import { Link } from 'react-router-dom';
import { Printer as Printer3D, Shapes, Wrench } from 'lucide-react';
import { ContactInfo } from '../components/ContactInfo';

const categories = [
  {
    id: 'filamentos',
    name: 'Filamentos',
    description: 'Descubre nuestra amplia gama de filamentos PLA y técnicos para tus proyectos.',
    icon: Shapes,
    image: 'https://images.unsplash.com/photo-1631749352438-7d576312185d'
  },
  {
    id: 'impresoras',
    name: 'Impresoras 3D',
    description: 'Encuentra la impresora perfecta. Incluye curso de uso y armado gratuito.',
    icon: Printer3D,
    image: 'https://images.unsplash.com/photo-1615947914112-73cd3529b0cf'
  },
  {
    id: 'repuestos',
    name: 'Repuestos',
    description: 'Todo lo que necesitas para mantener tu impresora funcionando perfectamente.',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1581092446327-9b52bd1570c2'
  }
];

export function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4">
          Todo para tu impresión 3D
        </h2>
        <p className="text-xl text-gray-600">
          Explora nuestras categorías y encuentra exactamente lo que necesitas
        </p>
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
              <div className="relative p-3 md:p-8 h-32 md:h-full flex flex-col items-center justify-center text-center text-white">
                <Icon className="h-8 w-8 md:h-12 md:w-12 mb-2 md:mb-4" />
                <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">{category.name}</h3>
                <p className="text-gray-200 text-sm md:text-base hidden md:block">{category.description}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <ContactInfo />
    </main>
  );
}