import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader, PartyPopper } from 'lucide-react';

// Enum para los posibles estados del pago
const PaymentStatus = {
  LOADING: 'loading',
  SUCCESS: 'success',
  FAIL: 'fail'
};

// Componente principal de la página de pago
const PaymentCallback = () => {
  // Estado para controlar el estado del pago
  const [status, setStatus] = useState(PaymentStatus.LOADING);
  
  // Datos simulados del pago
  const [paymentData, setPaymentData] = useState({
    id: '',
    amount: 0,
    currency: '',
    date: ''
  });

  // Añadimos estilos CSS para animaciones personalizadas
  useEffect(() => {
    const style = document.createElement('style');
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

  // Simulamos la verificación del pago al cargar el componente
  useEffect(() => {
    // Simulación de una llamada a API para verificar el estado del pago
    const verifyPayment = async () => {
      try {
        // Simulamos un tiempo de espera para la verificación
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulamos una respuesta aleatoria (éxito o fallo)
        const isSuccess = Math.random() > 0.5;
        
        if (isSuccess) {
          setStatus(PaymentStatus.SUCCESS);
          setPaymentData({
            id: 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase(),
            amount: parseFloat((Math.random() * 1000).toFixed(2)),
            currency: 'USD',
            date: new Date().toISOString()
          });
        } else {
          setStatus(PaymentStatus.FAIL);
        }
      } catch (error) {
        setStatus(PaymentStatus.FAIL);
        console.error('Error al verificar el pago:', error);
      }
    };

    verifyPayment();
  }, []);

  // Función para renderizar el contenido según el estado
  const renderContent = () => {
    switch (status) {
      case PaymentStatus.LOADING:
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader className="animate-spin text-blue-500" size={64} />
            <h2 className="text-xl font-semibold">Procesando su pago</h2>
            <p className="text-gray-600">Por favor espere mientras verificamos su transacción...</p>
          </div>
        );
      
      case PaymentStatus.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <CheckCircle 
                className="text-green-500" 
                size={64} 
              />
              <PartyPopper 
                className="absolute -top-4 -right-9 text-yellow-500 animate-pulse" 
                size={32} 
              />
              <PartyPopper 
                className="absolute -top-4 -left-8 text-blue-500 animate-pulse" 
                size={32} 
              />
            </div>
            
            <h2 className="text-xl font-semibold animate-pulse text-green-600">¡Pago Exitoso!</h2>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 w-full max-w-md transform transition-all duration-500 hover:scale-105">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-ping"></div>
                <p className="font-medium">Detalles de la transacción:</p>
              </div>
              <div className="mt-2 space-y-2">
                <p className="text-sm opacity-0 animate-fadeIn" style={{animationDelay: '0.2s', animationFillMode: 'forwards'}}>
                  ID de transacción: <span className="font-mono">{paymentData.id}</span>
                </p>
                <p className="text-sm opacity-0 animate-fadeIn" style={{animationDelay: '0.4s', animationFillMode: 'forwards'}}>
                  Monto: {paymentData.amount} {paymentData.currency}
                </p>
                <p className="text-sm opacity-0 animate-fadeIn" style={{animationDelay: '0.6s', animationFillMode: 'forwards'}}>
                  Fecha: {new Date(paymentData.date).toLocaleString()}
                </p>
              </div>
            </div>
            
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors transform hover:scale-105 hover:shadow-lg">
              Volver al inicio
            </button>
            
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute animate-confetti"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-5%',
                    animationDelay: `0s`,
                    animationDuration: `${3 + Math.random() * 4}s`,
                    background: ['#fde047', '#22c55e', '#3b82f6', '#ec4899'][Math.floor(Math.random() * 4)],
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
            <h2 className="text-xl font-semibold">El pago ha fallado</h2>
            <p className="text-gray-600">Lo sentimos, no pudimos procesar su pago. Por favor, inténtelo nuevamente.</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-md">
              <p className="font-medium">Posibles razones:</p>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Fondos insuficientes</li>
                <li>• Información de pago incorrecta</li>
                <li>• Problemas con su entidad bancaria</li>
                <li>• Error de conexión</li>
              </ul>
            </div>
            <div className="flex space-x-4 mt-4">
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                Contactar soporte
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Intentar nuevamente
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
          <h1 className="text-lg font-medium text-gray-900">Verificación de Pago</h1>
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