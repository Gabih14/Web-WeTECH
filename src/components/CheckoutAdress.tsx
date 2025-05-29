import { Store, Truck } from "lucide-react"; //MapPin,
import { shippingCosts } from "../data/shippingCost";
import { useState } from "react";
import { ShippingInfoModal } from "./ShippingInfoModal";

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
  // const GOOGLE_API_KEY = "AIzaSyCDesHGPMQEk72w8X9sFRu1O1rzno9UopQ";
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "shipping">(
    "pickup"
  );
  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const [shippingInfoChecked, setShippingInfoChecked] = useState(false);
  // Función para calcular el costo de envío
  const calculateShippingCost = (distance: number) => {
    const costEntry = shippingCosts.find(
      (entry) =>
        distance >= entry.distances[0] && distance <= entry.distances[1]
    );
    return costEntry ? costEntry.cost : 0;
  };
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  // Función para obtener la distancia desde la API de Google
  const fetchDistance = async () => {
    setCalculatingShipping(true);
    try {
      const response = await fetch("http://localhost:3000/maps/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: formData.address,
          city: formData.city,
        }),
      });
      const data = await response.json();
      console.log("Respuesta del backend:", data);

      if (data && data.distance && data.destinationResolved) {
        // Pregunta al usuario si la dirección resuelta es correcta
        const isConfirmed = window.confirm(
          `¿Este es tu domicilio?\n\n${data.destinationResolved}\n\nPresiona "Aceptar" si es correcto, o "Cancelar" para volver a intentarlo con datos más precisos.`
        );
        if (!isConfirmed) {
          alert("Por favor, ingresa tu dirección con más detalles.");
          setCalculatingShipping(false);
          return;
        }

        const distanceText = data.distance; // Ejemplo: "2.2 km"
        const distanceValue = parseFloat(distanceText.replace(" km", ""));
        if (distanceValue > 20) {
          alert("La distancia supera los 20 km. El envío no está permitido.");
          setShippingCost(0);
        } else {
          const cost = calculateShippingCost(distanceValue);
          setShippingCost(cost);
        }
      } else {
        alert("No se pudo calcular la distancia. Verifica la dirección.");
      }
    } catch (error) {
      console.error("Error al obtener la distancia:", error);
      alert("Hubo un error al calcular la distancia. Inténtalo de nuevo.");
    } finally {
      setCalculatingShipping(false);
    }
  };

  // Cuando cambia el método de entrega:
  const handleDeliveryMethod = (method: "pickup" | "shipping") => {
    setDeliveryMethod(method);
    if (method === "pickup") {
      setShippingCost(0);
    }
    // Si es shipping, el costo se calcula con fetchDistance
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Método de Entrega
      </h2>
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row w-full gap-2">
          <button
            type="button"
            onClick={() => handleDeliveryMethod("pickup")}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all
      ${deliveryMethod === "pickup"
                ? "border-yellow-600 bg-yellow-50 text-yellow-700"
                : "border-gray-300 hover:border-gray-400"}
    `}
          >
            <Store className="h-5 w-5 mr-2" />
            Retiro en Local
          </button>
          <button
            type="button"
            onClick={() => handleDeliveryMethod("shipping")}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all
      ${deliveryMethod === "shipping"
                ? "border-yellow-600 bg-yellow-50 text-yellow-700"
                : "border-gray-300 hover:border-gray-400"}
    `}
          >
            <Truck className="h-5 w-5 mr-2" />
            Envío a Domicilio
          </button>
        </div>

        {deliveryMethod === "pickup" && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">Dirección del Local</h3>
            <p className="mt-2 text-gray-600">
              Santiago de Liniers 670
              <br />
              Godoy Cruz, Mendoza
              <br />
              Horario: Lunes a Viernes{" "}
              <span className="font-bold">10:00 - 19:00</span>
              <br />
              Sábados: <span className="font-bold">10:00 - 14:00</span>
              <br />
              <br />
              <a
                href="https://maps.app.goo.gl/NbjkqZgv72pkWcTR8"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow hover:bg-yellow-700 transition"
              >
                Ver en Google Maps
              </a>
            </p>
          </div>
        )}

        {deliveryMethod === "shipping" && (
          <div className="space-y-4">
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
                required={deliveryMethod === "shipping"}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  required={deliveryMethod === "shipping"}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                  required={deliveryMethod === "shipping"}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="shippingInfoChecked"
                checked={shippingInfoChecked}
                onChange={(e) => setShippingInfoChecked(e.target.checked)}
                className="accent-yellow-600"
              />
              <label htmlFor="shippingInfoChecked" className="text-sm">
                Leí{" "}
                <button
                  type="button"
                  className="text-yellow-700 font-semibold underline hover:text-yellow-900"
                  onClick={() => setShowShippingInfo(true)}
                >
                  información importante de envíos
                </button>
              </label>
            </div>
            <button
              type="button"
              onClick={fetchDistance}
              disabled={
                calculatingShipping ||
                !formData.postalCode ||
                !shippingInfoChecked
              }
              className="w-full bg-yellow-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculatingShipping ? "Calculando..." : "Calcular Costo de Envío"}
            </button>
            {/* Modal */}
            {showShippingInfo && (
              <ShippingInfoModal
                open={showShippingInfo}
                onClose={() => setShowShippingInfo(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
