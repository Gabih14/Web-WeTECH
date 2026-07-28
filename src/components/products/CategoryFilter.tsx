import { Category } from "../../types";

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
  onCategoryChange,
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
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
