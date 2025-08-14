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

const Categorias01BO = () => {
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
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA01_ID}`;
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
    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA01_ID}`;
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
    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA01_ID}`;

    // Verificar si hay una imagen seleccionada
    if (!mainImageSlider || !updatedSliderCategory.mainImage.data) {
      alert("Por favor, selecciona una imagen para el slider.");
      return;
    }

    // Verificar si hay menos de 4 sliders antes de agregar uno nuevo
    if (slidersData.length >= 4) {
      alert("No se pueden agregar más de 4 sliders.");
      return;
    }

    // Verificar si la categoría seleccionada ya tiene un slider asociado
    const categoryExists = slidersData.some(
      (slider) => slider.title === updatedSliderCategory.title
    );
    if (categoryExists) {
      alert("Esta categoría ya tiene un slider asociado.");
      return;
    }

    // Verificar si ya existe un slider con el mismo orden
    const orderExists = slidersData.some(
      (slider) => slider.orderNumber === updatedSliderCategory.orderNumber
    );
    if (orderExists) {
      alert("Ya existe un slider con el mismo orden.");
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
      fetchBannerCategoryHome();
      handleClearImage(setMainImageSlider);
    } catch (error) {
      console.error("Error updating Slider:", error);
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
      const buttonLink = `${process.env.NEXT_PUBLIC_BASE_URL}/tienda/${categorySlug}`;

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
    const maxSliders = 4;
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
      <div className="flex flex-wrap gap-6 items-center align-middle justify-center">
        {slidersData.map((banner) => (
          <div
            className="flex-1 max-w-[200px] min-w-[200px]"
            key={banner.id}
          >
            <span>{banner.orderNumber}</span>
            <Link
              href={banner.buttonLink}
              className="group relative flex h-96 items-end overflow-hidden rounded-lg bg-gray-100 p-4 shadow-lg"
            >
              <img
                alt="Banner Image"
                src={banner.mainImage.url}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="relative w-full text-center bg-white rounded-xl p-2 font-bold ">
                <h3 className="text-xl text-dark">{banner.title}</h3>
                <p className="mt-1 text-sm text-black hidden">
                  {banner.landingText}
                </p>
              </div>
            </Link>
            <button
              onClick={() => deleteSlider(banner.id)}
              className="mt-2 text-red-500 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>
        ))}
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
              htmlFor="landingText"
              className="block text-sm font-medium text-gray-700"
            >
              Texto de la Landing
            </label>
            <input
              type="text"
              id="landingText"
              name="landingText"
              value={updatedSliderCategory.landingText}
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
              id="mainImageSlider"
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
                  htmlFor="mainImageSlider"
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
        <Modal
          showModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={mainImageSlider || ""}
              crop={crop}
              zoom={zoom}
              aspect={400 / 800} // Ajusta esto según las dimensiones que necesites
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="w-full py-6">
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
                className="zoom-range w-full custom-range"
              />
            </div>

            <div className="flex justify-between w-full gap-2">
              <button
                onClick={handleCrop}
                className="bg-primary text-[13px] md:text-[16px] hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Recortar y Subir
              </button>
              <button
                onClick={() => {
                  setMainImageSlider(null);
                  setIsModalOpen(false);
                }}
                className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-[13px] md:text-[16px]"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default Categorias01BO;