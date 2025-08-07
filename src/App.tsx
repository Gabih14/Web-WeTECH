import { Routes, Route } from "react-router-dom";
import { HomePage } from "./pages/HomePage";
import { ProductsPage } from "./pages/ProductsPage";
import Navbar from "./components/layout/Navbar";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ProductPage } from "./pages/ProductPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import { Footer } from "./components/layout/Footer";
import Checkout from "./components/checkout/Checkout";
import PaymentCallback from "./pages/PaymentCallback";
import { Franquicias } from "./pages/Franquicias";

function App() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-gray-100 overflow-x-hidden">
      {" "}
      {/* bg-gradient-to-b from-yellow-50 to-yellow-500 */}
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/checkout/callback"
              element={<PaymentCallback />}
            />{" "}
            {/* http://localhost:5173/checkout/callback?payment_id=12345 */}
            <Route path="/franquicias" element={<Franquicias />} />
          </Routes>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
