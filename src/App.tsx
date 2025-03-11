import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProductPage } from "./pages/ProductPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductPage/>}/>
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
