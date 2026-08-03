import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { categories } from "../data/categories";
import { ProductCard } from "../components/products/ProductCard";
import { CategoryFilter } from "../components/products/CategoryFilter";
import { ColorSwatch } from "../components/products/ColorSwatch";
import { ColorGroup, Product } from "../types";
import { fetchProducts } from "../services/fetchProducts";

interface ColorFilterProps {
  colorGroups: ColorGroup[];
  selectedColorGroupId: number | null;
  onColorGroupChange: (colorGroupId: number | null) => void;
}

interface BrandFilterProps {
  brands: string[];
  selectedBrand: string | null;
  onBrandChange: (brand: string | null) => void;
}

interface LineFilterProps {
  lines: string[];
  selectedLine: string | null;
  onLineChange: (line: string | null) => void;
}

interface DifficultyFilterProps {
  levels: string[];
  selectedLevel: string | null;
  onLevelChange: (level: string | null) => void;
}

const normalizeBrand = (brand: string) => brand.trim().toUpperCase();
const normalizeLine = (line: string) =>
  line
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
const normalizeDifficulty = (level: string) =>
  level
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
const SPARE_PARTS_CATEGORY = "REPUESTOS & ACCESORIOS";
const DIFFICULTY_ORDER = ["PRINCIPIANTE", "INTERMEDIO", "AVANZADO", "EXPERTO"];
const LINE_ORDER = ["PREMIUM", "ESTANDAR", "BASICO"];

const lineBarCount = (line: string) => {
  switch (normalizeLine(line)) {
    case "PREMIUM":
      return 3;
    case "ESTANDAR":
      return 2;
    case "BASICO":
      return 1;
    default:
      return 0;
  }
};

const difficultyColorClasses = (level: string, isSelected: boolean) => {
  switch (normalizeDifficulty(level)) {
    case "PRINCIPIANTE":
      return isSelected
        ? "border-green-600 bg-green-200 text-green-950 ring-2 ring-green-300"
        : "border-green-300 bg-green-100 text-green-800 hover:bg-green-200";
    case "INTERMEDIO":
      return isSelected
        ? "border-yellow-600 bg-yellow-200 text-yellow-950 ring-2 ring-yellow-300"
        : "border-yellow-300 bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "AVANZADO":
    case "EXPERTO":
      return isSelected
        ? "border-red-600 bg-red-200 text-red-950 ring-2 ring-red-300"
        : "border-red-300 bg-red-100 text-red-800 hover:bg-red-200";
    default:
      return isSelected
        ? "border-sky-600 bg-sky-200 text-sky-950 ring-2 ring-sky-300"
        : "border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200";
  }
};

const difficultyDotCount = (level: string) => {
  switch (normalizeDifficulty(level)) {
    case "INTERMEDIO":
      return 2;
    case "AVANZADO":
    case "EXPERTO":
      return 3;
    default:
      return 1;
  }
};

