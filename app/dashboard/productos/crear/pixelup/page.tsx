"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import toast from "react-hot-toast";
import { getCookie } from "cookies-next";
import axios from "axios";

const CrearProductoSimple: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [skuId, setSkuId] = useState<string | null>(null);
  const [precioNormal, setPrecioNormal] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [productType, setProductType] = useState<any[]>([]); // Datos de tipo de producto
  const [skuData, setSkuData] = useState({
    description: "",
    hasUnlimitedStock: false,
    hasStockNotifications: false,
    isFeatured: false,
  });
  const [formData, setFormData] = useState({
    name: "Producto Dummy",
    description: "Descripción Dummy",
    statusCode: "ACTIVE",
    enabledForDelivery: false,
    enabledForWithdrawal: false,
    hasVariations: false,
    isFeatured: false,
    previewImage: {
      data: "data:image/png;base64,...", // Imagen dummy
    },
    mainImage: {
      data: "data:image/png;base64,...", // Imagen dummy
    },
    productTypes: [
      { value: "dummy-product-type-id", label: "Tipo de Producto Dummy" },
    ], // ID fijo
  });

  const validateForm = () => {
    let valid = true;
    if (!formData.name) {
      toast.error("El nombre del producto es requerido");
      valid = false;
    }
    if (!formData.description) {
      toast.error("La descripción del producto es requerida");
      valid = false;
    }
    if (precioNormal === null || precioNormal <= 1) {
      toast.error("El precio es requerido");
      valid = false;
    }
    if (stockQuantity === null) {
      toast.error("La cantidad de stock es requerida");
      valid = false;
    }
    if (!formData.mainImage.data) {
      toast.error("La imagen principal es requerida");
      valid = false;
    }
    return valid;
  };

  const handleFormSubmit = async () => {
    if (validateForm()) {
      try {
        setIsLoading(true);
        const token = getCookie("AdminTokenAuth");
        // Aquí agregamos el código de creación de producto con los datos dummy
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (response.status === 200) {
          toast.success("Producto creado exitosamente");
        } else {
          toast.error("Error al crear el producto");
        }
      } catch (error) {
        console.error("Error al crear el producto:", error);
        toast.error("Error al crear el producto");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    imageKey: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        const imageInfo = {
          data: result,
        };
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [imageKey]: imageInfo,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null);
  };

  useEffect(() => {
    // Fetch Product Types here and set fixed value for Product Type
    setProductType([
      { id: "dummy-product-type-id", name: "Tipo de Producto Dummy" },
    ]);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">Crear Producto Simple</h1>
      <form className="space-y-4">
        <div>
          <label className="block">Nombre del Producto</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData((prevFormData: any) => ({
                ...prevFormData,
                name: e.target.value,
              }))
            }
            className="w-full border p-2"
          />
        </div>

        <div>
          <label className="block">Descripción del Producto</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prevFormData: any) => ({
                ...prevFormData,
                description: e.target.value,
              }))
            }
            className="w-full border p-2"
          />
        </div>

        <div>
          <label className="block">Precio Normal</label>
          <input
            type="number"
            value={precioNormal || ""}
            onChange={(e) => setPrecioNormal(parseFloat(e.target.value))}
            className="w-full border p-2"
          />
        </div>

        <div>
          <label className="block">Cantidad de Stock</label>
          <input
            type="number"
            value={stockQuantity || ""}
            onChange={(e) => setStockQuantity(parseFloat(e.target.value))}
            className="w-full border p-2"
          />
        </div>

        <div>
          <label className="block">Imagen Principal</label>
          <input
            type="file"
            onChange={(e) => handleImageChange(e, setMainImage, "mainImage")}
            className="w-full border p-2"
          />
        </div>

        <div>
          <label className="block">Imagen de Vista Previa</label>
          <input
            type="file"
            onChange={(e) =>
              handleImageChange(e, setPreviewImage, "previewImage")
            }
            className="w-full border p-2"
          />
        </div>

        <button
          type="button"
          onClick={handleFormSubmit}
          className="bg-blue-500 text-white p-2 rounded"
        >
          {isLoading ? "Cargando..." : "Crear Producto"}
        </button>
      </form>
    </div>
  );
};

export default CrearProductoSimple;
