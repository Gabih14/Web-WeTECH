import React from "react";

interface ShippingInfoModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShippingInfoModal: React.FC<ShippingInfoModalProps> = ({
  open,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>
        <h3 className="text-lg font-bold mb-2 text-yellow-700">
          Información importante de envíos
        </h3>
        <div className="text-gray-700 text-sm space-y-2">
          <p>
            - El envío solo está disponible dentro de un radio de 24 km desde nuestro local.
          </p>
          <p>
            - Asegúrate de ingresar tu dirección completa y correcta para evitar demoras.
          </p>
          <p>
            - Los costos varían según la distancia y se calculan automáticamente.
          </p>
          <p>
            - Si tienes dudas, contáctanos antes de finalizar tu compra.
          </p>
        </div>
      </div>
    </div>
  );
};