function DifficultyFilter({
  levels,
  selectedLevel,
  onLevelChange,
}: DifficultyFilterProps) {
  if (levels.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 rounded-lg border border-sky-200 bg-sky-50 p-4 shadow">
      <div className="mb-4">
        <div>
          <h2 className="text-lg font-bold leading-tight text-sky-950 sm:text-xl">
            ¿Recién empezás?
          </h2>
          <p className="mt-1 text-xs leading-snug text-sky-800 sm:text-sm">
            Filtrá por nivel de dificultad y encontrá filamentos pensados para
            tu experiencia.
          </p>
        </div>
        {selectedLevel !== null && (
          <button
            onClick={() => onLevelChange(null)}
            className="mt-2 block text-xs font-medium text-sky-700 hover:text-sky-950 sm:text-sm"
            type="button"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {levels.map((level) => {
          const isSelected =
            selectedLevel !== null &&
            normalizeDifficulty(selectedLevel) === normalizeDifficulty(level);

          return (
            <button
              key={level}
              onClick={() => onLevelChange(isSelected ? null : level)}
              className={`flex min-w-0 flex-col items-center overflow-hidden rounded-md border px-0.5 py-2 text-center text-[9px] font-semibold tracking-tight transition-colors sm:px-1 sm:text-[10px] ${difficultyColorClasses(
                level,
                isSelected,
              )}`}
              type="button"
            >
              <span
                className="mb-1 flex h-3 items-center justify-center gap-1"
                aria-hidden="true"
              >
                {Array.from({ length: difficultyDotCount(level) }).map(
                  (_, index) => (
                    <span
                      key={index}
                      className="h-2 w-2 rounded-full bg-current"
                    />
                  ),
                )}
              </span>
              <span className="w-full whitespace-nowrap">{level}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BrandFilter({
  brands,
  selectedBrand,
  onBrandChange,
}: BrandFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (brands.length === 0) {
    return null;
  }

  const visibleBrands = isExpanded ? brands : brands.slice(0, 5);
  const hasMoreBrands = brands.length > 5;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Marcas</h2>
        {selectedBrand !== null && (
          <button
            onClick={() => onBrandChange(null)}
            className="text-sm font-medium text-yellow-700 hover:text-yellow-900"
            type="button"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="space-y-2">
        {visibleBrands.map((brand) => {
          const isSelected =
            selectedBrand !== null &&
            normalizeBrand(selectedBrand) === normalizeBrand(brand);

          return (
            <button
              key={brand}
              onClick={() => onBrandChange(isSelected ? null : brand)}
              className={`w-full rounded p-2 text-left transition-colors ${
                isSelected ? "bg-yellow-100 text-black" : "hover:bg-gray-100"
              }`}
              type="button"
            >
              {brand}
            </button>
          );
        })}
      </div>

      {hasMoreBrands && (
        <button
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="mt-4 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-900"
          type="button"
          aria-expanded={isExpanded}
        >
          {isExpanded ? "Ver menos" : `Ver las ${brands.length} marcas`}
        </button>
      )}
    </div>
  );
}

function LineFilter({
  lines,
  selectedLine,
  onLineChange,
}: LineFilterProps) {
  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Línea</h2>
        {selectedLine !== null && (
          <button
            onClick={() => onLineChange(null)}
            className="text-sm font-medium text-yellow-700 hover:text-yellow-900"
            type="button"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="space-y-2">
        {lines.map((line) => {
          const isSelected =
            selectedLine !== null &&
            normalizeLine(selectedLine) === normalizeLine(line);

          return (
            <button
              key={line}
              onClick={() => onLineChange(isSelected ? null : line)}
              className={`flex w-full items-center gap-3 rounded p-2 text-left transition-colors ${
                isSelected ? "bg-yellow-100 text-black" : "hover:bg-gray-100"
              }`}
              type="button"
            >
              <span
                className="flex flex-col gap-0.5"
                aria-label={`${lineBarCount(line)} de 3 barras`}
                role="img"
              >
                {Array.from({ length: 3 }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1 w-5 rounded-full ${
                      index >= 3 - lineBarCount(line)
                        ? "bg-yellow-500"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </span>
              <span>{line}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ColorFilter({
  colorGroups,
  selectedColorGroupId,
  onColorGroupChange,
}: ColorFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (colorGroups.length === 0) {
    return null;
  }

  const visibleColorGroups = isExpanded
    ? colorGroups
    : colorGroups.slice(0, 8);
  const hasMoreColors = colorGroups.length > 8;

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">Colores</h2>
        {selectedColorGroupId !== null && (
          <button
            onClick={() => onColorGroupChange(null)}
            className="text-sm font-medium text-yellow-700 hover:text-yellow-900"
            type="button"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 lg:grid-cols-4">
        {visibleColorGroups.map((colorGroup) => {
          const isSelected = selectedColorGroupId === colorGroup.id;

          return (
            <button
              key={colorGroup.id}
              onClick={() =>
                onColorGroupChange(isSelected ? null : colorGroup.id)
              }
              className={`group flex flex-col items-center gap-1.5 rounded-md p-1 text-center text-[11px] font-medium transition-colors hover:bg-gray-50 ${
                isSelected ? "text-yellow-900" : "text-gray-700"
              }`}
              type="button"
              aria-label={`Filtrar por ${colorGroup.name}`}
              title={colorGroup.name}
            >
              <ColorSwatch
                hex={colorGroup.hex}
                colorGroup={colorGroup}
                className={`h-10 w-10 rounded-full border shadow-sm transition-all ${
                  isSelected
                    ? "border-yellow-500 ring-2 ring-yellow-300 ring-offset-2"
                    : "border-gray-300 group-hover:border-gray-400"
                }`}
              />
              <span className="w-full truncate">{colorGroup.name}</span>
            </button>
          );
        })}
      </div>

      {hasMoreColors && (
        <button
          onClick={() => setIsExpanded((expanded) => !expanded)}
          className="mt-4 w-full rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-yellow-300 hover:bg-yellow-50 hover:text-yellow-900"
          type="button"
          aria-expanded={isExpanded}
        >
          {isExpanded
            ? "Ver menos"
            : `Ver los ${colorGroups.length} colores`}
        </button>
      )}
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
  const [selectedColorGroupId, setSelectedColorGroupId] = useState<
    number | null
  >(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
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

  const availableColorGroups = useMemo(() => {
    const colorGroupMap = new Map<number, ColorGroup>();

    products
      .filter(matchesSelectedCategory)
      .forEach((product) => {
        product.colors?.forEach((color) => {
          if (!color.colorGroup || colorGroupMap.has(color.colorGroup.id)) {
            return;
          }

          colorGroupMap.set(color.colorGroup.id, color.colorGroup);
        });
      });

    return Array.from(colorGroupMap.values()).sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      return a.name.localeCompare(b.name);
    });
  }, [matchesSelectedCategory, products]);

  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, string>();

    products.filter(matchesSelectedCategory).forEach((product) => {
      if (product.category?.trim().toUpperCase() === SPARE_PARTS_CATEGORY) {
        return;
      }

      if (!product.brand?.trim()) {
        return;
      }

      const normalizedBrand = normalizeBrand(product.brand);
      if (!brandMap.has(normalizedBrand)) {
        brandMap.set(normalizedBrand, product.brand.trim());
      }
    });

    return Array.from(brandMap.values()).sort((a, b) => a.localeCompare(b));
  }, [matchesSelectedCategory, products]);

  const availableLines = useMemo(() => {
    const lineMap = new Map<string, string>();

    products.filter(matchesSelectedCategory).forEach((product) => {
      if (!product.line?.trim()) {
        return;
      }

      const normalizedLine = normalizeLine(product.line);
      if (!lineMap.has(normalizedLine)) {
        lineMap.set(normalizedLine, product.line.trim());
      }
    });

    return Array.from(lineMap.values()).sort((a, b) => {
      const aIndex = LINE_ORDER.indexOf(normalizeLine(a));
      const bIndex = LINE_ORDER.indexOf(normalizeLine(b));
      const normalizedAIndex = aIndex === -1 ? LINE_ORDER.length : aIndex;
      const normalizedBIndex = bIndex === -1 ? LINE_ORDER.length : bIndex;

      return normalizedAIndex - normalizedBIndex || a.localeCompare(b);
    });
  }, [matchesSelectedCategory, products]);

  const availableDifficultyLevels = useMemo(() => {
    const levels = new Map<string, string>();

    products.filter(matchesSelectedCategory).forEach((product) => {
      if (!product.difficultyLevel?.trim()) {
        return;
      }

      const normalizedLevel = normalizeDifficulty(product.difficultyLevel);
      if (!levels.has(normalizedLevel)) {
        levels.set(normalizedLevel, product.difficultyLevel.trim());
      }
    });

    return Array.from(levels.values()).sort((a, b) => {
      const aIndex = DIFFICULTY_ORDER.indexOf(normalizeDifficulty(a));
      const bIndex = DIFFICULTY_ORDER.indexOf(normalizeDifficulty(b));
      const normalizedAIndex = aIndex === -1 ? DIFFICULTY_ORDER.length : aIndex;
      const normalizedBIndex = bIndex === -1 ? DIFFICULTY_ORDER.length : bIndex;

      return normalizedAIndex - normalizedBIndex || a.localeCompare(b);
    });
  }, [matchesSelectedCategory, products]);

  useEffect(() => {
    if (
      selectedColorGroupId !== null &&
      !availableColorGroups.some(
        (colorGroup) => colorGroup.id === selectedColorGroupId
      )
    ) {
      setSelectedColorGroupId(null);
    }
  }, [availableColorGroups, selectedColorGroupId]);

  useEffect(() => {
    if (
      selectedBrand !== null &&
      !availableBrands.some(
        (brand) => normalizeBrand(brand) === normalizeBrand(selectedBrand)
      )
    ) {
      setSelectedBrand(null);
    }
  }, [availableBrands, selectedBrand]);

  useEffect(() => {
    if (
      selectedDifficulty !== null &&
      !availableDifficultyLevels.some(
        (level) =>
          normalizeDifficulty(level) ===
          normalizeDifficulty(selectedDifficulty)
      )
    ) {
      setSelectedDifficulty(null);
    }
  }, [availableDifficultyLevels, selectedDifficulty]);

  useEffect(() => {
    if (
      selectedLine !== null &&
      !availableLines.some(
        (line) => normalizeLine(line) === normalizeLine(selectedLine)
      )
    ) {
      setSelectedLine(null);
    }
  }, [availableLines, selectedLine]);

  const filteredProducts = products.filter((product) => {
    const matchesColor =
      selectedColorGroupId === null ||
      product.colors?.some(
        (color) => color.colorGroup?.id === selectedColorGroupId
      );
    const matchesBrand =
      selectedBrand === null ||
      (product.brand &&
        normalizeBrand(product.brand) === normalizeBrand(selectedBrand));
    const matchesLine =
      selectedLine === null ||
      (product.line &&
        normalizeLine(product.line) === normalizeLine(selectedLine));
    const matchesDifficulty =
      selectedDifficulty === null ||
      (product.difficultyLevel &&
        normalizeDifficulty(product.difficultyLevel) ===
          normalizeDifficulty(selectedDifficulty));

    return (
      matchesSelectedCategory(product) &&
      matchesColor &&
      matchesBrand &&
      matchesLine &&
      matchesDifficulty
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

  const handleSubcategoryChange = (subcategory: string | null) => {
    setSelectedSubcategory(subcategory);
  };

  const clearActiveFilters = () => {
    handleCategoryChange(null);
    setSelectedColorGroupId(null);
    setSelectedBrand(null);
    setSelectedLine(null);
    setSelectedDifficulty(null);
  };

  const hasActiveFilters =
    !!selectedCategory ||
    selectedColorGroupId !== null ||
    selectedBrand !== null ||
    selectedLine !== null ||
    selectedDifficulty !== null;

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
          <DifficultyFilter
            levels={availableDifficultyLevels}
            selectedLevel={selectedDifficulty}
            onLevelChange={setSelectedDifficulty}
          />
          <ColorFilter
            colorGroups={availableColorGroups}
            selectedColorGroupId={selectedColorGroupId}
            onColorGroupChange={setSelectedColorGroupId}
          />
          <BrandFilter
            brands={availableBrands}
            selectedBrand={selectedBrand}
            onBrandChange={setSelectedBrand}
          />
          <LineFilter
            lines={availableLines}
            selectedLine={selectedLine}
            onLineChange={setSelectedLine}
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
                  selectedColorGroupId={selectedColorGroupId}
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
          <DifficultyFilter
            levels={availableDifficultyLevels}
            selectedLevel={selectedDifficulty}
            onLevelChange={(level) => {
              setSelectedDifficulty(level);
              setIsMobileFilterOpen(false);
            }}
          />
          <ColorFilter
            colorGroups={availableColorGroups}
            selectedColorGroupId={selectedColorGroupId}
            onColorGroupChange={(colorGroupId) => {
              setSelectedColorGroupId(colorGroupId);
              setIsMobileFilterOpen(false);
            }}
          />
          <BrandFilter
            brands={availableBrands}
            selectedBrand={selectedBrand}
            onBrandChange={(brand) => {
              setSelectedBrand(brand);
              setIsMobileFilterOpen(false);
            }}
          />
          <LineFilter
            lines={availableLines}
            selectedLine={selectedLine}
            onLineChange={(line) => {
              setSelectedLine(line);
              setIsMobileFilterOpen(false);
            }}
          />
        </div>
      </div>
    </main>
  );
}
