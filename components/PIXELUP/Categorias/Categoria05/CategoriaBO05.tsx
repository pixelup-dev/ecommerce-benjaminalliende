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
import { toast } from "react-hot-toast";

const Categorias05BO = () => {
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

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: '',
    message: '',
    action: () => {},
    type: ''
  });

  const getDefaultBanner = (order: number) => ({
    id: `default-${order}`,
    title: "Agregar categoría",
    mainImage: { url: defaultImage },
    orderNumber: order,
    isDefault: true
  });

  const getOrderedBanners = () => {
    const orderedBanners = [...Array(4)].map((_, index) => {
      const existingBanner = slidersData.find(banner => banner.orderNumber === index + 1);
      return existingBanner || getDefaultBanner(index + 1);
    });
    return orderedBanners;
  };

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA05_ID}`;
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

  const handleDeleteSlider = (id: any) => {
    setModalConfig({
      title: 'Eliminar Categoría',
      message: '¿Estás seguro que deseas eliminar esta categoría?',
      action: () => deleteSlider(id),
      type: 'delete'
    });
    setShowConfirmModal(true);
  };

  const deleteSlider = async (id: any) => {
    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA05_ID}`;
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
      toast.success('Categoría eliminada exitosamente');
      fetchBannerCategoryHome();
    } catch (error) {
      toast.error('Error al eliminar la categoría');
      console.error("Error deleting Slider:", error);
    }
    setShowConfirmModal(false);
  };

  const handleSliderSubmit = (e: React.FormEvent) => {
    SliderSubmit(e);
  };

  const SliderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA05_ID}`;

    // Verificar si hay una imagen seleccionada
    if (!mainImageSlider || !updatedSliderCategory.mainImage.data) {
      toast.error("Por favor, selecciona una imagen para el slider.");
      return;
    }

    // Verificar si hay menos de 4 sliders antes de agregar uno nuevo
    if (slidersData.length >= 4) {
      toast.error("No se pueden agregar más de 4 sliders.");
      return;
    }

    // Verificar si la categoría seleccionada ya tiene un slider asociado
    const categoryExists = slidersData.some(
      (slider) => slider.title === updatedSliderCategory.title
    );
    if (categoryExists) {
      toast.error("Esta categoría ya tiene un slider asociado.");
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
      toast.success('Categoría agregada exitosamente');
      fetchBannerCategoryHome();
      handleClearImage(setMainImageSlider);
      setSelectedCategoryId(null);
    } catch (error) {
      toast.error('Error al agregar la categoría');
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
        
        // Establecer el aspecto según el orderNumber actual
        const currentOrder = updatedSliderCategory.orderNumber;
        switch (currentOrder) {
          case 1:
            setAspect(1 / 1); // Aspecto cuadrado para la primera posición
            break;
          case 2:
            setAspect(1.5 / 1); // Aspecto rectangular horizontal para la segunda posición
            break;
          case 3:
            setAspect(2.38 / 1); // Aspecto más ancho para la tercera posición
            break;
          case 4:
            setAspect(1.53 / 1); // Aspecto rectangular horizontal para la cuarta posición
            break;
          default:
            setAspect(1 / 1); // Valor por defecto
            break;
        }
        
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

    // Establecer el aspecto del cropper basado en la selección de posición
    if (name === "orderNumber") {
      switch (parseInt(value)) {
        case 1:
          setAspect(1 / 1); // Aspecto cuadrado para la primera posición
          break;
        case 2:
          setAspect(1.5 / 1); // Aspecto rectangular horizontal para la segunda posición
          break;
        case 3:
          setAspect(2.38 / 1); // Aspecto más ancho para la tercera posición
          break;
        case 4:
          setAspect(1.53 / 1); // Aspecto rectangular horizontal para la cuarta posición
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
      <div className="w-full">
        <header className="text-center mb-8">
          <h2 className="text-xl font-bold text-primary sm:text-3xl">
            Vista Previa de Categorías
          </h2>
          <p className="mx-auto mt-4 max-w-md text-foreground">
            Previsualización del diseño en el sitio web
          </p>
        </header>

        <div className="flex items-center justify-center px-4 lg:px-0">
          <div className="max-w-7xl mx-auto rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Primer item */}
              <div className="relative flex flex-col items-center w-full">
                {getOrderedBanners()[0] && (
                  <div className="group relative block w-full">
                    <div
                      className={`w-[326px] h-[220px] md:w-[300px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-cover bg-center mx-auto ${!getOrderedBanners()[0].isDefault ? 'group-hover:opacity-90' : 'opacity-40'}`}
                      style={{
                        backgroundImage: `url(${getOrderedBanners()[0].mainImage.url})`,
                        borderRadius: 'var(--radius)',
                        backgroundPosition: 'center center'
                      }}
                    >
                      <div className="w-full h-full flex items-end justify-start p-4">
                        <h3 className="text-2xl md:text-4xl font-bold text-white">{getOrderedBanners()[0].title}</h3>
                      </div>
                      <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full">
                        Orden: {getOrderedBanners()[0].orderNumber}
                      </div>
                      {!getOrderedBanners()[0].isDefault && (
                        <button
                          onClick={() => handleDeleteSlider(getOrderedBanners()[0].id)}
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
                    </div>
                  </div>
                )}
              </div>

              {/* Segundo item */}
              <div className="relative flex flex-col items-center w-full">
                {getOrderedBanners()[1] && (
                  <div className="group relative block w-full">
                    <div
                      className={`w-[326px] h-[250px] md:w-[300px] md:h-[380px] lg:w-[600px] lg:h-[480px] bg-cover bg-center mx-auto ${!getOrderedBanners()[1].isDefault ? 'group-hover:opacity-90' : 'opacity-40'}`}
                      style={{
                        backgroundImage: `url(${getOrderedBanners()[1].mainImage.url})`,
                        borderRadius: 'var(--radius)',
                        backgroundPosition: 'center center'
                      }}
                    >
                      <div className="w-full h-full flex items-end justify-end p-4">
                        <h3 className="text-2xl md:text-4xl font-bold text-white">{getOrderedBanners()[1].title}</h3>
                      </div>
                      <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full">
                        Orden: {getOrderedBanners()[1].orderNumber}
                      </div>
                      {!getOrderedBanners()[1].isDefault && (
                        <button
                          onClick={() => handleDeleteSlider(getOrderedBanners()[1].id)}
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
                    </div>
                  </div>
                )}
              </div>

              {/* Tercer item */}
              <div className="relative flex flex-col items-center w-full">
                {getOrderedBanners()[2] && (
                  <div className="group relative block w-full">
                    <div
                      className={`w-[326px] h-[150px] md:w-[300px] md:h-[260px] lg:w-[600px] lg:h-[360px] bg-cover bg-center mx-auto ${!getOrderedBanners()[2].isDefault ? 'group-hover:opacity-90' : 'opacity-40'}`}
                      style={{
                        backgroundImage: `url(${getOrderedBanners()[2].mainImage.url})`,
                        borderRadius: 'var(--radius)',
                        backgroundPosition: 'center center'
                      }}
                    >
                      <div className="w-full h-full flex items-start justify-start p-4">
                        <h3 className="text-2xl md:text-4xl font-bold text-white">{getOrderedBanners()[2].title}</h3>
                      </div>
                      <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full">
                        Orden: {getOrderedBanners()[2].orderNumber}
                      </div>
                      {!getOrderedBanners()[2].isDefault && (
                        <button
                          onClick={() => handleDeleteSlider(getOrderedBanners()[2].id)}
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
                    </div>
                  </div>
                )}
              </div>

              {/* Cuarto item */}
              <div className="relative flex flex-col items-center w-full mt-0 md:mt-[-120px]">
                {getOrderedBanners()[3] && (
                  <div className="group relative block w-full">
                    <div
                      className={`w-[326px] h-[250px] md:w-[300px] md:h-[380px] lg:w-[600px] lg:h-[480px] bg-cover bg-center mx-auto ${!getOrderedBanners()[3].isDefault ? 'group-hover:opacity-90' : 'opacity-40'}`}
                      style={{
                        backgroundImage: `url(${getOrderedBanners()[3].mainImage.url})`,
                        borderRadius: 'var(--radius)',
                        backgroundPosition: 'center center'
                      }}
                    >
                      <div className="w-full h-full flex items-end justify-end p-4">
                        <h3 className="text-2xl md:text-4xl font-bold text-white">{getOrderedBanners()[3].title}</h3>
                      </div>
                      <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full">
                        Orden: {getOrderedBanners()[3].orderNumber}
                      </div>
                      {!getOrderedBanners()[3].isDefault && (
                        <button
                          onClick={() => handleDeleteSlider(getOrderedBanners()[3].id)}
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
                    </div>
                  </div>
                )}
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
          onSubmit={handleSliderSubmit}
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
              id="mainImageCategoria05"
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
                  htmlFor="mainImageCategoria05"
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
                  aspect={aspect}
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

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {modalConfig.title}
              </h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  {modalConfig.message}
                </p>
              </div>
            </div>
            <div className="mt-5 flex justify-center gap-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                onClick={() => modalConfig.action()}
              >
                Eliminar
              </button>
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Categorias05BO;