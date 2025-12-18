import { MapPin, Store, Truck, AlertCircle, X } from "lucide-react"; //MapPin,
import { useState } from "react";
import { ShippingInfoModal } from "./ShippingInfoModal";
import { apiFetch } from "../../services/api";

type Props = {
  formData: {
    street: string;
    number: string;
    city: string;
    postalCode: string;
    distance: number;
    observaciones: string;
  };
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setShippingCost: (cost: number) => void;
  deliveryMethod: "pickup" | "shipping";
  setDeliveryMethod: (method: "pickup" | "shipping") => void;
  confirmedAddress: string | null;
  setConfirmedAddress: (address: string | null) => void;
};

export const CheckoutAdress = ({
  formData,
  handleInputChange,
  setShippingCost,
  deliveryMethod,
  setDeliveryMethod,
  confirmedAddress,
  setConfirmedAddress,
}: Props) => {
  // const GOOGLE_API_KEY = "AIzaSyCDesHGPMQEk72w8X9sFRu1O1rzno9UopQ";

  const [showShippingInfo, setShowShippingInfo] = useState(false);
  const [shippingInfoChecked, setShippingInfoChecked] = useState(false);
  const [showShippingErrorModal, setShowShippingErrorModal] = useState(false);
  const [shippingError, setShippingError] = useState<{ message: string; retryable: boolean } | null>(null);
  // Función para calcular el costo de envío
  const calculateShippingCost = async (distance: number): Promise<number> => {
    try {
      // Redondear la distancia al entero más cercano para el endpoint
      const roundedDistance = Math.round(distance);
      const response = await apiFetch(`/stk-item/costo/${roundedDistance}`);
      console.log("Costo de envío recibido:", response);
      return response.costoTotal;
    } catch (error) {
      console.error("Error al obtener costo de envío:", error);
      return 0;
    }
  };
  const [calculatingShipping, setCalculatingShipping] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const BEARER_TOKEN = import.meta.env.VITE_API_BEARER_TOKEN;
  // Función para obtener la distancia desde la API de Google
  const fetchDistance = async () => {
    setCalculatingShipping(true);
    try {
      const response = await fetch(`${API_URL}/maps/distance`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${BEARER_TOKEN}`,"Content-Type": "application/json" },
        body: JSON.stringify({
          address: `${formData.street} ${formData.number}`,
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
          setCalculatingShipping(false);
          setConfirmedAddress(null);
          return;
        }
        setConfirmedAddress(data.destinationResolved);
        const distanceText = data.distance; // Ejemplo: "2.2 km"
        const distanceValue = parseFloat(distanceText.replace(" km", ""));
        if (distanceValue > 20) {
          setShippingError({ message: "La distancia supera los 20 km. El envío no está permitido.", retryable: false });
          setShowShippingErrorModal(true);
          setShippingCost(0);
        } else {
          const cost = await calculateShippingCost(distanceValue);
          setShippingCost(cost);
        }
      } else {
        setShippingError({ message: "No se pudo calcular la distancia. Verifica la dirección.", retryable: true });
        setShowShippingErrorModal(true);
      }
    } catch (error) {
      console.error("Error al obtener la distancia:", error);
      setShippingError({ message: "Hubo un error al calcular la distancia. Inténtalo de nuevo.", retryable: true });
      setShowShippingErrorModal(true);
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
      ${
        deliveryMethod === "pickup"
          ? "border-yellow-600 bg-yellow-50 text-yellow-700"
          : "border-gray-300 hover:border-gray-400"
      }
    `}
          >
            <Store className="h-5 w-5 mr-2" />
            Retiro en Local
          </button>
          <button
            type="button"
            onClick={() => handleDeliveryMethod("shipping")}
            className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all
      ${
        deliveryMethod === "shipping"
          ? "border-yellow-600 bg-yellow-50 text-yellow-700"
          : "border-gray-300 hover:border-gray-400"
      }
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
            <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
              <MapPin className="inline-block h-4 w-4 mr-1 text-blue-500" />
              Solo se muestran las provincias donde se realizan envíos
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700"
                >
                  País
                </label>
                <input
                  type="text"
                  id="country"
                  value="Argentina"
                  disabled
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed shadow-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="province"
                  className="block text-sm font-medium text-gray-700"
                >
                  Provincia
                </label>
                <input
                  type="text"
                  id="province"
                  value="Mendoza"
                  disabled
                  className="mt-1 p-2 block w-full rounded-md border-gray-300 bg-gray-100 cursor-not-allowed shadow-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Calle
                </label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleInputChange}
                  required={deliveryMethod === "shipping"}
                  className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Ej: Santiago de Liniers"
                />
              </div>
              <div>
                <label
                  htmlFor="number"
                  className="block text-sm font-medium text-gray-700"
                >
                  Número
                </label>
                <input
                  type="text"
                  id="number"
                  name="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  required={deliveryMethod === "shipping"}
                  className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Ej: 670"
                />
              </div>
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
                  className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                  placeholder="Ej: Godoy Cruz"
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
                  className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ej: 5501"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="observaciones"
                className="block text-sm font-medium text-gray-700"
              >
                Observaciones (opcional)
              </label>
              <textarea
                id="observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={(e) => handleInputChange(e as any)}
                rows={3}
                className="mt-1 p-2 block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500"
                placeholder="Ej: Casa con portón azul, timbre 2B"
              />
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
                  información de envíos
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
              {calculatingShipping
                ? "Calculando..."
                : "Calcular Costo de Envío"}
            </button>
            {confirmedAddress && (
              <div className="mt-2 p-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm">
                <strong>Ubicación confirmada:</strong>
                <div>{confirmedAddress}</div>
              </div>
            )}
            {/* Modal */}
            {showShippingInfo && (
              <ShippingInfoModal
                open={showShippingInfo}
                onClose={() => setShowShippingInfo(false)}
              />
            )}

            {/* Modal de error de envío */}
            {showShippingErrorModal && shippingError && (
              <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                <div 
                  className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="shipping-error-title"
                >
                  <div className="relative px-6 pt-6 pb-4">
                    <button
                      onClick={() => {
                        setShowShippingErrorModal(false);
                      }}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                      aria-label="Cerrar"
                    >
                      <X size={20} />
                    </button>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="text-red-600" size={24} />
                      </div>
                      <div className="flex-1 pt-1">
                        <h3 
                          id="shipping-error-title"
                          className="text-xl font-semibold text-gray-900 mb-1"
                        >
                          Error al calcular envío
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {shippingError.message}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700">
                        {shippingError.retryable 
                          ? "💡 Puedes intentar calcular nuevamente." 
                          : "⏰ Por favor, intenta más tarde o contacta con soporte."}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6">
                    <button
                      onClick={() => {
                        setShowShippingErrorModal(false);
                      }}
                      className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-sm hover:shadow-md"
                    >
                      Aceptar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
