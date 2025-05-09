import { products as rawProducts } from "../data/products2";
import { Product } from "../types";

export const fetchProducts = (): Promise<Product[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Transformar los datos
      const groupedProducts: { [key: string]: Product } = {};

      rawProducts.forEach((item) => {
        const familiaId = item.familiaId || item.id; // Si no tiene familiaId, usar el id como único producto
        if (!groupedProducts[familiaId]) {
          // Crear el producto principal
          groupedProducts[familiaId] = {
            id: familiaId,
            name: item.familiaId ? item.familiaId : item.descripcion,
            description: item.descripcion,
            image: `/assets/${familiaId}.png`, // Generar la ruta dinámica de la imagen
            category: item.grupo,
            subcategory: item.subgrupo ? item.subgrupo.toUpperCase() : undefined,
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

          // Verificar si el peso ya existe en `weights`
          const existingWeight = groupedProducts[familiaId].weights?.find(
            (w) => w.weight === weight
          );

          if (!existingWeight) {
            // Agregar el peso y precio a `weights` solo si no existe
            groupedProducts[familiaId].weights?.push({ weight, price });
          }

          // Manejar el stock por colores
          const colorName = item.descripcion.split("|")[1]?.trim() || "Sin color"; // Extraer el color del campo descripción
          const stock = parseFloat(item.stkExistencias[0]?.cantidad || "0");

          const existingColor = groupedProducts[familiaId].colors?.find(
            (color) => color.name === colorName
          );

          if (existingColor) {
            // Si el color ya existe, sumar el stock para el peso específico
            existingColor.stock[weight] = (existingColor.stock[weight] || 0) + stock;
          } else {
            // Si el color no existe, agregarlo
            groupedProducts[familiaId].colors?.push({
              name: colorName,
              hex: "#000000", // Puedes asignar un color genérico o específico
              stock: {
                [weight]: stock, // Manejar el stock por peso
              },
            });
          }
        } else {
          // Para otras categorías, sumar el stock de forma general
          groupedProducts[familiaId].stock =
            (groupedProducts[familiaId].stock || 0) +
            parseFloat(item.stkExistencias[0]?.cantidad || "0");
        }
      });

      // Convertir el objeto agrupado en un array
      const transformedProducts = Object.values(groupedProducts);

      resolve(transformedProducts);
    }, 1000); // Simula un retraso de 1 segundo
  });
};