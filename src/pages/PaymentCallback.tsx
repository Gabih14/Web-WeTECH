import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "fail">(
    "loading"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    const checkPaymentStatus = async () => {
      try {
        // Simulación de delay de red
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulación de resultado mock
        const mockData = {
          status: "approved", // Cambiar a "rejected" para simular error (=! approved)
        };

        if (mockData.status === "approved") {
          setStatus("success");
        } else {
          setStatus("fail");
        }
      } catch (err) {
        console.error(err);
        setStatus("fail");
      }
    };

    if (paymentId) {
      checkPaymentStatus();
    } else {
      setStatus("fail");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-start mt-20 h-screen bg-gray-100 px-4">
      {status === "loading" && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Verificando estado del pago...</p>
        </div>
      )}
  
      {status === "success" && (
        <div className="text-center bg-green-100 text-green-700 p-6 rounded shadow-md mb-4">
          <h2 className="text-2xl font-bold mb-2">✅ ¡Pago exitoso!</h2>
          <p className="text-lg">Gracias por tu compra.</p>
        </div>
      )}
  
      {status === "fail" && (
        <div className="text-center bg-red-100 text-red-700 p-6 rounded shadow-md mb-4">
          <h2 className="text-2xl font-bold mb-2">❌ Hubo un problema con el pago.</h2>
          <p className="text-lg">Por favor, intentá nuevamente o contactanos.</p>
        </div>
      )}
  
      <button
        onClick={() => navigate("/")}
        className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Volver a la tienda
      </button>
    </div>
  );
}
