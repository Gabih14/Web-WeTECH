export function NotFoundPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
        <h1 className="text-4xl font-bold text-red-600">404</h1>
        <p className="text-lg text-gray-600 mt-4">Página no encontrada</p>
        <a
          href="/"
          className="mt-6 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-blue-700 transition"
        >
          Volver al inicio
        </a>
      </div>
    );
  }