"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { obtenerTiposProductos } from "@/app/utils/obtenerTiposProductos";
import { slugify } from "@/app/utils/slugify";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";
import { toast, Toaster } from "react-hot-toast";

const CategoriaBO02 = () => {
  const [slidersData, setSlidersData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [mainImageSlider, setMainImageSlider] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const [updatedSliderCategory, setUpdatedSliderCategory] = useState({
    title: "",
    landingText: "pixelup",
    buttonLink: "",
    buttonText: "click",
    orderNumber: 1,
    mainImageLink: "pixelup.cl",
    mainImage: {
      name: "",
      type: "",
      size: 0,
      data: "",
    },
  });

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA08_ID}`;
      const BannersCategory = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const bannerImages = BannersCategory.data.banner.images;
      const sortedBannerImages = bannerImages.sort(
        (a: { orderNumber: number }, b: { orderNumber: number }) =>
          a.orderNumber - b.orderNumber
      );
      setSlidersData(sortedBannerImages);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductTypes = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const productTypes = await obtenerTiposProductos(
        process.env.NEXT_PUBLIC_API_URL_SITEID,
        token,
        1, // PageNumber
        10 // PageSize
      );

      setCategories(productTypes.productTypes);
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
  };

  const deleteSlider = async (id: any) => {
    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA08_ID}`;
    try {
      const token = getCookie("AdminTokenAuth");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Slider eliminado exitosamente");
      fetchBannerCategoryHome();
    } catch (error) {
      console.error("Error deleting Slider:", error);
      toast.error("Error al eliminar el slider");
    }
  };

  const SliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA08_ID}`;

    // Verificar si hay una imagen seleccionada
    if (!mainImageSlider || !updatedSliderCategory.mainImage.data) {
      toast.error("Por favor, selecciona una imagen para el slider");
      return;
    }

    // Verificar si hay menos de 2 sliders antes de agregar uno nuevo
    if (slidersData.length >= 2) {
      toast.error("No se pueden agregar más de 2 sliders");
      return;
    }

    // Verificar si la categoría seleccionada ya tiene un slider asociado
    const categoryExists = slidersData.some(
      (slider) => slider.title === updatedSliderCategory.title
    );
    if (categoryExists) {
      toast.error("Esta categoría ya tiene un slider asociado");
      return;
    }

    // Verificar si ya existe un slider con el mismo orden
    const orderExists = slidersData.some(
      (slider) => slider.orderNumber === updatedSliderCategory.orderNumber
    );
    if (orderExists) {
      toast.error("Ya existe un slider con el mismo orden");
      return;
    }

    try {
      const token = getCookie("AdminTokenAuth");

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        { ...updatedSliderCategory },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Slider creado exitosamente");
      fetchBannerCategoryHome();
      handleClearImage(setMainImageSlider);
    } catch (error) {
      console.error("Error updating Slider:", error);
      toast.error("Error al crear el slider");
    }
  };

  const handleImageSliderChange = async (
    e: ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    imageKey: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeSlider = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    const numericValue = name === "orderNumber" ? parseInt(value) : value;

    setUpdatedSliderCategory((prevData) => ({
      ...prevData,
      [name]: numericValue,
    }));
  };

  const handleSelectCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    setSelectedCategoryId(value);

    const selectedCategory = categories.find(
      (category) => category.id === value
    );

    if (selectedCategory) {
      const categorySlug = slugify(selectedCategory.name);
      const buttonLink = `${process.env.NEXT_PUBLIC_BASE_URL}/tienda?categoria=${categorySlug}`;

      setUpdatedSliderCategory((prevData) => ({
        ...prevData,
        buttonLink,
        title: selectedCategory.name,
      }));
    }
  };
  const handleClearImage = (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null); // Limpiar la imagen seleccionada
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!mainImageSlider) return;

    try {
      const croppedImage = await getCroppedImg(
        mainImageSlider,
        croppedAreaPixels
      );
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 1,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: fileName || "default-image.jpg",
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      setUpdatedSliderCategory((prevFormData: any) => ({
        ...prevFormData,
        mainImage: imageInfo,
      }));
      setMainImageSlider(base64);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Función para obtener los números de orden disponibles
  const getAvailableOrderNumbers = () => {
    const maxSliders = 2;
    const usedOrders = slidersData.map((slider) => slider.orderNumber);
    const availableOrders = [];

    for (let i = 1; i <= maxSliders; i++) {
      if (!usedOrders.includes(i)) {
        availableOrders.push(i);
      }
    }

    return availableOrders;
  };

  // Función para obtener las categorías disponibles (no seleccionadas)
  const getAvailableCategories = () => {
    const usedCategories = slidersData.map((slider) => slider.title);
    return categories.filter((category) => !usedCategories.includes(category.name));
  };

  useEffect(() => {
    fetchBannerCategoryHome();
    fetchProductTypes();
  }, []);

  useEffect(() => {
    // Ordenar los sliders por orderNumber
    setSlidersData((prevData) =>
      [...prevData].sort((a, b) => a.orderNumber - b.orderNumber)
    );
  }, []);

  // Modificar el useEffect para actualizar el orderNumber automáticamente
  useEffect(() => {
    const availableOrders = getAvailableOrderNumbers();
    if (availableOrders.length > 0) {
      setUpdatedSliderCategory((prev) => ({
        ...prev,
        orderNumber: availableOrders[0],
      }));
    }
  }, [slidersData]);

  return (
    <section className="py-16">
      <Toaster position="top-center" />
      <h2 className="text-2xl font-bold text-center mb-8">Gestión de Categorías</h2>
      {/* Visualización de categorías en formato grid */}
      <div className="grid grid-cols-2 gap-0">
        {slidersData.map((banner) => (
          <div
            key={banner.id}
            className="relative h-[400px] group overflow-hidden cursor-pointer"
          >
            <img
              src={banner.mainImage.url}
              alt={banner.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
              <div className="text-center">
                <h3 className="text-4xl font-poiret text-white mb-2">
                  {banner.landingText || "Descripción no disponible"}
                </h3>
                <a
                  href={banner.buttonLink}
                  className="inline-block text-montserrat px-6 py-1 text-white border-b border-white/30 group-hover:border-white transition-all text-sm"
                >
                  Comprar Ahora
                </a>
              </div>
            </div>
            
            {/* Controles de administración */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
              <div className="bg-primary text-white px-3 py-1 rounded-full">
                Orden: {banner.orderNumber}
              </div>
              <div className="bg-primary/80 text-white px-3 py-1 rounded-full text-sm">
                Categoría: {banner.title}
              </div>
            </div>
            <button
              onClick={() => deleteSlider(banner.id)}
              className="absolute top-4 right-4 bg-red-500 hover:bg-red-700 text-white rounded-full p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
      
      {/* Formulario para agregar nueva categoría */}
      <div className="mt-8  mx-auto bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center mb-6">
          Agregar Nueva Categoría
        </h2>
        <form
          onSubmit={SliderSubmit}
          className="space-y-4"
        >
          <div>
            <label htmlFor="categorySelect" className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="categorySelect"
              name="categorySelect"
              onChange={handleSelectCategory}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            >
              <option value="">Seleccione una categoría</option>
              {getAvailableCategories().map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Orden de la Categoría <span className="text-red-500">*</span>
            </label>
            <select
              id="orderNumber"
              name="orderNumber"
              value={updatedSliderCategory.orderNumber}
              onChange={(event) => handleChangeSlider(event)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              disabled={getAvailableOrderNumbers().length === 0}
            >
              {getAvailableOrderNumbers().map((number) => (
                <option
                  key={number}
                  value={number}
                >
                  {number}
                </option>
              ))}
              {getAvailableOrderNumbers().length === 0 && (
                <option value="">No hay posiciones disponibles</option>
              )}
            </select>
            {getAvailableOrderNumbers().length === 0 && (
              <p className="text-sm text-red-500 mt-1">
                Has alcanzado el límite máximo de categorías (2)
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="landingText" className="block text-sm font-medium text-gray-700 mb-1">
              Texto de la Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="landingText"
              name="landingText"
              value={updatedSliderCategory.landingText}
              onChange={handleChangeSlider}
              placeholder="Ingrese el texto descriptivo de la categoría"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          
          <div className="hidden">
            <input
              type="text"
              id="title"
              name="title"
              value={updatedSliderCategory.title}
              onChange={handleChangeSlider}
            />
            <input
              type="text"
              id="mainImageLink"
              name="mainImageLink"
              value={updatedSliderCategory.mainImageLink}
              onChange={handleChangeSlider}
            />
            <input
              type="text"
              id="buttonLink"
              name="buttonLink"
              value={updatedSliderCategory.buttonLink}
              onChange={handleChangeSlider}
            />
            <input
              type="text"
              id="buttonText"
              name="buttonText"
              value={updatedSliderCategory.buttonText}
              onChange={handleChangeSlider}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen de la Categoría <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              id="mainImageCategoria08"
              className="hidden"
              onChange={(e) =>
                handleImageSliderChange(e, setMainImageSlider, "mainImage")
              }
            />
            {mainImageSlider ? (
              <div className="relative mt-2 h-[150px] rounded-lg object-contain overflow-hidden border border-gray-300">
                <img
                  src={mainImageSlider}
                  alt="Imagen seleccionada"
                  className="w-full h-full object-contain"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-1"
                  onClick={() => handleClearImage(setMainImageSlider)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <label
                htmlFor="mainImageCategoria08"
                className="flex flex-col justify-center items-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col justify-center items-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-2 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <p className="mb-1 text-sm text-gray-500">
                    <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG o Webp (800x800px)</p>
                </div>
              </label>
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={!mainImageSlider || !selectedCategoryId}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                !mainImageSlider || !selectedCategoryId
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary"
              }`}
            >
              {!mainImageSlider
                ? "Selecciona una imagen"
                : !selectedCategoryId
                ? "Selecciona una categoría"
                : "Agregar Categoría"}
            </button>
          </div>
        </form>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Recortar Imagen</h2>
              </div>
              <button
                onClick={() => {
                  setMainImageSlider(null);
                  setIsModalOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="relative h-96 w-full">
                <Cropper
                  image={mainImageSlider || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={1 / 1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom
                  </label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.01}
                    aria-labelledby="Zoom"
                    onChange={(e) => {
                      setZoom(parseFloat(e.target.value));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCrop}
                    className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recortar y Continuar
                  </button>
                  <button
                    onClick={() => {
                      setMainImageSlider(null);
                      setIsModalOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CategoriaBO02;
