/* eslint-disable @next/next/no-img-element */
import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";
import toast, { Toaster } from "react-hot-toast";
import { 
  Dumbbell, 
  Apple, 
  Clock, 
  Heart, 
  Leaf, 
  BookOpen, 
  Target, 
  Zap,
  TrendingUp,
  Activity,
  Coffee,
  Moon
} from "lucide-react";

interface Habito {
  id: string;
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  mainImageLink: string;
  mobileImageLink?: string | null;
  creationDate: string;
  orderNumber: number;
  image?: {
    url: string;
    name: string;
    type: string;
    size: number | null;
    data: string;
  };
  mainImage?: {
    url: string;
    name: string;
    type: string;
    size: number | null;
    data: string;
  };
}

interface HabitoTextContent {
  title: string;
  description: string;
  icon: string;
}

interface TextContent {
  sectionTitle: string;
  mainTitle: string;
  description: string;
  ctaTitle: string;
  ctaDescription: string;
  horarios: string;
  buttonText: string;
  buttonLink: string;
}

  const Hero19BO: React.FC = () => {
  const [habitosData, setHabitosData] = useState<Habito[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Estados para el modal de hábitos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentHabito, setCurrentHabito] = useState<Habito | null>(null);
  const [habitoTextContent, setHabitoTextContent] = useState<HabitoTextContent>({
    title: "",
    description: "",
    icon: "heart",
  });
  
  // Estados para el contenido de texto general
  const [textContent, setTextContent] = useState<TextContent>({
    sectionTitle: "Busca el Equilibrio",
    mainTitle: "Cambia tus hábitos, agenda tu bienestar",
    description: "Descubre cómo pequeños cambios pueden transformar tu vida. Agenda tu consulta personalizada para comenzar tu camino hacia el equilibrio y el bienestar A veces solo necesitamos a alguien que nos escuchen, nos guíen y nos muestre un camino más eficaz para sentirnos motivados y estar en plena salud",
    ctaTitle: "Agenda tu consulta personalizada",
    ctaDescription: "Tu bienestar comienza con un primer paso.",
    horarios: "Lunes a Jueves: 09:00 - 19:00\nSábado: 10:00 - 14:00",
    buttonText: "Agenda tu consulta",
    buttonLink: "#contacto",
  });

  // Estados para imagen en modal
  const [fileName, setFileName] = useState<string | null>(null);
  const [isImageUploaded, setIsImageUploaded] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // States for image cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  // Función para parsear el JSON del textContent general
  const parseTextContent = (landingText: string): TextContent => {
    try {
      return JSON.parse(landingText);
    } catch (error) {
      return {
        sectionTitle: "Busca el Equilibrio",
        mainTitle: "Cambia tus hábitos, agenda tu bienestar",
        description: "Descubre cómo pequeños cambios pueden transformar tu vida. Agenda tu consulta personalizada para comenzar tu camino hacia el equilibrio y el bienestar A veces solo necesitamos a alguien que nos escuchen, nos guíen y nos muestre un camino más eficaz para sentirnos motivados y estar en plena salud",
        ctaTitle: "Agenda tu consulta personalizada",
        ctaDescription: "Tu bienestar comienza con un primer paso.",
        horarios: "Lunes a Jueves: 09:00 - 19:00\nSábado: 10:00 - 14:00",
        buttonText: "Agenda tu consulta",
        buttonLink: "#contacto",
      };
    }
  };

  // Función para parsear el JSON del landingText del hábito
  const parseHabitoTextContent = (landingText: string): HabitoTextContent => {
    try {
      return JSON.parse(landingText);
    } catch (error) {
      return {
        title: "",
        description: "",
        icon: "heart",
      };
    }
  };

  // Función para convertir el contenido de texto del hábito a JSON
  const habitoTextContentToJson = (content: HabitoTextContent): string => {
    return JSON.stringify(content);
  };

  // Función para obtener el icono según el nombre
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "dumbbell":
        return <Dumbbell size={36} stroke="white" strokeWidth={2} />;
      case "apple":
        return <Apple size={36} stroke="white" strokeWidth={2} />;
      case "target":
        return <Target size={36} stroke="white" strokeWidth={2} />;
      case "zap":
        return <Zap size={36} stroke="white" strokeWidth={2} />;
      case "leaf":
        return <Leaf size={36} stroke="white" strokeWidth={2} />;
      case "book-open":
        return <BookOpen size={36} stroke="white" strokeWidth={2} />;
      case "clock":
        return <Clock size={36} stroke="white" strokeWidth={2} />;
      case "activity":
        return <Activity size={36} stroke="white" strokeWidth={2} />;
      case "trending-up":
        return <TrendingUp size={36} stroke="white" strokeWidth={2} />;
      case "coffee":
        return <Coffee size={36} stroke="white" strokeWidth={2} />;
      case "moon":
        return <Moon size={36} stroke="white" strokeWidth={2} />;
      default:
        return <Heart size={36} stroke="white" strokeWidth={2} />;
    }
  };

  const fetchHabitosData = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO19_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setHabitosData(response.data.bannerImages);
    } catch (error) {
      console.error("Error al obtener los datos de hábitos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTextContent = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = process.env.NEXT_PUBLIC_HERO19_CONTENTBLOCK || "";

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 0 && response.data.contentBlock) {
        try {
          const parsedData = JSON.parse(response.data.contentBlock.contentText);
          setTextContent(parsedData);
        } catch (error) {
          console.error("Error al parsear JSON del content block:", error);
        }
      }
    } catch (error) {
      console.error("Error al obtener el contenido de texto:", error);
    }
  };

  useEffect(() => {
    fetchHabitosData();
    fetchTextContent();
  }, []);

  const handleTextContentChange = (field: keyof TextContent, value: string) => {
    setTextContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveTextContent = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = process.env.NEXT_PUBLIC_HERO19_CONTENTBLOCK || "";

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "Hábitos y Pérdida de Peso", // Campo obligatorio
          contentText: JSON.stringify(textContent),
          description: "Sección de hábitos y pérdida de peso", // Campo obligatorio
          image: "", // Campo obligatorio
          orderNumber: 1, // Campo obligatorio
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Revalidar la página
      await fetch("/api/revalidate");

      toast.success("Contenido de texto guardado correctamente!");
    } catch (error) {
      console.error("Error al guardar el contenido de texto:", error);
      toast.error("Error al guardar el contenido de texto");
    }
  };

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentHabito({
      id: "",
      title: "",
      landingText: "",
      buttonText: "Ver más",
      buttonLink: "#",
      mainImageLink: "pixelup.cl",
      mobileImageLink: null,
      creationDate: new Date().toISOString(),
      orderNumber: habitosData.length + 1,
      image: {
        url: "",
        name: "",
        type: "",
        size: null,
        data: "",
      },
    });
    setHabitoTextContent({
      title: "",
      description: "",
      icon: "heart",
    });
    setMainImage(null);
    setIsImageUploaded(false);
    setIsModalOpen(true);
  };

  const openEditModal = (habito: Habito) => {
    setIsEditing(true);
    setCurrentHabito(habito);
    
    // Parsear el contenido de texto del hábito
    const parsedTextContent = parseHabitoTextContent(habito.landingText);
    setHabitoTextContent(parsedTextContent);
    
    setMainImage(habito.mainImage?.url || habito.mainImage?.data || habito.image?.url || habito.image?.data || "");
    setFileName(habito.mainImage?.name || habito.image?.name || "");
    setIsImageUploaded(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentHabito(null);
    setHabitoTextContent({ title: "", description: "", icon: "heart" });
    setMainImage(null);
    setIsImageUploaded(false);
  };

  // Navegación entre hábitos
  const navigateToPreviousHabito = () => {
    if (!isEditing || habitosData.length <= 1 || !currentHabito) return;
    const currentIndex = habitosData.findIndex(h => h.id === currentHabito.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : habitosData.length - 1;
    const prevHabito = habitosData[prevIndex];
    openEditModal(prevHabito);
  };

  const navigateToNextHabito = () => {
    if (!isEditing || habitosData.length <= 1 || !currentHabito) return;
    const currentIndex = habitosData.findIndex(h => h.id === currentHabito.id);
    const nextIndex = currentIndex < habitosData.length - 1 ? currentIndex + 1 : 0;
    const nextHabito = habitosData[nextIndex];
    openEditModal(nextHabito);
  };

  // Manejo de teclas para navegación
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isModalOpen || !isEditing) return;
      
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateToPreviousHabito();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateToNextHabito();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, isEditing, currentHabito, habitosData]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMainImage(result);
        setIsImageUploaded(true);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!mainImage) return;

    try {
      const croppedImage = await getCroppedImg(mainImage, croppedAreaPixels);
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
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: fileName || "",
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
        url: "",
      };

      setCurrentHabito((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          mainImage: imageInfo,
        };
      });
      setMainImage(base64);
      setIsCropModalOpen(false);
      setIsImageUploaded(true);
      
      console.log("Image processed and set:", imageInfo);
      console.log("Current habito after crop:", currentHabito);
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

  const handleClearImage = () => {
    setMainImage(currentHabito?.mainImage?.url || currentHabito?.mainImage?.data || currentHabito?.image?.url || currentHabito?.image?.data || "");
    setIsImageUploaded(false);
  };

  const handleHabitoChange = (field: keyof Habito, value: any) => {
    if (currentHabito) {
      setCurrentHabito({
        ...currentHabito,
        [field]: value,
      });
    }
  };

  const handleHabitoTextContentChange = (field: keyof HabitoTextContent, value: string) => {
    setHabitoTextContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveHabito = async () => {
    if (!currentHabito) return;

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO19_ID}`;

      // Convertir el contenido de texto a JSON
      const landingTextJson = habitoTextContentToJson(habitoTextContent);

      const dataToSend = {
        title: habitoTextContent.title,
        landingText: landingTextJson,
        buttonText: "Ver más", // Campo obligatorio
        buttonLink: "#", // Campo obligatorio
        mainImageLink: "pixelup.cl", // Campo obligatorio
        orderNumber: currentHabito.orderNumber,
        ...(isImageUploaded && currentHabito.mainImage && { mainImage: currentHabito.mainImage }),
      };

      console.log("Data to send:", dataToSend);
      console.log("Is image uploaded:", isImageUploaded);
      console.log("Current habito mainImage:", currentHabito.mainImage);

      if (isEditing) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${currentHabito.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Hábito actualizado correctamente!");
      } else {
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
        toast.success("Hábito creado correctamente!");
      }

      await fetchHabitosData();
      closeModal();
    } catch (error) {
      console.error("Error al guardar el hábito:", error);
      toast.error("Error al guardar el hábito");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHabito = async (habitoId: string) => {
    // Mostrar toast de confirmación
    const confirmed = await new Promise<boolean>((resolve) => {
      toast((t) => (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-medium">¿Eliminar hábito?</p>
            <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(false);
              }}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                resolve(true);
              }}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      ), {
        duration: 0, // No se cierra automáticamente
        position: "top-center",
      });
    });

    if (!confirmed) return;

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO19_ID}`;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${habitoId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Hábito eliminado correctamente!");
      await fetchHabitosData();
    } catch (error) {
      console.error("Error al eliminar el hábito:", error);
      toast.error("Error al eliminar el hábito");
    } finally {
      setLoading(false);
    }
  };

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
    <section className="w-full">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Contenido de Texto General */}
        <div className="mb-8 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Contenido de Texto General</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-normal text-primary mb-2">
                Título de Sección <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={textContent.sectionTitle}
                onChange={(e) => handleTextContentChange('sectionTitle', e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título de la sección"
              />
            </div>
            
            <div>
              <h3 className="font-normal text-primary mb-2">
                Título Principal <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={textContent.mainTitle}
                onChange={(e) => handleTextContentChange('mainTitle', e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título principal"
              />
            </div>
            
            <div className="md:col-span-2">
              <h3 className="font-normal text-primary mb-2">
                Descripción <span className="text-primary">*</span>
              </h3>
              <textarea
                value={textContent.description}
                onChange={(e) => handleTextContentChange('description', e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Descripción de la sección"
                rows={3}
              />
            </div>
            
            <div>
              <h3 className="font-normal text-primary mb-2">
                Título CTA <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={textContent.ctaTitle}
                onChange={(e) => handleTextContentChange('ctaTitle', e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título del CTA"
              />
            </div>
            
            <div>
              <h3 className="font-normal text-primary mb-2">
                Descripción CTA <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={textContent.ctaDescription}
                onChange={(e) => handleTextContentChange('ctaDescription', e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del CTA"
              />
            </div>
            
            <div className="md:col-span-2">
              <h3 className="font-normal text-primary mb-2">
                Horarios <span className="text-primary">*</span>
              </h3>
              <textarea
                value={textContent.horarios}
                onChange={(e) => handleTextContentChange('horarios', e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Horarios de atención"
                rows={2}
              />
            </div>
            
            <div>
              <h3 className="font-normal text-primary mb-2">
                Texto del Botón <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={textContent.buttonText}
                onChange={(e) => handleTextContentChange('buttonText', e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Texto del botón"
              />
            </div>
            
            <div>
              <h3 className="font-normal text-primary mb-2">
                Link del Botón <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={textContent.buttonLink}
                onChange={(e) => handleTextContentChange('buttonLink', e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Link del botón"
              />
            </div>
          </div>
          
          <button
            onClick={handleSaveTextContent}
            className="mt-6 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/80 transition-colors font-medium"
          >
            Guardar contenido de texto
          </button>
        </div>

        {/* Gestión de Hábitos */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Hábitos y Pérdida de Peso</h2>
            <button
              onClick={openAddModal}
              className="px-4 py-2 rounded-md text-white font-medium transition-colors bg-green-600 hover:bg-green-700"
            >
              Agregar Hábito
            </button>
          </div>

          {/* Grid de Hábitos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitosData.map((habito, index) => {
              const habitoTextContent = parseHabitoTextContent(habito.landingText);
              return (
              <div key={habito.id} className="relative group">
                <div className="relative rounded-xl overflow-hidden w-full h-80 flex items-center justify-center group shadow-md border border-gray-100 bg-white">
                  <img
                    src={habito.mainImage?.url || habito.mainImage?.data || habito.image?.url || habito.image?.data || "/img/placeholder-image.jpg"}
                    alt={habitoTextContent.title || habito.title}
                    className="absolute inset-0 w-full h-full object-cover z-0"
                    onError={(e) => {
                      console.log("Error loading image for habito:", habito.id);
                      console.log("Image sources:", {
                        mainImageUrl: habito.mainImage?.url,
                        mainImageData: habito.mainImage?.data,
                        imageUrl: habito.image?.url,
                        imageData: habito.image?.data
                      });
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-60 z-10" />
                  <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-white px-4">
                    <div className="mb-4">
                      {getIconComponent(habitoTextContent.icon)}
                    </div>
                    <h3 className="text-xl font-semibold mb-2 drop-shadow-lg text-center">
                      {habitoTextContent.title || habito.title}
                    </h3>
                    <p className="text-sm drop-shadow-lg text-center">
                      {habitoTextContent.description}
                    </p>
                  </div>
                  
                  {/* Overlay con botones */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl z-30">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(habito)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteHabito(habito.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-center mt-2 text-sm text-gray-600">
                  Hábito {index + 1}
                </div>
              </div>
            );
            })}
          </div>

          {habitosData.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No hay hábitos agregados. Haz clic en &quot;Agregar Hábito&quot; para comenzar.
            </div>
          )}
        </div>
      </div>

      {/* Modal para Agregar/Editar Hábito */}
      {isModalOpen && currentHabito && (
        <Modal showModal={isModalOpen} onClose={closeModal}>
          <div className="bg-white p-8 rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {isEditing ? "Editar Hábito" : "Agregar Nuevo Hábito"}
              </h2>
              
              {/* Navegación entre hábitos (solo en modo edición) */}
              {isEditing && habitosData.length > 1 && (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {habitosData.findIndex(h => h.id === currentHabito.id) + 1} de {habitosData.length}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={navigateToPreviousHabito}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Hábito anterior (←)"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={navigateToNextHabito}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Hábito siguiente (→)"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Columna Izquierda - Formulario Principal */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-normal text-primary">
                    Título <span className="text-primary">*</span>
                  </h3>
                  <input
                    type="text"
                    value={habitoTextContent.title}
                    onChange={(e) => handleHabitoTextContentChange('title', e.target.value)}
                    className="shadow block w-full px-4 py-3 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Título del hábito"
                  />
                </div>
                
                <div>
                  <h3 className="font-normal text-primary">
                    Descripción <span className="text-primary">*</span>
                  </h3>
                  <textarea
                    value={habitoTextContent.description}
                    onChange={(e) => handleHabitoTextContentChange('description', e.target.value)}
                    className="shadow block w-full px-4 py-3 mt-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="Descripción del hábito"
                    rows={4}
                  />
                </div>



                {/* Subida de imagen */}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    id="habitoImage"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                  />
                  {isImageUploaded ? (
                    <div className="flex flex-col items-center mt-3">
                      <h4 className="font-normal text-primary text-center text-slate-600 w-full mb-2">
                        Imagen cargada: {currentHabito.mainImage?.name || 'Sin nombre'}
                      </h4>
                      <button
                        className="bg-red-500 gap-2 flex items-center justify-center px-3 py-1 hover:bg-red-700 text-white rounded text-xs"
                        onClick={handleClearImage}
                      >
                        <span>Cambiar Imagen</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
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
                        Imagen <span className="text-primary">*</span>
                      </h3>
                      <label
                        htmlFor="habitoImage"
                        className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-8 pb-8 border border-dashed rounded-lg cursor-pointer w-full hover:border-blue-400 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col justify-center items-center">
                          <svg
                            className="w-8 h-8 text-gray-400"
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
                            PNG, JPG o Webp
                          </p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha - Iconos y Vista Previa */}
              <div className="space-y-6">
                <div>
                  <h3 className="font-normal text-primary mb-2">
                    Icono <span className="text-primary">*</span>
                  </h3>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {[
                      { name: "heart", label: "Corazón", icon: <Heart size={24} /> },
                      { name: "dumbbell", label: "Ejercicio", icon: <Dumbbell size={24} /> },
                      { name: "apple", label: "Nutrición", icon: <Apple size={24} /> },
                      { name: "target", label: "Objetivo", icon: <Target size={24} /> },
                      { name: "zap", label: "Energía", icon: <Zap size={24} /> },
                      { name: "leaf", label: "Natural", icon: <Leaf size={24} /> },
                      { name: "book-open", label: "Terapia", icon: <BookOpen size={24} /> },
                      { name: "clock", label: "Tiempo", icon: <Clock size={24} /> },
                      { name: "activity", label: "Actividad", icon: <Activity size={24} /> },
                      { name: "trending-up", label: "Progreso", icon: <TrendingUp size={24} /> },
                      { name: "coffee", label: "Café", icon: <Coffee size={24} /> },
                      { name: "moon", label: "Sueño", icon: <Moon size={24} /> },
                    ].map((iconOption) => (
                      <button
                        key={iconOption.name}
                        type="button"
                        onClick={() => handleHabitoTextContentChange('icon', iconOption.name)}
                        className={`p-3 border-2 rounded-lg transition-colors ${
                          habitoTextContent.icon === iconOption.name
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-gray-300 hover:border-gray-400 text-gray-600'
                        }`}
                        title={iconOption.label}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {iconOption.icon}
                          <span className="text-xs">{iconOption.label}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg text-gray-800">Vista Previa</h3>
                  
                  {/* Vista previa con imagen o sin imagen */}
                  {mainImage ? (
                    <div className="relative rounded-xl overflow-hidden w-full h-48 flex items-center justify-center group shadow-md border border-gray-100 bg-white">
                      <img
                        src={mainImage}
                        alt="Vista previa"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 z-10" />
                      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-white px-4">
                        <div className="mb-4">
                          {getIconComponent(habitoTextContent.icon)}
                        </div>
                        <h4 className="text-lg font-semibold mb-2 drop-shadow-lg text-center">
                          {habitoTextContent.title || "Título del hábito"}
                        </h4>
                        <p className="text-sm drop-shadow-lg text-center">
                          {habitoTextContent.description || "Descripción del hábito"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                      <div className="text-center">
                        <div className="mb-4 flex justify-center">
                          {getIconComponent(habitoTextContent.icon)}
                        </div>
                        <h4 className="font-bold text-lg mb-2 text-dark">
                          {habitoTextContent.title || "Título del hábito"}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {habitoTextContent.description || "Descripción del hábito"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveHabito}
                    disabled={loading || !habitoTextContent.title || !habitoTextContent.description}
                    className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex-1"
                  >
                    {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Crop */}
      {isCropModalOpen && (
        <Modal showModal={isCropModalOpen} onClose={() => setIsCropModalOpen(false)}>
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full">
            <h3 className="text-xl font-bold mb-4">Recortar Imagen</h3>
            <div className="relative h-96 w-full mb-4">
              <Cropper
                image={mainImage || ""}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={handleCropComplete}
              />
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom
                </label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleCrop}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
                >
                  Recortar y Guardar
                </button>
                <button
                  onClick={() => setIsCropModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
      
      <Toaster position="top-center" />
    </section>
  );
};

export default Hero19BO; 