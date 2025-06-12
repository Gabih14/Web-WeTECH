import { Product } from "../types";
import { colors } from "../data/colors";

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // Petición
    const response = await fetch("http://localhost:3000/stk-item");

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los productos del servidor");
    }

    // Obtener los datos en formato JSON
    const rawProducts = await response.json();

    // Transformar los datos
    const groupedProducts: { [key: string]: Product } = {};

    rawProducts.forEach((item: any) => {
      const familiaId = item.familiaId || item.id;

      // Ignorar ítems del grupo "FILAMENTOS" sin familiaId
      if (item.grupo === "FILAMENTOS" && !item.familiaId) {
        return; // Salir de esta iteración
      }

      if (!groupedProducts[familiaId]) {
        // Crear el producto principal
        groupedProducts[familiaId] = {
          id: familiaId,
          name: item.familiaId ? item.familiaId : item.descripcion,
          description: item.descripcion,
          image: `/assets/${familiaId}.png`, // Generar la ruta dinámica de la imagen
          category: item.grupo,
          subcategory: item.subgrupo
            ? item.subgrupo.toUpperCase()
            : undefined,
          price: parseFloat(item.precioVtaCotizado || "0"), // Guardar precioVtaCotizado en todos los productos
          ...(item.grupo === "FILAMENTOS" && { colors: [] }), // Solo agregar `colors` si es "FILAMENTOS"
          ...(item.grupo !== "FILAMENTOS" && { stock: 0 }), // Solo agregar `stock` si no es "FILAMENTOS"
        };

        // Solo agregar `weights` si el grupo es "FILAMENTOS"
        if (item.grupo === "FILAMENTOS") {
          groupedProducts[familiaId].weights = [];
        }
      }

      // Si el grupo es "FILAMENTOS", manejar los weights y precios
      if (item.grupo === "FILAMENTOS") {
        // Extraer el peso y la unidad (kg o g) de la presentación
        const weightMatch = item.presentacion.match(/(\d+\.?\d*)\s*(kg|g)/i);
        let weight = 0;

        if (weightMatch) {
          const value = parseFloat(weightMatch[1]); // Extraer el número
          const unit = weightMatch[2].toLowerCase(); // Extraer la unidad (kg o g)

          // Convertir a kilogramos si es necesario
          weight = unit === "g" ? value / 1000 : value;
        }
        const price = parseFloat(item.precioVtaCotizado || "0"); // Usar precioVtaCotizado como precio
        const promotionalPrice = price - price * 0.15; // Calcular el precio promocional (15% de descuento)

        // Verificar si el peso ya existe en `weights`
        const existingWeight = groupedProducts[familiaId].weights?.find(
          (w) => w.weight === weight
        );

        if (!existingWeight) {
          // Agregar el peso y precio a `weights` solo si no existe
          groupedProducts[familiaId].weights?.push({
            weight,
            price,
            promotionalPrice,
          });
        }

        // Manejar el stock por colores
        const colorName =
          item.descripcion.split("|")[1]?.trim() || "Sin color"; // Extraer el color del campo descripción
        const stock = parseFloat(item.stkExistencias?.[0]?.cantidad || "0");

        // Buscar el color en el array `colors` para obtener su valor `hex`
        const colorData = colors.find(
          (color) => color.name.toLowerCase() === colorName.toLowerCase()
        );
        const hexValue = colorData ? colorData.hex : "#000000"; // Usar el valor encontrado o un valor predeterminado

        const existingColor = groupedProducts[familiaId].colors?.find(
          (color) => color.name === colorName
        );

        if (existingColor) {
          // Si el color ya existe, sumar el stock para el peso específico
          existingColor.stock[weight] =
            (existingColor.stock[weight] || 0) + stock;
        } else {
          // Si el color no existe, agregarlo
          groupedProducts[familiaId].colors?.push({
            name: colorName,
            hex: hexValue, // Puedes asignar un color genérico o específico
            stock: {
              [weight]: stock, // Manejar el stock por peso
            },
          });
        }
      } else {
        // Para otras categorías, sumar el stock de forma general
        groupedProducts[familiaId].stock =
          (groupedProducts[familiaId].stock || 0) +
          parseFloat(item.stkExistencias?.[0]?.cantidad || "0");
      }
    });

    // Convertir el objeto agrupado en un array
    const transformedProducts = Object.values(groupedProducts);
    return transformedProducts;
  } catch (error: any) {
    console.error("Error al obtener los productos:", error.message);
    throw new Error("No se pudieron obtener los productos. Intenta nuevamente más tarde.");
  }
};