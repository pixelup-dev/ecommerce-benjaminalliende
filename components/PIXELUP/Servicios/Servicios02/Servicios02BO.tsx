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

const Servicios02BO: React.FC = () => {
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
    epigrafe: "Servicios personalizados",
    titulo: "Cuidado excepcional a la medida",
    parrafo:
      "Entendemos que cada mascota es única y adaptamos nuestros servicios a sus necesidades específicas.",
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
    buttonLink: "https://www.lafuentedebelleza.cl",
    mainImageLink: "https://www.lafuentedebelleza.cl",
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<{id: string; orderNumber: number} | null>(null);

  const fetchServicios = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS02_ID}`;

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
                descripcion: "SERVICIO PERSONALIZADO",
                servicios: ["Error al cargar los servicios"],
                tiempo: "TIEMPO APROXIMADO DE ATENCIÓN DE 1:30 Hrs a 2:00 Hrs",
                precio: "Desde $25.000",
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
      toast.error("Error al cargar las imágenes");
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
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS02_ID}`;

      // Mantener la imagen existente sin modificarla
      const imageData = {
        title: servicio.nombre || "Nuevo Servicio",
        landingText: JSON.stringify([
          servicio.descripcion,
          ...servicio.servicios,
          servicio.tiempo, // Tiempo aproximado
          servicio.precio, // Precio
          servicio.destacada,
        ]),
        buttonText: servicio.id,
        buttonLink: "https://www.lafuentedebelleza.cl",
        orderNumber: 1,
        mainImageLink: "https://www.lafuentedebelleza.cl",
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
    if (
      !window.confirm("¿Estás seguro de que deseas eliminar este servicio?")
    ) {
      return;
    }

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS02_ID}`;

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
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS02_ID}`;

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
          buttonLink: "https://www.lafuentedebelleza.cl",
          orderNumber: 1,
          mainImageLink: "https://www.lafuentedebelleza.cl",
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
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS02_ID}`;

      const dataToSend = {
        title: nuevoServicio.nombre || "Nuevo Servicio",
        landingText: JSON.stringify([
          nuevoServicio.descripcion,
          ...nuevoServicio.servicios,
          nuevoServicio.tiempo, // Tiempo aproximado
          nuevoServicio.precio, // Precio
          nuevoServicio.destacada,
        ]),
        buttonText: "servicio",
        buttonLink: "https://www.lafuentedebelleza.cl",
        orderNumber: servicios.length + 1,
        mainImageLink: "https://www.lafuentedebelleza.cl",
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

  // Modificar la función handleDeleteImage
  const handleDeleteImage = async (imageId: string, orderNumber: number) => {
    setImageToDelete({ id: imageId, orderNumber });
    setShowDeleteModal(true);
  };

  // Agregar nueva función para confirmar eliminación
  const confirmDelete = async () => {
    if (!imageToDelete) return;
  
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_TITULO_SERVICIOS_ID}`;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${imageToDelete.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setShowDeleteModal(false);
      setImageToDelete(null);
      await fetchTituloServicio();
      toast.success("Imagen eliminada exitosamente");
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      toast.error("Error al eliminar la imagen");
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
        buttonLink: "https://www.lafuentedebelleza.cl",
        mainImageLink: "https://www.lafuentedebelleza.cl",
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
        tiempo: data[data.length - 3] || "TIEMPO APROXIMADO DE ATENCIÓN DE 1:30 Hrs a 2:00 Hrs",
        precio: data[data.length - 2] || "Desde $25.000",
        destacada: data[data.length - 1] || false,
      };
    } catch (error) {
      console.error("Error al parsear landingText:", error);
      return {
        descripcion: "SERVICIO PERSONALIZADO",
        servicios: ["Error al cargar los servicios"],
        tiempo: "TIEMPO APROXIMADO DE ATENCIÓN DE 1:30 Hrs a 2:00 Hrs",
        precio: "Desde $25.000",
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

                      <div>
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

                      <div>
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
                                Haz clic para subir una imagen (Recomendado 1400 × 600px)
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

                      <div>
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
                      </div>

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
                      </div>

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
                                Haz clic para subir una imagen (Recomendado 1400 × 600px)
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
              <div className="bg-[#5B488E]/5 rounded-lg overflow-hidden border border-[#81C4BA]/10 hover:shadow-xl transition-all duration-300">
                <div className="relative h-64">
                  {isAddingImage ? (
                    nuevoServicio.mainImage ? (
                      <img
                        src={nuevoServicio.mainImage.data}
                        alt={nuevoServicio.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">Sin imagen</span>
                      </div>
                    )
                  ) : servicios[currentIndex]?.mainImage ? (
                    <img
                      src={servicios[currentIndex].mainImage?.data || servicios[currentIndex].mainImage?.url || ''}
                      alt={servicios[currentIndex].nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">Sin imagen</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h2 className="text-2xl font-light text-white">
                      {isAddingImage ? nuevoServicio.nombre : servicios[currentIndex]?.nombre}
                    </h2>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <p className="text-[#81C4BA] font-medium text-sm mb-4">
                      {isAddingImage ? nuevoServicio.descripcion : servicios[currentIndex]?.descripcion}
                    </p>
                    <ul className="space-y-2">
                      {(isAddingImage
                        ? nuevoServicio.servicios
                        : servicios[currentIndex]?.servicios
                      )?.map((servicio, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-3"
                        >
                          <div className="w-5 h-5 rounded bg-[#5B488E]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg
                              className="w-3 h-3 text-[#81C4BA]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <span className="text-gray-600 text-sm">{servicio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-gray-500 text-sm italic mt-4">
                    {isAddingImage ? nuevoServicio.tiempo : servicios[currentIndex]?.tiempo}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-[#81C4BA]/10">
                    <div className="text-gray-600">
                      <span className="text-[#81C4BA] font-medium block text-sm">
                        Valor
                      </span>
                      <span className="text-sm">
                        {isAddingImage ? nuevoServicio.precio : servicios[currentIndex]?.precio}
                      </span>
                    </div>
                    <div className="bg-[#5B488E] text-white px-6 py-2 rounded hover:bg-[#1B9C84] transition-colors">
                      Reservar
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
                step={0.01}
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
      {showDeleteModal && (
        <Modal
          showModal={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setImageToDelete(null);
          }}
        >
          <div className="p-6 max-w-sm mx-auto">
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
                ¿Eliminar imagen?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta acción no se puede deshacer. ¿Estás seguro de que deseas eliminar esta imagen?
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setImageToDelete(null);
                  }}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Eliminar
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

export default Servicios02BO;
