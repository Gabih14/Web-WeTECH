import { Product } from "../types";
import { colors } from "../data/colors";

export const fetchProducts = async (): Promise<Product[]> => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  if (!API_URL) {
    throw new Error("API URL is not defined");
  }
  try {
    // Petición
    const response = await fetch(`${API_URL}/stk-item`);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      throw new Error("Error al obtener los productos del servidor");
    }

    // Obtener los datos en formato JSON
    const rawProducts = await response.json();

    // Transformar los datos
    const groupedProducts: { [key: string]: Product } = {};

    rawProducts.forEach((item: any) => {
      // Usar familia si está disponible, de lo contrario usar id
      const familia = item.familia || item.id;
      const [marca, ...modeloArr] = familia.split(" ");
      const modelo = modeloArr.join(" ");

      // Ignorar ítems del grupo "FILAMENTOS" sin familia
      if (item.grupo === "FILAMENTOS" && !item.familia) {
        return; // Salir de esta iteración
      }

      if (!groupedProducts[familia]) {
        // Crear el producto principal
        groupedProducts[familia] = {
          id: item.id,
          name: familia,//item.id, //item.familia ? item.familia : item.descripcion
          description: item.descripcion,
          image: `/assets/${marca}/${modelo}/${item.id}.png`, // Generar la ruta dinámica de la imagen
          category: item.grupo,
          subcategory: item.subgrupo ? item.subgrupo.toUpperCase() : undefined,
          price: parseFloat(item.precioVtaCotizado || "0"), // Guardar precioVtaCotizado en todos los productos
          ...(item.grupo === "FILAMENTOS" && { colors: [] }), // Solo agregar `colors` si es "FILAMENTOS"
          ...(item.grupo !== "FILAMENTOS" && { stock: 0 }), // Solo agregar `stock` si no es "FILAMENTOS"
        };

        // Solo agregar `weights` si el grupo es "FILAMENTOS"
        if (item.grupo === "FILAMENTOS") {
          groupedProducts[familia].weights = [];
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
        const existingWeight = groupedProducts[familia].weights?.find(
          (w) => w.weight === weight
        );

        if (!existingWeight) {
          // Agregar el peso y precio a `weights` solo si no existe
          groupedProducts[familia].weights?.push({
            weight,
            price,
            promotionalPrice,
          });
        }

        // Manejar el stock por colores
        const colorName = item.descripcion.split("|")[1]?.trim() || "Sin color"; // Extraer el color del campo descripción
        const stock = parseFloat(item.stkExistencias?.[0]?.cantidad || "0");

        // Buscar el color en el array `colors` para obtener su valor `hex`
        const colorData = colors.find(
          (color) => color.name.toLowerCase() === colorName.toLowerCase()
        );
        const hexValue = colorData ? colorData.hex : "#000000"; // Usar el valor encontrado o un valor predeterminado

        const existingColor = groupedProducts[familia].colors?.find(
          (color) => color.name === colorName
        );

        if (existingColor) {
          // Si el color ya existe, sumar el stock para el peso específico
          existingColor.stock[weight] =
            (existingColor.stock[weight] || 0) + stock;
        } else {
          // Si el color no existe, agregarlo
          groupedProducts[familia].colors?.push({
            name: colorName,
            hex: hexValue, // Puedes asignar un color genérico o específico
            stock: {
              [weight]: stock, // Manejar el stock por peso
            },
          });
        }
      } else {
        // Para otras categorías, sumar el stock de forma general
        groupedProducts[familia].stock =
          (groupedProducts[familia].stock || 0) +
          parseFloat(item.stkExistencias?.[0]?.cantidad || "0");
      }
    });

    // Convertir el objeto agrupado en un array
    const transformedProducts = Object.values(groupedProducts);
    return transformedProducts;
  } catch (error: any) {
    console.error("Error al obtener los productos:", error.message);
    throw new Error(
      "No se pudieron obtener los productos. Intenta nuevamente más tarde."
    );
  }
};
