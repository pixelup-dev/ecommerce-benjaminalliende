/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { getCookie } from "cookies-next";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Testimonio {
  id: string;
  nombre: string;
  texto: string;
  imagen: {
    name: string;
    type: string;
    size: number | null;
    data: string;
  };
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface EditingTestimonio {
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  orderNumber: number;
  mainImageLink: string;
  mainImage: {
    url?: string;
    name?: string;
    type?: string;
    size?: number;
    data?: string;
  };
}

export default function Testimonios05BO() {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const bannerId = process.env.NEXT_PUBLIC_TESTIMONIOS05_ID;
  const [skeletonLoading, setSkeletonLoading] = useState(true);

  // Estados para el cropper
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [currentImageId, setCurrentImageId] = useState<string | null>(null);

  // Nuevo estado para el testimonio en edición/creación
  const [nuevoTestimonio, setNuevoTestimonio] = useState({
    nombre: "",
    texto: "",
    imagen: {
      name: "",
      type: "",
      size: 0,
      data: "",
    },
  });

  // Agregar estado para manejar ediciones temporales
  const [editingTestimonios, setEditingTestimonios] = useState<{
    [key: string]: EditingTestimonio;
  }>({});

  // Agregar estos estados después de los otros estados
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testimonioToDelete, setTestimonioToDelete] = useState<string | null>(
    null
  );

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  };

  const fetchImages = async () => {
    try {
      setSkeletonLoading(true);
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setImages(response.data.bannerImages || []);
    } catch (error) {
      console.error("Error al cargar testimonios:", error);
      toast.error("Error al cargar los testimonios");
    } finally {
      setSkeletonLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    // Cuando se cargan las imágenes, inicializar el estado de edición
    if (images.length > 0) {
      const initialEditing = images.reduce((acc, image) => {
        acc[image.id] = {
          title: image.title,
          landingText: image.landingText,
          buttonText: image.buttonText || "testimonios",
          buttonLink: image.buttonLink || "https://www.pixelup.cl",
          orderNumber: image.orderNumber || 1,
          mainImageLink:
            image.mainImageLink || "https://www.pixelup.cl",
          mainImage: image.mainImage,
        };
        return acc;
      }, {} as { [key: string]: EditingTestimonio });
      setEditingTestimonios(initialEditing);
    }
  }, [images]);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageId: string = "new"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setCurrentImageId(imageId);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const handleCropComplete = (
    croppedArea: any,
    croppedAreaPixels: CropArea
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    try {
      if (!tempImage || !croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      if (!croppedImage) return;

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        initialQuality: 0.8,
      };

      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      // Asegurarnos de que siempre tengamos un nombre de archivo
      const fileName = compressedFile.name || "imagen.jpg";

      const imageInfo = {
        name: fileName,
        type: compressedFile.type || "image/jpeg",
        size: compressedFile.size,
        data: base64,
      };

      if (currentImageId === "new") {
        setNuevoTestimonio((prev) => ({
          ...prev,
          imagen: imageInfo,
        }));
      } else {
        setEditingTestimonios((prev) => ({
          ...prev,
          [currentImageId as string]: {
            ...prev[currentImageId as string],
            mainImage: {
              ...imageInfo,
              name: fileName, // Asegurarnos de que el nombre se incluya aquí también
            },
          },
        }));
      }

      setIsModalOpen(false);
      setTempImage(null);
      setCurrentImageId(null);
      toast.success("Imagen procesada correctamente");
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const convertToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCreateTestimonio = async () => {
    if (!nuevoTestimonio.imagen.data) {
      toast.error("Por favor, selecciona una imagen");
      return;
    }

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      const dataToSend = {
        title: nuevoTestimonio.nombre,
        landingText: nuevoTestimonio.texto,
        buttonText: "testimonios",
        buttonLink: "https://www.pixelup.cl",
        orderNumber: 1,
        mainImageLink: "https://www.pixelup.cl",
        mainImage: {
          name: nuevoTestimonio.imagen.name || "testimonio.jpg",
          type: nuevoTestimonio.imagen.type,
          size: nuevoTestimonio.imagen.size,
          data: nuevoTestimonio.imagen.data,
        },
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Testimonio creado exitosamente");
      setIsAddingImage(false);
      setNuevoTestimonio({
        nombre: "",
        texto: "",
        imagen: { name: "", type: "", size: 0, data: "" },
      });
      fetchImages();
    } catch (error) {
      console.error("Error al crear el testimonio:", error);
      toast.error("Error al crear el testimonio");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTestimonio = async (testimonioId: string) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const currentTestimonio = images.find((img) => img.id === testimonioId);
      const editedData = editingTestimonios[testimonioId];

      const dataToSend = {
        title: editedData.title,
        landingText: editedData.landingText,
        buttonText: editedData.buttonText,
        buttonLink: editedData.buttonLink,
        orderNumber: editedData.orderNumber,
        mainImageLink: editedData.mainImageLink,
        ...(editedData.mainImage?.data && {
          mainImage: {
            name: editedData.mainImage.name || "imagen.jpg",
            type: editedData.mainImage.type || "image/jpeg",
            size: editedData.mainImage.size || 0,
            data: editedData.mainImage.data,
          },
        }),
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${testimonioId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Testimonio actualizado correctamente");
      fetchImages();
    } catch (error) {
      console.error("Error al actualizar el testimonio:", error);
      toast.error("Error al actualizar el testimonio");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonio = async (testimonioId: string) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${testimonioId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Testimonio eliminado correctamente");
      setShowDeleteModal(false);
      setTestimonioToDelete(null);
      fetchImages();
    } catch (error) {
      console.error("Error al eliminar el testimonio:", error);
      toast.error("Error al eliminar el testimonio");
    } finally {
      setLoading(false);
    }
  };

  const SkeletonLoader = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="bg-white p-6 rounded-lg shadow animate-pulse"
        >
          <div className="h-40 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
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
    <div className="space-y-6 px-4 md:px-8">
      {/* Header simplificado */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => {
            setIsAddingImage(!isAddingImage);
            if (!isAddingImage) {
              fileInputRef.current?.click();
            }
          }}
          className={`shadow uppercase text-white font-bold py-2 px-4 rounded transition-colors ${
            isAddingImage
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {isAddingImage ? "Cancelar" : "Agregar Testimonio"}
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={(e) => handleImageChange(e, "new")}
          accept="image/*"
        />
      </div>

      {/* Contenedor principal con padding ajustado */}
      <div className="relative">
        {skeletonLoading ? (
          <SkeletonLoader />
        ) : (
          <div className="relative">
            {isAddingImage ? (
              // Formulario de nuevo testimonio
              <div className="bg-white p-6 rounded-lg shadow max-w-lg mx-auto">
                <h3 className="text-lg font-medium mb-4">Nuevo Testimonio</h3>

                <div className="mb-4">
                  <div className="mt-1">
                    {nuevoTestimonio.imagen.data ? (
                      <div className="relative w-full">
                        <div className="aspect-[2/1] relative overflow-hidden rounded-lg">
                          <img
                            src={nuevoTestimonio.imagen.data}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() =>
                              setNuevoTestimonio((prev) => ({
                                ...prev,
                                imagen: {
                                  name: "",
                                  type: "",
                                  size: 0,
                                  data: "",
                                },
                              }))
                            }
                            className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-[2/1] flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg border-2 border-dashed border-gray-300"
                      >
                        <span className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          Seleccionar Imagen
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={nuevoTestimonio.nombre}
                    onChange={(e) =>
                      setNuevoTestimonio((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded"
                    placeholder="Nombre del cliente"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Testimonio
                  </label>
                  <textarea
                    value={nuevoTestimonio.texto}
                    onChange={(e) =>
                      setNuevoTestimonio((prev) => ({
                        ...prev,
                        texto: e.target.value,
                      }))
                    }
                    className="w-full p-2 border rounded"
                    rows={4}
                    placeholder="Escribe aquí el testimonio del cliente..."
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsAddingImage(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateTestimonio}
                    disabled={
                      !nuevoTestimonio.imagen.data ||
                      !nuevoTestimonio.nombre ||
                      !nuevoTestimonio.texto
                    }
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
                  >
                    Crear Testimonio
                  </button>
                </div>
              </div>
            ) : (
              <div className="mx-auto relative">
                <div className="max-w-[1200px] mx-auto px-4 md:px-8">
                  <Slider {...settings}>
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="p-2"
                      >
                        <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg h-full relative">
                          {/* Botón eliminar en la esquina superior derecha */}
                          <div className="absolute top-2 right-2 z-10">
                            <button
                              onClick={() => {
                                setTestimonioToDelete(image.id);
                                setShowDeleteModal(true);
                              }}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700 transition-colors p-2 rounded-full hover:bg-red-50 bg-red-200 shadow-sm"
                              aria-label="Eliminar testimonio"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>

                          {/* Contenido de la tarjeta */}
                          <div className="mb-4">
                            <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
                              <img
                                src={image.mainImage.url}
                                alt={image.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                              Nombre
                            </label>
                            <input
                              type="text"
                              value={editingTestimonios[image.id]?.title || ""}
                              onChange={(e) => {
                                setEditingTestimonios((prev) => ({
                                  ...prev,
                                  [image.id]: {
                                    ...prev[image.id],
                                    title: e.target.value,
                                  },
                                }));
                              }}
                              className="w-full p-2 border rounded"
                            />
                          </div>

                          <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                              Testimonio
                            </label>
                            <textarea
                              value={
                                editingTestimonios[image.id]?.landingText || ""
                              }
                              onChange={(e) => {
                                setEditingTestimonios((prev) => ({
                                  ...prev,
                                  [image.id]: {
                                    ...prev[image.id],
                                    landingText: e.target.value,
                                  },
                                }));
                              }}
                              className="w-full p-2 border rounded"
                              rows={4}
                            />
                          </div>

                          {/* Botón guardar en la parte inferior */}
                          <div className="flex justify-center mt-6">
                            <button
                              onClick={() => handleSaveTestimonio(image.id)}
                              disabled={loading}
                              className="flex items-center gap-2 bg-dark hover:bg-primary text-white px-6 py-2 rounded-md transition-colors w-full justify-center"
                            >
                              {loading ? (
                                <>
                                  <svg
                                    className="animate-spin h-5 w-5"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                  <span>Guardando...</span>
                                </>
                              ) : (
                                <>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span>Actualizar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Estilos del carrusel */}
        <style
          jsx
          global
        >{`
          .slick-list {
            margin: 0 -8px;
          }
          .slick-slide > div {
            padding: 0 8px;
          }
          .slick-dots {
            bottom: -40px;
          }
          .slick-dots li button:before {
            color: hsl(var(--dynamic-primary, 210 100% 50%));
            opacity: 0.4;
            font-size: 8px;
          }
          .slick-dots li.slick-active button:before {
            color: hsl(var(--dynamic-primary, 210 100% 50%));
            opacity: 1;
          }
          .slick-prev,
          .slick-next {
            width: 40px;
            height: 40px;
            z-index: 10;
            background-color: white !important;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            transform: translateY(-50%);
          }
          .slick-prev {
            left: -50px;
          }
          .slick-next {
            right: -50px;
          }
          .slick-prev:before,
          .slick-next:before {
            font-family: "slick";
            font-size: 20px;
            line-height: 1;
            opacity: 1;
            color: hsl(var(--dynamic-primary, 210 100% 50%)) !important;
            -webkit-font-smoothing: antialiased;
          }
          .slick-prev:hover,
          .slick-next:hover {
            background-color: hsl(var(--dynamic-primary, 210 100% 50%)) !important;
          }
          .slick-prev:hover:before,
          .slick-next:hover:before {
            color: white !important;
          }
          @media (max-width: 1280px) {
            .slick-prev {
              left: -30px;
            }
            .slick-next {
              right: -30px;
            }
          }
          @media (max-width: 768px) {
            .slick-prev,
            .slick-next {
              display: none !important;
            }
          }
        `}</style>
      </div>

      {/* Modal de recorte */}
      {isModalOpen && (
        <Modal
          showModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={tempImage || ""}
              crop={crop}
              zoom={zoom}
              aspect={1}
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
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-between gap-2">
              <button
                onClick={handleCrop}
                className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded"
              >
                Recortar y Guardar
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setTempImage(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de confirmación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Confirmar eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar este testimonio? Esta acción
              no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTestimonioToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() =>
                  testimonioToDelete &&
                  handleDeleteTestimonio(testimonioToDelete)
                }
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
