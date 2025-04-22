import { Clock, Instagram, Facebook } from "lucide-react";
import { ContactInfo } from "../components/ContactInfo";
/* import Logo from "../assets/Logo WeTECH Negro PNG.png";
 */

export function HomePage() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-4 text-black">
      {/* Animación de construcción */}
      <div className="relative mb-8">
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
          <div className="w-4 h-16 bg-yellow-400 animate-bounce rounded-full"></div>
        </div>
        <div className="w-32 h-32 border-8 border-yellow-400 rounded-full flex items-center justify-center">
          <Clock size={48} className="text-yellow-400 animate-pulse" />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="text-center max-w-lg">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Página en Desarrollo
        </h1>
        <div className="w-16 h-1 bg-yellow-400 mx-auto mb-6"></div>
        <p className="text-lg mb-8">
          Estamos trabajando duro para crear algo increíble. Pronto estaremos en
          línea con una nueva experiencia para ti.
        </p>
      </div>

      <h2 className="text-3xl font-bold  sm:text-4xl mb-4">VISITANOS</h2>
      <ContactInfo />
      <h2 className="text-3xl font-bold  sm:text-4xl mb-4  mt-6">SIGUENOS</h2>
      <div className="flex space-x-4 mb-8">
        <a
          href="#"
          className="bg-yellow-500 p-3 rounded-full hover:bg-yellow-400 transition"
        >
          <Facebook size={20} className="text-black" />
        </a>
        <a
          href="#"
          className="bg-yellow-500 p-3 rounded-full hover:bg-yellow-400 transition"
        >
          <Instagram size={20} className="text-black" />
        </a>
      </div>
    </main>
  );
}
