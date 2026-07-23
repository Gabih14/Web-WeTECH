import { apiFetch, dashboardReadApiFetch } from "../services/api";
import { Colors, Product } from "../types";
import { shouldExcludeFamily } from "../data/excludedFamilies";
import sparePartsFallbackImage from "../assets/pngtree-no-image-vector-illustration-isolated-png-image_1694547.jpg";

const MINIMUM_PRODUCT_PRICE = 100;
const MINIMUM_FILAMENT_PRICE = 10000;
const FILAMENT_GROUP = "FILAMENTO 3D";
const SPARE_PARTS_GROUP = "REPUESTOS & ACCESORIOS";
const BASE_FILAMENT_DISCOUNT = 0.15;

// ---- Tipos de la respuesta de /stk-item/catalogo (backend) ----
interface CatalogoAtributo {
  clase: string;
  valor: string;
  color: string | null;
  heredado: boolean;
  orden: number | null;
}
interface CatalogoVariante {
  id: string;
  descripcion: string | null;
  observaciones: string | null;
  fotoUrl: string | null;
  precioVtaCotizadoMin: string | null;
  invoicePrice: string | null;
  promotionalPrice: string | null;
  stock: number;
  pesoKg: number | null;
  familia: string | null;
  visible: boolean;
  opciones: Record<string, string>;
  atributos: CatalogoAtributo[];
}
interface CatalogoProducto {
  key: string;
  nombre: string;
  marca: string | null;
  material: string | null;
  linea: string | null;
  origen: string | null;
  grupo: string | null;
  subgrupo: string | null;
  precioDesde: string | null;
  atributos: CatalogoAtributo[];
  dimensiones: { clase: string; valores: { valor: string; color: string | null }[] }[];
  variantes: CatalogoVariante[];
}

type ColorVariant = NonNullable<Product["colors"]>[number];

const isFilamentGroup = (group?: string | null) => {
  const upper = (group ?? "").toUpperCase();
  return upper === FILAMENT_GROUP || upper === "FILAMENTOS"; // aceptar legacy
};

const toNumber = (value: string | null | undefined): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

const imageFor = (fotoUrl: string | null, isSparePart: boolean): string | null => {
  const raw = typeof fotoUrl === "string" && fotoUrl.trim() ? fotoUrl.trim() : null;
  return raw ?? (isSparePart ? sparePartsFallbackImage : null);
};

const uniqueImages = (images: (string | null)[]): string[] =>
  Array.from(new Set(images.filter((img): img is string => !!img)));

/**
 * ID del producto compatible con `discounts.ts`, que deriva la familia de descuento
 * partiendo por "-" y tomando MARCA-MATERIAL. Para filamentos usamos los 4 atributos
 * de identidad (garantiza unicidad entre líneas/orígenes); para el resto, el id real.
 */
const buildProductId = (prod: CatalogoProducto): string => {
  if (prod.key.startsWith("fam")) {
    return [prod.marca, prod.material, prod.linea, prod.origen]
      .filter(Boolean)
      .join("-")
      .toUpperCase();
  }
  if (prod.key.startsWith("item:")) {
    return prod.key.slice("item:".length);
  }
  return prod.variantes[0]?.id ?? prod.key;
};

const colorNameOf = (variante: CatalogoVariante): string =>
  variante.opciones?.["Colores"] ??
  variante.atributos.find((a) => a.clase === "Colores")?.valor ??
  "Sin color";

