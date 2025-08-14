import React from "react";
import Link from "next/link";

const CategorySidebar = () => {
  const categories = [
    { id: 1, name: "Categoría 1", slug: "categoria-1" },
    { id: 2, name: "Categoría 2", slug: "categoria-2" },
    { id: 3, name: "Categoría 3", slug: "categoria-3" },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Categorías</h2>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/tienda/categoria/${category.slug}`}
              className="hover:text-blue-500 block py-2"
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategorySidebar;
