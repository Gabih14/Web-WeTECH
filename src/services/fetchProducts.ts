import { apiFetch } from "../services/api";
import { Colors, Product } from "../types";
import { shouldExcludeFamily } from "../data/excludedFamilies";
import sparePartsFallbackImage from "../assets/pngtree-no-image-vector-illustration-isolated-png-image_1694547.jpg";

const getSalePriceFromList = (
  item: any,
  listName: string
): number | undefined => {
  const normalizedListName = listName.trim().toUpperCase();
  const priceData = Array.isArray(item.stkPrecios)
    ? item.stkPrecios.find(
        (price: any) =>
          typeof price?.lista === "string" &&
          price.lista.trim().toUpperCase() === normalizedListName
      )
    : undefined;
  const parsedPrice = Number(priceData?.precioVta ?? priceData?.precio);

  return Number.isFinite(parsedPrice) && parsedPrice > 0
    ? parsedPrice
    : undefined;
};

const getDefaultSalePrice = (item: any): number => {
  const parsedPrice = Number(item.precioVtaCotizadoMin);
  const listPrice = getSalePriceFromList(item, "MINORISTA");

  return Number.isFinite(parsedPrice) && parsedPrice > 0
    ? parsedPrice
    : listPrice ?? 0;
};

const getInvoiceSalePrice = (item: any, fallbackPrice: number): number =>
  getSalePriceFromList(item, "MINORISTA CON IVA") ?? fallbackPrice;

