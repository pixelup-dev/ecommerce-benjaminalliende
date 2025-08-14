"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";
import toast, { Toaster } from 'react-hot-toast';

interface BannerImage {
  id: string; 
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
  mainImageLink: string;
  orderNumber: number;
  mainImage?: any;
}

interface HeroConfig {
  title: string;
  descripcion: string;
  buttonText: string;
  buttonLink: string;
  servicios: Array<{
    titulo: string;
    descripcion: string;
  }>;
}

const Hero10BO: React.FC = () => {
  const [bannerData, setBannerData] = useState<BannerImage | null>(null);
  const [mainImageHero, setMainImageHero] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);

  const [heroConfig, setHeroConfig] = useState<HeroConfig>({
    title: "",
    descripcion: "",
    buttonText: "",
    buttonLink: "",
    servicios: [
      { titulo: "", descripcion: "" },
      { titulo: "", descripcion: "" },
      { titulo: "", descripcion: "" }
    ]
  });

  const [formDataHero, setFormDataHero] = useState<BannerImage>({
    id: "",
    title: "",
    landingText: "",
    buttonLink: "",
    buttonText: "",
    mainImageLink: "",
    orderNumber: 1,
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    }
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [updatedBannerData, setUpdatedBannerData] = useState({
    title: "",
    landingText: "",
    buttonLink: "",
    buttonText: "",
    mainImageLink: "",
    orderNumber: 1, // Modifica este valor según tu lógica
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO10_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO10_IMGID}`;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const bannerImage = productTypeResponse.data.bannerImage;
      setBannerData(bannerImage);
      
      // Intentar parsear el landingText como JSON
      let parsedConfig: HeroConfig;
      try {
        // Si el landingText es un string, intentamos parsearlo como JSON
        if (typeof bannerImage.landingText === 'string') {
          parsedConfig = JSON.parse(bannerImage.landingText);
        } else {
          parsedConfig = bannerImage.landingText;
        }
      } catch {
        // Si hay error al parsear, usamos la configuración por defecto
        parsedConfig = {
          title: "",
          descripcion: "",
          buttonText: "",
          buttonLink: "",
          servicios: [
            { titulo: "", descripcion: "" },
            { titulo: "", descripcion: "" },
            { titulo: "", descripcion: "" }
          ]
        };
      }

      setHeroConfig(parsedConfig);
      setFormDataHero({
        id: bannerImage.id,
        title: bannerImage.title,
        landingText: parsedConfig.descripcion,
        buttonLink: bannerImage.buttonLink,
        buttonText: bannerImage.buttonText,
        mainImageLink: bannerImage.mainImageLink,
        orderNumber: bannerImage.orderNumber || 1,
        mainImage: bannerImage.mainImage || {
          name: "",
          type: "",
          size: null,
          data: "",
        }
      });
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
      // Si hay error, inicializar con valores por defecto
      const defaultConfig: HeroConfig = {
        title: "",
        descripcion: "",
        buttonText: "",
        buttonLink: "",
        servicios: [
          { titulo: "", descripcion: "" },
          { titulo: "", descripcion: "" },
          { titulo: "", descripcion: "" }
        ]
      };
      setHeroConfig(defaultConfig);
      setFormDataHero({
        id: "",
        title: "",
        landingText: "",
        buttonLink: "",
        buttonText: "",
        mainImageLink: "",
        orderNumber: 1,
        mainImage: {
          name: "",
          type: "",
          size: null,
          data: "",
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'descripcion') {
      setHeroConfig((prev: HeroConfig) => ({
        ...prev,
        descripcion: value
      }));
      // Solo guardamos la descripción en el landingText
      setFormDataHero((prev: any) => ({
        ...prev,
        landingText: value
      }));
    } else if (name === 'buttonText' || name === 'buttonLink') {
      setHeroConfig((prev: HeroConfig) => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormDataHero((prev: any) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleServicioChange = (index: number, field: 'titulo' | 'descripcion', value: string) => {
    const newServicios = [...heroConfig.servicios];
    newServicios[index] = {
      ...newServicios[index],
      [field]: value
    };
    
    const newConfig = {
      ...heroConfig,
      servicios: newServicios
    };
    
    setHeroConfig(newConfig);
    // No actualizamos el landingText aquí, solo mantenemos el estado local
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      // Crear un objeto de datos actualizado
      const updatedData = {
        ...formDataHero,
        orderNumber: formDataHero.orderNumber,
        // Guardar todo el heroConfig como JSON en landingText
        landingText: JSON.stringify(heroConfig)
      };

      // Si no hay imagen seleccionada, eliminar mainImage del objeto
      if (!mainImageHero) {
        delete updatedData.mainImage;
      }

      const bannerId = `${process.env.NEXT_PUBLIC_HERO10_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO10_IMGID}`;

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Recargar los datos después de la actualización
      await fetchBannerHome();
      toast.success("Sección actualizada exitosamente");
    } catch (error) {
      console.error("Error updating banner:", error);
      toast.error("Error al actualizar la sección");
    } finally {
      setLoading(false);
      setIsMainImageUploaded(false);
    }
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    imageKey: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setIsModalOpen(true);
        const imageInfo = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: result,
        };
        setFormDataHero((prevFormDataHero: any) => ({
          ...prevFormDataHero,
          [imageKey]: imageInfo,
        }));
        // Actualizar updatedBannerData con la información de la imagen
        setUpdatedBannerData((prevData: any) => ({
          ...prevData,
          [imageKey]: imageInfo,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null); // Limpiar la imagen seleccionada
  };

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!mainImageHero) return;

    try {
      const croppedImage = await getCroppedImg(
        mainImageHero,
        croppedAreaPixels
      );
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }
      const options = {
        maxSizeMB: 1, // Ajusta el tamaño máximo permitido
        maxWidthOrHeight: 1200, // Ajusta las dimensiones máximas permitidas
        useWebWorker: true,
        initialQuality: 0.95, // Ajusta la calidad inicial para mantener mejor calidad visual
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: originalFileName,
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };
      setFormDataHero((prevFormDataHero: any) => ({
        ...prevFormDataHero,
        mainImage: imageInfo,
      }));
      setUpdatedBannerData((prevData: any) => ({
        ...prevData,
        mainImage: imageInfo,
      }));
      setMainImageHero(base64);
      setIsModalOpen(false);
      setIsMainImageUploaded(true);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin fill-primary"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <section
      id="banner"
      className="w-full"
    >
      <Toaster position="top-center" />
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-bold mb-2 sm:mb-0">Sección Hero10</h2>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
          >
            {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa"}
          </button>
        </div>

        {/* Vista previa */}
        {showPreview && (
          <div className="mb-8 overflow-x-auto">
            <h3 className="font-medium text-gray-700 mb-4">Vista Previa:</h3>
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
              <div className=" mx-auto px-4">
                <div className="max-w-5xl mx-auto">
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                          {bannerData?.title || "Nuestros Servicios"}
                        </h2>
                      </div>
                      <p className="text-lg text-gray-600 leading-relaxed">
                        {heroConfig.descripcion || "Descripción de nuestros servicios"}
                      </p>
                      <div className="space-y-4">
                        {heroConfig.servicios.map((servicio: any, index: number) => (
                          <div key={index} className="flex items-start space-x-4">
                            <div className="bg-primary/10 p-2 rounded-full mt-1">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {servicio.titulo || `Servicio ${index + 1}`}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                {servicio.descripcion || `Descripción del servicio ${index + 1}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4">
                        <a
                          href={heroConfig.buttonLink || "#"}
                          className="inline-flex items-center bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/80 transition-colors duration-300 shadow-lg hover:shadow-xl"
                        >
                          <span>{heroConfig.buttonText || "Solicitar Servicio"}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-2"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                        </a>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary rounded-2xl transform rotate-3"></div>
                      <img
                        src={bannerData?.mainImage?.url || "/tsuki/1.webp"}
                        alt="Servicios"
                        className="relative rounded-2xl shadow-xl object-cover w-full h-[500px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Formulario */}
        <form
          onSubmit={handleSubmit}
          className="px-4 mx-auto mt-8"
        >
          <input
            type="number"
            name="orderNumber"
            value={formDataHero.orderNumber}
            onChange={handleChange}
            className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
          />
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h3 className="font-normal text-primary">
                Título <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                name="title"
                value={formDataHero.title}
                onChange={handleChange}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
                placeholder="Ingrese el título de la sección"
              />
              
              <h3 className="font-normal text-primary">
                Descripción General <span className="text-primary">*</span>
              </h3>
              <textarea
                name="descripcion"
                value={heroConfig.descripcion}
                onChange={handleChange}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
                placeholder="Ingrese la descripción general"
                rows={4}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-normal text-primary">
                    Texto del Botón <span className="text-primary">*</span>
                  </h3>
                  <input
                    type="text"
                    name="buttonText"
                    value={heroConfig.buttonText}
                    onChange={handleChange}
                    className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                    style={{ borderRadius: "var(--radius)" }}
                    placeholder="Ej: Solicitar Servicio"
                  />
                </div>

                <div>
                  <h3 className="font-normal text-primary">
                    Link del Botón <span className="text-primary">*</span>
                  </h3>
                  <input
                    type="text"
                    name="buttonLink"
                    value={heroConfig.buttonLink}
                    onChange={handleChange}
                    className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                    style={{ borderRadius: "var(--radius)" }}
                    placeholder="Ej: /contacto o https://ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <h3 className="font-normal text-primary mb-4">
                  Servicios <span className="text-primary">*</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {heroConfig.servicios.map((servicio: any, index: number) => (
                    <div key={index} className="mb-4 p-4 border border-gray-300 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold">Servicio {index + 1}</h4>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Título</label>
                          <input
                            type="text"
                            value={servicio.titulo}
                            onChange={(e) => {
                              handleServicioChange(index, 'titulo', e.target.value);
                            }}
                            className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                            style={{ borderRadius: "var(--radius)" }}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Descripción</label>
                          <textarea
                            value={servicio.descripcion}
                            onChange={(e) => {
                              handleServicioChange(index, 'descripcion', e.target.value);
                            }}
                            className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                            style={{ borderRadius: "var(--radius)" }}
                            rows={3}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="mainImageHero"
                  className="hidden"
                  onChange={(e) =>
                    handleImageChange(e, setMainImageHero, "mainImage")
                  }
                />
                {isMainImageUploaded ? (
                  <div className="flex flex-col items-center mt-3 relative">
                    <h4 className="font-normal text-primary text-center text-slate-600 w-full">
                      Tu fotografía{" "}
                      <span className="text-dark">
                        {" "}
                        {formDataHero.mainImage.name}
                      </span>{" "}
                      ya ha sido cargada.
                      <br /> Actualiza para ver los cambios.
                    </h4>

                    <button
                      className="bg-red-500 gap-4 flex item-center justify-center px-4 py-2 hover:bg-red-700 text-white rounded-full text-xs mt-4"
                      onClick={() => handleClearImage(setMainImageHero)}
                    >
                      <span className="self-center">Seleccionar otra Imagen</span>
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
                ) : (
                  <div>
                    <h3 className="font-normal text-primary">
                      Imagen Principal <span className="text-primary">*</span>
                    </h3>
                    <label
                      htmlFor="mainImageHero"
                      className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed rounded-lg cursor-pointer w-full z-10"
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
                          PNG, JPG o Webp (800x600px)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary  font-bold py-2 px-4 rounded flex-wrap mt-6"
            style={{ borderRadius: "var(--radius)" }}
          >
            <svg
              aria-hidden="true"
              role="status"
              className={`inline w-4 h-4 me-3 text-white animate-spin ${
                loading ? "block" : "hidden"
              }`}
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#E5E7EB"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentColor"
              />
            </svg>
            {loading ? "Loading..." : "Actualizar Banner"}
          </button>
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
                  setMainImageHero(null);
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
                  image={mainImageHero || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
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
                      setMainImageHero(null);
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

export default Hero10BO;
