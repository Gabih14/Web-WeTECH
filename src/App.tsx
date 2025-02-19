import { Routes, Route, Link } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import Isologo from './assets/Isologo Fondo Negro SVG.svg'

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-primary shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
            <img src={Isologo} alt="Logo WeTECH" className="h-24 w-auto" />
            </Link>
          </div>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
      </Routes>
    </div>
  );
}

export default App