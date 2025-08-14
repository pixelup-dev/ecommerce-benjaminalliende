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
import Modal from "@/components/Core/Modals/ModalSeo"; // Asegúrate de importar el modal
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";
import toast, { Toaster } from "react-hot-toast";

interface BannerImage {
  id: string;
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
  buttonLink2: string;
  buttonText2: string;
  mainImageLink: string;
  orderNumber: number;
  mainImage?: any;
}

interface TextContent {
  title: string;
  mainText: string;
  bookText: string;
  buttonText: string;
  buttonText2: string;
  buttonLink: string;
  buttonLink2: string;
}

const BannerPrincipal03BO: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);

  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPreviewImageUploaded, setIsPreviewImageUploaded] = useState(false);
  const [bannerData, setBannerData] = useState<BannerImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  
  // Estado para manejar el contenido de texto como JSON
  const [textContent, setTextContent] = useState<TextContent>({
    title: "",
    mainText: "",
    bookText: "",
    buttonText: "",
    buttonText2: "",
    buttonLink: "",
    buttonLink2: "",
  });

  const [formData, setFormData] = useState<BannerImage>({
    id: "",
    title: "",
    landingText: "",
    buttonLink: "",
    buttonText: "",
    buttonLink2: "",
    buttonText2: "",
    mainImageLink: "pixelup.cl",
    orderNumber: 1,
    mainImage: {
      url: "",
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [skeletonLoading, setSkeletonLoading] = useState<boolean>(true);
  const [mainImage, setMainImage] = useState<string | null>(null);

  // States for image cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Agregar estado para el banner activo
  const [activeBanner, setActiveBanner] = useState<"uno" | "dos">("uno");

  // Función para parsear el JSON del landingText
  const parseLandingText = (landingText: string): TextContent => {
    try {
      return JSON.parse(landingText);
    } catch (error) {
      // Si no es JSON válido, crear estructura por defecto
      return {
        title: "",
        mainText: landingText || "",
        bookText: "",
        buttonText: "",
        buttonText2: "",
        buttonLink: "",
        buttonLink2: "",
      };
    }
  };

  // Función para convertir el contenido de texto a JSON
  const textContentToJson = (content: TextContent): string => {
    return JSON.stringify(content);
  };

  const fetchBannerHome = async (preserveState: boolean = false) => {
    try {
      setLoading(true);
      setSkeletonLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_BANNERPRINCIPAL03_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBannerData(response.data.bannerImages);
      
      // Solo actualizar el estado inicial si no estamos preservando el estado
      if (response.data.bannerImages.length > 0 && !preserveState) {
        console.log(response.data.bannerImages, "response.data.bannerImages");
        
        const initialImage = response.data.bannerImages[0];
        setFileName(initialImage.mainImage.name);
        
        // Parsear el contenido de texto
        const parsedText = parseLandingText(initialImage.landingText);
        console.log("Parsed text content:", parsedText); // Debug
        setTextContent(parsedText);
        
        setFormData({
          id: initialImage.id,
          title: initialImage.title,
          landingText: initialImage.landingText,
          buttonLink: parsedText.buttonLink || initialImage.buttonLink, // Usar el valor del JSON si existe
          buttonText: parsedText.buttonText || initialImage.buttonText,
          buttonLink2: parsedText.buttonLink2 || initialImage.buttonLink2,
          buttonText2: parsedText.buttonText2 || initialImage.buttonText2,
          mainImageLink: initialImage.mainImageLink,
          orderNumber: initialImage.orderNumber,
          mainImage: initialImage.mainImage,
        });
        setMainImage(initialImage.mainImage.url || initialImage.mainImage.data);
      }
    } catch (error) {
      console.error("Error al obtener los datos del banner:", error);
    } finally {
      setLoading(false);
      setSkeletonLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Manejar cambios en el contenido de texto
  const handleTextContentChange = (field: keyof TextContent, value: string) => {
    setTextContent(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name); // Almacena el nombre del archivo
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMainImage(result);
        setIsMainImageUploaded(true); // Indicar que una nueva imagen ha sido cargada
        setIsModalOpen(true); // Open modal for cropping
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
        name: fileName, // Usa el nombre del archivo almacenado
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      setFormData((prevFormData) => ({
        ...prevFormData,
        mainImage: imageInfo,
      }));
      setMainImage(base64);
      setIsModalOpen(false);
      setIsMainImageUploaded(true);
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
    setMainImage(formData.mainImage.url || formData.mainImage.data);
    setIsMainImageUploaded(false); // Reiniciar el estado
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_BANNERPRINCIPAL03_ID}`;

      // Convertir el contenido de texto a JSON
      const landingTextJson = textContentToJson(textContent);
      console.log("Sending JSON data:", landingTextJson); // Debug

      const dataToSend = {
        title: textContent.title || formData.title, // Usar el título del JSON o del formData como fallback
        landingText: landingTextJson, // Usar el JSON del contenido de texto
        buttonLink: textContent.buttonLink || "", // Enviar aunque esté en el JSON para cumplir validación
        buttonText: textContent.buttonText || "", // Enviar aunque esté en el JSON para cumplir validación
        buttonLink2: textContent.buttonLink2 || "", // Enviar aunque esté en el JSON para cumplir validación
        buttonText2: textContent.buttonText2 || "", // Enviar aunque esté en el JSON para cumplir validación
        mainImageLink: "mainImageLink",
        orderNumber: formData.orderNumber,
        ...(isMainImageUploaded && { mainImage: formData.mainImage }),
      };

      if (isAddingImage) {
        // Realizar una solicitud POST para crear una nueva imagen
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
        setIsAddingImage(false); // Resetear el estado después de agregar
      } else {
        // Realizar una solicitud PUT para actualizar la imagen existente
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${formData.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          dataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Guardar el estado actual antes de recargar
      const currentIndexBeforeUpdate = currentIndex;
      const activeBannerBeforeUpdate = activeBanner;
      
      // Recargar datos y actualizar el estado inmediatamente
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Actualizar bannerData con los nuevos datos
      const updatedBannerData = response.data.bannerImages;
      setBannerData(updatedBannerData);
      
      // Actualizar inmediatamente el estado del formulario con los datos actualizados
      if (updatedBannerData.length > currentIndexBeforeUpdate) {
        const imageToShow = updatedBannerData[currentIndexBeforeUpdate];
        const parsedText = parseLandingText(imageToShow.landingText);
        
        setCurrentIndex(currentIndexBeforeUpdate);
        setTextContent(parsedText);
        setFormData({
          ...imageToShow,
          buttonLink: parsedText.buttonLink || imageToShow.buttonLink,
          buttonText: parsedText.buttonText || imageToShow.buttonText,
          buttonLink2: parsedText.buttonLink2 || imageToShow.buttonLink2,
          buttonText2: parsedText.buttonText2 || imageToShow.buttonText2,
        });
        setMainImage(imageToShow.mainImage.url || imageToShow.mainImage.data);
        setIsMainImageUploaded(false);
        setActiveBanner(activeBannerBeforeUpdate);
      }
      
      // Mostrar mensaje de éxito
      toast.success("Banner actualizado correctamente!");
    } catch (error) {
      console.error("Error al actualizar el banner:", error);
      toast.error("Error al actualizar el banner. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      const bannerId = `${process.env.NEXT_PUBLIC_BANNERPRINCIPAL03_ID}`;
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${formData.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchBannerHome();
    } catch (error) {
      console.error("Error al borrar la imagen del banner:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextImage = async () => {
    setSkeletonLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const nextIndex = (currentIndex + 1) % bannerData.length;
    setCurrentIndex(nextIndex);
    const nextImage = bannerData[nextIndex];
    
    // Parsear el contenido de texto
    const parsedText = parseLandingText(nextImage.landingText);
    setTextContent(parsedText);
    
    setFormData({
      ...nextImage,
      buttonLink: parsedText.buttonLink || nextImage.buttonLink,
      buttonText: parsedText.buttonText || nextImage.buttonText,
      buttonLink2: parsedText.buttonLink2 || nextImage.buttonLink2,
      buttonText2: parsedText.buttonText2 || nextImage.buttonText2,
    });
    setMainImage(nextImage.mainImage.url || nextImage.mainImage.data);
    setIsMainImageUploaded(false); // Reiniciar el estado de la imagen cargada
    setSkeletonLoading(false);
  };

  const handlePrevImage = async () => {
    setSkeletonLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const prevIndex =
      (currentIndex - 1 + bannerData.length) % bannerData.length;
    setCurrentIndex(prevIndex);
    const prevImage = bannerData[prevIndex];
    
    // Parsear el contenido de texto
    const parsedText = parseLandingText(prevImage.landingText);
    setTextContent(parsedText);
    
    setFormData({
      ...prevImage,
      buttonLink: parsedText.buttonLink || prevImage.buttonLink,
      buttonText: parsedText.buttonText || prevImage.buttonText,
      buttonLink2: parsedText.buttonLink2 || prevImage.buttonLink2,
      buttonText2: parsedText.buttonText2 || prevImage.buttonText2,
    });
    setMainImage(prevImage.mainImage.url || prevImage.mainImage.data);
    setIsMainImageUploaded(false); // Reiniciar el estado de la imagen cargada
    setSkeletonLoading(false);
  };
  const handleAddImageClick = () => {
    if (bannerData.length >= 2 && !isAddingImage) {
      toast.error("Solo se permiten 2 imágenes en este banner");
      return;
    }

    if (isAddingImage) {
      // Cancelar operación
      const currentImage = bannerData[currentIndex];
      const parsedText = parseLandingText(currentImage?.landingText || "");
      setTextContent(parsedText);
      
      setFormData({
        id: currentImage?.id || "",
        title: currentImage?.title || "",
        landingText: currentImage?.landingText || "",
        buttonLink: currentImage?.buttonLink || "",
        buttonText: currentImage?.buttonText || "",
        buttonLink2: currentImage?.buttonLink2 || "",
        buttonText2: currentImage?.buttonText2 || "",
        mainImageLink: "",
        orderNumber: currentImage?.orderNumber || 1,
        mainImage: currentImage?.mainImage || {
          url: "",
          name: "",
          type: "",
          size: null,
          data: "",
        },
      });
      setMainImage(
        currentImage?.mainImage?.url ||
          currentImage?.mainImage?.data ||
          null
      );
      setIsAddingImage(false);
      setIsMainImageUploaded(false);
    } else {
      // Iniciar proceso de agregar
      setTextContent({
        title: "",
        mainText: "",
        bookText: "",
        buttonText: "",
        buttonText2: "",
        buttonLink: "",
        buttonLink2: "",
      });
      
      setFormData({
        id: "",
        title: "",
        landingText: "",
        buttonLink: "",
        buttonText: "",
        buttonLink2: "",
        buttonText2: "",
        mainImageLink: "",
        orderNumber: bannerData.length + 1,
        mainImage: {
          url: "",
          name: "",
          type: "",
          size: null,
          data: "",
        },
      });
      setMainImage(null);
      setIsAddingImage(true);
      fileInputRef.current?.click();
      setIsMainImageUploaded(false);
    }
  };

  const SkeletonLoader = () => (
    <div className="relative font-sans before:absolute before:w-full before:h-full before:inset-0 before:bg-black before:opacity-30 before:z-10">
      <div className="absolute inset-0 w-full h-full bg-gray-100 animate-pulse" />
      <div className="min-h-[300px] relative z-20 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
        <div className="w-1/2 h-6 bg-gray-500 animate-pulse mb-2 rounded"></div>
        <div className="w-3/4 h-4 bg-gray-500 animate-pulse rounded"></div>
      </div>
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
    <section
      id="banner"
      className="w-full"
    >
      {/* Selector de Banner */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => {
            setActiveBanner("uno");
            if (bannerData.length > 0) {
              setCurrentIndex(0);
              const parsedText = parseLandingText(bannerData[0].landingText);
              setTextContent(parsedText);
              setFormData({
                ...bannerData[0],
                buttonLink: parsedText.buttonLink || bannerData[0].buttonLink,
                buttonText: parsedText.buttonText || bannerData[0].buttonText,
                buttonLink2: parsedText.buttonLink2 || bannerData[0].buttonLink2,
                buttonText2: parsedText.buttonText2 || bannerData[0].buttonText2,
              });
              setMainImage(
                bannerData[0].mainImage.url || bannerData[0].mainImage.data
              );
              setIsMainImageUploaded(false);
            }
          }}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeBanner === "uno"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Imagen Uno
        </button>
        <button
          onClick={() => {
            setActiveBanner("dos");
            if (bannerData.length > 1) {
              setCurrentIndex(1);
              const parsedText = parseLandingText(bannerData[1].landingText);
              setTextContent(parsedText);
              setFormData({
                ...bannerData[1],
                buttonLink: parsedText.buttonLink || bannerData[1].buttonLink,
                buttonText: parsedText.buttonText || bannerData[1].buttonText,
                buttonLink2: parsedText.buttonLink2 || bannerData[1].buttonLink2,
                buttonText2: parsedText.buttonText2 || bannerData[1].buttonText2,
              });
              setMainImage(
                bannerData[1].mainImage.url || bannerData[1].mainImage.data
              );
              setIsMainImageUploaded(false);
            }
          }}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeBanner === "dos"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Imagen Dos
        </button>
      </div>

      {/* Vista previa de la imagen actual */}
      <div className="mb-6">
        {bannerData[currentIndex] && (
          <div className="mx-auto">
            {/* Imagen principal */}
            <div className="relative h-[600px] max-w-[600px] mx-auto overflow-hidden group">
              <img
                src={
                  bannerData[currentIndex].mainImage.url ||
                  bannerData[currentIndex].mainImage.data
                }
                alt={bannerData[currentIndex].title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6  max-w-lg mx-auto">
                <h2 className="text-3xl md:text-4xl text-center font-bold text-white mb-4 drop-shadow-lg leading-tight">
                  {textContent.title || bannerData[currentIndex].title}
                </h2>
                <p className="text-base text-center text-white mb-6 drop-shadow-lg leading-tight">
                  {textContent.mainText}
                </p>
                {textContent.bookText && (
                  <p className="text-base text-center text-white mb-6 drop-shadow-lg leading-tight">
                    {textContent.bookText}
                  </p>
                )}
                <div className="flex flex-col gap-3 w-full">
                  <button
                    onClick={() => {
                      window.open(textContent.buttonLink || bannerData[currentIndex].buttonLink, "_blank");
                    }}
                    className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-lg hover:scale-105 transition-colors shadow-lg"
                  >
                    {textContent.buttonText || bannerData[currentIndex].buttonText}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Sección de botones adicionales - Vista previa */}
            <div className="flex justify-center w-full">
              <div className="w-full max-w-[600px] ">
                <a
                  href={textContent.buttonLink2 || bannerData[currentIndex].buttonLink2 || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-white px-6 py-3 text-lg flex items-center justify-between gap-2 ${
                    currentIndex === 0 
                      ? "bg-primary hover:bg-dark" 
                      : "bg-dark hover:bg-primary"
                  }`}
                >
                  {textContent.buttonText2 || bannerData[currentIndex].buttonText2 || 'Botón secundario'}
                  <span className="text-white">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-move-right-icon lucide-move-right"
                    >
                      <path d="M18 8L22 12L18 16" />
                      <path d="M2 12H22" />
                    </svg>
                  </span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between mb-6">
        <button
          type="button"
          onClick={handleAddImageClick}
          className={`shadow w-full uppercase text-white font-bold py-2 px-4 rounded ${
            isAddingImage
              ? "bg-red-600 hover:bg-red-700"
              : bannerData.length >= 2
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={bannerData.length >= 2 && !isAddingImage}
        >
          {isAddingImage ? "Cancelar" : "Agregar Banner"}
        </button>

        {bannerData.length > 0 && !isAddingImage && (
          <button
            type="button"
            onClick={handleDeleteImage}
            className="shadow bg-red-600 hover:bg-red-700 w-full uppercase text-white font-bold py-2 px-4 rounded ml-4"
          >
            Borrar Imagen
          </button>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-4 mx-auto mt-8"
      >
        <h3 className="font-normal text-primary">
          Título <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="title"
          value={textContent.title}
          onChange={(e) => handleTextContentChange('title', e.target.value)}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Título del banner"
        />
        <h3 className="font-normal text-primary">
          Texto Principal <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="mainText"
          value={textContent.mainText}
          onChange={(e) => handleTextContentChange('mainText', e.target.value)}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Texto principal del banner"
        />
        <h3 className="font-normal text-primary">
          Texto del Libro <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="bookText"
          value={textContent.bookText}
          onChange={(e) => handleTextContentChange('bookText', e.target.value)}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Texto sobre el libro"
        />
        <h3 className="font-normal text-primary">
          Texto Botón Principal <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="buttonText"
          value={textContent.buttonText}
          onChange={(e) => handleTextContentChange('buttonText', e.target.value)}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Texto del botón principal"
        />
        <h3 className="font-normal text-primary">
          Texto Botón Secundario <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="buttonText2"
          value={textContent.buttonText2}
          onChange={(e) => handleTextContentChange('buttonText2', e.target.value)}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Texto del botón secundario"
        />
        <h3 className="font-normal text-primary">
          Link Botón Principal <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="buttonLink"
          value={textContent.buttonLink}
          onChange={(e) => handleTextContentChange('buttonLink', e.target.value)}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Link del botón principal"
        />
        <h3 className="font-normal text-primary">
          Link Botón Secundario <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="buttonLink2"
          value={textContent.buttonLink2}
          onChange={(e) => handleTextContentChange('buttonLink2', e.target.value)}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
          placeholder="Link del botón secundario"
        />
        <div>
          <input
            type="file"
            accept="image/*"
            id="mainImage"
            className="hidden"
            ref={fileInputRef} // Asigna la referencia al input
            onChange={handleImageChange}
          />
          {isMainImageUploaded ? (
            <div className="flex flex-col items-center mt-3 relative">
              <h4 className="font-normal text-primary text-center text-slate-600 w-full">
                Tu fotografía{" "}
                <span className="text-dark"> {formData.mainImage.name}</span> ya
                ha sido cargada.
                <br /> Actualiza para ver los cambios.
              </h4>

              <button
                className="bg-red-500 gap-4 flex item-center justify-center px-4 py-2 hover:bg-red-700 text-white rounded-full   text-xs mt-4"
                onClick={handleClearImage}
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
                Foto <span className="text-primary">*</span>
              </h3>
              <label
                htmlFor="mainImage"
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
                    PNG, JPG o Webp (1800x400px)
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded flex-wrap mt-6"
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
              fill="currentFill"
            />
          </svg>
          {loading
            ? "Loading..."
            : isAddingImage
            ? "Crear Banner"
            : "Actualizar"}
        </button>
      </form>
      {isModalOpen && (
        <Modal
          showModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={mainImage || ""} // Asegurar que se pasa una cadena no nula
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
            <div className="controls"></div>
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

            <div className="flex justify-between w-full gap-2">
              <button
                onClick={handleCrop}
                className="bg-primary text-[13px] md:text-[16px] hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Recortar y Subir
              </button>
              <button
                onClick={() => {
                  setMainImage(null);
                  setIsMainImageUploaded(false);
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
      
      {/* Toaster para mostrar notificaciones */}
      <Toaster position="top-center" />
    </section>
  );
};

export default BannerPrincipal03BO;
