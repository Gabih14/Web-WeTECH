import { useState } from "react";
import { ShoppingCart } from "lucide-react"; // UserCircle
import { FaWhatsapp } from "react-icons/fa"; // FaMapMarkerAlt
import { useCart } from "../../context/CartContext";
//import { useAuth } from "../context/AuthContext";
import CartModal from "../cart/CartModal";
import LoginModal from "../../components/LoginModal";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Isologo from "../../assets/Isologo Fondo Negro SVG.svg";

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  //const [selectedProvince, setSelectedProvince] = useState("Mendoza");
  const { items } = useCart();
  //const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Verificar si estamos en la página de franquicias
  const isInFranquiciasPage = location.pathname === '/franquicias';

  const openWhatsApp = () => {
    const phoneNumber = "5492615987988";
    const message = "¡Hola! Tengo una consulta";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  /* const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value);
  }; */

  return (
    <>
      {/* Header */}
      <header className="bg-primary shadow fixed top-0 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center pr-2">
              <img src={Isologo} alt="Logo WeTECH" className="h-10 sm:h-20 w-auto" />
            </Link>
            {/* <div className="flex items-center">
              <FaMapMarkerAlt className="pr-1" />
              <div className="relative flex items-center space-x-2">
                <select
                  value={selectedProvince}
                  onChange={handleProvinceChange}
                  className="p-2 pl-3 border rounded-md bg-black text-white w-32 max-w-xs" 
                >
                  <option value="Mendoza">Mendoza</option>
                  <option value="Buenos Aires">Buenos Aires</option>
                  <option value="Córdoba">Córdoba</option>
                  <option value="Santa Fe">Santa Fe</option>
                </select>
              </div>
            </div> */}

            {/* Barra de busqueda para computadoras */}
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex flex-grow mx-2 max-w-lg"
            >
              {/* <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
                Search
              </label> */}
              <div className="relative flex-grow">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar "
                  className="block w-full p-4 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                />
                <button
                  type="submit"
                  className="text-white absolute right-2.5 bottom-2.5 bg-black hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            <div className="flex items-center space-x-2 pl-2 sm:space-x-4">
              {/* {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="text-black hover:text-white transition-colors flex items-center"
                >
                  <UserCircle className="h-6 w-6 mr-2" />
                  <span className="hidden lg:flex">Cerrar Sesión</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="text-black hover:text-white transition-colors flex items-center"
                >
                  <UserCircle className="h-6 w-6 mr-2" />
                  <span className="hidden lg:flex">Iniciar Sesión</span>
                </button>
              )} */}
              <button
                className="p-2 rounded-full text-black hover:bg-white relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart className="h-6 w-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Barra de busqueda para celulares */}
        <div className="pb-2 px-4">
          <form
            onSubmit={handleSearch}
            className="flex lg:hidden flex-grow mx-2 max-w-lg"
          >
            <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
              Search
            </label>
            <div className="relative flex-grow">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar "
                className="block w-full p-2.5 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              />
              <button
                type="submit"
                className="text-white absolute right-2 bottom-1.5 bg-black hover:bg-yellow-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                <svg
                  className="w-4 h-4 text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* WhatsApp Floating Button - Solo mostrar si NO estamos en franquicias */}
      {!isInFranquiciasPage && (
        <button
          onClick={openWhatsApp}
          className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center gap-2"
          aria-label="Contactar por WhatsApp"
        >
          <FaWhatsapp className="h-6 w-6" />
          <span className="hidden md:inline">Te ayudamos?</span>
        </button>
      )}
    </>
  );
}