const fetchColors = async (): Promise<Colors[]> => {
  const colorData = await apiFetch("/colors");

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
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const FILAMENT_GROUP = "FILAMENTO 3D";
  const SPARE_PARTS_GROUP = "REPUESTOS & ACCESORIOS";
  const isFilamentGroup = (group: string) => {
    const upper = group?.toUpperCase();
    return upper === FILAMENT_GROUP || upper === "FILAMENTOS"; // aceptar legacy
  };
  if (!API_URL) {
    throw new Error("API URL is not defined");
  }
  if (API_URL === "http://localhost:3000") {
    console.warn("Using default API URL:", API_URL);
  }
  try {
    // Petición
    // Usando apiFetch con token incluido
    const [rawProducts, colors] = await Promise.all([
      apiFetch("/stk-item"),
      fetchColors(),
    ]);
    if (import.meta.env.DEV) {
      console.log("Productos crudos recibidos:", rawProducts);
    }
    // Transformar los datos
    const groupedProducts: { [key: string]: Product } = {};

    rawProducts.forEach((item: any) => {
      const isFilament = isFilamentGroup(item.grupo);
      const normalizedGroup = isFilament ? FILAMENT_GROUP : item.grupo;
      const isSparePart =
        typeof normalizedGroup === "string" &&
        normalizedGroup.trim().toUpperCase() === SPARE_PARTS_GROUP;

      // Ignorar productos cuya descripción termina en "mm" (diámetros, etc)
      if (
        isFilament &&
        String(item.descripcion || "")
          .trim()
          .toLowerCase()
          .endsWith("mm")
      ) {
        return;
      }

      // TEMP: mostrar solo productos cuya descripción empieza con "Grilon3" (testing)
      //const desc = (item.descripcion || "").trim();
      /* if (!desc.startsWith("Grilon3")) {
        return;
      } */

      // Ignorar ítems filamentos cuyo id no cumpla el patrón con 3 guiones: XXXX-XXXX-XXXX-XXXX
      const id: string = String(item.id || "");
      const hasFourPartsWithThreeHyphens = /^[^-]+-[^-]+-[^-]+-[^-]+$/.test(id);
      if (!hasFourPartsWithThreeHyphens && isFilament) {
        return;
      }

      // Generar una clave de agrupación basada en las primeras dos partes de la descripción
      // Esto permite agrupar productos con diferentes pesos pero mismo material
      const descriptionParts = String(item.descripcion || "")
        .split("|")
        .map((p: string) => p.trim())
        .filter(Boolean);
      const brand = descriptionParts[0] || undefined;
      const groupingKey = (() => {
        if (descriptionParts.length >= 2) {
          return `${descriptionParts[0]}-${descriptionParts[1]}`.toUpperCase(); // e.g., "3N3-PLA"
        }

        // Fallback a familia o id si no hay descripción válida
        return item.familia || item.id;
      })();

      // Usar familia original para verificar exclusiones
      const familia = item.familia || item.id;

      // Ignorar familias en la lista de exclusión
      if (shouldExcludeFamily(familia)) {
        return; // Salir de esta iteración
      }

      // Ignorar productos no visibles
      if (item.visible === false) {
        return; // Salir de esta iteración
      }

      // Ignorar ítems del grupo de filamentos sin familia
      if (isFilament && !item.familia) {
        return; // Salir de esta iteración
      }

      // Ignorar ítems con precio 0 o menor
      const price = getDefaultSalePrice(item);
      const invoicePrice = getInvoiceSalePrice(item, price);

      if (price <= 0) {
        return; // Salir de esta iteración
      }

      // Ignorar filamentos con precio < 10.000 ARS
      if (isFilament && price < 10000) {
        return; // Salir de esta iteración
      }

      // Ignorar impresoras con precio < 300.000 ARS
      if (
        item.category?.toUpperCase() === "IMPRESORAS 3D" &&
        price < 300000
      ) {
        return; // Salir de esta iteración
      }
      // Ignorar impresoras BORRAR
      if (item.grupo?.toUpperCase() === "IMPRESORAS 3D") {
        return; // Salir de esta iteración
      }
      const rawItemImageUrl =
        typeof item.fotoUrl === "string" && item.fotoUrl.trim()
          ? item.fotoUrl.trim()
          : null;
      const itemImageUrl =
        rawItemImageUrl ?? (isSparePart ? sparePartsFallbackImage : null);

      // Ignorar productos sin fotoUrl
      if (!itemImageUrl || itemImageUrl.trim() === "") {
        return; // Salir de esta iteración
      }

      if (!groupedProducts[groupingKey]) {
        // Derivar el nombre usando los dos primeros segmentos de la descripción ("Marca Material")
        const productName = (() => {
          if (descriptionParts.length >= 2) {
            return `${descriptionParts[0]} ${descriptionParts[1]}`;
          }
          return groupingKey;
        })();

        const productImages = itemImageUrl ? [itemImageUrl] : [];

        // Para filamentos, la imagen principal será la primera imagen de color (se actualizará luego)
        let primaryImage = itemImageUrl || "";

        // Crear el producto principal
        groupedProducts[groupingKey] = {
          id: groupingKey, // Usar groupingKey (ej: "GRILON3-PLA BOUTIQUE") para identificación consistente
          name: productName,
          description: item.descripcion,
          observaciones:
            typeof item.observaciones === "string" && item.observaciones.trim()
              ? item.observaciones
              : undefined,
          image: primaryImage, // Se actualizará después con la primera imagen de color para filamentos
          images: productImages.length ? productImages : undefined, // Array completo de imágenes
          brand,
          category: normalizedGroup,
          subcategory: item.subgrupo ? item.subgrupo.toUpperCase() : undefined,
          price,
          invoicePrice,
          ...(isFilament && { colors: [] }), // Solo agregar `colors` si es filamento
          ...(!isFilament && { stock: 0 }), // Solo agregar `stock` si no es filamento
        };

        // Solo agregar `weights` si el grupo es "FILAMENTOS"
        if (isFilament) {
          groupedProducts[groupingKey].weights = [];
        }
      }

      // Agregar imagen del ítem al producto agrupado (si existe y no está ya)
      if (!groupedProducts[groupingKey].brand && brand) {
        groupedProducts[groupingKey].brand = brand;
      }

      const currentImages = groupedProducts[groupingKey].images || [];
      if (itemImageUrl && !currentImages.includes(itemImageUrl)) {
        groupedProducts[groupingKey].images = [...currentImages, itemImageUrl];
      }

      if (
        !groupedProducts[groupingKey].observaciones &&
        typeof item.observaciones === "string" &&
        item.observaciones.trim()
      ) {
        groupedProducts[groupingKey].observaciones = item.observaciones;
      }

      // Si el grupo es "FILAMENTOS", manejar los weights y precios
      if (isFilament) {
        // Extraer el peso del TERCER elemento de la descripción, en MAYÚSCULAS (e.g., "1kg" -> "1KG")
        const descParts = String(item.descripcion || "")
          .split("|")
          .map((p: string) => p.trim());
        const thirdPartUpper = (descParts[2] || "").toUpperCase();
        const weightMatch = thirdPartUpper.match(/(\d+\.?\d*)\s*(KG|G)/);

        if (!weightMatch) {
          return;
        }

        const value = parseFloat(weightMatch[1]);
        const unit = weightMatch[2]; // already uppercase KG/G
        // Convertir a kilogramos si es necesario
        const weight = unit === "G" ? value / 1000 : value;
        const promotionalPrice = price - price * 0.15; // Calcular el precio promocional (15% de descuento)

        // Verificar si el peso ya existe en `weights`
        const existingWeight = groupedProducts[groupingKey].weights?.find(
          (w) => w.weight === weight,
        );

        if (!existingWeight) {
          // Agregar el peso y precio a `weights` solo si no existe
          groupedProducts[groupingKey].weights?.push({
            weight,
            price,
            invoicePrice,
            promotionalPrice,
          });
        }

        // Manejar el stock por colores
        // Extraer el color del ÚLTIMO segmento de la descripción (e.g., "Grilon3 | PLA | 1kg | Premium | Amarillo" -> "Amarillo")
        const colorName = (() => {
          const parts = String(item.descripcion || "")
            .split("|")
            .map((p: string) => p.trim())
            .filter(Boolean);
          return parts.length > 0 ? parts[parts.length - 1] : "Sin color";
        })();
        const cantidad = parseFloat(item.stkExistencias?.[0]?.cantidad || "0");
        const comprometido = parseFloat(
          item.stkExistencias?.[0]?.comprometido || "0",
        );
        const stock = Math.max(0, cantidad - comprometido); // Stock disponible = cantidad - comprometido (mínimo 0)

        // Buscar el color en el array `colors` para obtener su valor `hex`
        const colorData = colors.find(
          (color) => color.name.toLowerCase() === colorName.toLowerCase(),
        );
        const hexValue = colorData ? colorData.hex : ""; // Usar el valor encontrado o un valor predeterminado

        const existingColor = groupedProducts[groupingKey].colors?.find(
          (color) => color.name === colorName,
        );

        if (existingColor) {
          // Si el color ya existe, sumar el stock para el peso específico
          existingColor.stock[weight] =
            (existingColor.stock[weight] || 0) + stock;
          existingColor.prices = {
            ...(existingColor.prices || {}),
            [weight]: price,
          };
          existingColor.invoicePrices = {
            ...(existingColor.invoicePrices || {}),
            [weight]: invoicePrice,
          };
          existingColor.promotionalPrices = {
            ...(existingColor.promotionalPrices || {}),
            [weight]: promotionalPrice,
          };
          existingColor.itemIds = {
            ...(existingColor.itemIds || {}),
            [weight]: item.id,
          };
          // Asegurar que conservamos el ID original del ítem
          if (!existingColor.itemId) {
            existingColor.itemId = item.id;
          }
          if (!existingColor.colorGroup) {
            existingColor.colorGroup = colorData?.colorGroup;
          }
          // Asociar imagen si no estaba
          if (itemImageUrl) {
            const existingImages = existingColor.images || [];
            if (!existingImages.includes(itemImageUrl)) {
              existingColor.images = [...existingImages, itemImageUrl];
            }
          }
        } else {
          // Generar imágenes específicas para este color usando fotoUrl del item (si existe)
          const colorImages = itemImageUrl ? [itemImageUrl] : [];

          // Si el color no existe, agregarlo
          groupedProducts[groupingKey].colors?.push({
            name: colorName,
            hex: hexValue, // Puedes asignar un color genérico o específico
            colorGroup: colorData?.colorGroup,
            stock: {
              [weight]: stock, // Manejar el stock por peso
            },
            prices: {
              [weight]: price,
            },
            invoicePrices: {
              [weight]: invoicePrice,
            },
            promotionalPrices: {
              [weight]: promotionalPrice,
            },
            itemIds: {
              [weight]: item.id,
            },
            images: colorImages, // Solo una imagen por color para filamentos
            itemId: item.id, // Guardar el ID original del item para la variante de color
          });
        }
      } else {
        // Para otras categorías, sumar el stock de forma general (cantidad - comprometido)
        const cantidad = parseFloat(item.stkExistencias?.[0]?.cantidad || "0");
        const comprometido = parseFloat(
          item.stkExistencias?.[0]?.comprometido || "0",
        );
        const stockDisponible = Math.max(0, cantidad - comprometido);

        groupedProducts[groupingKey].stock =
          (groupedProducts[groupingKey].stock || 0) + stockDisponible;
      }
    });

    // Convertir el objeto agrupado en un array
    const transformedProducts = Object.values(groupedProducts);

    // Para filamentos, actualizar la imagen principal con la primera imagen de color disponible
    transformedProducts.forEach((product) => {
      if (
        product.category === FILAMENT_GROUP &&
        product.colors &&
        product.colors.length > 0
      ) {
        // Ordenar colores alfabéticamente para consistencia
        const sortedColors = product.colors.sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        const colorWithImage = sortedColors.find(
          (c) => c.images && c.images.length > 0,
        );
        if (colorWithImage && colorWithImage.images) {
          product.image = colorWithImage.images[0];
        } else if (!product.image) {
          product.image = "";
        }

        // Actualizar el array de colores con el orden alfabético
        product.colors = sortedColors;
      } else if (
        !product.image &&
        product.images &&
        product.images.length > 0
      ) {
        // Para otros productos, si no se asignó imagen principal usar la primera disponible
        product.image = product.images[0];
      }
    });
    if (import.meta.env.DEV) {
    console.log("Productos transformados:", transformedProducts);
    }
    return transformedProducts;
  } catch (error: any) {
    console.error("Error al obtener los productos:", error.message);
    throw new Error(
      "No se pudieron obtener los productos. Intenta nuevamente más tarde.",
    );
  }
};


