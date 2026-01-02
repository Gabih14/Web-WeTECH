import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Loader,
  PartyPopper,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "../services/api";

// Enum para los posibles estados del pago
const PaymentStatus = {
  LOADING: "loading",
  SUCCESS: "success",
  FAIL: "fail",
};

// Tipo para los datos del pedido
interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
}

interface PedidoData {
  id: number;
  cliente_cuit: string;
  cliente_nombre: string;
  external_id: string;
  total: number;
  estado: string;
  productos: Producto[];
  creado: string;
  aprobado: string | null;
}

// Componente principal de la página de pago
const PaymentCallback = () => {
  // Estado para controlar el estado del pago
  const [status, setStatus] = useState(PaymentStatus.LOADING);
  const [searchParams] = useSearchParams();

  // Datos del pedido obtenidos de la API
  const [pedidoData, setPedidoData] = useState<PedidoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Obtener el external_id de los parámetros de la URL (compatibilidad con distintos gateways)
  const externalId =
    searchParams.get("external_id") ||
    searchParams.get("order_id") ||
    searchParams.get("id") ||
    searchParams.get("payment_id") ||
    searchParams.get("preference_id") ||
    searchParams.get("collection_id");

  // Log de diagnóstico si no se encuentra ningún ID en la URL
  useEffect(() => {
    if (!externalId) {
      try {
        // Mostrar todos los parámetros presentes para facilitar el diagnóstico
        // Object.fromEntries puede lanzar en navegadores antiguos, por eso el try/catch
        // pero en entornos modernos (y React) es seguro.
        // eslint-disable-next-line no-console
        console.warn(
          "No se encontró un identificador de pedido en la URL. Params:",
          Object.fromEntries(searchParams.entries())
        );
      } catch {
        // eslint-disable-next-line no-console
        console.warn("No se encontró un identificador de pedido en la URL.");
      }
    }
  }, [externalId, searchParams]);

  // Función para refrescar manualmente el estado del pedido
  const refreshPedidoStatus = async () => {
    if (!externalId || isRefreshing) return;

    try {
      setIsRefreshing(true);
      const data: PedidoData = await apiFetch(`/pedido/${externalId}`);
      setPedidoData(data);
      // Actualizar el estado basado en el nuevo estado del pedido
      if (data.estado === "APROBADO") {
        setStatus(PaymentStatus.SUCCESS);
      } else if (data.estado === "RECHAZADO" || data.estado === "CANCELADO") {
        setStatus(PaymentStatus.FAIL);
      } else {
        setStatus(PaymentStatus.LOADING);
      }

      // Limpiar errores previos si la petición fue exitosa
      setError(null);
    } catch (error) {
      console.error("Error al refrescar el pedido:", error);
      setError(error instanceof Error ? error.message : "Error al refrescar");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Añadimos estilos CSS para animaciones personalizadas
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes confetti {
        0% { transform: translateY(0) rotate(0deg); }
        100% { transform: translateY(100vh) rotate(720deg); }
      }

      .animate-fadeIn {
        animation: fadeIn 0.8s ease-out forwards;
      }
      
      .animate-confetti {
        animation: confetti 5s ease-in-out forwards;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Verificamos el estado del pedido al cargar el componente
  useEffect(() => {
    const fetchPedido = async () => {
      if (!externalId) {
        setError("No se proporcionó ID del pedido");
        setStatus(PaymentStatus.FAIL);
        return;
      }

      try {
        setStatus(PaymentStatus.LOADING);

        // Hacer petición al endpoint usando apiFetch
        const data: PedidoData = await apiFetch(`/pedido/${externalId}`);
        setPedidoData(data);
        console.log(data);
        // Determinar el estado basado en el estado del pedido
        if (data.estado === "APROBADO") {
          setStatus(PaymentStatus.SUCCESS);
        } else if (data.estado === "RECHAZADO" || data.estado === "CANCELADO") {
          setStatus(PaymentStatus.FAIL);
        } else {
          // Para estados como "PENDIENTE", mantener como loading y verificar periódicamente
          setStatus(PaymentStatus.LOADING);
        }
      } catch (error) {
        console.error("Error al obtener el pedido:", error);
        setError(error instanceof Error ? error.message : "Error desconocido");
        setStatus(PaymentStatus.FAIL);
      }
    };

    fetchPedido();
  }, [externalId]);

  // Efecto para verificar periódicamente el estado si está pendiente
  useEffect(() => {
    let interval: number;

    if (pedidoData && pedidoData.estado === "PENDIENTE") {
      interval = setInterval(async () => {
        try {
          const data: PedidoData = await apiFetch(`/pedido/${externalId}`);
          setPedidoData(data);

          if (data.estado === "APROBADO") {
            setStatus(PaymentStatus.SUCCESS);
          } else if (
            data.estado === "RECHAZADO" ||
            data.estado === "CANCELADO"
          ) {
            setStatus(PaymentStatus.FAIL);
          }
        } catch (error) {
          console.error("Error en verificación periódica:", error);
        }
      }, 5000); // Verificar cada 5 segundos
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [pedidoData, externalId]);

  // Función para renderizar el contenido según el estado
  const renderContent = () => {
    switch (status) {
      case PaymentStatus.LOADING:
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader className="animate-spin text-blue-500" size={64} />
            <h2 className="text-xl font-semibold">
              {pedidoData
                ? "Verificando estado del pedido"
                : "Cargando información del pedido"}
            </h2>
            <p className="text-gray-600 text-center">
              {pedidoData ? (
                <>
                  Su pedido está en estado{" "}
                  <span className="font-medium">{pedidoData.estado}</span>.
                  <br />
                  Por favor espere mientras verificamos el pago...
                </>
              ) : (
                "Por favor espere mientras obtenemos la información de su pedido..."
              )}
            </p>
            {pedidoData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full max-w-md">
                <p className="font-medium text-sm">Información del pedido:</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p>ID: {pedidoData.id}</p>
                  <p>Cliente: {pedidoData.cliente_nombre}</p>
                  <p>Total: ${pedidoData.total.toLocaleString("es-AR")} ARS</p>
                </div>
              </div>
            )}

            {/* Botón para refrescar manualmente */}
            <button
              onClick={refreshPedidoStatus}
              disabled={isRefreshing}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105 hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Verificando..." : "Verificar estado ahora"}
            </button>
          </div>
        );

      case PaymentStatus.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <CheckCircle className="text-green-500" size={64} />
              <PartyPopper
                className="absolute -top-4 -right-9 text-yellow-500 animate-pulse"
                size={32}
              />
              <PartyPopper
                className="absolute -top-4 -left-8 text-blue-500 animate-pulse"
                size={32}
              />
            </div>

            <h2 className="text-xl font-semibold animate-pulse text-green-600">
              ¡Pago Exitoso!
            </h2>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full max-w-md transform transition-all duration-500 hover:scale-105">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-ping"></div>
                <p className="font-medium">Detalles del pedido:</p>
              </div>
              <div className="mt-2 space-y-2">
                <p
                  className="text-sm opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: "0.2s",
                    animationFillMode: "forwards",
                  }}
                >
                  ID del pedido:{" "}
                  <span className="font-mono">{pedidoData?.id}</span>
                </p>
                <p
                  className="text-sm opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: "0.3s",
                    animationFillMode: "forwards",
                  }}
                >
                  Cliente:{" "}
                  <span className="font-medium">
                    {pedidoData?.cliente_nombre}
                  </span>
                </p>
                <p
                  className="text-sm opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: "0.4s",
                    animationFillMode: "forwards",
                  }}
                >
                  Total: ${pedidoData?.total?.toLocaleString("es-AR")} ARS
                </p>
                <p
                  className="text-sm opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: "0.5s",
                    animationFillMode: "forwards",
                  }}
                >
                  Estado:{" "}
                  <span className="font-medium text-green-600">
                    {pedidoData?.estado}
                  </span>
                </p>
                <p
                  className="text-sm opacity-0 animate-fadeIn"
                  style={{
                    animationDelay: "0.6s",
                    animationFillMode: "forwards",
                  }}
                >
                  Fecha:{" "}
                  {pedidoData?.creado
                    ? new Date(pedidoData.creado).toLocaleString("es-AR")
                    : "N/A"}
                </p>
              </div>

              {/* Mostrar productos */}
              {pedidoData?.productos && pedidoData.productos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200">
                  <p className="font-medium text-sm mb-2">Productos:</p>
                  <div className="space-y-2">
                    {pedidoData.productos.map(
                      (producto) => (
                        console.log(producto),
                        (
                          <div
                            key={producto.id}
                            className="text-xs bg-white p-2 rounded border"
                          >
                            <p className="font-medium">{producto.descripcion}</p>
                            <p className="text-gray-600">
                              Cantidad: {producto.cantidad} | Precio: $
                              {producto.precio_unitario.toLocaleString("es-AR")}
                            </p>
                          </div>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors transform hover:scale-105 hover:shadow-lg"
                onClick={() => (window.location.href = "/")}
              >
                Volver al inicio
              </button>
            </div>

            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: "-5%",
                    animationDelay: `0s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                    background: ["#fde047", "#22c55e", "#3b82f6", "#ec4899"][
                      Math.floor(Math.random() * 4)
                    ],
                    width: `${5 + Math.random() * 10}px`,
                    height: `${10 + Math.random() * 15}px`,
                  }}
                />
              ))}
            </div>
          </div>
        );

      case PaymentStatus.FAIL:
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <XCircle className="text-red-500" size={64} />
            <h2 className="text-xl font-semibold">
              {pedidoData
                ? "Pago rechazado o cancelado"
                : "Error al obtener el pedido"}
            </h2>
            <p className="text-gray-600 text-center">
              {pedidoData ? (
                <>
                  Su pedido está en estado{" "}
                  <span className="font-medium text-red-600">
                    {pedidoData.estado}
                  </span>
                  .
                  <br />
                  Por favor contacte con soporte para más información.
                </>
              ) : (
                "No pudimos obtener la información de su pedido. Por favor, inténtelo nuevamente."
              )}
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-md">
                <p className="font-medium text-red-800">Error técnico:</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            )}

            {pedidoData && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 w-full max-w-md">
                <p className="font-medium text-sm">Información del pedido:</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p>ID: {pedidoData.id}</p>
                  <p>Cliente: {pedidoData.cliente_nombre}</p>
                  <p>Total: ${pedidoData.total.toLocaleString("es-AR")} ARS</p>
                  <p>
                    Estado:{" "}
                    <span className="font-medium text-red-600">
                      {pedidoData.estado}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-md">
              <p className="font-medium">Posibles razones:</p>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Fondos insuficientes</li>
                <li>• Información de pago incorrecta</li>
                <li>• Problemas con su entidad bancaria</li>
                <li>• Error de conexión</li>
                <li>• Pedido cancelado manualmente</li>
              </ul>
            </div>
            <div className="flex space-x-4 mt-4">
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                Contactar soporte
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={refreshPedidoStatus}
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Verificando..." : "Verificar estado"}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Cabecera */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-medium text-gray-900">
            Verificación de Pago
          </h1>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6 md:p-12">
            {/* Renderizar el contenido según el estado */}
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentCallback;
