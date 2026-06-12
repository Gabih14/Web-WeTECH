import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, X, AlertCircle, ChevronDown } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { categories } from "../data/categories";
import { ProductCard } from "../components/products/ProductCard";
import { CategoryFilter } from "../components/products/CategoryFilter";
import { Product } from "../types";
import { fetchProducts } from "../services/fetchProducts";

type ColorFilterOption = {
  name: string;
  hex: string;
};

interface ColorFilterProps {
  colors: ColorFilterOption[];
  selectedColor: string | null;
  onColorChange: (color: string | null) => void;
}

function ColorFilter({
  colors,
  selectedColor,
  onColorChange,
}: ColorFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedColorData = colors.find((color) => color.name === selectedColor);

  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Colores</h2>
        {selectedColor && (
          <button
            onClick={() => onColorChange(null)}
            className="text-sm font-medium text-yellow-700 hover:text-yellow-900"
            type="button"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setIsOpen((open) => !open)}
          className={`flex min-h-10 w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors ${
            selectedColor
              ? "border-yellow-400 bg-yellow-50 text-yellow-900"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
          type="button"
          aria-expanded={isOpen}
        >
          {selectedColorData ? (
            <>
              <span
                className="h-5 w-5 flex-shrink-0 rounded-full border border-gray-300"
                style={{ backgroundColor: selectedColorData.hex || "#f3f4f6" }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1 truncate">
                {selectedColorData.name}
              </span>
            </>
          ) : (
            <span className="min-w-0 flex-1 text-gray-500">
              Seleccionar color
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
            {selectedColor && (
              <button
                onClick={() => {
                  onColorChange(null);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-gray-600 transition-colors hover:bg-gray-50"
                type="button"
              >
                Todos los colores
              </button>
            )}

            {colors.map((color) => {
              const isSelected = selectedColor === color.name;

              return (
                <button
                  key={color.name}
                  onClick={() => {
                    onColorChange(isSelected ? null : color.name);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-yellow-50 font-medium text-yellow-900"
                      : "hover:bg-gray-50"
                  }`}
                  type="button"
                >
                  <span
                    className="h-5 w-5 flex-shrink-0 rounded-full border border-gray-300"
                    style={{ backgroundColor: color.hex || "#f3f4f6" }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1 truncate">{color.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category")
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* const openWhatsApp = () => {
    const phoneNumber = "5492615987988";
    const message = "¡Hola! Estoy interesado en realizar una compra. ¿Podrían ayudarme?";
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  }; */

  

  useEffect(() => {
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

  const categoriesWithFilamentSubcategories = useMemo(() => {
    const filamentCategoryId = "FILAMENTO 3D";

    const filamentSubcategories = Array.from(
      new Set(
        products
          .filter(
            (product) =>
              product.category === filamentCategoryId &&
              typeof product.subcategory === "string" &&
              product.subcategory.trim() !== ""
          )
          .map((product) => product.subcategory!.trim().toUpperCase())
      )
    )
      .sort((a, b) => a.localeCompare(b))
      .map((subcategory) => ({
        id: subcategory,
        name: subcategory,
      }));

    return categories.map((category) => {
      if (category.id !== filamentCategoryId) {
        return category;
      }

      return {
        ...category,
        subcategories: filamentSubcategories,
      };
    });
  }, [products]);

  const matchesSelectedCategory = useCallback((product: Product) => {
    if (!selectedCategory) return true;

    const matchesCategory = product.category === selectedCategory.toUpperCase();
    const matchesSubcategory =
      !selectedSubcategory ||
      product.subcategory === selectedSubcategory.toUpperCase();

    return matchesCategory && matchesSubcategory;
  }, [selectedCategory, selectedSubcategory]);

  const availableColors = useMemo(() => {
    const colorMap = new Map<string, ColorFilterOption>();

    products
      .filter(matchesSelectedCategory)
      .forEach((product) => {
        product.colors?.forEach((color) => {
          if (!color.name.trim() || colorMap.has(color.name)) {
            return;
          }

          colorMap.set(color.name, {
            name: color.name,
            hex: color.hex,
          });
        });
      });

    return Array.from(colorMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [matchesSelectedCategory, products]);

  useEffect(() => {
    if (
      selectedColor &&
      !availableColors.some((color) => color.name === selectedColor)
    ) {
      setSelectedColor(null);
    }
  }, [availableColors, selectedColor]);

  const filteredProducts = products.filter((product) => {
    const matchesColor =
      !selectedColor ||
      product.colors?.some((color) => color.name === selectedColor);

    return matchesSelectedCategory(product) && matchesColor;
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

  const handleSubcategoryChange = (subcategory: string | null) => {
    setSelectedSubcategory(subcategory);
  };

  const clearActiveFilters = () => {
    handleCategoryChange(null);
    setSelectedColor(null);
  };

  const hasActiveFilters = !!selectedCategory || !!selectedColor;

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de desarrollo */}
        {/* <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
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
        </div> */}

        <div className="flex gap-8 min-h-screen">
          {/* Desktop Sidebar Skeleton */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Content */}
          <div className="flex-1">
            <div className="mb-6 flex justify-between items-center">
              <div className="h-8 bg-gray-200 rounded animate-pulse w-48"></div>
              <button
                onClick={toggleMobileFilter}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
                aria-label="Toggle filters"
              >
                <Filter className="h-5 w-5" />
                <span>Filtros</span>
              </button>
            </div>

            {/* Loading Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-200"></div>
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading Message */}
            <div className="flex flex-col items-center justify-center py-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Cargando productos
                </h3>
                <p className="text-gray-600">
                  Obteniendo la información más actualizada...
                </p>
              </div>
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
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner de desarrollo */}
      {/* <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
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
      </div> */}

      <div className="flex gap-8 min-h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <CategoryFilter
            categories={categoriesWithFilamentSubcategories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={handleCategoryChange}
            onSubcategoryChange={handleSubcategoryChange}
          />
          <ColorFilter
            colors={availableColors}
            selectedColor={selectedColor}
            onColorChange={setSelectedColor}
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

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  selectedColorFilter={selectedColor}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Filter className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  {hasActiveFilters
                    ? "No hay productos disponibles para los filtros seleccionados."
                    : "No hay productos disponibles en este momento."}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearActiveFilters}
                    className="inline-flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-medium rounded-md transition-colors"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
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
        <div className="h-full overflow-y-auto p-4">
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
            categories={categoriesWithFilamentSubcategories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={(category) => {
              handleCategoryChange(category);
              setIsMobileFilterOpen(false);
            }}
            onSubcategoryChange={(subcategory) => {
              handleSubcategoryChange(subcategory);
              setIsMobileFilterOpen(false);
            }}
          />
          <ColorFilter
            colors={availableColors}
            selectedColor={selectedColor}
            onColorChange={(color) => {
              setSelectedColor(color);
              setIsMobileFilterOpen(false);
            }}
          />
        </div>
      </div>
    </main>
  );
}
