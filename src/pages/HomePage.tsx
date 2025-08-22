import { Link } from "react-router-dom";
import { Printer as Printer3D, Shapes, Wrench, X } from "lucide-react";
import { ContactInfo } from "../components/ContactInfo";
import Logo from "../assets/Logo WeTECH Negro PNG.png";
import Slogan from "../assets/filamentso-removebg-preview.webp";
import filamentoCategoria from "../assets/Grilon_pla_piel.jpeg";
import impresoraCategoria from "../assets/CR6 S.png";
import repuestoCategoria from "../assets/racor 6mm plastico web2_Impresora 3D Creality CR-10 SMART Mendoza v2.jpg";
import { useState } from "react";
import { Reviews } from "../components/ReviewSection";

const categories = [
  {
    id: "filamentos",
    name: "Filamentos",
    description:
      "Descubre nuestra amplia gama de filamentos PLA y técnicos para tus proyectos.",
    icon: Shapes,
    image: filamentoCategoria,
  },
  {
    id: "impresoras",
    name: "Impresoras 3D",
    description:
      "Encuentra la impresora perfecta. Incluye curso de uso y armado gratuito.",
    icon: Printer3D,
    image: impresoraCategoria,
  },
  {
    id: "repuestos",
    name: "Repuestos",
    description:
      "Todo lo que necesitas para mantener tu impresora funcionando perfectamente.",
    icon: Wrench,
    image: repuestoCategoria,
  },
];

export function HomePage() {
  const [showModal, setShowModal] = useState(true);
  const closeModal = () => {
    setShowModal(false);
  };
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans w-full overflow-x-hidden">
      {/* Construction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-yellow-500">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Sitio en Construcción
                </h2>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-full hover:bg-gray-200 transition duration-200"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 border-l-4 border-yellow-500">
              <p className="text-gray-700 mb-3 leading-relaxed">
                Estamos trabajando para mejorar nuestro sitio web y ofrecer una
                mejor experiencia.
              </p>
              {/* <p className="text-gray-700 mb-3 leading-relaxed">
                Algunas secciones pueden estar incompletas o no funcionar correctamente.
              </p> */}
              <p className="font-medium text-gray-800">
                Si encuentras algún problema o tienes sugerencias, por favor
                contáctanos:
              </p>
              <br />
              <p className="font-medium text-gray-800">
                (SOLO PARA TEMAS RELACIONADOS CON LA WEB)
              </p>
              <div className="flex flex-col space-y-3 mt-4">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <span className="text-gray-700">+54 9 261 599 4531</span>
                </div>

                <div className="flex items-center">
                  <div className="bg-yellow-100 p-2 rounded-full mr-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-yellow-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <a
                    href="mailto:hernandezg.alvarez@gmail.com"
                    className="text-gray-700 break-all underline"
                  >
                    hernandezg.alvarez@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="px-6 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-700 transition duration-200 font-medium shadow-md"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      <header id="hero" className="text-center mb-8 gap-4">
  <div className="flex flex-col md:flex-row items-center justify-center">
    <img src={Logo} alt="Logo WeTECH" className="mx-auto h-24 md:h-48" />

  <Link to={"/products?category=filamentos"}>
    <img
      src={Slogan}
      alt="Slogan WeTECH"
      className="mx-auto h-32 md:h-56 pt-4 md:pt-0"
    />
  </Link>
    {/* Encabezado principal H1 */}
    <h1 className="sr-only">
      WeTECH: Impresoras 3D, Filamentos y Repuestos
    </h1>
  </div>

</header>

      {/* Sección Franquicias */}
      <section
        id="franquicias"
        className="bg-gray-50 py-2 my-14 rounded-lg shadow-md"
      >
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-4xl mb-2">
            Franquicias
          </h2>
          <p className="text-2x1 text-gray-700 mb-2">
            <span className="font-bold">¡Es tu momento de emprender!</span>{" "}
            Sumate a nuestra franquicia y llevá la revolución 3D a tu provincia.
          </p>
          <Link
            to="/franquicias"
            className="inline-block px-6 py-2 bg-yellow-500 text-white font-semibold rounded-lg shadow hover:bg-yellow-700 transition"
          >
            Más info
          </Link>
        </div>
      </section>
      {/* Sección de Categorías */}
      <div className="flex flex-row gap-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 mb-16">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow flex-1"
            >
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-full w-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30" />
              </div>
              <div className="relative p-3 md:p-16 h-32 md:h-full flex flex-col items-center justify-center text-center text-white">
                <Icon className="h-8 w-8 md:h-12 md:w-12 mb-2 md:mb-4" />
                <h3 className="text-base sm:text-lg md:text-2xl font-bold mb-1 md:mb-2">
                  {category.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Sección Visitános */}
      <h2
        id="visit"
        className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4"
      >
        VISITANOS
      </h2>
      <ContactInfo />
      <section className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Opiniones de nuestros clientes
        </h2>
        <Reviews />
      </section>
      {/* Sección En Desarrollo */}
      <section className="bg-gradient-to-r from-yellow-50 to-yellow-100 py-6 sm:py-8  lg:my-16 rounded-xl shadow-lg border-l-4 border-yellow-500">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <div className="bg-yellow-200 p-2 sm:p-3 rounded-full mb-3 sm:mb-0 sm:mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 text-center sm:text-left">
              Estamos Mejorando Para Vos
            </h2>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-4 sm:mb-6">
            <p className="text-base sm:text-lg text-gray-700 mb-3 sm:mb-4 leading-relaxed">
              Nuestro sitio web está en{" "}
              <span className="font-semibold text-yellow-700">
                constante desarrollo
              </span>{" "}
              para brindarte la mejor experiencia de compra posible.
            </p>
            <p className="text-sm sm:text-base text-gray-600 mb-4 leading-relaxed">
              Tu opinión es fundamental para nosotros. Si tenés ideas,
              sugerencias o encontrás algo que podamos mejorar, no dudes en
              escribirnos.
            </p>

            <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg border border-yellow-200">
              <p className="text-xs sm:text-sm font-medium text-gray-800 mb-2">
                📧 Envianos tus sugerencias:
              </p>
              <a
                href="mailto:hernandezg.alvarez@gmail.com"
                className="inline-flex flex-col sm:flex-row items-center text-yellow-700 hover:text-yellow-900 font-semibold transition-colors duration-200 break-all"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-0 sm:mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs sm:text-sm lg:text-base">
                  hernandezg.alvarez@gmail.com
                </span>
              </a>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 italic">
            Gracias por tu paciencia y por ayudarnos a crecer 🚀
          </p>
        </div>
      </section>
    </main>
  );
}
