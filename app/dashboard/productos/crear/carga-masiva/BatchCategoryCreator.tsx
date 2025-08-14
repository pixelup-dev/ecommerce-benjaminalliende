"use client";
import React, { useState } from "react";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { useRevalidation } from "@/app/Context/RevalidationContext";

interface CategoryToCreate {
  name: string;
  description?: string;
  status: "pending" | "success" | "error";
  error?: string;
  id?: string;
}

const BatchCategoryCreator = ({
  onCategoriesCreated,
}: {
  onCategoriesCreated?: () => void;
}) => {
  const { triggerRevalidation } = useRevalidation();
  const [categories, setCategories] = useState<CategoryToCreate[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value
      .split("\n")
      .filter((line) => line.trim() !== "");
    const newCategories = lines.map((line) => ({
      name: line.trim(),
      description: "texto predeterminado",
      status: "pending" as const,
    }));
    setCategories(newCategories);
  };

  const createCategory = async (category: CategoryToCreate) => {
    const token = getCookie("AdminTokenAuth");
    try {
      const requestData = {
        name: category.name,
        description: category.description || "texto predeterminado",
        statusCode: "ACTIVE",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar los datos.");
      }

      const responseData = await response.json();
      await triggerRevalidation();

      return {
        success: true,
        id: responseData.productType.id,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al crear la categoría",
      };
    }
  };

  const copyCategoriesToClipboard = () => {
    const successfulCategories = categories
      .filter((cat) => cat.status === "success" && cat.id)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
      }));

    navigator.clipboard.writeText(
      JSON.stringify(successfulCategories, null, 2)
    );
    toast.success("JSON de categorías copiado al portapapeles");
  };

  const processCategories = async () => {
    if (categories.length === 0) {
      toast.error("Por favor, ingresa al menos una categoría");
      return;
    }

    setIsProcessing(true);
    let processed = 0;

    const updatedCategories = [...categories];
    for (let i = 0; i < categories.length; i++) {
      const result = await createCategory(categories[i]);

      updatedCategories[i] = {
        ...updatedCategories[i],
        status: result.success ? "success" : "error",
        error: result.success ? undefined : result.error,
        id: result.success ? result.id : undefined,
      };

      processed++;
      setProgress((processed / categories.length) * 100);
      setCategories(updatedCategories);
    }

    setIsProcessing(false);
    onCategoriesCreated?.();

    const successCount = updatedCategories.filter(
      (c) => c.status === "success"
    ).length;
    toast.success(`${successCount} categorías creadas exitosamente`);
  };

  const clearCategories = () => {
    setCategories([]);
    setProgress(0);
  };

  return (
    <div className="shadow-md b rounded-lg p-4 bg-white my-6 overflow-x-auto">
      <div className="relative w-full bg-white rounded-lg sm:p-5">
        <div className="pb-4 mb-4 rounded-t border-b sm:mb-5">
          <h3 className="text-lg font-semibold text-gray-900">
            Crear Categorías en Lote
          </h3>
        </div>

        <div className="grid gap-4 mb-4">
          <div>
            <label
              htmlFor="categories"
              className="block text-sm font-medium text-gray-700"
            >
              Nombres de Categorías (una por línea)
            </label>
            <textarea
              id="categories"
              className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 min-h-[160px]"
              placeholder="Electrónicos
Ropa
Accesorios
Calzado"
              onChange={handleTextChange}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={processCategories}
            disabled={isProcessing || categories.length === 0}
            className={`${
              isProcessing || categories.length === 0
                ? "bg-gray-400"
                : "bg-primary hover:bg-secondary"
            } text-white font-medium rounded-lg px-5 py-2.5`}
          >
            {isProcessing ? "Procesando..." : "Crear Categorías"}
          </button>

          {categories.some((cat) => cat.status === "success") && (
            <button
              onClick={copyCategoriesToClipboard}
              className="bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-5 py-2.5"
            >
              Copiar JSON
            </button>
          )}

          <button
            onClick={clearCategories}
            disabled={isProcessing}
            className="bg-red-800 hover:bg-secondary text-white font-medium rounded-lg px-5 py-2.5"
          >
            Limpiar
          </button>
        </div>

        {isProcessing && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progreso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-6 space-y-2">
            <h3 className="font-semibold text-gray-900">
              Estado de las categorías:
            </h3>
            {categories.map((category, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg ${
                  category.status === "success"
                    ? "bg-green-50 text-green-800"
                    : category.status === "error"
                    ? "bg-red-50 text-red-800"
                    : "bg-gray-50 text-gray-800"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{category.name}</span>
                  <span>
                    {category.status === "success" && "✓ Creada"}
                    {category.status === "error" && "✗ Error"}
                    {category.status === "pending" && "⋯ Pendiente"}
                  </span>
                </div>
                {category.error && (
                  <p className="text-sm mt-1">{category.error}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchCategoryCreator;
