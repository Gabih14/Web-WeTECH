export const Footer = () => {
    return (
      <footer className="bg-gray-900 text-white p-4 ">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center md:items-center">
          <p className="text-sm text-center md:text-center">
            © {new Date().getFullYear()} Hello S.R.L. Todos los derechos
            reservados.
          </p>
          
        </div>
      </footer>
    );
  };