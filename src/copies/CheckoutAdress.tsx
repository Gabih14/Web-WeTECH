import { MapPin } from "lucide-react";
import { shippingCosts } from "../data/shippingCost";

type Props = {
  formData: {
    address: string;
    city: string;
    postalCode: string;
    distance: number;
  };
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setShippingCost: (cost: number) => void;
};

export const CheckoutAdress = ({
  formData,
  handleInputChange,
  setShippingCost,
}: Props) => {
  const GOOGLE_API_KEY = "AIzaSyCDesHGPMQEk72w8X9sFRu1O1rzno9UopQ";

  // Función para calcular el costo de envío
  const calculateShippingCost = (distance: number) => {
    const costEntry = shippingCosts.find(
      (entry) =>
        distance >= entry.distances[0] && distance <= entry.distances[1]
    );
    return costEntry ? costEntry.cost : 0;
  };

  // Función para obtener la distancia desde la API de Google
  const fetchDistance = async () => {
    const destination = `${formData.address},${formData.city}`;
    const origin = "place_id:ChIJaWI2TDwJfpYRx4Y5N9AgsAY"; // ID del local
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${encodeURIComponent(
      destination
    )}&origins=${origin}&key=${GOOGLE_API_KEY}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Respuesta de Google Maps:", data);

      if (data.status === "OK") {
        const distanceText = data.rows[0].elements[0].distance.text; // Ejemplo: "25 km"
        const distanceValue = parseFloat(distanceText.replace(" km", "")); // Convertir a número

        if (distanceValue > 24) {
          alert("La distancia supera los 24 km. El envío no está permitido.");
          setShippingCost(0); // No se permite el envío
        } else {
          const cost = calculateShippingCost(distanceValue);
          setShippingCost(cost); // Actualizar el costo de envío
        }
      } else {
        alert("No se pudo calcular la distancia. Verifica la dirección.");
      }
    } catch (error) {
      console.error("Error al obtener la distancia:", error);
      alert("Hubo un error al calcular la distancia. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
        <MapPin className="h-5 w-5 mr-2" />
        Dirección de Envío
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700"
          >
            Dirección
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="city"
              className="block text-sm font-medium text-gray-700"
            >
              Ciudad
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="postalCode"
              className="block text-sm font-medium text-gray-700"
            >
              Código Postal
            </label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={fetchDistance}
            className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Calcular Distancia
          </button>
        </div>
      </div>
    </div>
  );
};