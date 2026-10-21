import { ApiError, apiFetch, authenticatedApiFetch, dashboardReadApiFetch, type SessionTokenGetter } from "../services/api";
import { Colors, Product } from "../types";
import { shouldExcludeFamily } from "../data/excludedFamilies";
import sparePartsFallbackImage from "../assets/pngtree-no-image-vector-illustration-isolated-png-image_1694547.jpg";
import { shouldFallbackFromWholesaleStatus } from "../utils/wholesalePricing";
import { preferredSubmaterial } from "../utils/materialFilters";

const MINIMUM_PRODUCT_PRICE = 100;
const MINIMUM_FILAMENT_PRICE = 10000;
const FILAMENT_GROUP = "FILAMENTO 3D";
const SPARE_PARTS_GROUP = "REPUESTOS & ACCESORIOS";
const PRINTING_COMPLEMENTS_GROUP = "COMPLEMENTOS PARA IMPRESION 3D";
const BASE_FILAMENT_DISCOUNT = 0.15;

// ---- Tipos de la respuesta de /stk-item/catalogo (backend) ----
interface CatalogoAtributo {
  clase: string;
  valor: string;
  color: string | null;
  heredado: boolean;
  orden: number | null;
  grupoAtributo?: string | null;
  subgrupoAtributo?: string | null;
}
interface CatalogoVariante {
  id: string;
  descripcion: string | null;
  observaciones: string | null;
  fotoUrl: string | null;
  precioVtaCotizadoMin: string | null;
  wholesalePrice?: string | null;
  invoicePrice: string | null;
  promotionalPrice: string | null;
  stock: number;
  pesoKg: number | null;
  familia: string | null;
  visible: boolean;
  opciones: Record<string, string>;
  atributos: CatalogoAtributo[];
  submaterial?: string | null;
  sublinea?: string | null;
}
interface CatalogoProducto {
  key: string;
  nombre: string;
  marca: string | null;
  material: string | null;
  materialGrupo?: string | null;
  submaterial?: string | null;
  sublinea?: string | null;
  grupoWeb?: string | null;
  linea: string | null;
  origen: string | null;
  grupo: string | null;
  subgrupo: string | null;
  precioDesde: string | null;
  wholesalePriceFrom?: string | null;
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

const imageFor = (fotoUrl: string | null, isAccessory: boolean): string | null => {
  const raw = typeof fotoUrl === "string" && fotoUrl.trim() ? fotoUrl.trim() : null;
  return raw ?? (isAccessory ? sparePartsFallbackImage : null);
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

const normalizeAttributeName = (value: string): string =>
  value
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

const grupoWebFromAttributes = (attributes: CatalogoAtributo[]): string | undefined =>
  attributes
    .find((attribute) => normalizeAttributeName(attribute.clase) === "GRUPO WEB")
    ?.valor?.trim() || undefined;

const taxonomyValueFromAttributes = (
  attributes: CatalogoAtributo[],
  attributeClass: string,
): string | undefined =>
  attributes
    .find(
      (attribute) =>
        normalizeAttributeName(attribute.clase).replace(/[\s_-]+/g, "") ===
        normalizeAttributeName(attributeClass).replace(/[\s_-]+/g, ""),
    )
    ?.valor?.trim() || undefined;

const materialClassificationsOf = (
  product: CatalogoProducto,
  variants: CatalogoVariante[],
) => {
  const classifications = new Map<string, {
    material: string;
    submaterial: string | null;
    grupoWebValues: Map<string, string>;
  }>();
  const explicitGrupoWeb = product.grupoWeb?.trim() || undefined;
  const productAttributeGrupoWeb = grupoWebFromAttributes(product.atributos);
  const productGrupoWeb = explicitGrupoWeb ?? productAttributeGrupoWeb;
  const productSubmaterial = product.submaterial?.trim() ||
    taxonomyValueFromAttributes(product.atributos, "SUBMATERIAL");
  const productSublinea = product.sublinea?.trim() ||
    taxonomyValueFromAttributes(product.atributos, "SUB-LINEA");
  const productFallbackSubmaterial = preferredSubmaterial(
    productSubmaterial,
    productSublinea,
  );
  const productMaterialAttributes = product.atributos.filter(
    (attribute) => normalizeAttributeName(attribute.clase) === "MATERIAL",
  );
  const topLevelMaterial = (product.materialGrupo ?? product.material)?.trim();
  const topLevelSubmaterial = productFallbackSubmaterial;
  const productMaterialValues = productMaterialAttributes.length
    ? productMaterialAttributes.map((attribute) => ({
        material: (attribute.grupoAtributo ?? attribute.valor)?.trim(),
        submaterial: preferredSubmaterial(
          attribute.subgrupoAtributo,
          productFallbackSubmaterial,
        ),
      }))
    : topLevelMaterial
      ? [{ material: topLevelMaterial, submaterial: topLevelSubmaterial }]
      : [];

  const addClassification = (
    material: string | undefined,
    submaterial: string | null,
    grupoWeb: string | undefined,
  ) => {
    if (!material) return;
    const key = `${material.toLocaleUpperCase()}\0${submaterial?.toLocaleUpperCase() ?? ""}`;
    const classification = classifications.get(key) ?? {
      material,
      submaterial,
      grupoWebValues: new Map<string, string>(),
    };
    if (grupoWeb) {
      const grupoWebKey = grupoWeb.toLocaleUpperCase();
      if (!classification.grupoWebValues.has(grupoWebKey)) {
        classification.grupoWebValues.set(grupoWebKey, grupoWeb);
      }
    }
    classifications.set(key, classification);
  };

  productMaterialValues.forEach(({ material, submaterial }) => {
    addClassification(material, submaterial, productGrupoWeb);
  });

  variants.forEach((variant) => {
    const variantGrupoWeb = explicitGrupoWeb ??
      grupoWebFromAttributes(variant.atributos) ??
      productAttributeGrupoWeb;
    const variantSubmaterial = variant.submaterial?.trim() ||
      taxonomyValueFromAttributes(variant.atributos, "SUBMATERIAL") ||
      productSubmaterial;
    const variantSublinea = variant.sublinea?.trim() ||
      taxonomyValueFromAttributes(variant.atributos, "SUB-LINEA") ||
      productSublinea;
    const variantFallbackSubmaterial = preferredSubmaterial(
      variantSubmaterial,
      variantSublinea,
    );
    const variantMaterialAttributes = variant.atributos.filter(
      (attribute) => normalizeAttributeName(attribute.clase) === "MATERIAL",
    );
    const materialValues = variantMaterialAttributes.length
      ? variantMaterialAttributes.map((attribute) => ({
          material: (attribute.grupoAtributo ?? attribute.valor)?.trim(),
          submaterial: preferredSubmaterial(
            attribute.subgrupoAtributo,
            variantFallbackSubmaterial,
          ),
        }))
      : productMaterialValues;

    materialValues.forEach(({ material, submaterial }) => {
      addClassification(material, submaterial, variantGrupoWeb);
    });
  });

  return Array.from(classifications.values()).map(
    ({ material, submaterial, grupoWebValues }) => ({
      material,
      submaterial,
      grupoWebValues: Array.from(grupoWebValues.values()),
    }),
  );
};

const colorNameOf = (variante: CatalogoVariante): string | undefined => {
  const optionColor = variante.opciones?.["Colores"]?.trim();
  if (optionColor) return optionColor;

  const attributeColor = variante.atributos
    .find((a) => normalizeAttributeName(a.clase) === "COLORES")
    ?.valor?.trim();

  return attributeColor || undefined;
};

const difficultyLevelOf = (
  productAttributes: CatalogoAtributo[],
  variantAttributes: CatalogoAtributo[],
): string | undefined => {
  const difficultyAttribute = [...productAttributes, ...variantAttributes].find(
    (attribute) =>
      normalizeAttributeName(attribute.clase) === "NIVEL DE DIFICULTAD",
  );
  const value = difficultyAttribute?.valor?.trim();

  return value || undefined;
};

const foodSafeOf = (
  productAttributes: CatalogoAtributo[],
  variantAttributes: CatalogoAtributo[],
): boolean | undefined => {
  const values = [...productAttributes, ...variantAttributes]
    .filter(
      (attribute) => normalizeAttributeName(attribute.clase) === "APTO ALIMENTOS",
    )
    .map((attribute) => normalizeAttributeName(attribute.valor));

  if (values.length === 0) {
    return undefined;
  }

  return values.includes("SI");
};

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

interface FetchProductsOptions {
  isWholesale?: boolean;
  getToken?: SessionTokenGetter;
  onWholesaleDenied?: () => void;
}

export const fetchProducts = async ({
  isWholesale = false,
  getToken,
  onWholesaleDenied,
}: FetchProductsOptions = {}): Promise<Product[]> => {
  try {
    // El backend ya arma los productos (agrupa variantes por atributos). Solo
    // aplicamos los filtros de publicación y mapeamos a la forma `Product`.
    let wholesaleCatalog = isWholesale && !!getToken;
    const catalogRequest = wholesaleCatalog
      ? authenticatedApiFetch<{ minimumPurchaseKg: number; products: CatalogoProducto[] }>(
          "/stk-item/catalogo/mayorista",
          getToken,
        ).catch((error) => {
          if (error instanceof ApiError && shouldFallbackFromWholesaleStatus(error.status)) {
            wholesaleCatalog = false;
            onWholesaleDenied?.();
            return apiFetch("/stk-item/catalogo");
          }
          throw error;
        })
      : apiFetch("/stk-item/catalogo");
    const [catalogResponse, colors] = await Promise.all([
      catalogRequest,
      fetchColors(),
    ]);
    const minimumPurchaseKg = wholesaleCatalog && !Array.isArray(catalogResponse)
      ? Number(catalogResponse.minimumPurchaseKg) || 0
      : 0;
    const catalogo = wholesaleCatalog && !Array.isArray(catalogResponse)
      ? catalogResponse.products
      : catalogResponse;
    const catalogProducts = Array.isArray(catalogo) ? catalogo as CatalogoProducto[] : [];

    if (import.meta.env.DEV) {
      if (wholesaleCatalog) {
        console.log("Catálogo mayorista recibido:", {
          minimumPurchaseKg,
          products: catalogProducts,
        });
      }
      console.log("Catálogo recibido:", catalogo);
      console.log(
        "Repuestos recibidos:",
        catalogProducts.filter(
          (product) =>
            String(product.grupo ?? "").trim().toUpperCase() ===
            SPARE_PARTS_GROUP,
        ),
      );
      console.log(
        "Complementos recibidos:",
        catalogProducts.filter(
          (product) =>
            String(product.grupo ?? "").trim().toUpperCase() ===
            PRINTING_COMPLEMENTS_GROUP,
        ),
      );
    }

    const colorByName = new Map<string, Colors>();
    colors.forEach((color) => colorByName.set(color.name.toLowerCase(), color));

    const products: Product[] = [];

    for (const prod of catalogProducts) {
      const isFilament = isFilamentGroup(prod.grupo);
      const category = isFilament ? FILAMENT_GROUP : prod.grupo ?? "";
      const upperGroup = String(prod.grupo ?? "").toUpperCase();
      const isAccessory =
        upperGroup === SPARE_PARTS_GROUP ||
        upperGroup === PRINTING_COMPLEMENTS_GROUP;

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

        // Debe tener imagen (o fallback para grupos tratados como accesorios)
        if (!imageFor(v.fotoUrl, isAccessory)) return false;

        // Filamentos: debe tener peso numérico (descarta "Kit 20 Colores", etc.)
        // `pesoKg` nulo se conserva como variante de 0 kg para no bloquear el catálogo.

        return true;
      });

      const variantesPublicables = isFilament
        ? variantesValidas.filter((v) => colorNameOf(v))
        : variantesValidas;

      if (variantesPublicables.length === 0) continue;

      const id = buildProductId(prod);
      const first = variantesPublicables[0];
      const firstRetailPrice = toNumber(first.precioVtaCotizadoMin) ?? 0;
      const firstPrice = firstRetailPrice;
      const observaciones = variantesPublicables
        .map((v) => v.observaciones)
        .find((o): o is string => typeof o === "string" && o.trim().length > 0);
      const images = uniqueImages(
        variantesPublicables.map((v) => imageFor(v.fotoUrl, isAccessory)),
      );

      const product: Product = {
        id,
        name: prod.nombre,
        description: first.descripcion ?? prod.nombre,
        observaciones: observaciones ?? undefined,
        image: images[0] ?? "",
        images: images.length ? images : undefined,
        brand: prod.marca ?? undefined,
        line: prod.linea ?? undefined,
        material: prod.material ?? undefined,
        grupoWeb: prod.grupoWeb?.trim() || grupoWebFromAttributes(prod.atributos),
        materialClassifications: materialClassificationsOf(prod, variantesPublicables),
        foodSafe: foodSafeOf(
          prod.atributos,
          variantesPublicables.flatMap((variant) => variant.atributos),
        ),
        origin: prod.origen ?? undefined,
        category,
        subcategory: prod.subgrupo ? String(prod.subgrupo).toUpperCase() : undefined,
        difficultyLevel: difficultyLevelOf(prod.atributos, first.atributos),
        price: firstPrice,
        retailPrice: firstRetailPrice,
        wholesalePriceFrom: wholesaleCatalog ? toNumber(prod.wholesalePriceFrom) : undefined,
        wholesaleMinimumPurchaseKg: wholesaleCatalog ? minimumPurchaseKg : undefined,
        isWholesaleCatalog: wholesaleCatalog,
        invoicePrice: toNumber(first.invoicePrice) ?? firstPrice,
        promotionalPrice: toNumber(first.promotionalPrice),
        itemId: first.id,
      };

      if (isFilament) {
        const weights: NonNullable<Product["weights"]> = [];
        const colorMap = new Map<string, ColorVariant>();

        for (const v of variantesPublicables) {
          const weight = v.pesoKg ?? 0;
          const weightKey = weight.toString();
          const price = toNumber(v.precioVtaCotizadoMin) ?? 0;
          const wholesalePrice = wholesaleCatalog ? toNumber(v.wholesalePrice) : undefined;
          const invoicePrice = toNumber(v.invoicePrice) ?? price;
          const promotionalPrice =
            toNumber(v.promotionalPrice) ?? price * (1 - BASE_FILAMENT_DISCOUNT);
          const colorName = colorNameOf(v);
          if (!colorName) continue;
          const colorData = colorByName.get(colorName.toLowerCase());
          const stock = Math.max(0, v.stock ?? 0);
          const img = imageFor(v.fotoUrl, isAccessory);

          if (!weights.some((w) => w.weight === weight)) {
            weights.push({ weight, pesoKg: v.pesoKg, price, retailPrice: price, wholesalePrice, invoicePrice, promotionalPrice });
          }

          const existing = colorMap.get(colorName);
          if (existing) {
            existing.stock[weightKey] = (existing.stock[weightKey] || 0) + stock;
            existing.prices = { ...(existing.prices || {}), [weightKey]: price };
            existing.retailPrices = { ...(existing.retailPrices || {}), [weightKey]: price };
            existing.wholesalePrices = { ...(existing.wholesalePrices || {}), [weightKey]: wholesalePrice };
            existing.invoicePrices = {
              ...(existing.invoicePrices || {}),
              [weightKey]: invoicePrice,
            };
            existing.promotionalPrices = {
              ...(existing.promotionalPrices || {}),
              [weightKey]: promotionalPrice,
            };
            existing.itemIds = { ...(existing.itemIds || {}), [weightKey]: v.id };
            if (img) {
              existing.imagesByWeight = {
                ...(existing.imagesByWeight || {}),
                [weightKey]: img,
              };
            }
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
              retailPrices: { [weightKey]: price },
              wholesalePrices: wholesalePrice ? { [weightKey]: wholesalePrice } : {},
              invoicePrices: { [weightKey]: invoicePrice },
              promotionalPrices: { [weightKey]: promotionalPrice },
              itemIds: { [weightKey]: v.id },
              imagesByWeight: img ? { [weightKey]: img } : {},
              images: img ? [img] : [],
              itemId: v.id,
            });
          }
        }

        const sortedColors = Array.from(colorMap.values()).sort((a, b) =>
          a.name.localeCompare(b.name),
        );
        product.colors = sortedColors;
        product.weights = weights.sort((a, b) => a.weight - b.weight);

        // Imagen principal = primera imagen de color disponible
        const colorWithImage = sortedColors.find(
          (c) => c.images && c.images.length > 0,
        );
        product.image = colorWithImage?.images?.[0] ?? images[0] ?? "";
      } else {
        // Otras categorías: stock agregado (cantidad − comprometido sumado)
        product.stock = variantesPublicables.reduce(
          (total, v) => total + Math.max(0, v.stock ?? 0),
          0,
        );
      }

      products.push(product);
    }

    if (import.meta.env.DEV) {
      console.log("Productos transformados:", products);
      console.log(
        "Repuestos transformados:",
        products.filter(
          (product) => product.category.trim().toUpperCase() === SPARE_PARTS_GROUP,
        ),
      );
      console.log(
        "Complementos transformados:",
        products.filter(
          (product) =>
            product.category.trim().toUpperCase() === PRINTING_COMPLEMENTS_GROUP,
        ),
      );
    }

    return products;
  } catch (error: unknown) {
    console.error(
      "Error al obtener los productos:",
      error instanceof Error ? error.message : error,
    );
    throw new Error(
      "No se pudieron obtener los productos. Intenta nuevamente más tarde.",
    );
  }
};
