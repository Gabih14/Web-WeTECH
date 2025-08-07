import { Category } from "../types/types";
import { ChevronDown } from "lucide-react";

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  onCategoryChange: (category: string | null) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}: CategoryFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h2 className="text-xl font-bold mb-4">Categorías</h2>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id}>
            <button
              onClick={() => onCategoryChange(category.id)}
              className={`w-full text-left flex items-center justify-between p-2 rounded ${
                selectedCategory === category.id
                  ? "bg-yellow-100 text-black"
                  : "hover:bg-gray-100"
              }`}
            >
              <span>{category.name}</span>
              {category.subcategories && <ChevronDown className="w-4 h-4" />}
            </button>

            {selectedCategory === category.id && category.subcategories && (
              <div className="ml-4 mt-1 space-y-1">
                {category.subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => onSubcategoryChange(sub.id)}
                    className={`w-full text-left p-2 rounded ${
                      selectedSubcategory === sub.id
                        ? "bg-yellow-50 text-yellow-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
