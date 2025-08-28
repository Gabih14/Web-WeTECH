import { Link } from "react-router-dom";
import { ArrowLeft, Wrench } from "lucide-react";
import Logo from "../assets/Logo WeTECH Negro PNG.png";

export function UnderDevelopment() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src={Logo}
            alt="Logo WeTECH"
            className="h-24 w-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ¡Estamos trabajando en esta sección!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Pronto tendrás disponible esta funcionalidad
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center">
            <div className="bg-yellow-100 p-4 rounded-full mb-4">
              <Wrench className="h-12 w-12 text-yellow-600" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              En desarrollo
            </h3>
            
            <p className="text-center text-gray-600 mb-6">
              Estamos trabajando para mejorar tu experiencia. Esta sección estará disponible muy pronto.
            </p>
            
            <div className="space-y-3 w-full">
              <Link
                to="/"
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio
              </Link>
              
              {/* <Link
                to="/products"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors"
              >
                Ver productos
              </Link> */}
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Si tienes alguna consulta, puedes contactarnos directamente
        </p>
      </div>
    </div>
  );
}
