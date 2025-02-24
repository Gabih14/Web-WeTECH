import { Routes, Route, Link } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AuthProvider>
        <CartProvider>
          <Navbar />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
