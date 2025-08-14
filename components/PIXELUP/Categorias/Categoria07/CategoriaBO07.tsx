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
import toast from "react-hot-toast";

const Categorias07BO = () => {
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
  const [aspect, setAspect] = useState(1 / 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const defaultImage = "/img/placeholder.webp";

  const getDefaultBanner = (order: number) => ({
    id: `default-${order}`,
    title: "Predeterminado",
    mainImage: { url: defaultImage },
    orderNumber: order,
    isDefault: true
  });

  const getOrderedBanners = () => {
    const orderedBanners = [...Array(5)].map((_, index) => {
      const existingBanner = slidersData.find(banner => banner.orderNumber === index + 1);
      return existingBanner || getDefaultBanner(index + 1);
    });
    return orderedBanners;
  };

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA07_ID}`;
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
    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA07_ID}`;
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
      fetchBannerCategoryHome();
    } catch (error) {
      console.error("Error deleting Slider:", error);
    }
  };

  const SliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA07_ID}`;

    // Verificar si hay una imagen seleccionada
    if (!mainImageSlider || !updatedSliderCategory.mainImage.data) {
      toast.error("Por favor, selecciona una imagen para el slider.");
      return;
    }

    // Verificar si hay menos de 4 sliders antes de agregar uno nuevo
    if (slidersData.length >= 5) {
      toast.error("No se pueden agregar más de 4 sliders.");
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
      toast.error("Ya existe un slider con el mismo orden.");
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
      toast.success("Slider agregado exitosamente");
      fetchBannerCategoryHome();
      handleClearImage(setMainImageSlider);
    } catch (error) {
      console.error("Error updating Slider:", error);
      toast.error("Error al agregar el slider");
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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    const numericValue = name === "orderNumber" ? parseInt(value) : value;

    setUpdatedSliderCategory((prevData) => ({
      ...prevData,
      [name]: numericValue,
    }));

    // Establecer el aspecto del cropper basado en la selección de posición
    if (name === "orderNumber") {
      switch (parseInt(value)) {
        case 1:
          setAspect(4 / 3); // Aspecto para la primera imagen (alta y delgada)
          break;
        case 2:         
         setAspect(4 / 3); // Aspecto para la primera imagen (alta y delgada)
        break;
        case 3:
          setAspect(4 / 3); // Aspecto para las imágenes centrales (rectangulares horizontales)
          break;
        case 4:
          setAspect(4 / 3); // Aspecto para la última imagen (alta y delgada)
          break;
        default:
          setAspect(4 / 3); // Valor por defecto
          break;
      }
    }
  };

  const handleSelectCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;

    setSelectedCategoryId(value);

    const selectedCategory = categories.find(
      (category) => category.id === value
    );

    if (selectedCategory) {
      const categorySlug = slugify(selectedCategory.name);
      const buttonLink = `/tienda?categoria=${categorySlug}`;

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
    const maxSliders = 5;
    const usedOrders = slidersData.map((slider) => slider.orderNumber);
    const availableOrders = [];

    for (let i = 1; i <= maxSliders; i++) {
      if (!usedOrders.includes(i)) {
        availableOrders.push(i);
      }
    }

    return availableOrders;
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
    <section
      id="banner"
      className="w-full"
    >
      <div className="w-full">


        <div className="flex justify-center items-center">
          <div className="2xl:mx-auto 2xl:container py-12 px-4 sm:px-6 xl:px-20 2xl:px-0 w-full">
            <div className="flex flex-col jusitfy-center items-center space-y-10">
              <div className="flex flex-col justify-center items-center">
                <h1 className="text-3xl xl:text-4xl font-semibold leading-7 xl:leading-9 text-primary dark:text-white">
                  Nuestras Categorías
                </h1>
              </div>

              <div className="grid grid-cols-1 gap-4 w-full">
                {/* Contenedor superior - 2 categorías grandes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[0, 1].map((index) => (
                    <div key={index} className="relative h-[300px] md:h-[400px] group overflow-hidden rounded">
                      {getOrderedBanners()[index] && (
                        <>
                          <img 
                            className={`w-full h-full object-cover transform ${!getOrderedBanners()[index].isDefault ? 'opacity-100' : 'opacity-40'}`}
                            src={getOrderedBanners()[index].mainImage.url}
                            alt={getOrderedBanners()[index].title}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full">
                            Orden: {getOrderedBanners()[index].orderNumber}
                          </div>
                          {!getOrderedBanners()[index].isDefault && (
                            <button
                              onClick={() => deleteSlider(getOrderedBanners()[index].id)}
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
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                              {getOrderedBanners()[index].title}
                            </h3>
                            <p className="text-white/90 text-sm lg:text-base mb-4 max-w-md">
                              {getOrderedBanners()[index].landingText}
                            </p>
                            <button className="bg-transparent border border-white/50 hover:bg-white hover:text-stone-900 text-white py-2 px-6 rounded backdrop-blur-sm transition-all duration-300">
                              Ver más
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {/* Contenedor inferior - 3 categorías pequeñas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[2, 3, 4].map((index) => (
                    <div key={index} className="relative h-[250px] group overflow-hidden rounded">
                      {getOrderedBanners()[index] && (
                        <>
                          <img 
                            className={`w-full h-full object-cover transform ${!getOrderedBanners()[index].isDefault ? 'opacity-100' : 'opacity-40'}`}
                            src={getOrderedBanners()[index].mainImage.url}
                            alt={getOrderedBanners()[index].title}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div>
                          <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full">
                            Orden: {getOrderedBanners()[index].orderNumber}
                          </div>
                          {!getOrderedBanners()[index].isDefault && (
                            <button
                              onClick={() => deleteSlider(getOrderedBanners()[index].id)}
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
                          )}
                          <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h3 className="text-xl font-bold text-white mb-2">
                              {getOrderedBanners()[index].title}
                            </h3>
                            <p className="text-white/80 text-sm mb-4">
                              {getOrderedBanners()[index].landingText}
                            </p>
                            <button className="text-sm bg-transparent border border-white/50 hover:bg-white hover:text-stone-900 text-white py-1.5 px-4 rounded backdrop-blur-sm transition-all duration-300">
                              Ver más
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-md uppercase font-semibold text-center mb-4">
          Agregar Nuevo Slider
        </h2>
        <form
          onSubmit={SliderSubmit}
          className=" mx-auto"
        >
          <div>
            <label htmlFor="categorySelect">
              <h3 className="font-normal text-primary">
                Seleccionar Categoria <span className="text-primary">*</span>
              </h3>
            </label>
            <select
              id="categorySelect"
              name="categorySelect"
              onChange={handleSelectCategory}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
            >
              <option value="">Seleccione una categoría</option>

              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="my-4">
            <label htmlFor="orderNumber">
              <h3 className="font-normal text-primary">
                Orden del Slider <span className="text-primary">*</span>
              </h3>
            </label>
            <select
              id="orderNumber"
              name="orderNumber"
              value={updatedSliderCategory.orderNumber}
              onChange={(event) => handleChangeSlider(event)}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
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
                Has alcanzado el límite máximo de sliders (4)
              </p>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="landingText">
              <h3 className="font-normal text-primary">
                Texto Descriptivo <span className="text-primary">*</span>
              </h3>
            </label>
            <div className="relative">
              <textarea
                id="landingText"
                name="landingText"
                value={updatedSliderCategory.landingText}
                onChange={handleChangeSlider}
                placeholder="Ingresa una descripción para la categoría"
                className="shadow block w-full px-4 py-2 mt-2 mb-1 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
                rows={1}
                maxLength={80}
              />
              <div className="text-right text-sm text-gray-500">
                {updatedSliderCategory.landingText.length}/30 caracteres
              </div>
            </div>
          </div>
          <div className="mb-4 hidden">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Título
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={updatedSliderCategory.title}
              onChange={handleChangeSlider}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4 hidden">
            <label
              htmlFor="mainImageLink"
              className="block text-sm font-medium text-gray-700"
            >
              mainImageLink
            </label>
            <input
              type="text"
              id="mainImageLink"
              name="mainImageLink"
              value={updatedSliderCategory.mainImageLink}
              onChange={handleChangeSlider}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4 hidden">
            <label
              htmlFor="buttonLink"
              className="block text-sm font-medium text-gray-700"
            >
              Link del Botón
            </label>
            <input
              type="text"
              id="buttonLink"
              name="buttonLink"
              value={updatedSliderCategory.buttonLink}
              onChange={handleChangeSlider}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div className="mb-4 hidden">
            <label
              htmlFor="buttonText"
              className="block text-sm font-medium text-gray-700"
            >
              Texto del Botón
            </label>
            <input
              type="text"
              id="buttonText"
              name="buttonText"
              value={updatedSliderCategory.buttonText}
              onChange={handleChangeSlider}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          <div>
            <input
              type="file"
              accept="image/*"
              id="mainImageCategoria07"
              className="hidden"
              onChange={(e) =>
                handleImageSliderChange(e, setMainImageSlider, "mainImage")
              }
            />
            {mainImageSlider ? (
              <div>
                <h3 className="font-normal text-primary">
                  Foto <span className="text-primary">*</span>
                </h3>
                <div className="relative mt-2 h-[150px] rounded-lg object-contain overflow-hidden">
                  <img
                    src={mainImageSlider}
                    alt="Main Image"
                    className="w-full"
                  />
                  <button
                    className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 m-1 text-xs"
                    onClick={() => handleClearImage(setMainImageSlider)}
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
                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-normal text-primary">
                  Foto <span className="text-primary">*</span>
                </h3>
                <label
                  htmlFor="mainImageCategoria07"
                  className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed cursor-pointer w-full z-10"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <div className="flex flex-col justify-center items-center">
                    <svg
                      className="w-12 h-12 text-gray-400"
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
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-semibold">Subir Imagen</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG o Webp (800x800px)
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              disabled={!mainImageSlider || !selectedCategoryId}
              className={`shadow w-full uppercase font-bold py-2 px-4 rounded flex-wrap mt-6 ${
                !mainImageSlider || !selectedCategoryId
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-primary hover:bg-secondary text-secondary hover:text-primary"
              }`}
              style={{ borderRadius: "var(--radius)" }}
            >
              {!mainImageSlider
                ? "Selecciona una imagen"
                : !selectedCategoryId
                ? "Selecciona una categoría"
                : "Agregar Slider"}
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
                  aspect={4/3}
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
                    step={0.1}
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

export default Categorias07BO;