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
  
  interface ButtonTextData {
    price: string;
    value: string;
    show: boolean;
  }
  
  // Agregar la interfaz DisplayConfig
  interface DisplayConfig {
    text: string;
    showPrice: boolean;
    showValue: boolean;
    showScheduleButton: boolean;
    showDetailsButton: boolean;
  }
  
  // Modificar la interfaz BannerData
  interface BannerData {
    images: BannerImage[];
  }
  
  const Testimonios03BO: React.FC = () => {
    const [fileName, setFileName] = useState<string | null>(null);
    const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
    const [isAddingImage, setIsAddingImage] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isPreviewImageUploaded, setIsPreviewImageUploaded] = useState(false);
    const [bannerData, setBannerData] = useState<BannerImage[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [formData, setFormData] = useState<BannerImage>({
      id: "",
      title: "",
      landingText: "",
      buttonLink: "",
      buttonText: "",
      mainImageLink: "Rosamonte",
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
  
    const [buttonTextData, setButtonTextData] = useState<ButtonTextData>({
      price: "",
      value: "",
      show: true,
    });
  
    const [showControlPanel, setShowControlPanel] = useState(true);
  
    // Agregar estado para la configuración de visualización
    const [displayConfig, setDisplayConfig] = useState<DisplayConfig>({
      text: "",
      showPrice: true,
      showValue: true,
      showScheduleButton: true,
      showDetailsButton: true,
    });
  
    // Agregar estado para controlar el índice inicial del carrusel
    const [startIndex, setStartIndex] = useState(0);
    const testimonialsPerPage = 4;
  
    const parseButtonTextData = (buttonText: string): ButtonTextData => {
      try {
        return JSON.parse(buttonText);
      } catch {
        return { price: buttonText, value: "", show: true };
      }
    };
  
    const fetchBannerHome = async () => {
      try {
        setLoading(true);
        setSkeletonLoading(true);
        const token = getCookie("AdminTokenAuth");
        const bannerId = `${process.env.NEXT_PUBLIC_TESTIMONIOS03_ID}`;
  
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
        if (response.data.bannerImages.length > 0) {
          const initialImage = response.data.bannerImages[0];
  
          // Parsear buttonText
          const parsedButtonText = parseButtonTextData(initialImage.buttonText);
          setButtonTextData(parsedButtonText);
  
          // Parsear landingText
          const parsedLandingText = parseDisplayConfig(initialImage.landingText);
          setDisplayConfig(parsedLandingText);
  
          setFormData({
            id: initialImage.id,
            title: initialImage.title,
            landingText: initialImage.landingText, // Guardar el JSON completo en lugar de solo el texto
            buttonLink: initialImage.buttonLink,
            buttonText: initialImage.buttonText,
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
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
      setIsMainImageUploaded(false);
      setMainImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (!isAddingImage && formData.mainImage) {
        setMainImage(formData.mainImage.url || formData.mainImage.data);
      }
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validación de campos requeridos
      if (!formData.title.trim() || 
          !formData.buttonLink.trim() || 
          !displayConfig.text.trim()) {
        toast.error('Debe llenar todos los campos de texto para crear el testimonio', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#FF5757',
            color: '#fff',
            fontSize: '14px',
            padding: '16px',
          },
        });
        return;
      }

      // Validación específica para la imagen cuando se está creando un nuevo testimonio
      if (isAddingImage && !isMainImageUploaded) {
        toast.error('Debe subir una imagen para crear el testimonio', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#FF5757',
            color: '#fff',
            fontSize: '14px',
            padding: '16px',
          },
        });
        return;
      }

      // Si estamos editando, asegurarse de que haya una imagen (ya sea la original o una nueva)
      if (!isAddingImage && !isMainImageUploaded && !formData.mainImage?.url && !formData.mainImage?.data) {
        toast.error('Debe tener una imagen para el testimonio', {
          duration: 3000,
          position: 'top-center',
          style: {
            background: '#FF5757',
            color: '#fff',
            fontSize: '14px',
            padding: '16px',
          },
        });
        return;
      }

      try {
        setLoading(true);
        const token = getCookie("AdminTokenAuth");
        const bannerId = `${process.env.NEXT_PUBLIC_TESTIMONIOS03_ID}`;
  
        // Asegurarse de que landingText esté en el formato JSON correcto
        let newLandingText;
        try {
          // Intentar parsear el texto actual por si ya es JSON
          const currentConfig = JSON.parse(formData.landingText);
          newLandingText = JSON.stringify({
            ...currentConfig,
            text: displayConfig.text,
            showPrice: displayConfig.showPrice,
            showValue: displayConfig.showValue,
            showScheduleButton: displayConfig.showScheduleButton,
            showDetailsButton: displayConfig.showDetailsButton,
          });
        } catch {
          // Si no es JSON, crear uno nuevo
          newLandingText = JSON.stringify({
            text: formData.landingText,
            showPrice: displayConfig.showPrice,
            showValue: displayConfig.showValue,
            showScheduleButton: displayConfig.showScheduleButton,
            showDetailsButton: displayConfig.showDetailsButton,
          });
        }
  
        // Crear el nuevo objeto buttonText
        const newButtonText = JSON.stringify({
          price: buttonTextData.price,
          value: buttonTextData.value,
          show: buttonTextData.show,
        });
  
        const dataToSend = {
          title: formData.title,
          landingText: newLandingText,
          buttonText: newButtonText,
          buttonLink: formData.buttonLink,
          mainImageLink: formData.mainImageLink,
          orderNumber: formData.orderNumber,
          ...(isMainImageUploaded && { mainImage: formData.mainImage }),
        };
  
        if (isAddingImage) {
          // Crear nueva imagen
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
        } else {
          // Actualizar imagen existente
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
  
        // Actualizar el estado local después de la actualización exitosa
        await fetchBannerHome();
      } catch (error) {
        console.error("Error al actualizar el banner:", error);
        toast.error('Error al guardar los cambios', {
          duration: 3000,
          position: 'top-center',
        });
      } finally {
        setLoading(false);
      }
    };
  
    const handleDeleteImage = async () => {
      try {
        setLoading(true);
        const token = getCookie("AdminTokenAuth");
        const bannerId = `${process.env.NEXT_PUBLIC_TESTIMONIOS03_ID}`;
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${formData.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
  
        // Actualizar el estado local
        await fetchBannerHome();
        
        // Ajustar el currentIndex después de borrar
        if (bannerData.length <= 1) {
          // Si era el último testimonio
          setCurrentIndex(0);
          setStartIndex(0);
          // Resetear el formulario
          setFormData({
            id: "",
            title: "",
            landingText: "",
            buttonLink: "",
            buttonText: "",
            mainImageLink: "Rosamonte",
            orderNumber: 1,
            mainImage: {
              url: "",
              name: "",
              type: "",
              size: null,
              data: "",
            },
          });
          setMainImage(null);
          setIsMainImageUploaded(false);
          setIsAddingImage(true);
        } else {
          // Si hay más testimonios, ajustar al anterior o al primero
          const newIndex = currentIndex > 0 ? currentIndex - 1 : 0;
          setCurrentIndex(newIndex);
          if (newIndex < startIndex) {
            setStartIndex(Math.max(0, newIndex));
          }
          
          // Actualizar el formulario con el testimonio activo
          const activeTestimonio = bannerData[newIndex];
          if (activeTestimonio) {
            setFormData({
              id: activeTestimonio.id,
              title: activeTestimonio.title,
              landingText: activeTestimonio.landingText,
              buttonLink: activeTestimonio.buttonLink,
              buttonText: activeTestimonio.buttonText,
              mainImageLink: activeTestimonio.mainImageLink,
              orderNumber: activeTestimonio.orderNumber,
              mainImage: activeTestimonio.mainImage || {
                url: "",
                name: "",
                type: "",
                size: null,
                data: "",
              },
            });
            setMainImage(activeTestimonio.mainImage?.url || activeTestimonio.mainImage?.data || null);
            setDisplayConfig(parseDisplayConfig(activeTestimonio.landingText));
            setButtonTextData(parseButtonTextData(activeTestimonio.buttonText));
          }
        }
  
        toast.success('Testimonio eliminado correctamente', {
          duration: 3000,
          position: 'top-center',
        });
  
      } catch (error) {
        console.error("Error al borrar la imagen del banner:", error);
        toast.error('Error al eliminar el testimonio', {
          duration: 3000,
          position: 'top-center',
        });
      } finally {
        setLoading(false);
      }
    };
  
    const handleNextImage = async () => {
      setSkeletonLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 200));
      const nextIndex = (currentIndex + 1) % bannerData.length;
      const nextImage = bannerData[nextIndex];
  
      // Cargar la configuración del siguiente banner
      const nextConfig = parseDisplayConfig(nextImage.landingText);
      setDisplayConfig(nextConfig);
  
      setCurrentIndex(nextIndex);
      setFormData({
        ...nextImage,
        mainImage: nextImage.mainImage || {
          url: '',
          data: '',
          name: '',
          type: '',
          size: null,
        }
      });
      setMainImage(nextImage.mainImage?.url || nextImage.mainImage?.data || null);
      setIsMainImageUploaded(false);
      setSkeletonLoading(false);
    };
  
    const handlePrevImage = async () => {
      setSkeletonLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 200));
      const prevIndex = (currentIndex - 1 + bannerData.length) % bannerData.length;
      const prevImage = bannerData[prevIndex];
  
      // Cargar la configuración del banner anterior
      const prevConfig = parseDisplayConfig(prevImage.landingText);
      setDisplayConfig(prevConfig);
  
      setCurrentIndex(prevIndex);
      setFormData({
        ...prevImage,
        mainImage: prevImage.mainImage || {
          url: '',
          data: '',
          name: '',
          type: '',
          size: null,
        }
      });
      setMainImage(prevImage.mainImage?.url || prevImage.mainImage?.data || null);
      setIsMainImageUploaded(false);
      setSkeletonLoading(false);
    };
    const handleAddImageClick = () => {
      if (isAddingImage) {
        // Si ya estamos en el estado de agregar, esto cancela la operación
        setFormData({
          id: bannerData[currentIndex]?.id || "",
          title: bannerData[currentIndex]?.title || "",
          landingText: bannerData[currentIndex]?.landingText || "",
          buttonLink: bannerData[currentIndex]?.buttonLink || "",
          buttonText: bannerData[currentIndex]?.buttonText || "",
          mainImageLink: bannerData[currentIndex]?.mainImageLink || "Rosamonte",
          orderNumber: bannerData[currentIndex]?.orderNumber || 1,
          mainImage: bannerData[currentIndex]?.mainImage || {
            url: "",
            name: "",
            type: "",
            size: null,
            data: "",
          },
        });
        setMainImage(
          bannerData[currentIndex]?.mainImage?.url ||
            bannerData[currentIndex]?.mainImage?.data ||
            null
        );
        setIsAddingImage(false);
        setIsMainImageUploaded(false);
      } else {
        // Si no estamos agregando, iniciar el proceso de agregar
        // Inicializar con valores por defecto para el nuevo banner
        const initialLandingText = JSON.stringify({
          text: "",
          showPrice: true,
          showValue: true,
          showScheduleButton: true,
          showDetailsButton: true,
        });
  
        const initialButtonText = JSON.stringify({
          price: "",
          value: "",
          show: true,
        });
  
        setFormData({
          id: "",
          title: "",
          landingText: initialLandingText,
          buttonLink: "",
          buttonText: initialButtonText,
          mainImageLink: "Rosamonte",
          orderNumber: 1,
          mainImage: {
            url: "",
            name: "",
            type: "",
            size: null,
            data: "",
          },
        });
  
        // Establecer la configuración inicial de visualización
        setDisplayConfig({
          text: "",
          showPrice: true,
          showValue: true,
          showScheduleButton: true,
          showDetailsButton: true,
        });
  
        // Establecer la configuración inicial del botón
        setButtonTextData({
          price: "",
          value: "",
          show: true,
        });
  
        setMainImage(null);
        setIsAddingImage(true);
        fileInputRef.current?.click();
        setIsMainImageUploaded(false);
      }
    };
  
    const handleButtonTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setButtonTextData((prev) => {
        const newData = { ...prev, [name]: value };
        // Actualizar formData.buttonText con el nuevo JSON
        setFormData((prevForm) => ({
          ...prevForm,
          buttonText: JSON.stringify(newData),
        }));
        return newData;
      });
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
  
    // Modificar la función parseDisplayConfig
    const parseDisplayConfig = (landingText: string): DisplayConfig => {
      try {
        // Si es un string JSON, intentar parsearlo
        if (typeof landingText === "string") {
          let parsed = JSON.parse(landingText);
  
          // Si el texto también es un JSON anidado, parsearlo también
          if (typeof parsed.text === "string" && parsed.text.startsWith("{")) {
            const nestedParsed = JSON.parse(parsed.text);
            parsed = {
              ...parsed,
              text: nestedParsed.text || "",
            };
          }
  
          return {
            text: parsed.text || "",
            showPrice: parsed.showPrice ?? true,
            showValue: parsed.showValue ?? true,
            showScheduleButton: parsed.showScheduleButton ?? true,
            showDetailsButton: parsed.showDetailsButton ?? true,
          };
        }
        return {
          text: landingText,
          showPrice: true,
          showValue: true,
          showScheduleButton: true,
          showDetailsButton: true,
        };
      } catch {
        return {
          text: landingText,
          showPrice: true,
          showValue: true,
          showScheduleButton: true,
          showDetailsButton: true,
        };
      }
    };
  
    // Modificar la función updateDisplayConfig
    const updateDisplayConfig = async (updates: Partial<DisplayConfig>) => {
      try {
        // Actualizar el estado local inmediatamente
        const newDisplayConfig = { ...displayConfig, ...updates };
        setDisplayConfig(newDisplayConfig);
  
        // Si estamos en modo de creación (isAddingImage es true), 
        // solo actualizamos el estado local y el formData
        if (isAddingImage) {
          const newLandingText = JSON.stringify({
            text: newDisplayConfig.text,
            showPrice: newDisplayConfig.showPrice,
            showValue: newDisplayConfig.showValue,
            showScheduleButton: newDisplayConfig.showScheduleButton,
            showDetailsButton: newDisplayConfig.showDetailsButton,
          });
  
          setFormData(prev => ({
            ...prev,
            landingText: newLandingText
          }));
          
          return; // No hacemos la llamada al API si estamos creando
        }
  
        // Si estamos editando, continuamos con la actualización en el servidor
        const token = getCookie("AdminTokenAuth");
        const bannerId = `${process.env.NEXT_PUBLIC_TESTIMONIOS03_ID}`;
  
        // Obtener la configuración actual del banner específico
        const currentBannerImage = bannerData[currentIndex];
        const currentConfig = parseDisplayConfig(currentBannerImage.landingText);
  
        // Crear el nuevo objeto landingText manteniendo el texto actual
        const newLandingText = JSON.stringify({
          text: currentConfig.text,
          showPrice: newDisplayConfig.showPrice,
          showValue: newDisplayConfig.showValue,
          showScheduleButton: newDisplayConfig.showScheduleButton,
          showDetailsButton: newDisplayConfig.showDetailsButton,
        });
  
        // Preparar datos para enviar
        const dataToSend = {
          title: formData.title,
          landingText: newLandingText,
          buttonText: formData.buttonText,
          buttonLink: formData.buttonLink,
          mainImageLink: formData.mainImageLink,
          orderNumber: formData.orderNumber,
        };
  
        // Enviar actualización al servidor
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
  
        // Actualizar el estado local de formData
        setFormData(prev => ({
          ...prev,
          landingText: newLandingText,
        }));
  
        // Actualizar el estado local de bannerData
        setBannerData(prev =>
          prev.map((image, index) =>
            index === currentIndex
              ? { ...image, landingText: newLandingText }
              : image
          )
        );
      } catch (error) {
        console.error("Error al actualizar la configuración:", error);
      }
    };
  
    // Función para obtener los testimonios visibles actualmente
    const getVisibleTestimonials = () => {
      if (!bannerData || bannerData.length === 0) return [];
      if (bannerData.length <= testimonialsPerPage) return bannerData;
      return bannerData.slice(startIndex, startIndex + testimonialsPerPage);
    };
  
    // Modificar las funciones de navegación
    const handleNextGroup = () => {
      const nextIndex = currentIndex + 1;
      if (nextIndex < bannerData.length) {
        setCurrentIndex(nextIndex);
        // Actualizar el formulario con el siguiente testimonio
        const nextBanner = bannerData[nextIndex];
        setFormData({
          id: nextBanner.id,
          title: nextBanner.title,
          landingText: nextBanner.landingText,
          buttonLink: nextBanner.buttonLink,
          buttonText: nextBanner.buttonText,
          mainImageLink: nextBanner.mainImageLink,
          orderNumber: nextBanner.orderNumber,
          mainImage: nextBanner.mainImage
        });
        setMainImage(nextBanner.mainImage.url || nextBanner.mainImage.data);
        setDisplayConfig(parseDisplayConfig(nextBanner.landingText));
        setButtonTextData(parseButtonTextData(nextBanner.buttonText));
        
        // Ajustar startIndex para mantener el elemento seleccionado visible
        if (nextIndex >= startIndex + testimonialsPerPage) {
          setStartIndex(startIndex + 1);
        }
      } else {
        // Volver al inicio
        setCurrentIndex(0);
        setStartIndex(0);
        const firstBanner = bannerData[0];
        setFormData({
          id: firstBanner.id,
          title: firstBanner.title,
          landingText: firstBanner.landingText,
          buttonLink: firstBanner.buttonLink,
          buttonText: firstBanner.buttonText,
          mainImageLink: firstBanner.mainImageLink,
          orderNumber: firstBanner.orderNumber,
          mainImage: firstBanner.mainImage
        });
        setMainImage(firstBanner.mainImage.url || firstBanner.mainImage.data);
        setDisplayConfig(parseDisplayConfig(firstBanner.landingText));
        setButtonTextData(parseButtonTextData(firstBanner.buttonText));
      }
    };
  
    const handlePrevGroup = () => {
      const prevIndex = currentIndex - 1;
      if (prevIndex >= 0) {
        setCurrentIndex(prevIndex);
        // Actualizar el formulario con el testimonio anterior
        const prevBanner = bannerData[prevIndex];
        setFormData({
          id: prevBanner.id,
          title: prevBanner.title,
          landingText: prevBanner.landingText,
          buttonLink: prevBanner.buttonLink,
          buttonText: prevBanner.buttonText,
          mainImageLink: prevBanner.mainImageLink,
          orderNumber: prevBanner.orderNumber,
          mainImage: prevBanner.mainImage
        });
        setMainImage(prevBanner.mainImage.url || prevBanner.mainImage.data);
        setDisplayConfig(parseDisplayConfig(prevBanner.landingText));
        setButtonTextData(parseButtonTextData(prevBanner.buttonText));
        
        // Ajustar startIndex para mantener el elemento seleccionado visible
        if (prevIndex < startIndex) {
          setStartIndex(startIndex - 1);
        }
      } else {
        // Ir al último
        const lastIndex = bannerData.length - 1;
        setCurrentIndex(lastIndex);
        setStartIndex(Math.max(0, lastIndex - testimonialsPerPage + 1));
        const lastBanner = bannerData[lastIndex];
        setFormData({
          id: lastBanner.id,
          title: lastBanner.title,
          landingText: lastBanner.landingText,
          buttonLink: lastBanner.buttonLink,
          buttonText: lastBanner.buttonText,
          mainImageLink: lastBanner.mainImageLink,
          orderNumber: lastBanner.orderNumber,
          mainImage: lastBanner.mainImage
        });
        setMainImage(lastBanner.mainImage.url || lastBanner.mainImage.data);
        setDisplayConfig(parseDisplayConfig(lastBanner.landingText));
        setButtonTextData(parseButtonTextData(lastBanner.buttonText));
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
      <>
        <div className="relative">
          {/* Toaster para mostrar notificaciones */}
          <div><Toaster/></div>
          
          {/* Panel de control */}


          {/* Vista previa */}
          <section className="py-12 bg-white rounded-lg shadow">
            
            <div className="max-w-7xl mx-auto px-4">
                          {/* Mensaje de alerta informativa */}
            <div className="p-4 mb-8 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Este es un preview referencial, por lo cual algunos elementos pueden no quedar correctamente organizados.</span>
              </div>
            </div>
  {/*             <div className="text-center mb-16">
                <span className="text-[#81C4BA] text-sm uppercase tracking-widest">
                  Testimonios
                </span>
                <h2 className="text-4xl font-light text-[#5B488E] mt-4">
                  Lo que dicen nuestros clientes
                </h2>
                <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                  Historias reales de familias que confían en nosotros para el cuidado
                  de sus mascotas
                </p>
              </div> */}

                <div className="relative">
                  {/* Controles de carrusel - solo mostrar si hay más de 4 testimonios */}
                  {bannerData.length > testimonialsPerPage && (
                    <div className="absolute -left-4 lg:-left-8 top-1/2 -translate-y-1/2 flex justify-between items-center w-[calc(100%+32px)] lg:w-[calc(100%+64px)]">
                      <button 
                        onClick={handlePrevGroup}
                        className="w-12 h-12 bg-[#5B488E]/5 rounded shadow-lg flex items-center justify-center text-[#81C4BA] hover:text-[#1B9C84] transition-colors z-10"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button 
                        onClick={handleNextGroup}
                        className="w-12 h-12 bg-[#5B488E]/5 rounded shadow-lg flex items-center justify-center text-[#81C4BA] hover:text-[#1B9C84] transition-colors z-10"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className={`grid grid-cols-1 ${
                    bannerData.length === 1 
                      ? 'md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto' 
                      : 'md:grid-cols-2 lg:grid-cols-4'
                  } gap-8`}>
                    {getVisibleTestimonials().map((banner, index) => (
                      <div
                        key={banner.id}
                        className={`group relative bg-white p-4 shadow-lg transform hover:-rotate-2 transition-all duration-300 ${
                          banner.id === bannerData[currentIndex].id 
                            ? 'scale-105 opacity-100' 
                            : 'scale-100 opacity-70 after:absolute after:inset-0 after:bg-black/20 after:transition-opacity hover:after:opacity-0'
                        }`}
                        onClick={() => {
                          const actualIndex = bannerData.findIndex(item => item.id === banner.id);
                          setCurrentIndex(actualIndex);
                          
                          // Actualizar el formData con todos los campos necesarios
                          setFormData({
                            id: banner.id,
                            title: banner.title,
                            landingText: banner.landingText,
                            buttonLink: banner.buttonLink,
                            buttonText: banner.buttonText,
                            mainImageLink: banner.mainImageLink,
                            orderNumber: banner.orderNumber,
                            mainImage: banner.mainImage || {
                              url: '',
                              data: '',
                              name: '',
                              type: '',
                              size: null,
                            }
                          });

                          // Actualizar la imagen principal
                          setMainImage(banner.mainImage?.url || banner.mainImage?.data || null);
                          setIsMainImageUploaded(false);
                          
                          // Actualizar la configuración del banner
                          const nextConfig = parseDisplayConfig(banner.landingText);
                          setDisplayConfig(nextConfig);
                          
                          // Actualizar el buttonTextData
                          const parsedButtonText = parseButtonTextData(banner.buttonText);
                          setButtonTextData(parsedButtonText);

                          // Resetear estados de edición si es necesario
                          setIsAddingImage(false);
                        }}
                        style={{
                          boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                          cursor: "pointer"
                        }}
                      >
                        {/* Contenedor de la foto estilo Polaroid */}
                        <div className="relative bg-white">
                          <div className="relative pt-[100%]">
                            <div className="absolute inset-0 p-3">
                              <div className="relative w-full h-full overflow-hidden">
                                <img
                                  src={banner.mainImage?.url || banner.mainImage?.data || '/placeholder-image.jpg'}
                                  alt={banner.title || 'Testimonio'}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/placeholder-image.jpg';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                                  <div className="absolute bottom-0 inset-x-0 p-2">
                                    <p className="text-white font-medium text-center">
                                      {banner.title}
                                    </p>
                                    <p className="text-white/80 text-sm text-center">
                                      {banner.buttonLink}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Testimonio en una "nota adhesiva" */}
                        <div className="mt-4 bg-[#5B488E]/5 p-4 rounded-lg transform -rotate-1">
                          <svg
                            className="w-6 h-6 text-[#81C4BA] mb-2"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                          </svg>
                          <p className="text-gray-600 text-sm italic mb-3">
                            {parseDisplayConfig(banner.landingText).text}
                          </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className="w-4 h-4 text-[#81C4BA]"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                              </svg>
                            ))}
                          </div>
                        </div>

                        {/* Cinta adhesiva decorativa */}
                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-[#5B488E]/10 transform -rotate-3" />
                      </div>
                    ))}
                  </div>

                  {/* Indicadores de página - mostrar solo si hay más de un testimonio */}
                  {bannerData.length > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                      {bannerData.map((_, index) => (
                        <button
                          key={index}
                          className={`h-1.5 rounded transition-all duration-300 ${
                            index === currentIndex
                              ? "w-8 bg-[#5B488E]"
                              : "w-4 bg-[#5B488E]/20 hover:bg-[#5B488E]/40"
                          }`}
                          onClick={() => {
                            setCurrentIndex(index);
                            if (index >= startIndex + testimonialsPerPage) {
                              setStartIndex(index - testimonialsPerPage + 1);
                            } else if (index < startIndex) {
                              setStartIndex(index);
                            }
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
            <div className="my-8">
              <div className={`${bannerData.length <= 1 ? '' : 'flex gap-4'}`}>
                <button
                  type="button"
                  onClick={handleAddImageClick}
                  className={`shadow px-4 py-2 rounded text-white ${
                    isAddingImage ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  } ${bannerData.length <= 1 ? 'w-full' : 'w-1/2'}`}
                >
                  {isAddingImage ? "Cancelar" : "Agregar Testimonio"}
                </button>
                {bannerData.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    className="w-1/2 shadow bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Borrar Testimonio
                  </button>
                )}
              </div>
            </div>
            {/* Formulario */}
            <form onSubmit={handleSubmit} className="mt-8 bg-white p-6 rounded-lg shadow">
              <h3 className="font-normal text-primary">
                Nombre Cliente <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                placeholder="Nombre Cliente"
              />
                <h3 className="font-normal text-primary">
                Nombre Mascota <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleChange}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                placeholder="con [Nombre mascota]"
              />
              <h3 className="font-normal text-primary">
                Testimonio <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                name="landingText"
                value={displayConfig.text}
                onChange={(e) => {
                  const newText = e.target.value;
                  // Actualizar displayConfig
                  setDisplayConfig(prev => ({
                    ...prev,
                    text: newText
                  }));
                  // Actualizar formData manteniendo la estructura JSON
                  setFormData(prev => ({
                    ...prev,
                    landingText: JSON.stringify({
                      text: newText,
                      showPrice: displayConfig.showPrice,
                      showValue: displayConfig.showValue,
                      showScheduleButton: displayConfig.showScheduleButton,
                      showDetailsButton: displayConfig.showDetailsButton,
                    })
                  }));
                }}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                placeholder="Testimonio"
              />
  {/*           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-normal text-primary">
                  Texto precio <span className="text-primary">*</span>
                </h3>
                <input
                  type="text"
                  name="price"
                  value={buttonTextData.price}
                  onChange={handleButtonTextChange}
                  className="shadow block w-full px-4 py-3 mb-4 mt-2 border border-gray-300 rounded-md"
                  placeholder="Desde $"
                />
              </div>
              <div>
                <h3 className="font-normal text-primary">
                  Texto Valor <span className="text-primary">*</span>
                </h3>
                <input
                  type="text"
                  name="value"
                  value={buttonTextData.value}
                  onChange={handleButtonTextChange}
                  className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                  placeholder="x tiempo aprox."
                />
              </div>
            </div> */}
  {/*           <h3 className="font-normal text-primary">
              Link Botón (Ver detalles) <span className="text-primary">*</span>
            </h3>
            <input
              type="text"
              name="mainImageLink"
              value={formData.mainImageLink}
              onChange={handleChange}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Link"
            /> */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="testimonioImage"
                  className="hidden"
                  ref={fileInputRef} // Asigna la referencia al input
                  onChange={handleImageChange}
                />
                {isMainImageUploaded ? (
                  <div className="flex flex-col items-center mt-3 relative">
                    <h4 className="font-normal text-primary text-center text-slate-600 w-full">
                      Tu fotografía{" "}
                      <span className="text-dark"> {formData.mainImage.name}</span>{" "}
                      ya ha sido cargada.
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
                      htmlFor="testimonioImage"
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
                          PNG, JPG o Webp (Recomendado 1024 × 1024px)
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

            {/* Modal de recorte */}
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
                    aspect={1 / 1}
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
          </div>
        
      </>
    );
  };
  
  export default Testimonios03BO;
  