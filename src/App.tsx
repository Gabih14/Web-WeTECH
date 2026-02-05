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
import { UnderDevelopment } from "./pages/UnderDevelopment";
import { useMetaPixel } from "./hooks/useMetaPixel";

function App() {

  useMetaPixel();

  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-gray-100 overflow-x-hidden">
      {" "}
      {/* bg-gradient-to-b from-yellow-50 to-yellow-500 */}
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main className="pt-40 sm:pt-32 w-full overflow-x-hidden">
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
              <Route path="/franquicias/:provincia" element={<Franquicias />} />
              <Route path="/under-development" element={<UnderDevelopment />} />
            </Routes>
          </main>
          <Footer />
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
