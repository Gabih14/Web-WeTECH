import { MapPin } from "lucide-react";
import { shippingCosts } from "../data/shippingCost";

// Define the Props type
type Props = {
  formData: {
    address: string;
    city: string;
    postalCode: string;
    distance: number; // Agregado para almacenar la distancia
  };
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setShippingCost: (cost: number) => void; // Función para actualizar el costo de envío
};

export const CheckoutAdress = ({
  formData,
  handleInputChange,
  setShippingCost,
}: Props) => {
  // Función para calcular el costo de envío
  const calculateShippingCost = (distance: number) => {
    const costEntry = shippingCosts.find(
      (entry) =>
        distance >= entry.distances[0] && distance <= entry.distances[1]
    );
    return costEntry ? costEntry.cost : 0; // Retorna 0 si no hay coincidencia
  };

  // Manejar el cambio en el input de distancia
  const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const distance = parseFloat(e.target.value) || 0; // Convertir a número
    handleInputChange(e); // Actualizar el estado general
    const cost = calculateShippingCost(distance); // Calcular el costo
    setShippingCost(cost); // Actualizar el costo de envío
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
          <label
            htmlFor="distance"
            className="block text-sm font-medium text-gray-700"
          >
            Distancia (km)
          </label>
          <input
            type="number"
            id="distance"
            name="distance"
            value={formData.distance}
            onChange={handleDistanceChange}
            required
            className="mt-1 block w-full rounded-md border-2 border-black shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">
            Costo de Envío:{" "}
            <span className="font-bold text-gray-900">
              ${calculateShippingCost(formData.distance).toFixed(2)}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};