import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Filter, X } from "lucide-react";
import { ProductCard } from "../components/products/ProductCard";
import { CategoryFilter } from "../components/products/CategoryFilter";
import { fetchProducts } from "../services/fetchProducts";
import { categories } from "../data/categories";
import type { Product } from "../types";

export default function SearchResultsPage() {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("query") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // TODO: Cambiar a null cuando se agreguen impresoras y repuestos a la tienda
  // Por ahora filtramos solo por FILAMENTO 3D por defecto
  const [selectedCategory, setSelectedCategory] = useState<string | null>("FILAMENTO 3D");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProducts();
      setProducts(data);
    } catch (err: any) {
      setError(
        err?.message || "No se pudieron cargar los productos. Intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !selectedCategory || 
      product.category === selectedCategory.toUpperCase();
    const matchesSubcategory = !selectedSubcategory || 
      product.subcategory === selectedSubcategory.toUpperCase();
    
    return matchesQuery && matchesCategory && matchesSubcategory;
  });

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const toggleMobileFilter = () => {
    setIsMobileFilterOpen(!isMobileFilterOpen);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Resultados de búsqueda para "{query}"
      </h1>

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

        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={toggleMobileFilter}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
              aria-label="Toggle filters"
            >
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </button>
          </div>
          {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border p-4">
              <div className="h-40 bg-gray-200 rounded mb-4" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
          <p className="mb-2">{error}</p>
          <button
            onClick={loadProducts}
            className="mt-2 inline-flex items-center px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            Reintentar
          </button>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p>No se encontraron productos.</p>
      )}
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
    </div>
  );
}
