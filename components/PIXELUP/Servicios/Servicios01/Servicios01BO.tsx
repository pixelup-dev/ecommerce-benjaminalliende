/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";

interface ServicioImage {
  id: string;
  title: string; // nombre del servicio
  landingText: string; // lista de servicios en JSON
  buttonText: string; // identificador de la categoría
  mainImage?: {
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
  descripcion: string;
  servicios: string[];
  tiempo: string;
  precio: string;
  hasError: boolean;
  destacada: boolean;
  mainImage?: {
    name: string;
    type: string;
    size: number | null;
    data: string;
    url?: string;
  };
}

interface TituloServicio {
  id: string;
  epigrafe: string;
  titulo: string;
  parrafo: string;
}

interface ImagenServicio {
  id: string;
  url: string;
  orderNumber: number;
  mainImage?: {
    url: string;
    name: string;
    type: string;
    size: number;
  };
}

// Agregar constante para el límite de servicios
const MAX_SERVICIOS = 12;

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

const Servicios01BO: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [currentImageFile, setCurrentImageFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [nuevoServicio, setNuevoServicio] = useState<Servicio>({
    id: "",
    nombre: "",
    descripcion: "",
    servicios: [""],
    tiempo: "",
    precio: "",
    destacada: false,
    hasError: false,
    mainImage: undefined
  });

  const [tituloServicio, setTituloServicio] = useState<TituloServicio>({
    id: "",
    epigrafe: "HELP",
    titulo: "HELP",
    parrafo:
      "HELP",
  });

  const [imagenesServicio, setImagenesServicio] = useState<ImagenServicio[]>(
    []
  );
  const [loadingTitulo, setLoadingTitulo] = useState(true);
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [formDataTitulo, setFormDataTitulo] = useState({
    id: "",
    title: "",
    landingText: "",
    buttonText: "",
    buttonLink: "HELP",
    mainImageLink: "HELP",
    orderNumber: 1,

    mainImage: {
      url: "",
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  // Agregar nuevo estado al inicio del componente
  const [showDeleteServiceModal, setShowDeleteServiceModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS01_ID}`;

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
              const parsedData = parseLandingText(image.landingText);
              return {
                id: image.id,
                nombre: image.title,
                descripcion: parsedData.descripcion,
                servicios: parsedData.servicios,
                tiempo: parsedData.tiempo,
                precio: parsedData.precio,
                destacada: parsedData.destacada,
                hasError: false,
                mainImage: image.mainImage,
              };
            } catch (error) {
              return {
                id: image.id,
                nombre: "Error en el formato",
                descripcion: "HELP",
                servicios: ["Error al cargar los servicios"],
                tiempo: "HELP",
                precio: "HELP",
                destacada: false,
                hasError: true,

                mainImage: image.mainImage,
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

  const fetchTituloServicio = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_TITULO_SERVICIOS_ID}`;
      const bannerImagenId = `${process.env.NEXT_PUBLIC_TITULO_SERVICIOS_IMGID}`;

      // Primero intentamos crear el banner de imágenes si no existe
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            id: bannerImagenId,
            name: "Galería de Servicios",
            description: "Imágenes de la sección de servicios",
            type: "BANNER",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        // Si el error es porque ya existe, continuamos
        console.log("Banner de imágenes ya existe o error al crear:", error);
      }

      // Luego intentamos crear el banner de título si no existe
      try {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            id: bannerId,
            name: "Título de Servicios",
            description: "Título y descripción de la sección de servicios",
            type: "BANNER",
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        // Si el error es porque ya existe, continuamos
        console.log("Banner de título ya existe o error al crear:", error);
      }

      // Ahora procedemos con el resto del código existente
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const titulo = response.data.banner;
        setTituloServicio({
          id: titulo.id,
          epigrafe: titulo.title || "Servicios personalizados",
          titulo: titulo.buttonText || "Cuidado excepcional a la medida",
          parrafo:
            titulo.landingText || "Entendemos que cada mascota es única...",
        });
      }

      // Fetch imágenes
      const imagenesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_TITULO_SERVICIOS_ID}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (imagenesResponse.data?.bannerImages) {
        const imagenes = imagenesResponse.data.bannerImages.map((img: any) => ({
          id: img.id,
          url: img.mainImage?.url || "",
          orderNumber: img.orderNumber,
          mainImage: img.mainImage,
        }));

        // Ordenar por orderNumber
        imagenes.sort((a: any, b: any) => a.orderNumber - b.orderNumber);
        setImagenesServicio(imagenes);
      }
    } catch (error) {
      console.error("Error al obtener título e imágenes:", error);
    } finally {
      setLoadingTitulo(false);
    }
  };

  useEffect(() => {
    fetchServicios();
    fetchTituloServicio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleServicioUpdate = async (servicio: Servicio) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS01_ID}`;

      // Mantener la imagen existente sin modificarla
      const imageData = {
        title: servicio.nombre || "Nuevo Servicio",
        landingText: JSON.stringify([
          servicio.descripcion,
          ...servicio.servicios,
          servicio.tiempo,
          servicio.precio,
          servicio.destacada,
        ]),
        buttonText: servicio.id,
        buttonLink: "HELP",
        orderNumber: 1,
        mainImageLink: "HELP",
        // No incluimos mainImage para que no se actualice

      };

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
    setIsAddingImage(true);
  };

  const handleDeleteServicio = async (servicioId: string) => {
    setShowDeleteServiceModal(true);
    setServiceToDelete(servicioId);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = () => {
          setCurrentImageFile(reader.result as string);
          setIsModalOpen(true);
        };
        reader.readAsDataURL(file);
        
        // Limpiar el input file
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
        toast.error("Error al procesar la imagen");
      }
    }
  };

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    if (!currentImageFile) return;

    try {
      const croppedImage = await getCroppedImg(currentImageFile, croppedAreaPixels);
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 0.95,
      };

      const compressedFile = await imageCompression(croppedImage as File, options);
      const base64 = await convertToBase64(compressedFile);

      const newMainImage = {
        name: fileName || "imagen.jpg",
        type: compressedFile.type || "image/jpeg",
        size: compressedFile.size,
        data: base64,
      };

      // Actualizar la imagen inmediatamente en el servidor
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS01_ID}`;

      if (isAddingImage) {
        setNuevoServicio(prev => ({
          ...prev,
          mainImage: newMainImage,
        }));
      } else {
        // Actualizar solo la imagen en el servidor
        const imageData = {
          title: servicios[currentIndex].nombre,
          landingText: JSON.stringify([
            servicios[currentIndex].descripcion,
            ...servicios[currentIndex].servicios,
            servicios[currentIndex].tiempo,
            servicios[currentIndex].precio,
            servicios[currentIndex].destacada,
          ]),
          buttonText: servicios[currentIndex].id,
          buttonLink: "HELP",
          orderNumber: 1,
          mainImageLink: "HELP",
          mainImage: newMainImage,

        };

        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${servicios[currentIndex].id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          imageData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Actualizar el estado local
        const updatedServicios = [...servicios];
        updatedServicios[currentIndex] = {
          ...updatedServicios[currentIndex],
          mainImage: newMainImage,
        };
        setServicios(updatedServicios);
      }

      setIsModalOpen(false);
      setCurrentImageFile(null);
      toast.success("Imagen actualizada exitosamente");
      await fetchServicios();
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

  const handleCreateServicio = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS01_ID}`;

      const dataToSend = {
        title: nuevoServicio.nombre || "Nuevo Servicio",
        landingText: JSON.stringify([
          nuevoServicio.descripcion,
          ...nuevoServicio.servicios,
          nuevoServicio.tiempo,
          nuevoServicio.precio,
          nuevoServicio.destacada,
        ]),
        buttonText: "servicio",
        buttonLink: "HELP",
        orderNumber: servicios.length + 1,
        mainImageLink: "HELP",
        mainImage: nuevoServicio.mainImage || null,


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

      // Resetear el formulario con campos vacíos
      setNuevoServicio({
        id: "",
        nombre: "",
        descripcion: "",
        servicios: [""],
        tiempo: "",
        precio: "",
        destacada: false,
        hasError: false,
        mainImage: undefined
      });
    } catch (error) {
      console.error("Error al crear el servicio:", error);
      toast.error("Error al crear el servicio");
    } finally {
      setLoading(false);
    }
  };

  // Agregar esta función para confirmar la eliminación
  const confirmServiceDelete = async () => {
    if (!serviceToDelete) return;
    
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS01_ID}`;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${serviceToDelete}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
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

      setShowDeleteServiceModal(false);
      setServiceToDelete(null);
      await fetchServicios();
      toast.success("Servicio eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar el servicio:", error);
      toast.error("Error al eliminar el servicio");
    } finally {
      setLoading(false);
    }
  };

  const handleTituloUpdate = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_TITULO_SERVICIOS_ID}`;

      // Primero actualizamos el título y textos
      const tituloData = {
        title: tituloServicio.epigrafe,
        buttonText: tituloServicio.titulo,
        landingText: tituloServicio.parrafo,
        buttonLink: "HELP",
        mainImageLink: "HELP",
        orderNumber: 1,
        mainImage: null,

      };

      if (!tituloServicio.id) {
        // Si no existe, creamos uno nuevo
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          tituloData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Si existe, actualizamos
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          tituloData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      toast.success("Título actualizado exitosamente");
      fetchTituloServicio();
    } catch (error) {
      console.error("Error al actualizar título:", error);
      toast.error("Error al guardar los cambios del título");
    } finally {
      setLoading(false);
    }
  };

  // Función para parsear el landingText y obtener los datos incluyendo destacada
  const parseLandingText = (landingText: string) => {
    try {
      const data = JSON.parse(landingText);
      return {
        descripcion: data[0] || "SERVICIO PERSONALIZADO",
        servicios: data.slice(1, -3), // Modificado para incluir destacada
        tiempo: data[data.length - 3] || "HELP",
        precio: data[data.length - 2] || "HELP",
        destacada: data[data.length - 1] || false,

      };
    } catch (error) {
      return {
        descripcion: "HELP",
        servicios: ["Error al cargar los servicios"],
        tiempo: "HELP",
        precio: "HELP",
        destacada: false,
      };

    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto mt-12 px-4 sm:px-6 lg:px-0">
      {/* Sección de imágenes */}
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
                          placeholder="Nombre del Servicio"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción del Servicio
                        </label>
                        <input
                          type="text"
                          value={nuevoServicio.descripcion}
                          onChange={(e) =>
                            setNuevoServicio((prev) => ({
                              ...prev,
                              descripcion: e.target.value,
                            }))
                          }
                          className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                          placeholder="Descripción del Servicio"
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
                          placeholder="Ejemplo: Corte de cabello hombre; Perfilado de Barba; Afeitado con Navaja."
                        />
                      </div>

{/*                       <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiempo Aproximado
                        </label>
                        <input
                          type="text"
                          value={nuevoServicio.tiempo}
                          onChange={(e) =>
                            setNuevoServicio((prev) => ({
                              ...prev,
                              tiempo: e.target.value,
                            }))
                          }
                          className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                          placeholder="Ejemplo: Tiempo aproximado de atención desde 1 a 2 horas"
                        />
                      </div>
 */}
  {/*                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio
                        </label>
                        <input
                          type="text"
                          value={nuevoServicio.precio}
                          onChange={(e) =>
                            setNuevoServicio((prev) => ({
                              ...prev,
                              precio: e.target.value,
                            }))
                          }
                          className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                          placeholder="Ejemplo: Desde $25.000"
                        />
                      </div> */}

                      <div>
                        <h3 className="font-normal text-primary mb-2">
                          Imagen del Servicio <span className="text-primary">*</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors"
                        >
                          {nuevoServicio.mainImage ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={nuevoServicio.mainImage.data}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg mb-2"
                              />
                              <span className="text-sm text-gray-600">
                                Haz clic para cambiar la imagen
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-12 h-12 text-gray-400 mb-2"
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
                              <span className="text-sm text-gray-600">
                                Haz clic para subir una imagen
                              </span>
                            </div>
                          )}
                        </button>
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
                          disabled={!nuevoServicio.servicios.length}
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
                          Descripción del Servicio
                        </label>
                        <input
                          type="text"
                          value={servicios[currentIndex].descripcion}
                          onChange={(e) => {
                            const newServicios = [...servicios];
                            newServicios[currentIndex].descripcion =
                              e.target.value;
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

{/*                       <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tiempo Aproximado
                        </label>
                        <input
                          type="text"
                          value={servicios[currentIndex].tiempo}
                          onChange={(e) => {
                            const newServicios = [...servicios];
                            newServicios[currentIndex].tiempo = e.target.value;
                            setServicios(newServicios);
                          }}
                          className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                        />
                      </div> */}
{/* 
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Precio
                        </label>
                        <input
                          type="text"
                          value={servicios[currentIndex].precio}
                          onChange={(e) => {
                            const newServicios = [...servicios];
                            newServicios[currentIndex].precio = e.target.value;
                            setServicios(newServicios);
                          }}
                          className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                        />
                      </div> */}

                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm font-medium text-gray-700">Destacada</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={servicios[currentIndex].destacada}
                            onChange={(e) => {
                              const newServicios = [...servicios];
                              newServicios[currentIndex].destacada = e.target.checked;
                              setServicios(newServicios);
                            }}
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>

                      <div>
                        <h3 className="font-normal text-primary mb-2">
                          Imagen del Servicio <span className="text-primary">*</span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors"
                        >
                          {servicios[currentIndex].mainImage ? (
                            <div className="flex flex-col items-center">
                              <img
                                src={servicios[currentIndex].mainImage?.data || servicios[currentIndex].mainImage?.url || ''}
                                alt="Preview"
                                className="w-32 h-32 object-cover rounded-lg mb-2"
                              />
                              <span className="text-sm text-gray-600">
                                Haz clic para cambiar la imagen
                              </span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-12 h-12 text-gray-400 mb-2"
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
                              <span className="text-sm text-gray-600">
                                Haz clic para subir una imagen
                              </span>
                            </div>
                          )}
                        </button>
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
              <div className="bg-white rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                <div className="relative h-64">
                  {(isAddingImage ? nuevoServicio.mainImage?.data : servicios[currentIndex]?.mainImage?.data || servicios[currentIndex]?.mainImage?.url) ? (
                    <img
                      src={isAddingImage ? nuevoServicio.mainImage?.data : servicios[currentIndex]?.mainImage?.data || servicios[currentIndex]?.mainImage?.url}
                      alt={isAddingImage ? nuevoServicio.nombre : servicios[currentIndex]?.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A5729]/40 to-transparent flex items-end">
                    <div className="p-6">
                      <div className="flex items-center mb-2">
                        <h3 className="text-xl font-bold text-white">
                          {isAddingImage ? nuevoServicio.nombre : servicios[currentIndex]?.nombre}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    {isAddingImage ? nuevoServicio.descripcion : servicios[currentIndex]?.descripcion}
                  </p>
                  <div className="space-y-3">
                    {(isAddingImage ? nuevoServicio.servicios : servicios[currentIndex]?.servicios)?.map((item, idx) => (
                      <div key={idx} className="flex items-center text-[#0A5729]">
                        <div className="w-2 h-2 rounded-full bg-[#04A34A] mr-3"></div>
                        <span className="font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <button className="mt-8 w-full bg-[#04A34A] text-white px-4 py-3 rounded-xl hover:bg-[#0A5729] transition duration-300 flex items-center justify-center font-medium">
                      <svg 
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      Consultar
                    </button>
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
          onClose={() => {
            setIsModalOpen(false);
            setCurrentImageFile(null);
          }}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={currentImageFile || ""}
              crop={crop}
              zoom={zoom}
              aspect={7/3}
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
                  setCurrentImageFile(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteServiceModal && (
        <Modal
          showModal={showDeleteServiceModal}
          onClose={() => {
            setShowDeleteServiceModal(false);
            setServiceToDelete(null);
          }}
        >
          <div className="p-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Eliminar Servicio
              </h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-yellow-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      Esta acción eliminará permanentemente el servicio y no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
{/*               <p className="text-gray-500 mb-8">
                ¿Estás seguro de que deseas eliminar este servicio? Todos los datos asociados se perderán permanentemente.
              </p> */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => {
                    setShowDeleteServiceModal(false);
                    setServiceToDelete(null);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmServiceDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Eliminar Servicio
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageUpload}
      />
    </div>
  );
};

export default Servicios01BO;
