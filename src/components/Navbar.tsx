import { useState } from "react";
import { ShoppingCart, UserCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CartModal from "../components/CartModal";
import LoginModal from "../components/LoginModal";
import { Link } from "react-router-dom";
import Isologo from "../assets/Isologo Fondo Negro SVG.svg";
import { FaWhatsapp } from "react-icons/fa";

export default function Navbar() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { items } = useCart();
  const { isAuthenticated, logout } = useAuth();

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const openWhatsApp = () => {
    const phoneNumber = "5492615987988";
    const message = "¡Hola! Tengo una consulta";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <>
      {/* Header */}
      <header className="bg-primary shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={Isologo} alt="Logo WeTECH" className="h-24 w-auto" />
            </Link>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="text-black hover:text-white transition-colors flex items-center"
                >
                  <UserCircle className="h-6 w-6 mr-2" />
                  <span>Cerrar Sesión</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="text-black hover:text-white transition-colors flex items-center"
                >
                  <UserCircle className="h-6 w-6 mr-2" />
                  <span>Iniciar Sesión</span>
                </button>
              )}
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
      </header>

      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* WhatsApp Floating Button */}
      <button
        onClick={openWhatsApp}
        className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors z-50 flex items-center gap-2"
        aria-label="Contactar por WhatsApp"
      >
        <FaWhatsapp className="h-6 w-6" />
        <span className="hidden md:inline">Te ayudamos?</span>
      </button>
    </>
  );
}
