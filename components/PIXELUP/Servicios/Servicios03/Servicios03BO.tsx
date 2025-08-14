/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";
import imageCompression from "browser-image-compression";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";

interface ServicioImage {
  id: string;
  title: string; // nombre del servicio
  landingText: string; // lista de servicios en JSON
  buttonText: string; // identificador de la categoría
  mainImage: {
    name: string;
    type: string;
    size: number | null;
    data: string;
    url?: string;
  };
}

interface Servicio {
  id: string;
  nombre: string;
  servicios: string[];
  imagen: {
    name: string;
    type: string;
    size: number | null;
    data: string;
  };
  hasError: boolean;
}

// Agregar tipos para las imágenes
interface ImageInfo {
  name: string;
  type: string;
  size: number | null;
  data: string;
}

interface MainImageData {
  name: string;
  type: string;
  size: number;
  data: string;
}

// Mejorar el tipo de croppedAreaPixels
interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Agregar constante para el límite de servicios
const MAX_SERVICIOS = 4;

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 order-2 lg:order-1">
        <div className="border rounded-lg p-6 bg-white min-h-[500px]">
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-1 order-1 lg:order-2">
        <div className="border rounded-lg p-4 bg-white">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="aspect-[3/4] bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const Servicios03BO: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nuevoServicio, setNuevoServicio] = useState({
    nombre: "Nuevo Servicio",
    servicios: [
      "Servicio 1",
      "Servicio 2",
      "Servicio 3",
      "Servicio 4",
      "Servicio 5",
    ],
    imagen: {
      name: "",
      type: "",
      size: 0,
      data: "",
    },
  });

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [currentServiceId, setCurrentServiceId] = useState<string | null>(null);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS03_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.bannerImages?.length > 0) {
        const serviciosData = response.data.bannerImages.map(
          (image: ServicioImage) => {
            try {
              // Intentar parsear los servicios existentes
              const servicios = JSON.parse(image.landingText);
              return {
                id: image.id,
                nombre: image.title,
                servicios: servicios,
                imagen: {
                  name: image.mainImage?.name || "",
                  type: image.mainImage?.type || "",
                  size: image.mainImage?.size || null,
                  data: image.mainImage?.url || "",
                },
                hasError: false,
              };
            } catch (error) {
              // Si hay error, devolver un objeto con indicador de error
              return {
                id: image.id,
                nombre: "Error en el formato",
                servicios: ["Error al cargar los servicios"],
                imagen: {
                  name: "",
                  type: "",
                  size: null,
                  data: "/error-image.jpg", // Imagen por defecto para errores
                },
                hasError: true,
              };
            }
          }
        );

        setServicios(serviciosData);
      }
    } catch (error) {
      console.error("Error al obtener los servicios:", error);
      toast.error("Error al cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    servicioId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setCurrentServiceId(servicioId);
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

      const imageInfo = {
        name: compressedFile.name,
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      if (currentServiceId === "new") {
        setNuevoServicio((prev) => ({
          ...prev,
          imagen: imageInfo,
        }));
      } else {
        setServicios((prev) => {
          const newServicios = [...prev];
          const servicioIndex = newServicios.findIndex(
            (s) => s.id === currentServiceId
          );
          if (servicioIndex !== -1) {
            newServicios[servicioIndex].imagen = imageInfo;
          }
          return newServicios;
        });
      }

      setIsModalOpen(false);
      setTempImage(null);
      setCurrentServiceId(null);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
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

  const handleServicioUpdate = async (servicio: Servicio) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS03_ID}`;

      // Preparar datos básicos sin imagen
      const imageData = {
        title: servicio.nombre || "Nuevo Servicio",
        landingText: JSON.stringify(servicio.servicios),
        buttonText: servicio.id,
        buttonLink: "https://www.pixelup.cl",
        orderNumber: 1,
        mainImageLink: "https://www.pixelup.cl",
      };

      // Solo agregar mainImage si es una imagen en base64 (nueva imagen)
      if (servicio.imagen.data?.startsWith("data:image")) {
        const mainImage = createMainImageData(servicio.imagen);
        Object.assign(imageData, { mainImage });
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${servicio.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        imageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Servicio actualizado exitosamente");
      await fetchServicios();
    } catch (error) {
      console.error("Error al actualizar el servicio:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  const handleNextServicio = () => {
    const nextIndex = (currentIndex + 1) % servicios.length;
    setCurrentIndex(nextIndex);
  };

  const handlePrevServicio = () => {
    const prevIndex = (currentIndex - 1 + servicios.length) % servicios.length;
    setCurrentIndex(prevIndex);
  };

  const handleAddServicio = () => {
    if (servicios.length >= MAX_SERVICIOS) {
      toast.error(
        "Máximo 4 servicios permitidos. Elimina uno para agregar otro."
      );
      return;
    }

    if (isAddingImage) {
      setIsAddingImage(false);
    } else {
      setIsAddingImage(true);
      fileInputRef.current?.click();
    }
  };

  const handleDeleteServicio = async (servicioId: string) => {
    if (
      !window.confirm("¿Estás seguro de que deseas eliminar este servicio?")
    ) {
      return;
    }

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS03_ID}`;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${servicioId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Ajustar el índice actual si es necesario
      if (currentIndex >= servicios.length - 1) {
        setCurrentIndex(Math.max(0, servicios.length - 2));
      }

      await fetchServicios();
      toast.success("Servicio eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      toast.error("Error al eliminar el servicio");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateServicio = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS03_ID}`;

      // Asegurarnos de que mainImage tenga todos los campos requeridos
      const mainImage = {
        name: nuevoServicio.imagen.name || "default.jpg",
        type: nuevoServicio.imagen.type || "image/jpeg",
        size: nuevoServicio.imagen.size || 0,
        data: nuevoServicio.imagen.data || "",
      };

      const dataToSend = {
        title: nuevoServicio.nombre || "Nuevo Servicio",
        landingText: JSON.stringify(nuevoServicio.servicios),
        buttonText: "servicio",
        buttonLink: "https://www.pixelup.cl",
        orderNumber: servicios.length + 1,
        mainImageLink: "https://www.pixelup.cl",
        mainImage: mainImage,
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

      setIsAddingImage(false);
      await fetchServicios();
      toast.success("Nuevo servicio creado exitosamente");

      // Resetear el formulario
      setNuevoServicio({
        nombre: "Nuevo Servicio",
        servicios: [
          "Servicio 1",
          "Servicio 2",
          "Servicio 3",
          "Servicio 4",
          "Servicio 5",
        ],
        imagen: {
          name: "",
          type: "",
          size: 0,
          data: "",
        },
      });
    } catch (error) {
      console.error("Error al crear el servicio:", error);
      toast.error("Error al crear el servicio");
    } finally {
      setLoading(false);
    }
  };

  // Función helper para asegurar que mainImage tenga los tipos correctos
  const createMainImageData = (image: ImageInfo): MainImageData => ({
    name: image.name || "default.jpg",
    type: image.type || "image/jpeg",
    size: image.size || 0,
    data: image.data || "",
  });

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-5xl mx-auto mt-12 px-4 sm:px-6 lg:px-0">
      {/* Header con título y botones principales */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b gap-4">
        <div>
          <h3 className="text-xl font-semibold">Servicios Destacados</h3>
          <p className="text-sm text-gray-500 mt-1">
            Máximo {MAX_SERVICIOS} servicios permitidos
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchServicios}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors w-full sm:w-auto"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            Actualizar
          </button>
          {servicios.length < MAX_SERVICIOS && (
            <button
              onClick={handleAddServicio}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors w-full sm:w-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Agregar Servicio
            </button>
          )}
        </div>
      </div>

      {/* Navegación entre servicios */}
      {servicios.length > 0 && !isAddingImage && (
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <button
            onClick={handlePrevServicio}
            disabled={servicios.length <= 1}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            ← Anterior
          </button>
          <div className="flex items-center gap-2">
            {servicios.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  index === currentIndex
                    ? "bg-primary text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          <button
            onClick={handleNextServicio}
            disabled={servicios.length <= 1}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50 w-full sm:w-auto"
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <div className="border rounded-lg p-6 bg-white min-h-[500px]">
            {loading ? (
              <LoadingSkeleton />
            ) : (
              <>
                {isAddingImage ? (
                  // Formulario de nuevo servicio
                  <div className="border rounded-lg p-6 bg-white">
                    <h4 className="text-lg font-medium mb-4">Nuevo Servicio</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Servicio
                        </label>
                        <input
                          type="text"
                          value={nuevoServicio.nombre}
                          onChange={(e) =>
                            setNuevoServicio((prev) => ({
                              ...prev,
                              nombre: e.target.value,
                            }))
                          }
                          className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                          placeholder="Ej: Barbería & Caballeros"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Servicios (uno por línea)
                        </label>
                        <textarea
                          value={nuevoServicio.servicios.join("\n")}
                          onChange={(e) =>
                            setNuevoServicio((prev) => ({
                              ...prev,
                              servicios: e.target.value.split("\n"),
                            }))
                          }
                          rows={5}
                          className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                          placeholder="Corte de cabello hombre&#10;Perfilado de Barba&#10;Afeitado con Navaja"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imagen
                        </label>
                        <div className="mt-1 flex items-center gap-4">
                          <input
                            type="file"
                            onChange={(e) => handleImageChange(e, "new")}
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                          >
                            Seleccionar Imagen
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-6">
                        <button
                          onClick={() => setIsAddingImage(false)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleCreateServicio}
                          disabled={!nuevoServicio.imagen.data}
                          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
                        >
                          Crear Servicio
                        </button>
                      </div>
                    </div>
                  </div>
                ) : servicios[currentIndex] ? (
                  // Formulario de edición
                  <div className="border rounded-lg p-6 bg-white">
                    <div className="mb-6">
                      <h4 className="text-lg font-medium mb-4">
                        Editando Servicio {currentIndex + 1}
                      </h4>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() =>
                            handleServicioUpdate(servicios[currentIndex])
                          }
                          className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                        >
                          Guardar Cambios
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteServicio(servicios[currentIndex].id)
                          }
                          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Servicio
                        </label>
                        <input
                          type="text"
                          value={servicios[currentIndex].nombre}
                          onChange={(e) => {
                            const newServicios = [...servicios];
                            newServicios[currentIndex].nombre = e.target.value;
                            setServicios(newServicios);
                          }}
                          className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Servicios (uno por línea)
                        </label>
                        <textarea
                          value={servicios[currentIndex].servicios.join("\n")}
                          onChange={(e) => {
                            const newServicios = [...servicios];
                            newServicios[currentIndex].servicios =
                              e.target.value.split("\n");
                            setServicios(newServicios);
                          }}
                          rows={5}
                          className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Imagen
                        </label>
                        <div className="mt-1 flex items-center gap-4">
                          <input
                            type="file"
                            onChange={(e) =>
                              handleImageChange(e, servicios[currentIndex].id)
                            }
                            accept="image/*"
                            className="hidden"
                            id={`image-${servicios[currentIndex].id}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              document
                                .getElementById(
                                  `image-${servicios[currentIndex].id}`
                                )
                                ?.click()
                            }
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
                          >
                            Cambiar Imagen
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        {/* Vista previa */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="border rounded-lg overflow-hidden bg-white lg:sticky lg:top-4">
            <div className="p-4 bg-gray-50 border-b">
              <h5 className="font-medium">Vista Previa</h5>
            </div>
            <div className="p-4">
              <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                <img
                  src={
                    isAddingImage
                      ? nuevoServicio.imagen.data || "/placeholder-image.jpg"
                      : servicios[currentIndex]?.imagen.data ||
                        "/placeholder-image.jpg"
                  }
                  alt="Vista previa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white text-lg font-serif mb-2">
                      {isAddingImage
                        ? nuevoServicio.nombre
                        : servicios[currentIndex]?.nombre}
                    </h3>
                    <div className="h-auto">
                      <ul className="text-white/80 text-xs space-y-0.5">
                        {(isAddingImage
                          ? nuevoServicio.servicios
                          : servicios[currentIndex]?.servicios
                        )?.map((servicio, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-1"
                          >
                            <span className="text-primary">•</span>
                            {servicio}
                          </li>
                        ))}
                      </ul>
                      <button className="mt-2 text-sm text-primary hover:text-white transition-colors">
                        Agendar &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
              aspect={3 / 4}
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
            <div className="flex justify-between gap-4">
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
                  setCurrentServiceId(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Servicios03BO;
