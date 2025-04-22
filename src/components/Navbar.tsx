import {  FaWhatsapp } from "react-icons/fa";

import { Link,  } from "react-router-dom";
import Isologo from "../assets/Logo WeTECH Negro PNG.png";

export default function Navbar() {

  


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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-center">
          
            <Link to="/" className="flex items-center pr-2">
              <img src={Isologo} alt="Logo WeTECH" className="h-20 w-auto" />
            </Link>
           
            
          
          
        </div>
        
      </header>


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