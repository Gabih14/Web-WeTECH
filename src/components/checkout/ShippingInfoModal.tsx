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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] shadow-xl relative overflow-y-auto">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl leading-none z-10"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ×
        </button>

        <div className="pr-8">
          <h3 className="text-xl font-bold mb-4 text-blue-700 flex items-center gap-2">
            📦 Información Importante sobre Envíos
          </h3>

          <div className="space-y-6">
            {/* Gran Mendoza */}
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                📍 Gran Mendoza
              </h4>
              <div className="text-gray-700 text-sm space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  Ofrecemos servicio de mensajería para entregas en el día.
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>
                    Para recibir tu pedido el mismo día: realiza tu pedido y
                    confirma el pago
                    <strong className="text-green-700">
                      {" "}
                      antes de las 16:00 hs
                    </strong>
                    .
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  Los pedidos procesados después de ese horario no siempre
                  podrán ser despachados el mismo día.
                </p>
              </div>
            </div>

            {/* Resto de la Provincia */}
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                📍 Resto de la Provincia
              </h4>
              <div className="text-gray-700 text-sm space-y-2">
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Para entregas rápidas: realiza tu pedido y paga por
                    transferencia
                    <strong className="text-blue-700">
                      {" "}
                      antes de las 14:00 hs
                    </strong>
                    .
                  </span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  Los envíos se despachan esa tarde y llegan al día siguiente.
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>
                    Los pedidos pagados después de las 14hs serán despachados al
                    día siguiente,
                    <strong className="text-blue-700"> sin excepción</strong>.
                    Lo cual extiende la entrega al día posterior del despacho.
                  </span>
                </p>
              </div>
            </div>

            {/* Lugares Alejados */}
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
                📍 Lugares Alejados
              </h4>
              <div className="text-gray-700 text-sm">
                <p className="flex items-start gap-2">
                  <span className="text-orange-600 mt-1">•</span>
                  Algunos destinos alejados pueden requerir más tiempo de
                  entrega. Te sugerimos consultar tiempos estimados antes de
                  realizar tu compra.
                </p>
              </div>
            </div>

            {/* Mensaje Importante */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-yellow-600 text-lg">⚠️</span>
                <div>
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Importante
                  </h4>
                  <p className="text-yellow-700 text-sm mb-3">
                    Queremos garantizarte un envío rápido al mejor precio. Por
                    favor, planifica y gestiona tu pedido con antelación para
                    evitar demoras.
                  </p>
                  <p className="text-yellow-700 text-sm font-medium">
                    ¡Gracias por confiar en nosotros! 😊
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
