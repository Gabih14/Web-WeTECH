import { Routes, Route } from "react-router-dom";
import { DevelopmentLandingPage } from "./pages/desarrollo-landing-page";
import { NotFoundPage } from "./pages/NotFoundPage";
import Navbar from "./components/Navbar";
/* import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext"; */
import { Footer } from "./components/Footer";

function App() {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] min-h-screen bg-gray-100">
      {/* <AuthProvider> */}
        {/* <CartProvider> */}
          <Navbar />
          <Routes>
            <Route path="/" element={< DevelopmentLandingPage/>} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <Footer />
        {/* </CartProvider> */}
      {/* </AuthProvider> */}
    </div>
  );
}

export default App;
