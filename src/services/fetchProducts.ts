import { apiFetch } from "../services/api";
import { Product } from "../types";
import { colors } from "../data/colors";


export const fetchProducts = async (): Promise<Product[]> => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
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
    console.log("Raw products fetched:", rawProducts);

    // Transformar los datos
    const groupedProducts: { [key: string]: Product } = {};

    rawProducts.forEach((item: any) => {
      // Usar familia si está disponible, de lo contrario usar id
      const familia = item.familia || item.id;
      // const [marca, ...modeloArr] = familia.split(" ");
      // const modelo = modeloArr.join(" ");

      // Ignorar ítems del grupo "FILAMENTOS" sin familia
      if (item.grupo === "FILAMENTOS" && !item.familia) {
        return; // Salir de esta iteración
      }

      // Ignorar ítems con precio 0 o menor
      if (!item.precioVtaCotizadoMin || parseFloat(item.precioVtaCotizadoMin) <= 0) {
        return; // Salir de esta iteración
      }

      if (!groupedProducts[familia]) {
        // Generar rutas de imágenes para el producto
        const generateProductImages = (itemId: string, itemGroup: string, familia: string) => {
          const basePath = itemGroup === "FILAMENTOS" ? "/assets/filamentos" : "/assets/productos";
          
          if (itemGroup === "FILAMENTOS") {
            // Para filamentos, usar el nombre de la familia
            return [
              `${basePath}/${familia}.png`,
              `${basePath}/${familia}_1.png`,
              `${basePath}/${familia}_2.png`,
              `${basePath}/${familia}_3.png`,
            ];
          } else {
            // Para otros productos, usar el ID
            return [
              `${basePath}/${itemId}.png`,
              `${basePath}/${itemId}_1.png`,
              `${basePath}/${itemId}_2.png`,
              `${basePath}/${itemId}_3.png`,
            ];
          }
        };

        const productImages = generateProductImages(item.id, item.grupo, familia);
        
        // Para filamentos, la imagen principal será la primera imagen de color
        let primaryImage = productImages[0];
        
        // Crear el producto principal
        groupedProducts[familia] = {
          id: item.id,
          name: familia,//item.id, //item.familia ? item.familia : item.descripcion
          description: item.descripcion,
          image: primaryImage, // Se actualizará después con la primera imagen de color para filamentos
          images: productImages, // Array completo de imágenes
          category: item.grupo,
          subcategory: item.subgrupo ? item.subgrupo.toUpperCase() : undefined,
          price: parseFloat(item.precioVtaCotizadoMin || "0"), // Guardar precioVtaCotizadoMin en todos los productos
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
        const price = parseFloat(item.precioVtaCotizadoMin || "0"); // Usar precioVtaCotizadoMin como precio
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
          // Generar imágenes específicas para este color
          // Para filamentos: solo una imagen por color
          const colorImages = [
            `/assets/filamentos/${familia} ${colorName.toUpperCase()}.png`,
          ];
          
          // Si el color no existe, agregarlo
          groupedProducts[familia].colors?.push({
            name: colorName,
            hex: hexValue, // Puedes asignar un color genérico o específico
            stock: {
              [weight]: stock, // Manejar el stock por peso
            },
            images: colorImages, // Solo una imagen por color para filamentos
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
    
    // Para filamentos, actualizar la imagen principal con la primera imagen de color
    transformedProducts.forEach(product => {
      if (product.category === "FILAMENTOS" && product.colors && product.colors.length > 0) {
        // Usar la primera imagen del primer color como imagen principal
        const firstColorImage = product.colors[0].images?.[0];
        if (firstColorImage) {
          product.image = firstColorImage;
        }
      }
    });
    
    return transformedProducts;
  } catch (error: any) {
    console.error("Error al obtener los productos:", error.message);
    throw new Error(
      "No se pudieron obtener los productos. Intenta nuevamente más tarde."
    );
  }
};
