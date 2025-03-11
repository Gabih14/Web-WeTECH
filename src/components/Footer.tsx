export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white text-center p-4 mt-10">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">
          © {new Date().getFullYear()} Mi Sitio Web. Todos los derechos
          reservados.
        </p>
        <nav className="flex space-x-4 mt-2 md:mt-0">
          <a href="#" className="hover:underline">
            Inicio
          </a>
          <a href="#" className="hover:underline">
            Servicios
          </a>
          <a href="#" className="hover:underline">
            Contacto
          </a>
        </nav>
      </div>
    </footer>
  );
};
