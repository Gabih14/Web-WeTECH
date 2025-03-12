export const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white p-4 mt-10">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <p className="text-sm text-left md:text-center">
            © {new Date().getFullYear()} WeTECH. Todos los derechos
            reservados.
          </p>
          <nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 mt-2 md:mt-0 text-left md:text-center pb-4 sm:pb-0 pr-28">
            <a href="/" className="hover:underline">
              Inicio
            </a>
            {/* <a href="#" className="hover:underline">
              Servicios
            </a>
            <a href="#" className="hover:underline">
              Contacto
            </a> */}
          </nav>
        </div>
      </footer>
    );
  };