import { useEffect, useState } from "react";
import { Filter, X, AlertCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { categories } from "../data/categories";
import { ProductCard } from "../components/ProductCard";
import { CategoryFilter } from "../components/CategoryFilter";
import { Product } from "../types";
import { fetchProducts } from "../services/fetchProducts";

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category")
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const openWhatsApp = () => {
    const phoneNumber = "5492615987988";
    const message = "¡Hola! Estoy interesado en realizar una compra. ¿Podrían ayudarme?";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  useEffect(() => {
    console.log("Fetching products...");
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, []);
  const filteredProducts = products.filter((product: any) => {
    if (!selectedCategory) return true;
    if (!selectedSubcategory)
      return product.category === selectedCategory.toUpperCase();
    return (
      product.category === selectedCategory.toUpperCase() &&
      product.subcategory === selectedSubcategory.toUpperCase()
    );
  });

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({});
    }
    setSelectedSubcategory(null);
  };
  if (loading) {
    return <p>Cargando productos...</p>;
  }
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner de desarrollo */}
      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-yellow-800 mb-1">
            Página en Desarrollo
          </h3>
          <p className="text-sm text-yellow-700 mb-3">
            Por el momento no se pueden realizar compras a través de la página web. 
            Para adquirir cualquiera de nuestros productos, por favor contáctanos directamente.
          </p>
          <button
            onClick={openWhatsApp}
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <FaWhatsapp className="h-4 w-4" />
            Contactar por WhatsApp
          </button>
        </div>
      </div>

      <div className="flex gap-8 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={handleCategoryChange}
            onSubcategoryChange={setSelectedSubcategory}
          />
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory
                ? categories.find((c) => c.id === selectedCategory)?.name ||
                  "Productos"
                : "Todos los Productos"}
            </h2>
            <button
              onClick={toggleMobileFilter}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              aria-label="Toggle filters"
            >
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleMobileFilter}
        />
      )}

      {/* Mobile Filter Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-40 lg:hidden ${
          isMobileFilterOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Filtros</h2>
            <button
              onClick={toggleMobileFilter}
              className="p-2 text-gray-600 hover:text-gray-900"
              aria-label="Close filters"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={(category) => {
              handleCategoryChange(category);
              setIsMobileFilterOpen(false);
            }}
            onSubcategoryChange={(subcategory) => {
              setSelectedSubcategory(subcategory);
              setIsMobileFilterOpen(false);
            }}
          />
        </div>
      </div>
    </main>
  );
}
