"use client";
import React, { useState } from "react";
import { handleStockSku } from "@/app/utils/HandleStockSku";
import { HandlePriceSku } from "@/app/utils/HandlePriceSku";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import ImageToBase64Converter from "./ImageToBase64Converter";
import BatchCategoryCreator from "@/app/dashboard/productos/crear/carga-masiva/BatchCategoryCreator";

interface Product {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  mainImage?: {
    name: string;
    type: string;
    size: number;
    data: string;
  };
}

const CargaMasiva = () => {
  const [jsonInput, setJsonInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentProduct, setCurrentProduct] = useState(0);
  const router = useRouter();

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonInput(e.target.value);
  };

  const validateProducts = (products: Product[]): boolean => {
    for (const product of products) {
      if (
        !product.name ||
        !product.description ||
        !product.price ||
        !product.stock
      ) {
        toast.error(
          "Todos los productos deben tener nombre, descripción, precio y stock"
        );
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const products = JSON.parse(jsonInput);

      if (!validateProducts(products)) {
        toast.error("El formato del JSON no es válido");
        setIsLoading(false);
        return;
      }

      setTotalProducts(products.length);

      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        setCurrentProduct(i + 1);
        setProgress(((i + 1) * 100) / products.length);

        // Preparar los datos de la imagen
        const imageData = product.mainImage
          ? {
              mainImage: {
                name: product.mainImage.name,
                type: product.mainImage.type,
                size: product.mainImage.size,
                data: product.mainImage.data,
              },
              previewImage: {
                name: product.mainImage.name,
                type: product.mainImage.type,
                size: product.mainImage.size,
                data: product.mainImage.data,
              },
            }
          : {};

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${getCookie("AdminTokenAuth")}`,
            },
            body: JSON.stringify({
              name: product.name,
              description: product.description,
              statusCode: "ACTIVE",
              enabledForDelivery: true,
              enabledForWithdrawal: true,
              hasVariations: false,
              hasFeaturedBaseSku: false,
              isFeatured: false,
              productTypes: [{ id: product.category }],
              measures: {
                length: 1,
                width: 1,
                height: 1,
                weight: 1,
              },
              ...imageData,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Error al crear el producto ${product.name}`);
        }

        const data = await response.json();
        const { id, skuId } = data.product;

        // Actualizar stock
        await handleStockSku(id, skuId, product.stock, 0);

        // Actualizar precio
        await HandlePriceSku(id, skuId, product.price);
      }

      toast.success("Productos creados exitosamente");
      router.push("/dashboard/productos");
    } catch (error) {
      console.error(error);
      toast.error("Error al crear los productos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) {
      const confirmCancel = window.confirm(
        "¿Estás seguro que deseas cancelar la carga masiva? El proceso se detendrá."
      );
      if (confirmCancel) {
        setIsLoading(false);
        router.push("/dashboard/productos");
      }
    } else {
      router.push("/dashboard/productos");
    }
  };

  return (
    <div className=" mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Carga Masiva de Productos</h1>

      <div className="grid grid-cols-1 gap-8">
        <ImageToBase64Converter />

        <BatchCategoryCreator />

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            JSON de Productos
          </label>
          <textarea
            className="w-full h-64 p-4 border rounded-md shadow-sm"
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder={`[
  {
    "name": "Producto 1",
    "description": "<p>Descripción del producto 1</p>",
    "price": 1000,
    "stock": 10,
    "category": "990dc6bd-a333-406a-8cc9-ab41af0b551a",
    "mainImage": {
      "name": "producto1.jpg",
      "type": "image/jpeg",
      "size": 1024,
      "data": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAEAAAAAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAKAAoDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9/KKKKACiiigA/9k="
    }
  }
]`}
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white ${
              isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isLoading ? "Procesando..." : "Crear Productos"}
          </button>

          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Cancelar
          </button>
        </div>

        {isLoading && (
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm text-gray-600">
              <span>
                Progreso: {currentProduct} de {totalProducts} productos
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CargaMasiva;
