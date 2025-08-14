"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";
import { toast } from "react-hot-toast";
import Select from "react-select";

const DestacadosCatBO = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const siteid = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types?pageNumber=1&pageSize=50&siteId=${siteid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Ordenar categorías por nombre
      const sortedCategories = response.data.productTypes
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

      setCategories(sortedCategories);

      // Cargar las categorías seleccionadas guardadas
      const savedCategories = await fetchSavedCategories();
      setSelectedCategories(savedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCategories = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const contentBlockId = process.env.NEXT_PUBLIC_DESTACADOS_CAT_CONTENTBLOCK;
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.contentBlock.contentText ? JSON.parse(response.data.contentBlock.contentText) : [];
    } catch (error) {
      console.error("Error fetching saved categories:", error);
      return [];
    }
  };

  const handleCategoryChange = (selectedOption: any) => {
    if (selectedOption) {
      if (selectedCategories.length >= 3) {
        toast.error("Solo puedes seleccionar hasta 3 categorías");
        return;
      }
      handleCategoryToggle(selectedOption.value);
      setSelectedCategory(null);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    let updatedCategories: string[];

    if (selectedCategories.includes(categoryId)) {
      // Remover la categoría
      updatedCategories = selectedCategories.filter(id => id !== categoryId);
    } else {
      // Agregar la categoría
      if (selectedCategories.length >= 3) {
        toast.error("Solo puedes seleccionar hasta 3 categorías");
        return;
      }
      updatedCategories = [...selectedCategories, categoryId];
    }

    setSelectedCategories(updatedCategories);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const contentBlockId = process.env.NEXT_PUBLIC_DESTACADOS_CAT_CONTENTBLOCK;

      // Actualizar el content block con las categorías seleccionadas
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${siteId}`,
        {
          title: "destacadosCat",
          contentText: JSON.stringify(selectedCategories),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setHasChanges(false);
      toast.success("Cambios guardados exitosamente");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const formatOptionLabel = ({ value, label }: any) => (
    <div>
      <span>{label}</span>
    </div>
  );

  const availableCategories = categories.filter(
    (category) => !selectedCategories.includes(category.id)
  );

  const handleMoveCategory = (currentIndex: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= selectedCategories.length) {
      return; // No hacer nada si el nuevo índice está fuera de los límites
    }

    // Obtener las categorías en el orden actual
    const orderedCategories = categories
      .filter(category => selectedCategories.includes(category.id))
      .sort((a, b) => {
        const indexA = selectedCategories.indexOf(a.id);
        const indexB = selectedCategories.indexOf(b.id);
        return indexA - indexB;
      });

    // Obtener los IDs de las categorías que queremos intercambiar
    const categoryToMove = orderedCategories[currentIndex].id;
    const categoryToSwapWith = orderedCategories[newIndex].id;

    // Crear una nueva copia del array de IDs
    const newOrder = [...selectedCategories];
    
    // Encontrar los índices reales en el array de selectedCategories
    const actualCurrentIndex = selectedCategories.indexOf(categoryToMove);
    const actualNewIndex = selectedCategories.indexOf(categoryToSwapWith);

    // Intercambiar las posiciones usando los índices reales
    [newOrder[actualCurrentIndex], newOrder[actualNewIndex]] = [newOrder[actualNewIndex], newOrder[actualCurrentIndex]];

    // Actualizar el estado con el nuevo orden
    setSelectedCategories(newOrder);
    setHasChanges(true);
  };

  if (loading) return <div>Cargando categorías...</div>;
  if (error) return <div>Error al cargar las categorías</div>;

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Seleccionar Categorías para Mostrar
        </h2>
        <p className="text-center mb-8 text-gray-600">
          Selecciona hasta 4 categorías para mostrar en la página principal
        </p>

        <div className="mb-8">
          <Select
            value={selectedCategory}
            onChange={handleCategoryChange}
            options={availableCategories.map((category) => ({
              value: category.id,
              label: category.name,
            }))}
            formatOptionLabel={formatOptionLabel}
            className="shadow block w-full"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "var(--radius)",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "var(--radius)",
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: "200px", // Altura para mostrar ~5 elementos
                "::-webkit-scrollbar": {
                  width: "8px",
                  height: "0px",
                },
                "::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "4px",
                },
                "::-webkit-scrollbar-thumb": {
                  background: "#888",
                  borderRadius: "4px",
                },
                "::-webkit-scrollbar-thumb:hover": {
                  background: "#555",
                },
              }),
              option: (base) => ({
                ...base,
                padding: "8px 12px",
              }),
            }}
            placeholder="Buscar y seleccionar categoría..."
            isClearable
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories
            .filter((category) => selectedCategories.includes(category.id))
            .sort((a, b) => {
              const indexA = selectedCategories.indexOf(a.id);
              const indexB = selectedCategories.indexOf(b.id);
              return indexA - indexB;
            })
            .map((category, index) => (
              <div
                key={category.id}
                className="border rounded-lg p-4 shadow-sm transition-all duration-300 border-primary/20 shadow-primary/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-lg">{category.name}</h3>
                  </div>
                  <button
                    onClick={() => handleCategoryToggle(category.id)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                    title="Eliminar"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={2} 
                      stroke="currentColor" 
                      className="w-5 h-5"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleMoveCategory(index, 'left')}
                    disabled={index === 0}
                    className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                      index === 0
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-secondary hover:bg-secondary hover:text-primary"
                    }`}
                    title="Mover a la izquierda"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-6 h-6 mx-auto"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" 
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleMoveCategory(index, 'right')}
                    disabled={index === selectedCategories.length - 1}
                    className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                      index === selectedCategories.length - 1
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-secondary hover:bg-secondary hover:text-primary"
                    }`}
                    title="Mover a la derecha"
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      strokeWidth={1.5} 
                      stroke="currentColor" 
                      className="w-6 h-6 mx-auto"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Categorías seleccionadas: {selectedCategories.length}/3
          </p>
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              hasChanges
                ? "bg-primary text-secondary hover:bg-secondary hover:text-primary"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Guardando..." : "Actualizar Cambios"}
          </button>
          {hasChanges && (
            <p className="text-yellow-600 text-sm mt-2">
              * Hay cambios sin guardar
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default DestacadosCatBO;
