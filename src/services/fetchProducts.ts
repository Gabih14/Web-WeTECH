import { apiFetch } from "../services/api";
import { Product } from "../types";
import { colors } from "../data/colors";
import { shouldExcludeFamily } from "../data/excludedFamilies";

export const fetchProducts = async (): Promise<Product[]> => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const FILAMENT_GROUP = "FILAMENTO 3D";
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
    const rawProducts = await apiFetch("/stk-item");
    console.log("Productos crudos recibidos:", rawProducts);
    // Transformar los datos
    const groupedProducts: { [key: string]: Product } = {};

    rawProducts.forEach((item: any) => {
      // Ignorar productos cuya descripción termina en "mm" (diámetros, etc)
      if (
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

      const isFilament = isFilamentGroup(item.grupo);
      const normalizedGroup = isFilament ? FILAMENT_GROUP : item.grupo;

      // Ignorar ítems filamentos cuyo id no cumpla el patrón con 3 guiones: XXXX-XXXX-XXXX-XXXX
      const id: string = String(item.id || "");
      const hasFourPartsWithThreeHyphens = /^[^-]+-[^-]+-[^-]+-[^-]+$/.test(id);
      if (!hasFourPartsWithThreeHyphens && isFilament) {
        return;
      }

      // Generar una clave de agrupación basada en las primeras dos partes de la descripción
      // Esto permite agrupar productos con diferentes pesos pero mismo material
      const groupingKey = (() => {
        if (item.descripcion) {
          const parts = item.descripcion
            .split("|")
            .map((p: string) => p.trim())
            .filter(Boolean);
          if (parts.length >= 2) {
            return `${parts[0]}-${parts[1]}`.toUpperCase(); // e.g., "3N3-PLA"
          }
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
      if (
        !item.precioVtaCotizadoMin ||
        parseFloat(item.precioVtaCotizadoMin) <= 0
      ) {
        return; // Salir de esta iteración
      }

      // Ignorar filamentos con precio < 10.000 ARS
      if (isFilament && parseFloat(item.precioVtaCotizadoMin) < 10000) {
        return; // Salir de esta iteración
      }

      // Ignorar impresoras con precio < 300.000 ARS
      if (
        item.category?.toUpperCase() === "IMPRESORAS 3D" &&
        parseFloat(item.precioVtaCotizadoMin) < 300000
      ) {
        return; // Salir de esta iteración
      }
      // Ignorar impresoras BORRAR
      if (item.grupo?.toUpperCase() === "IMPRESORAS 3D") {
        return; // Salir de esta iteración
      }
      const itemImageUrl =
        typeof item.fotoUrl === "string" ? item.fotoUrl : null;

      // Ignorar productos sin fotoUrl
      if (!itemImageUrl || itemImageUrl.trim() === "") {
        return; // Salir de esta iteración
      }

      if (!groupedProducts[groupingKey]) {
        // Derivar el nombre usando los dos primeros segmentos de la descripción ("Marca Material")
        const productName = (() => {
          if (item.descripcion) {
            const parts = item.descripcion
              .split("|")
              .map((p: string) => p.trim())
              .filter(Boolean);
            if (parts.length >= 2) {
              return `${parts[0]} ${parts[1]}`;
            }
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
          category: normalizedGroup,
          subcategory: item.subgrupo ? item.subgrupo.toUpperCase() : undefined,
          price: parseFloat(item.precioVtaCotizadoMin || "0"), // Guardar precioVtaCotizadoMin en todos los productos
          ...(isFilament && { colors: [] }), // Solo agregar `colors` si es filamento
          ...(!isFilament && { stock: 0 }), // Solo agregar `stock` si no es filamento
        };

        // Solo agregar `weights` si el grupo es "FILAMENTOS"
        if (isFilament) {
          groupedProducts[groupingKey].weights = [];
        }
      }

      // Agregar imagen del ítem al producto agrupado (si existe y no está ya)
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
        let weight = 0;

        if (weightMatch) {
          const value = parseFloat(weightMatch[1]);
          const unit = weightMatch[2]; // already uppercase KG/G
          // Convertir a kilogramos si es necesario
          weight = unit === "G" ? value / 1000 : value;
        }
        const price = parseFloat(item.precioVtaCotizadoMin || "0"); // Usar precioVtaCotizadoMin como precio
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
          // Asegurar que conservamos el ID original del ítem
          if (!existingColor.itemId) {
            existingColor.itemId = item.id;
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
            stock: {
              [weight]: stock, // Manejar el stock por peso
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

    console.log("Productos transformados:", transformedProducts);
    return transformedProducts;
  } catch (error: any) {
    console.error("Error al obtener los productos:", error.message);
    throw new Error(
      "No se pudieron obtener los productos. Intenta nuevamente más tarde.",
    );
  }
};