const fetchColors = async (): Promise<Colors[]> => {
  const colorData = await dashboardReadApiFetch("/colors");

  return Array.isArray(colorData)
    ? colorData
        .filter(
          (color): color is Colors =>
            typeof color?.name === "string" && typeof color?.hex === "string",
        )
        .map((color) => ({
          id: typeof color.id === "number" ? color.id : undefined,
          name: color.name.trim(),
          hex: color.hex.trim(),
          colorGroupId:
            typeof color.colorGroupId === "number" ? color.colorGroupId : null,
          colorGroup:
            color.colorGroup &&
            typeof color.colorGroup.id === "number" &&
            typeof color.colorGroup.name === "string"
              ? {
                  id: color.colorGroup.id,
                  name: color.colorGroup.name.trim(),
                  hex:
                    typeof color.colorGroup.hex === "string"
                      ? color.colorGroup.hex.trim()
                      : null,
                  sortOrder:
                    typeof color.colorGroup.sortOrder === "number"
                      ? color.colorGroup.sortOrder
                      : 0,
                }
              : undefined,
        }))
    : [];
};

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // El backend ya arma los productos (agrupa variantes por atributos). Solo
    // aplicamos los filtros de publicación y mapeamos a la forma `Product`.
    const [catalogo, colors] = await Promise.all([
      apiFetch("/stk-item/catalogo"),
      fetchColors(),
    ]);

    if (import.meta.env.DEV) {
      console.log("Catálogo recibido:", catalogo);
    }

    const colorByName = new Map<string, Colors>();
    colors.forEach((color) => colorByName.set(color.name.toLowerCase(), color));

    const products: Product[] = [];

    for (const prod of (catalogo as CatalogoProducto[]) ?? []) {
      const isFilament = isFilamentGroup(prod.grupo);
      const category = isFilament ? FILAMENT_GROUP : prod.grupo ?? "";
      const upperGroup = String(prod.grupo ?? "").toUpperCase();
      const isSparePart = upperGroup === SPARE_PARTS_GROUP;

      // Ignorar impresoras (paridad con el flujo actual)
      if (upperGroup === "IMPRESORAS 3D") continue;

      // Filtros de publicación (política de la tienda: se mantienen en el front)
      const variantesValidas = prod.variantes.filter((v) => {
        if (v.visible === false) return false;
        if (shouldExcludeFamily(v.familia ?? "")) return false;
        if (isFilament && !v.familia) return false;

        // Descripción que termina en "mm" (diámetros, etc.)
        if (
          isFilament &&
          String(v.descripcion ?? "").trim().toLowerCase().endsWith("mm")
        ) {
          return false;
        }

        // Filamentos: id con patrón de 4 segmentos (XXXX-XXXX-XXXX-XXXX)
        if (isFilament && !/^[^-]+-[^-]+-[^-]+-[^-]+$/.test(String(v.id ?? ""))) {
          return false;
        }

        // Precio mínimo publicable
        const price = toNumber(v.precioVtaCotizadoMin) ?? 0;
        if (price < MINIMUM_PRODUCT_PRICE) return false;
        if (isFilament && price < MINIMUM_FILAMENT_PRICE) return false;

        // Debe tener imagen (o fallback para repuestos)
        if (!imageFor(v.fotoUrl, isSparePart)) return false;

        // Filamentos: debe tener peso numérico (descarta "Kit 20 Colores", etc.)
        if (isFilament && v.pesoKg == null) return false;

        return true;
      });

      if (variantesValidas.length === 0) continue;

      const id = buildProductId(prod);
      const first = variantesValidas[0];
      const firstPrice = toNumber(first.precioVtaCotizadoMin) ?? 0;
      const observaciones = variantesValidas
        .map((v) => v.observaciones)
        .find((o): o is string => typeof o === "string" && o.trim().length > 0);
      const images = uniqueImages(
        variantesValidas.map((v) => imageFor(v.fotoUrl, isSparePart)),
      );

      const product: Product = {
        id,
        name: prod.nombre,
        description: first.descripcion ?? prod.nombre,
        observaciones: observaciones ?? undefined,
        image: images[0] ?? "",
        images: images.length ? images : undefined,
        brand: prod.marca ?? undefined,
        category,
        subcategory: prod.subgrupo ? String(prod.subgrupo).toUpperCase() : undefined,
        price: firstPrice,
        invoicePrice: toNumber(first.invoicePrice) ?? firstPrice,
        promotionalPrice: toNumber(first.promotionalPrice),
        itemId: first.id,
      };

      if (isFilament) {
        const weights: NonNullable<Product["weights"]> = [];
        const colorMap = new Map<string, ColorVariant>();

        for (const v of variantesValidas) {
          const weight = v.pesoKg as number;
          const weightKey = weight.toString();
          const price = toNumber(v.precioVtaCotizadoMin) ?? 0;
          const invoicePrice = toNumber(v.invoicePrice) ?? price;
          const promotionalPrice =
            toNumber(v.promotionalPrice) ?? price * (1 - BASE_FILAMENT_DISCOUNT);
          const colorName = colorNameOf(v);
          const colorData = colorByName.get(colorName.toLowerCase());
          const stock = Math.max(0, v.stock ?? 0);
          const img = imageFor(v.fotoUrl, isSparePart);

          if (!weights.some((w) => w.weight === weight)) {
            weights.push({ weight, price, invoicePrice, promotionalPrice });
          }

          const existing = colorMap.get(colorName);
          if (existing) {
            existing.stock[weightKey] = (existing.stock[weightKey] || 0) + stock;
            existing.prices = { ...(existing.prices || {}), [weightKey]: price };
            existing.invoicePrices = {
              ...(existing.invoicePrices || {}),
              [weightKey]: invoicePrice,
            };
            existing.promotionalPrices = {
              ...(existing.promotionalPrices || {}),
              [weightKey]: promotionalPrice,
            };
            existing.itemIds = { ...(existing.itemIds || {}), [weightKey]: v.id };
            if (!existing.itemId) existing.itemId = v.id;
            if (!existing.colorGroup) existing.colorGroup = colorData?.colorGroup;
            if (img && !(existing.images || []).includes(img)) {
              existing.images = [...(existing.images || []), img];
            }
          } else {
            colorMap.set(colorName, {
              name: colorName,
              hex: colorData?.hex ?? "",
              colorGroup: colorData?.colorGroup,
              stock: { [weightKey]: stock },
              prices: { [weightKey]: price },
              invoicePrices: { [weightKey]: invoicePrice },
              promotionalPrices: { [weightKey]: promotionalPrice },
              itemIds: { [weightKey]: v.id },
              images: img ? [img] : [],
              itemId: v.id,
            });
          }
        }

        const sortedColors = Array.from(colorMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        product.colors = sortedColors;
        product.weights = weights;

        // Imagen principal = primera imagen de color disponible
        const colorWithImage = sortedColors.find(
          (c) => c.images && c.images.length > 0,
        );
        product.image = colorWithImage?.images?.[0] ?? images[0] ?? "";
      } else {
        // Otras categorías: stock agregado (cantidad − comprometido sumado)
        product.stock = variantesValidas.reduce(
          (total, v) => total + Math.max(0, v.stock ?? 0),
          0,
        );
      }

      products.push(product);
    }

    if (import.meta.env.DEV) {
      console.log("Productos transformados:", products);
    }

    return products;
  } catch (error: any) {
    console.error("Error al obtener los productos:", error.message);
    throw new Error(
      "No se pudieron obtener los productos. Intenta nuevamente más tarde.",
    );
  }
};
