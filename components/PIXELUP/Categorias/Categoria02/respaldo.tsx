"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { obtenerTiposProductos } from "@/app/utils/obtenerTiposProductos";
import Cropper from "react-easy-crop"; // Asegúrate de importar el Cropper
import Modal from "@/components/Core/Modals/ModalSeo"; // Asegúrate de que esta ruta es correcta
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";

const Categoria02BO = () => {
  const [slidersData, setSlidersData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [aspect, setAspect] = useState(1 / 1);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainImageSlider, setMainImageSlider] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  const [updatedSliderCategory, setUpdatedSliderCategory] = useState({
    title: "",
    landingText: "",
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

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA02_ID}`;
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const BannersCategory = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${siteId}`
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
        100 // PageSize
      );

      setCategories(productTypes.productTypes);
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
  };

  const deleteSlider = async (id: any) => {
    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA02_ID}`;
    try {
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${id}?siteId=${siteId}`,
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

    if (slidersData.length >= 3) {
      alert("No se pueden agregar más de 3 sliders.");
      return;
    }

    // Asegurarnos de que el buttonLink use el nombre de la categoría
    if (updatedSliderCategory.title) {
      const categoryName = updatedSliderCategory.title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      updatedSliderCategory.buttonLink = `/tienda?categoria=${categoryName}`;
    }

    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA02_ID}`;

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
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${siteId}`,
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
      resetSliderData();
    } catch (error) {
      console.error("Error updating Slider:", error);
    }
  };
  const resetSliderData = () => {
    setUpdatedSliderCategory({
      title: "pixelup",
      landingText: "",
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
    setMainImageSlider(null); // Limpiar la imagen seleccionada
  };
  const handleImageSliderChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageToCrop(result); // Establecer la imagen para recortar
        setIsModalOpen(true); // Abrir el modal
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

    // Establecer el aspecto del cropper basado en la selección de posición
    if (name === "orderNumber") {
      switch (value) {
        case "1":
          setAspect(1 / 1); // Aspecto 1
          break;
        case "2":
          setAspect(1 / 1); // Aspecto 2
          break;
        case "3":
          setAspect(1 / 1); // Aspecto 3
          break;
        case "4":
          setAspect(1 / 1); // Aspecto 4
          break;
        default:
          setAspect(1 / 1); // Valor por defecto
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
      // Convertimos el nombre de la categoría a minúsculas y quitamos acentos
      const categoryName = selectedCategory.name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      console.log("Processed category name:", categoryName);

      const buttonLink = `/tienda?categoria=${categoryName}`;

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

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const defaultImage =
    "/img/placeholder.webp";
  const getDefaultBanner = (index: number) => {
    return slidersData && slidersData[index]
      ? slidersData[index]
      : { mainImage: { url: defaultImage }, title: "Titulo por defecto" };
  };
  const generateImageName = () => {
    return `slider_image_${Date.now()}.jpg`; // Nombre dinámico con la fecha actual
  };

  const handleCrop = async () => {
    if (!imageToCrop) return;

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 0.95,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      setMainImageSlider(base64);
      console.log("Compressed file:", compressedFile);

      setUpdatedSliderCategory((prevFormData: any) => ({
        ...prevFormData,
        mainImage: {
          name: compressedFile.name || generateImageName(),
          type: compressedFile.type,
          size: compressedFile.size,
          data: base64,
        },
      }));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  return (
    <section id="banner" className="w-full">
      {/* Vista previa */}
      <div className="py-16">
        {slidersData && (
          <div className="grid grid-cols-1 md:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="group cursor-pointer relative h-[400px] md:h-[500px] overflow-hidden"
              >
                <div className="relative w-full h-full">
                  <img
                    src={getDefaultBanner(index).mainImage.url}
                    alt={getDefaultBanner(index).title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80" />
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="text-2xl md:text-3xl text-white font-bold mb-3">
                        {getDefaultBanner(index).title}
                      </h3>
                      <p className="text-gray-200 mb-2 text-base">
                        {getDefaultBanner(index).landingText}
                      </p>
                      <div className="bg-white text-gray-800 px-8 py-3 rounded font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#eea83b] transform -translate-y-2 group-hover:translate-y-0">
                        Explorar Categoría
                      </div>
                    </div>
                  </div>
                  {slidersData[index] && (
                    <button
                      className="shadow absolute top-2 right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-2 m-1 z-10"
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                      }}
                      onClick={() => deleteSlider(slidersData[index].id)}
                    >
                      X
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
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
                Seleccionar posición <span className="text-primary">*</span>
              </h3>
            </label>
            <select
              id="orderNumber"
              name="orderNumber"
              value={updatedSliderCategory.orderNumber}
              onChange={(event) => handleChangeSlider(event)}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
            >
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
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
          <div className="mb-4 ">
            <label
              htmlFor="landingText"
              className="block text-sm font-medium text-gray-700"
            >
              Texto 
            </label>
            <input
              type="text"
              id="landingText"
              name="landingText"
              value={updatedSliderCategory.landingText}
              onChange={handleChangeSlider}
              placeholder="Texto..."
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
              onChange={handleImageSliderChange}
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
                      PNG, JPG o Webp (Recomendada 1024 × 1024px)
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="submit"
              className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded flex-wrap mt-6"
              style={{ borderRadius: "var(--radius)" }}
              disabled={isSubmitting} // Deshabilitar el botón mientras se envía
            >
              {isSubmitting ? "Agregando..." : "Agregar Slider"}
            </button>
          </div>

          {/* Modal de Cropper */}
          {isModalOpen && (
            <Modal
              showModal={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            >
              <div className="relative h-96 w-full">
                <Cropper
                  image={imageToCrop || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect} // Usar el estado de aspecto aquí
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(croppedArea, croppedAreaPixels) => {
                    setCroppedAreaPixels(croppedAreaPixels);
                  }}
                />
              </div>

              <div className="flex flex-col  justify-end ">
                <div className="w-full py-6">
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
                    className="zoom-range w-full custom-range "
                  />
                </div>
                <div className="flex justify-between mt-4 space-x-4">
                  <button
                    onClick={handleCrop}
                    className="bg-primary hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Recortar y Subir
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </form>
      </div>
    </section>
  );
};

export default Categoria02BO;