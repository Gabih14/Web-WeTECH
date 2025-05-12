import { Product } from '../types'; // Asegúrate de que 'Product' esté correctamente importado

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    // Realizamos la llamada a la API para obtener los datos de la familia de productos
    const response = await fetch("http://localhost:3000/stk-familia");
    const data = await response.json();

    // Procesamos los datos
    const products: Product[] = data.map((familia: any) => {
      return familia.stkItems.map((item: any) => {
        // Extraemos la información de cada item
        const product: Product = {
          id: item.id.split(" ")[0], // El primer segmento de la ID de stk-item
          name: item.descripcion.split(" | ")[0], // El primer segmento de la descripción
          description: item.descripcion,
          category: item.grupo,
          subcategory: item.subgrupo || undefined,
          presentatio: item.presentacion,
          colors: item.stkPrecios.map((precio: any) => {
            return {
              name: item.descripcion.split(" | ")[1], // El segundo segmento de la descripción (ej. "Verde Lima")
              hex: "#000000", // Esto lo podrías ajustar si tienes más datos de color
              stock: item.stkExistencias.reduce((acc: any, existencia: any) => {
                const weight = existencia.item.split(" ")[3]; // El peso está en la descripción
                acc[weight] = parseFloat(existencia.cantidad);
                return acc;
              }, {}),
            };
          }),
          weights: item.stkPrecios.map((precio: any) => ({
            weight: parseFloat(item.descripcion.split(" | ")[3]), // Obtenemos el peso de la descripción
            price: parseFloat(precio.precioVtaCotizado),
            promotionalPrice: parseFloat(precio.precioVtaCotizado) * 0.9, // O una lógica similar para el precio promocional
          })),
          // El precio del producto
          price: item.stkPrecios[0] ? parseFloat(item.stkPrecios[0].precioVtaCotizado) : undefined,
          currency: "ARS", // Asumimos que es ARS, pero puedes ajustar según la API
        };

        return product;
      });
    });

    // Devolvemos el array de productos
    return products.flat();
  } catch (error) {
    console.error("Error al obtener los productos:", error);
    return [];
  }
};