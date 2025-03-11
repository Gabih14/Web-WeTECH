import { Link } from "react-router-dom";
import { Printer as Printer3D, Shapes, Wrench } from "lucide-react";
import { ContactInfo } from "../components/ContactInfo";
import Logo from "../assets/Logo WeTECH Negro PNG.png";
import filamentoCategoria from "../assets/Grilon_pla_piel.jpeg";
import impresoraCategoria from "../assets/CR6 S.png";
import repuestoCategoria from "../assets/racor 6mm plastico web2_Impresora 3D Creality CR-10 SMART Mendoza v2.jpg";

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
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="text-center mb-12">
        <img src={Logo} alt="Logo WeTECH" className="mx-auto h-16 md:h-48" />
      </div>

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
                </h3>{" "}
                {/* <p className="text-gray-200 text-sm md:text-base hidden md:block">{category.description}</p> */}
              </div>
            </Link>
          );
        })}
      </div>
      <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
        VISITANOS
      </h2>
      <ContactInfo />
    </main>
  );
}
