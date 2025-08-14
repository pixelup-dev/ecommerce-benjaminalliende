interface Category {
  id: string;
  name: string;
  description: string | null;
  statusCode: string;
}

interface CategoryPillsProps {
  categories: Category[];
  selectedCategories: string[];
  onCategorySelect: (categoryId: string) => void;
}

const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategories,
  onCategorySelect,
}) => {
  return (
    <div className="flex flex-wrap gap-2 min-w-0">
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onCategorySelect(category.id)}
          className={`
            group relative inline-flex items-center px-4 py-2 rounded-full
            transition-all duration-200 ease-in-out whitespace-nowrap
            ${
              selectedCategories.includes(category.id)
                ? "bg-primary text-white hover:bg-secondary hover:text-primary"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }
          `}
        >
          <span className="text-sm font-medium">{category.name}</span>
          {category.description && (
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {category.description}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default CategoryPills;
