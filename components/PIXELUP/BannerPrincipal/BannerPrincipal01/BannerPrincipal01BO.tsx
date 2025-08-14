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
import ModalPesoImagen from "@/components/Core/Modals/ModalPesoImagen"; // Importar el nuevo modal
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";
import { Switch } from "@/components/Core/Switch";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { globalConfig } from "@/app/config/GlobalConfig";
import { validateImage } from "@/utils/imageValidation";
import { FaQuestionCircle } from "react-icons/fa";

interface FontOption {
  value: string;
  label: string;
  className: string;
}

interface BannerImage {
  id: string;
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
  mainImageLink: string;
  orderNumber: number;
  mainImage?: any;
  mobileImage?: any;
}

interface ButtonTextData {
  price: string;
  value: string;
  show: boolean;
}

// Agregar la interfaz DisplayConfig
interface DisplayConfig {
  text: string;
  showText: boolean;
  showPrice: boolean;
  showValue: boolean;
  showButton1: boolean;
  showButton2: boolean;
  button1Text: string;
  button2Text: string;
  button1Link: string;
  button2Link: string;
  contentAlignment: "left" | "center" | "right";
  fullBannerLink: boolean;
  fullBannerLinkUrl: string;
  isMobileVersion: boolean;
  desktopImageId?: string;
  mobileImageId?: string;
  baseTypography: string; // Nueva propiedad para tipografía base
  titleTypography: string; // Nueva propiedad para tipografía del título
}

// Modificar la interfaz BannerData
interface BannerData {
  images: BannerImage[];
}

const BannerPrincipal01BO: React.FC = () => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [mobileFileName, setMobileFileName] = useState<string | null>(null);

  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [isMobileImageUploaded, setIsMobileImageUploaded] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mobileFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isPreviewImageUploaded, setIsPreviewImageUploaded] = useState(false);
  const [bannerData, setBannerData] = useState<BannerImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [formData, setFormData] = useState<BannerImage>({
    id: "",
    title: "Banner",
    landingText: "",
    buttonLink: "#",
    buttonText: "Button Text",
    mainImageLink: "#",
    orderNumber: 1,
    mainImage: {
      url: "",
      name: "",
      type: "",
      size: null,
      data: "",
    },
    mobileImage: {
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
  const [mobileImage, setMobileImage] = useState<string | null>(null);

  // States for image cropping - Desktop
  const [cropDesktop, setCropDesktop] = useState({ x: 0, y: 0 });
  const [zoomDesktop, setZoomDesktop] = useState(1);
  const [croppedAreaPixelsDesktop, setCroppedAreaPixelsDesktop] =
    useState<any>(null);
  const [isDesktopModalOpen, setIsDesktopModalOpen] = useState(false);

  // States for image cropping - Mobile
  const [cropMobile, setCropMobile] = useState({ x: 0, y: 0 });
  const [zoomMobile, setZoomMobile] = useState(1);
  const [croppedAreaPixelsMobile, setCroppedAreaPixelsMobile] =
    useState<any>(null);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPesoImagenModalOpen, setIsPesoImagenModalOpen] = useState(false); // Nuevo estado para el modal de peso de imagen

  const [buttonTextData, setButtonTextData] = useState<ButtonTextData>({
    price: "",
    value: "",
    show: false,
  });

  const [showControlPanel, setShowControlPanel] = useState(true);

  // Agregar estado para la configuración de visualización
  const [displayConfig, setDisplayConfig] = useState<DisplayConfig>({
    text: "",
    showText: false,
    showPrice: false,
    showValue: false,
    showButton1: false,
    showButton2: false,
    button1Text: "Botón 1",
    button2Text: "Botón 2",
    button1Link: "",
    button2Link: "",
    contentAlignment: "left",
    fullBannerLink: false,
    fullBannerLinkUrl: "",
    isMobileVersion: false,
    baseTypography: "montserrat", // Valor por defecto
    titleTypography: "montserrat", // Valor por defecto
  });

  // Agregar constantes para valores por defecto
  const DEFAULT_TITLE = "Banner";
  const DEFAULT_BUTTON_LINK = "#";

  // Constantes para límites de caracteres por campo
  const CHARACTER_LIMITS = {
    EPIGRAPH: 25, // Epígrafe - texto corto
    TITLE: 30, // Título - texto medio
    DESCRIPTION: 100, // Descripción - texto largo
    BUTTON1_TEXT: 9, // Botón 1 - texto corto
    BUTTON2_TEXT: 9, // Botón 2 - texto corto
  } as const;

  // Función para obtener el límite de caracteres de un botón
  const getButtonTextLimit = (buttonNumber: 1 | 2) => {
    const isButton1Active = displayConfig.showButton1;
    const isButton2Active = displayConfig.showButton2;

    // Si solo hay un botón activo, permitir 18 caracteres
    if (
      (buttonNumber === 1 && isButton1Active && !isButton2Active) ||
      (buttonNumber === 2 && isButton2Active && !isButton1Active)
    ) {
      return 18;
    }

    // Si ambos botones están activos o ninguno, mantener el límite de 9
    return 9;
  };

  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const [showMobileVersion, setShowMobileVersion] = useState(false);
  const [relatedMobileImage, setRelatedMobileImage] =
    useState<BannerImage | null>(null);
  const [relatedDesktopImage, setRelatedDesktopImage] =
    useState<BannerImage | null>(null);

  // Agregar estado para rastrear errores de validación de imagen
  const [imageValidationError, setImageValidationError] = useState<{
    desktop: boolean;
    mobile: boolean;
  }>({
    desktop: false,
    mobile: false,
  });

  // Obtener los aspectos de las imágenes desde la configuración global
  const desktopAspect = globalConfig.bannerAspects.desktop;
  const mobileAspect = globalConfig.bannerAspects.mobile;

  const parseButtonTextData = (buttonText: string): ButtonTextData => {
    try {
      const parsed = JSON.parse(buttonText);
      // Asegurar que show solo sea true si hay valores y está explícitamente activado
      return {
        price: parsed.price || "",
        value: parsed.value || "",
        show:
          Boolean(parsed.show) &&
          (Boolean(parsed.price) || Boolean(parsed.value)),
      };
    } catch {
      return { price: "", value: "", show: false };
    }
  };

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      setSkeletonLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_BANNERPRINCIPAL01_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Asegurar que cada imagen tenga los valores por defecto si están vacíos
      const imagesWithDefaults = response.data.bannerImages.map(
        (image: BannerImage) => ({
          ...image,
          title: image.title || DEFAULT_TITLE,
          buttonLink: image.buttonLink || DEFAULT_BUTTON_LINK,
          mainImageLink: image.mainImageLink || "#",
        })
      );

      // Filtrar solo las versiones desktop para la navegación principal
      const desktopImages = imagesWithDefaults.filter((image: BannerImage) => {
        const config = parseDisplayConfig(image.landingText);
        return !config.isMobileVersion;
      });

      setBannerData(imagesWithDefaults);
      if (desktopImages.length > 0) {
        const initialImage = desktopImages[0];
        const parsedButtonText = parseButtonTextData(initialImage.buttonText);
        setButtonTextData(parsedButtonText);
        const parsedLandingText = parseDisplayConfig(initialImage.landingText);
        setDisplayConfig(parsedLandingText);
        setFormData({
          ...initialImage,
          title: initialImage.title || DEFAULT_TITLE,
          buttonLink: initialImage.buttonLink || DEFAULT_BUTTON_LINK,
          mainImageLink: initialImage.mainImageLink || "#",
        });
        setMainImage(initialImage.mainImage.url || initialImage.mainImage.data);
        updateRelatedVersions(initialImage);
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    isMobile: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Limpiar error de validación previo
      setImageValidationError((prev) => ({
        ...prev,
        [isMobile ? "mobile" : "desktop"]: false,
      }));

      if (!validateImage(file)) {
        // Marcar error de validación
        setImageValidationError((prev) => ({
          ...prev,
          [isMobile ? "mobile" : "desktop"]: true,
        }));
        return;
      }

      if (isMobile) {
        setMobileFileName(file.name);
      } else {
        setFileName(file.name);
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (isMobile) {
          setMobileImage(result);
          setIsMobileModalOpen(true);
          setZoomMobile(1);
        } else {
          setMainImage(result);
          setIsDesktopModalOpen(true);
          setZoomDesktop(1);
        }
      };
      reader.readAsDataURL(file);
    } else {
      // Si no hay archivo seleccionado, marcar como error
      setImageValidationError((prev) => ({
        ...prev,
        [isMobile ? "mobile" : "desktop"]: true,
      }));
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any, isMobile: boolean = false) => {
      if (isMobile) {
        setCroppedAreaPixelsMobile(croppedAreaPixels);
      } else {
        setCroppedAreaPixelsDesktop(croppedAreaPixels);
      }
    },
    []
  );

  const handleCrop = async (isMobile: boolean = false) => {
    const imageToCrop = isMobile ? mobileImage : mainImage;
    const croppedAreaPixels = isMobile
      ? croppedAreaPixelsMobile
      : croppedAreaPixelsDesktop;

    if (!imageToCrop) return;

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: isMobile ? 768 : 1900,
        useWebWorker: true,
        initialQuality: 0.95,
      };

      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: isMobile
          ? mobileFileName || "banner-mobile.jpg"
          : fileName || "banner-image.jpg",
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      if (isMobile) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          mobileImage: imageInfo,
        }));
        setMobileImage(base64);
        setIsMobileImageUploaded(true);
        setIsMobileModalOpen(false);
        // Limpiar error de validación cuando se carga exitosamente
        setImageValidationError((prev) => ({
          ...prev,
          mobile: false,
        }));
      } else {
        setFormData((prevFormData) => ({
          ...prevFormData,
          mainImage: imageInfo,
        }));
        setMainImage(base64);
        setIsMainImageUploaded(true);
        setIsDesktopModalOpen(false);
        // Limpiar error de validación cuando se carga exitosamente
        setImageValidationError((prev) => ({
          ...prev,
          desktop: false,
        }));
      }
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

  const handleClearImage = (isMobile: boolean = false) => {
    if (isMobile) {
      setMobileImage(null);
      setMobileFileName(null);
      setIsMobileImageUploaded(false);
      // Marcar error de validación cuando se cancela la imagen
      setImageValidationError((prev) => ({
        ...prev,
        mobile: true,
      }));
      setFormData((prev) => ({
        ...prev,
        mobileImage: {
          url: "",
          name: "",
          type: "",
          size: null,
          data: "",
        },
      }));
      // Reiniciar el input de archivo mobile
      if (mobileFileInputRef.current) {
        mobileFileInputRef.current.value = "";
        // Forzar un nuevo evento de cambio
        const event = new Event("change", { bubbles: true });
        mobileFileInputRef.current.dispatchEvent(event);
      }
    } else {
      setMainImage(null);
      setFileName(null);
      setIsMainImageUploaded(false);
      // Marcar error de validación cuando se cancela la imagen
      setImageValidationError((prev) => ({
        ...prev,
        desktop: true,
      }));
      setFormData((prev) => ({
        ...prev,
        mainImage: {
          url: "",
          name: "",
          type: "",
          size: null,
          data: "",
        },
      }));
      // Reiniciar el input de archivo desktop
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
        // Forzar un nuevo evento de cambio
        const event = new Event("change", { bubbles: true });
        fileInputRef.current.dispatchEvent(event);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit llamado");
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      if (!token) {
        toast.error("No se encontró el token de autenticación");
        return;
      }

      const bannerId = `${process.env.NEXT_PUBLIC_BANNERPRINCIPAL01_ID}`;
      if (!bannerId) {
        toast.error("No se encontró el ID del banner");
        return;
      }

      // Asegurarse de que la URL del banner clickeable esté formateada
      const formattedFullBannerLinkUrl = displayConfig.fullBannerLink
        ? formatURL(displayConfig.fullBannerLinkUrl)
        : "";

      // Preparar los datos base a enviar
      const dataToSend: any = {
        title:
          formData.title === DEFAULT_TITLE || !formData.title
            ? DEFAULT_TITLE
            : formData.title,
        landingText: JSON.stringify({
          ...displayConfig,
          fullBannerLinkUrl: formattedFullBannerLinkUrl,
          isMobileVersion: showMobileVersion,
          desktopImageId: !showMobileVersion
            ? formData.id
            : relatedDesktopImage?.id,
          mobileImageId: showMobileVersion
            ? formData.id
            : relatedMobileImage?.id,
        }),
        buttonText: JSON.stringify({
          price: buttonTextData.price || "",
          value: buttonTextData.value || "",
          show: buttonTextData.show,
        }),
        buttonLink:
          formData.buttonLink === DEFAULT_BUTTON_LINK || !formData.buttonLink
            ? DEFAULT_BUTTON_LINK
            : formData.buttonLink,
        mainImageLink: formData.mainImageLink || "#",
        orderNumber: formData.orderNumber,
      };

      // Solo incluir mainImage si se ha subido una nueva imagen
      if (isMainImageUploaded) {
        dataToSend.mainImage = formData.mainImage;
      }

      // Solo incluir mobileImage si se ha subido una nueva imagen
      if (isMobileImageUploaded) {
        dataToSend.mobileImage = formData.mobileImage;
      }

      console.log("Datos a enviar:", dataToSend);

      const url = isAddingImage
        ? `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        : `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${formData.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

      const response = await axios({
        method: isAddingImage ? "POST" : "PUT",
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: dataToSend,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          isAddingImage
            ? "Banner creado exitosamente"
            : "Banner actualizado exitosamente"
        );
        await fetchBannerHome();
        if (isAddingImage) {
          setIsAddingImage(false);
          setShowMobileVersion(false);
        }
        // Resetear los estados de carga de imágenes después de un envío exitoso
        setIsMainImageUploaded(false);
        setIsMobileImageUploaded(false);
      } else {
        throw new Error(`Error en la respuesta: ${response.status}`);
      }
    } catch (error) {
      console.error("Error al procesar el banner:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        toast.error(
          error.response?.data?.message ||
            (isAddingImage
              ? "Error al crear el banner. Por favor, intente nuevamente."
              : "Error al actualizar el banner. Por favor, intente nuevamente.")
        );
      } else {
        toast.error(
          isAddingImage
            ? "Error al crear el banner. Por favor, intente nuevamente."
            : "Error al actualizar el banner. Por favor, intente nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      const bannerId = `${process.env.NEXT_PUBLIC_BANNERPRINCIPAL01_ID}`;
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${formData.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Banner eliminado exitosamente");
      setIsDeleteModalOpen(false);
      fetchBannerHome();
    } catch (error) {
      console.error("Error al borrar la imagen del banner:", error);
      toast.error(
        "Error al eliminar el banner. Por favor, intente nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNextImage = async () => {
    setSkeletonLoading(true);
    // Reducir el tiempo de espera artificial
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Filtrar las imágenes una sola vez
    const filteredImages = bannerData.filter((image: BannerImage) => {
      const config = parseDisplayConfig(image.landingText);
      return config.isMobileVersion === showMobileVersion;
    });

    const nextIndex = (currentIndex + 1) % filteredImages.length;
    const nextImage = filteredImages[nextIndex];

    // Actualizar todos los estados de una vez
    const nextConfig = parseDisplayConfig(nextImage.landingText);
    const parsedButtonText = parseButtonTextData(nextImage.buttonText);

    // Batch state updates
    Promise.resolve().then(() => {
      setDisplayConfig(nextConfig);
      setButtonTextData(parsedButtonText);
      setCurrentIndex(nextIndex);
      setFormData({
        ...nextImage,
        title: nextImage.title || DEFAULT_TITLE,
        buttonLink: nextImage.buttonLink || DEFAULT_BUTTON_LINK,
        mainImageLink: nextImage.mainImageLink || "#",
      });
      setMainImage(nextImage.mainImage.url || nextImage.mainImage.data);
      setIsMainImageUploaded(false);
      updateRelatedVersions(nextImage);
      setSkeletonLoading(false);
    });
  };

  const handlePrevImage = async () => {
    setSkeletonLoading(true);
    // Reducir el tiempo de espera artificial
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Filtrar las imágenes una sola vez
    const filteredImages = bannerData.filter((image: BannerImage) => {
      const config = parseDisplayConfig(image.landingText);
      return config.isMobileVersion === showMobileVersion;
    });

    const prevIndex =
      (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    const prevImage = filteredImages[prevIndex];

    // Actualizar todos los estados de una vez
    const prevConfig = parseDisplayConfig(prevImage.landingText);
    const parsedButtonText = parseButtonTextData(prevImage.buttonText);

    // Batch state updates
    Promise.resolve().then(() => {
      setDisplayConfig(prevConfig);
      setButtonTextData(parsedButtonText);
      setCurrentIndex(prevIndex);
      setFormData({
        ...prevImage,
        title: prevImage.title || DEFAULT_TITLE,
        buttonLink: prevImage.buttonLink || DEFAULT_BUTTON_LINK,
        mainImageLink: prevImage.mainImageLink || "#",
      });
      setMainImage(prevImage.mainImage.url || prevImage.mainImage.data);
      setIsMainImageUploaded(false);
      updateRelatedVersions(prevImage);
      setSkeletonLoading(false);
    });
  };

  const handleAddImageClick = () => {
    if (isAddingImage) {
      // Si ya estamos en el estado de agregar, esto cancela la operación
      setFormData({
        id: bannerData[currentIndex]?.id || "",
        title: bannerData[currentIndex]?.title || DEFAULT_TITLE,
        landingText: bannerData[currentIndex]?.landingText || "",
        buttonLink: bannerData[currentIndex]?.buttonLink || DEFAULT_BUTTON_LINK,
        buttonText: bannerData[currentIndex]?.buttonText || "",
        mainImageLink: bannerData[currentIndex]?.mainImageLink || "#",
        orderNumber: bannerData[currentIndex]?.orderNumber || 1,
        mainImage: bannerData[currentIndex]?.mainImage || {
          url: "",
          name: "",
          type: "",
          size: null,
          data: "",
        },
        mobileImage: bannerData[currentIndex]?.mobileImage || {
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
      setMobileImage(
        bannerData[currentIndex]?.mobileImage?.url ||
          bannerData[currentIndex]?.mobileImage?.data ||
          null
      );
      setIsAddingImage(false);
      setIsMainImageUploaded(false);
      setIsMobileImageUploaded(false);
      // Limpiar errores de validación al cancelar
      setImageValidationError({
        desktop: false,
        mobile: false,
      });
    } else {
      // Inicializar con valores por defecto para el nuevo banner
      const initialLandingText = JSON.stringify({
        text: "",
        showText: false,
        showPrice: false,
        showValue: false,
        showButton1: false,
        showButton2: false,
        button1Text: "Botón 1",
        button2Text: "Botón 2",
        button1Link: "",
        button2Link: "",
        contentAlignment: "left",
        fullBannerLink: false,
        fullBannerLinkUrl: "",
      });

      const initialButtonText = JSON.stringify({
        price: "",
        value: "",
        show: false,
      });

      setFormData({
        id: "",
        title: DEFAULT_TITLE,
        landingText: initialLandingText,
        buttonLink: DEFAULT_BUTTON_LINK,
        buttonText: initialButtonText,
        mainImageLink: "#",
        orderNumber: 1,
        mainImage: {
          url: "",
          name: "",
          type: "",
          size: null,
          data: "",
        },
        mobileImage: {
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
        showText: false,
        showPrice: false,
        showValue: false,
        showButton1: false,
        showButton2: false,
        button1Text: "Botón 1",
        button2Text: "Botón 2",
        button1Link: "",
        button2Link: "",
        contentAlignment: "left",
        fullBannerLink: false,
        fullBannerLinkUrl: "",
        isMobileVersion: false,
        baseTypography: "montserrat",
        titleTypography: "montserrat",
      });

      // Establecer la configuración inicial del botón
      setButtonTextData({
        price: "",
        value: "",
        show: false,
      });

      setMainImage(null);
      setMobileImage(null);
      setIsAddingImage(true);
      // Solo abrimos el modal de imagen desktop primero
      fileInputRef.current?.click();
      setIsMainImageUploaded(false);
      setIsMobileImageUploaded(false);
      // Limpiar errores de validación al iniciar
      setImageValidationError({
        desktop: false,
        mobile: false,
      });
    }
  };

  const handleButtonTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setButtonTextData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
        show:
          Boolean(value) || Boolean(name === "price" ? prev.value : prev.price),
      };

      // Actualizar formData.buttonText con el nuevo JSON
      setFormData((prevForm) => ({
        ...prevForm,
        buttonText: JSON.stringify(newData),
      }));

      return newData;
    });
  };

  // Función para verificar si hay texto de botón que excede el límite actual
  const hasButtonTextExceedingLimit = () => {
    const button1Limit = getButtonTextLimit(1);
    const button2Limit = getButtonTextLimit(2);

    return (
      (displayConfig.showButton1 &&
        displayConfig.button1Text.length > button1Limit) ||
      (displayConfig.showButton2 &&
        displayConfig.button2Text.length > button2Limit)
    );
  };

  // Función para verificar si el botón "Crear Banner" debe estar bloqueado
  const isCreateBannerDisabled = () => {
    if (loading) return true; // Siempre bloquear cuando está cargando

    // Si hay errores de validación en desktop o mobile, bloquear el botón
    if (imageValidationError.desktop || imageValidationError.mobile) {
      return true;
    }

    // Solo validar imagen cuando se está agregando un nuevo banner
    if (isAddingImage && !isMainImageUploaded) {
      return true;
    }

    // Si hay texto de botón que excede el límite actual, bloquear el botón
    if (hasButtonTextExceedingLimit()) {
      return true;
    }

    return false;
  };

  // Función para verificar si el botón "Borrar Banner" debe estar bloqueado
  const isDeleteBannerDisabled = () => {
    if (loading) return true; // Siempre bloquear cuando está cargando

    // Solo mostrar y habilitar si hay más de 1 banner Y no estamos en modo de agregar
    if (bannerData.length <= 1 || isAddingImage) {
      return true;
    }

    return false;
  };

  // Funciones para validar y limitar caracteres
  const validateAndLimitCharacters = (text: string, limit: number): string => {
    return text.length > limit ? text.slice(0, limit) : text;
  };

  const getCharacterCount = (text: string, limit: number) => {
    return {
      current: text.length,
      limit,
      remaining: limit - text.length,
      isOverLimit: text.length > limit,
    };
  };

  const getCharacterCountClass = (current: number, limit: number) => {
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 75) return "text-yellow-500";
    return "text-gray-500";
  };

  const SkeletonLoader = () => (
    <div
      className={`relative font-sans before:absolute before:w-full before:h-full before:inset-0 before:bg-black before:opacity-30 before:z-10 ${
        previewMode === "mobile"
          ? `aspect-[${mobileAspect}] w-full`
          : `aspect-[${desktopAspect}] w-full`
      }`}
    >
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
      if (typeof landingText === "string") {
        let parsed = JSON.parse(landingText);

        if (typeof parsed.text === "string" && parsed.text.startsWith("{")) {
          const nestedParsed = JSON.parse(parsed.text);
          parsed = {
            ...parsed,
            text: nestedParsed.text || "",
          };
        }

        // Asegurarse de que la URL esté formateada al cargar los datos
        const fullBannerLinkUrl = parsed.fullBannerLink
          ? formatURL(parsed.fullBannerLinkUrl || "")
          : "";

        return {
          text: parsed.text || "",
          showText: parsed.showText ?? false,
          showPrice: parsed.showPrice ?? false,
          showValue: parsed.showValue ?? false,
          showButton1: parsed.showButton1 ?? false,
          showButton2: parsed.showButton2 ?? false,
          button1Text: parsed.button1Text || "Botón 1",
          button2Text: parsed.button2Text || "Botón 2",
          button1Link: parsed.button1Link || "",
          button2Link: parsed.button2Link || "",
          contentAlignment: parsed.contentAlignment || "left",
          fullBannerLink: parsed.fullBannerLink ?? false,
          fullBannerLinkUrl: fullBannerLinkUrl,
          isMobileVersion: parsed.isMobileVersion ?? false,
          baseTypography: parsed.baseTypography || "montserrat",
          titleTypography: parsed.titleTypography || "montserrat",
        };
      }
      return {
        text: landingText,
        showText: false,
        showPrice: false,
        showValue: false,
        showButton1: false,
        showButton2: false,
        button1Text: "Botón 1",
        button2Text: "Botón 2",
        button1Link: "",
        button2Link: "",
        contentAlignment: "left",
        fullBannerLink: false,
        fullBannerLinkUrl: "",
        isMobileVersion: false,
        baseTypography: "montserrat",
        titleTypography: "montserrat",
      };
    } catch {
      return {
        text: landingText,
        showText: false,
        showPrice: false,
        showValue: false,
        showButton1: false,
        showButton2: false,
        button1Text: "Botón 1",
        button2Text: "Botón 2",
        button1Link: "",
        button2Link: "",
        contentAlignment: "left",
        fullBannerLink: false,
        fullBannerLinkUrl: "",
        isMobileVersion: false,
        baseTypography: "montserrat",
        titleTypography: "montserrat",
      };
    }
  };

  // Modificar la función updateDisplayConfig para que solo actualice el estado local
  const updateDisplayConfig = (updates: Partial<DisplayConfig>) => {
    const newDisplayConfig = { ...displayConfig, ...updates };
    setDisplayConfig(newDisplayConfig);

    // Actualizar el formData.landingText con la nueva configuración
    setFormData((prev) => ({
      ...prev,
      landingText: JSON.stringify(newDisplayConfig),
    }));
  };

  // Modificar el manejo del checkbox para el título
  const handleTitleToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      title: checked ? "" : DEFAULT_TITLE,
    }));
  };

  // Modificar el manejo del checkbox para el buttonLink
  const handleButtonLinkToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      buttonLink: checked ? "" : DEFAULT_BUTTON_LINK,
    }));
  };

  // Función de utilidad para formatear URLs
  const formatURL = (url: string): string => {
    // Si está vacío o es solo espacios en blanco, devolver string vacío
    if (!url || url.trim() === "") return "";

    let formattedURL = url.trim().toLowerCase();

    // Si es una ruta interna que comienza con /, la devolvemos tal cual
    if (formattedURL.startsWith("/")) return formattedURL;

    // Si no tiene protocolo (http/https)
    if (
      !formattedURL.startsWith("http://") &&
      !formattedURL.startsWith("https://")
    ) {
      // Si comienza con www., agregamos https://
      if (formattedURL.startsWith("www.")) {
        formattedURL = "https://" + formattedURL;
      }
      // Si no comienza con www., agregamos https://www.
      else {
        // Excluimos dominios comunes que no necesitan www
        const noWWWDomains = [
          "localhost",
          "mail.",
          "api.",
          "app.",
          "dev.",
          "stage.",
        ];
        const shouldAddWWW = !noWWWDomains.some((domain) =>
          formattedURL.startsWith(domain)
        );

        formattedURL = "https://" + (shouldAddWWW ? "www." : "") + formattedURL;
      }
    }

    return formattedURL;
  };

  const handleFullBannerLinkToggle = (checked: boolean) => {
    if (checked && (displayConfig.showButton1 || displayConfig.showButton2)) {
      setIsAlertModalOpen(true);
      return;
    }
    updateDisplayConfig({ fullBannerLink: checked });
  };

  const handleButton1Toggle = (checked: boolean) => {
    if (checked && displayConfig.fullBannerLink) {
      setIsAlertModalOpen(true);
      return;
    }
    updateDisplayConfig({ showButton1: checked });
  };

  const handleButton2Toggle = (checked: boolean) => {
    if (checked && displayConfig.fullBannerLink) {
      setIsAlertModalOpen(true);
      return;
    }
    updateDisplayConfig({ showButton2: checked });
  };

  // Función para encontrar la versión relacionada (mobile o desktop)
  const findRelatedVersion = useCallback(
    (currentImage: BannerImage, isMobile: boolean) => {
      return bannerData.find((img) => {
        const imgConfig = parseDisplayConfig(img.landingText);
        const currentConfig = parseDisplayConfig(currentImage.landingText);
        return (
          img.orderNumber === currentImage.orderNumber &&
          imgConfig.isMobileVersion === isMobile &&
          img.id !== currentImage.id
        );
      });
    },
    [bannerData]
  );

  // Función para actualizar las versiones relacionadas
  const updateRelatedVersions = useCallback(
    (currentImage: BannerImage) => {
      const currentConfig = parseDisplayConfig(currentImage.landingText);
      if (currentConfig.isMobileVersion) {
        setRelatedDesktopImage(findRelatedVersion(currentImage, false) || null);
        setRelatedMobileImage(null);
      } else {
        setRelatedMobileImage(findRelatedVersion(currentImage, true) || null);
        setRelatedDesktopImage(null);
      }
    },
    [findRelatedVersion]
  );

  // Función para abrir el modal sin actualizar el banner
  const handleOpenPesoImagenModal = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevenir el comportamiento predeterminado
    e.stopPropagation(); // Detener la propagación del evento
    setIsPesoImagenModalOpen(true);
  };

  const fontOptions: FontOption[] = [
    { value: "montserrat", label: "Montserrat", className: "font-montserrat" },
    { value: "poppins", label: "Poppins", className: "font-poppins" },
    {
      value: "roboto-mono",
      label: "Roboto Mono",
      className: "font-roboto-mono",
    },
    { value: "kalam", label: "Kalam", className: "font-kalam" },
    { value: "lato", label: "Lato", className: "font-lato" },
    { value: "oswald", label: "Oswald", className: "font-oswald" },
  ];

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
    <div className="space-y-6">
      {/* Panel de Vista Previa */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900">
            Vista Previa (referencial)
          </h3>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPreviewMode("desktop")}
                className={`px-3 py-1 rounded ${
                  previewMode === "desktop"
                    ? "bg-white shadow text-primary"
                    : "text-gray-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={() => setPreviewMode("mobile")}
                className={`px-3 py-1 rounded ${
                  previewMode === "mobile"
                    ? "bg-white shadow text-primary"
                    : "text-gray-600"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm3 14a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isPreviewVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        {isPreviewVisible && (
          <div>
            {/* Mensaje de alerta informativa */}
            <div
              className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400"
              role="alert"
            >
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span>
                  Este es un preview referencial, por lo cual algunos elementos
                  pueden no quedar correctamente organizados.
                </span>
              </div>
            </div>
            <div
              className={`transition-all duration-300 ease-in-out ${
                previewMode === "mobile"
                  ? "max-w-auto mx-auto"
                  : "max-w-auto mx-auto"
              }`}
            >
              <div className="h-[450px] flex items-center justify-center">
                {skeletonLoading ? (
                  <SkeletonLoader />
                ) : (
                  <div
                    className={`relative w-full h-full ${
                      previewMode === "mobile"
                        ? `aspect-[${mobileAspect}]`
                        : `aspect-[${desktopAspect}]`
                    }`}
                  >
                    {displayConfig.fullBannerLink &&
                      displayConfig.fullBannerLinkUrl && (
                        <Link
                          href={displayConfig.fullBannerLinkUrl}
                          className="absolute inset-0 z-30 cursor-pointer"
                          target="_blank"
                        />
                      )}
                    <div className="absolute inset-0">
                      <img
                        src={
                          previewMode === "mobile"
                            ? mobileImage || formData.mobileImage?.url
                            : mainImage || formData.mainImage?.url
                        }
                        alt="Banner Image"
                        className={`w-full h-full ${
                          previewMode === "mobile"
                            ? "object-contain"
                            : "object-cover"
                        }`}
                      />
                      {(formData.buttonLink !== DEFAULT_BUTTON_LINK ||
                        formData.title !== DEFAULT_TITLE ||
                        displayConfig.text ||
                        (buttonTextData.show &&
                          (displayConfig.showPrice ||
                            displayConfig.showValue)) ||
                        displayConfig.showButton1 ||
                        displayConfig.showButton2) && (
                        <div
                          className="absolute inset-0 bg-black"
                          style={{
                            opacity: 0.4,
                            transition:
                              "opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)",
                          }}
                        />
                      )}
                    </div>

                    {previewMode === "mobile" ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className={`flex flex-col justify-center w-full max-w-[500px] h-full mx-auto px-3 ${(() => {
                            switch (displayConfig.contentAlignment) {
                              case "center":
                                return "items-center text-center mx-auto";
                              case "right":
                                return "items-end text-right ml-auto";
                              default:
                                return "items-start text-left";
                            }
                          })()}`}
                        >
                          {formData.buttonLink !== DEFAULT_BUTTON_LINK && (
                            <span
                              className={`text-white text-xs uppercase tracking-widest mb-2 drop-shadow-md font-${displayConfig.baseTypography}`}
                            >
                              {formData.buttonLink}
                            </span>
                          )}
                          {formData.title !== DEFAULT_TITLE && (
                            <h2
                              className={`text-6xl text-white font-light mb-4 leading-[55px] drop-shadow-md font-${displayConfig.titleTypography}`}
                            >
                              {formData.title}
                            </h2>
                          )}
                          {displayConfig.showText && displayConfig.text && (
                            <p
                              className={`text-white text-base mb-4 leading-relaxed drop-shadow-md font-${displayConfig.baseTypography}`}
                            >
                              {displayConfig.text}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mb-4">
                            {displayConfig.showPrice &&
                              buttonTextData.price && (
                                <span
                                  className={`bg-white/5 backdrop-blur-sm text-white px-2 py-1 rounded text-xs drop-shadow-md font-${displayConfig.baseTypography}`}
                                >
                                  {buttonTextData.price}
                                </span>
                              )}
                            {displayConfig.showValue &&
                              buttonTextData.value && (
                                <span
                                  className={`bg-white/5 backdrop-blur-sm text-white px-2 py-1 rounded text-xs drop-shadow-md font-${displayConfig.baseTypography}`}
                                >
                                  {buttonTextData.value}
                                </span>
                              )}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {displayConfig.showButton1 && (
                              <a
                                href={displayConfig.button1Link}
                                className={`bg-primary/60 text-white px-4 py-2 rounded hover:bg-primary transition-all cursor-pointer drop-shadow-md text-md font-${displayConfig.baseTypography}`}
                              >
                                {displayConfig.button1Text}
                              </a>
                            )}
                            {displayConfig.showButton2 && (
                              <a
                                href={displayConfig.button2Link}
                                className={`bg-white/5 text-white border border-white/20 px-4 py-2 rounded hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer drop-shadow-md text-md font-${displayConfig.baseTypography}`}
                              >
                                {displayConfig.button2Text}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className={`relative h-full mx-auto px-20 md:px-24`}>
                        <div
                          className={`flex flex-col justify-center h-full ${(() => {
                            switch (displayConfig.contentAlignment) {
                              case "center":
                                return "items-center text-center mx-auto";
                              case "right":
                                return "items-end text-right ml-auto";
                              default:
                                return "items-start text-left";
                            }
                          })()} max-w-2xl`}
                        >
                          {formData.buttonLink !== DEFAULT_BUTTON_LINK && (
                            <span
                              className={`text-white text-sm uppercase tracking-widest mb-4 drop-shadow-md font-${displayConfig.baseTypography}`}
                            >
                              {formData.buttonLink}
                            </span>
                          )}
                          {formData.title !== DEFAULT_TITLE && (
                            <h2
                              className={`text-5xl md:text-7xl text-white font-light mb-6 leading-tight drop-shadow-md font-${displayConfig.titleTypography}`}
                            >
                              {formData.title}
                            </h2>
                          )}
                          {displayConfig.showText && displayConfig.text && (
                            <p
                              className={`text-white text-lg md:text-xl leading-relaxed drop-shadow-md font-${displayConfig.baseTypography}`}
                            >
                              {displayConfig.text}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mb-8">
                            {displayConfig.showPrice &&
                              buttonTextData.price && (
                                <span
                                  className={`bg-white/5 backdrop-blur-sm text-white px-4 py-2 rounded text-sm drop-shadow-md font-${displayConfig.baseTypography}`}
                                >
                                  {buttonTextData.price}
                                </span>
                              )}
                            {displayConfig.showValue &&
                              buttonTextData.value && (
                                <span
                                  className={`bg-white/5 backdrop-blur-sm text-white px-4 py-2 rounded text-sm drop-shadow-md font-${displayConfig.baseTypography}`}
                                >
                                  {buttonTextData.value}
                                </span>
                              )}
                          </div>
                          <div className="flex flex-wrap gap-4">
                            {displayConfig.showButton1 && (
                              <a
                                href={displayConfig.button1Link}
                                className={`bg-primary/60 text-white px-8 py-4 rounded hover:bg-primary transition-all cursor-pointer drop-shadow-md font-${displayConfig.baseTypography}`}
                              >
                                {displayConfig.button1Text}
                              </a>
                            )}
                            {displayConfig.showButton2 && (
                              <a
                                href={displayConfig.button2Link}
                                className={`bg-white/5 text-white border border-white/20 px-8 py-4 rounded hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer drop-shadow-md font-${displayConfig.baseTypography}`}
                              >
                                {displayConfig.button2Text}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Controles de Navegación */}
            {bannerData.length > 1 && !isAddingImage && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100">
                <button
                  onClick={handlePrevImage}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Banner Anterior
                </button>
                <span className="text-sm text-gray-500">
                  {currentIndex + 1} de {bannerData.length}
                </span>
                <button
                  onClick={handleNextImage}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  disabled={loading}
                >
                  Banner Siguiente
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Botones de acción principales */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={handleAddImageClick}
            className={`py-2 px-4 rounded text-white font-medium text-sm ${
              isAddingImage
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-700 hover:bg-green-700"
            }`}
          >
            {isAddingImage ? "Cancelar" : "Agregar Banner"}
          </button>

          {bannerData.length > 1 && (
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isDeleteBannerDisabled()}
              className={`py-2 px-4 rounded text-white font-medium text-sm ${
                isDeleteBannerDisabled()
                  ? "bg-gray-400 cursor-not-allowed opacity-50"
                  : "bg-red-700 hover:bg-red-700"
              }`}
              title={
                isDeleteBannerDisabled()
                  ? isAddingImage
                    ? "No puedes borrar mientras estás creando un banner"
                    : bannerData.length <= 1
                    ? "Necesitas al menos 2 banners para poder borrar"
                    : "Procesando..."
                  : ""
              }
            >
              Borrar Banner
            </button>
          )}

          <button
            type="submit"
            form="bannerForm"
            disabled={isCreateBannerDisabled()}
            className={`py-2 px-4 rounded text-white font-medium text-sm flex items-center justify-center ${
              isCreateBannerDisabled()
                ? "bg-gray-400 cursor-not-allowed opacity-50"
                : "bg-primary hover:bg-secondary"
            }`}
            title={
              isCreateBannerDisabled()
                ? imageValidationError.desktop || imageValidationError.mobile
                  ? "Error en la validación de imagen. Verifica que la imagen no supere 5MB y sea un formato válido."
                  : !isMainImageUploaded
                  ? "Debes seleccionar una imagen para crear el banner."
                  : hasButtonTextExceedingLimit()
                  ? "El texto de uno o ambos botones excede el límite permitido. Reduce el texto o desactiva un botón."
                  : "Procesando..."
                : ""
            }
          >
            {loading && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {loading
              ? "Guardando..."
              : isAddingImage
              ? "Crear Banner"
              : "Actualizar"}
          </button>
        </div>
      </div>

      {/* Panel de Control */}
      <form
        id="bannerForm"
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-4"
      >
        {/* Grid de 3 columnas para los controles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Columna 1: Controles de Contenido */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-4">
              Contenido
            </h3>
            <div className="space-y-4">
              {/* Controles de tipografía */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    Tipografía del título
                  </label>
                  <select
                    value={displayConfig.titleTypography}
                    onChange={(e) =>
                      updateDisplayConfig({ titleTypography: e.target.value })
                    }
                    className="w-full text-sm p-2 border border-gray-200 rounded-md"
                  >
                    {fontOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-700 mb-2 block">
                    Tipografía base (epígrafe, descripción, botones)
                  </label>
                  <select
                    value={displayConfig.baseTypography}
                    onChange={(e) =>
                      updateDisplayConfig({ baseTypography: e.target.value })
                    }
                    className="w-full text-sm p-2 border border-gray-200 rounded-md"
                  >
                    {fontOptions.map((option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Controles de alineación */}
              <div>
                <label className="text-sm text-gray-700 mb-2 block">
                  Alineación del contenido
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateDisplayConfig({ contentAlignment: "left" })
                    }
                    className={`flex-1 p-2 border rounded-md ${
                      displayConfig.contentAlignment === "left"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mx-auto"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 4.5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 9.5H12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 14.5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 19.5H12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDisplayConfig({ contentAlignment: "center" })
                    }
                    className={`flex-1 p-2 border rounded-md ${
                      displayConfig.contentAlignment === "center"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mx-auto"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 4.5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 9.5H18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 14.5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M6 19.5H18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      updateDisplayConfig({ contentAlignment: "right" })
                    }
                    className={`flex-1 p-2 border rounded-md ${
                      displayConfig.contentAlignment === "right"
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mx-auto"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 4.5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 9.5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M3 14.5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 19.5H21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700">Epígrafe</label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">Mostrar</span>
                    <Switch
                      checked={formData.buttonLink !== DEFAULT_BUTTON_LINK}
                      onChange={handleButtonLinkToggle}
                    />
                  </div>
                </div>
                <input
                  type="text"
                  name="buttonLink"
                  value={
                    formData.buttonLink === DEFAULT_BUTTON_LINK
                      ? ""
                      : formData.buttonLink
                  }
                  onChange={(e) => {
                    const limitedValue = validateAndLimitCharacters(
                      e.target.value,
                      CHARACTER_LIMITS.EPIGRAPH
                    );
                    setFormData((prev) => ({
                      ...prev,
                      buttonLink: limitedValue || DEFAULT_BUTTON_LINK,
                    }));
                  }}
                  className="w-full text-sm p-2 border border-gray-200 rounded-md"
                  placeholder="Ingresa el epígrafe"
                  disabled={formData.buttonLink === DEFAULT_BUTTON_LINK}
                />
                {formData.buttonLink !== DEFAULT_BUTTON_LINK && (
                  <div className="flex justify-between items-center mt-1">
                    <span
                      className={`text-xs ${getCharacterCountClass(
                        formData.buttonLink.length,
                        CHARACTER_LIMITS.EPIGRAPH
                      )}`}
                    >
                      {formData.buttonLink.length}/{CHARACTER_LIMITS.EPIGRAPH}{" "}
                      caracteres
                    </span>
                    {formData.buttonLink.length >=
                      CHARACTER_LIMITS.EPIGRAPH && (
                      <span className="text-xs text-red-500">
                        Límite alcanzado
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700">Título</label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">Mostrar</span>
                    <Switch
                      checked={formData.title !== DEFAULT_TITLE}
                      onChange={handleTitleToggle}
                    />
                  </div>
                </div>
                <input
                  type="text"
                  name="title"
                  value={formData.title === DEFAULT_TITLE ? "" : formData.title}
                  onChange={(e) => {
                    const limitedValue = validateAndLimitCharacters(
                      e.target.value,
                      CHARACTER_LIMITS.TITLE
                    );
                    setFormData((prev) => ({
                      ...prev,
                      title: limitedValue || DEFAULT_TITLE,
                    }));
                  }}
                  className="w-full text-sm p-2 border border-gray-200 rounded-md"
                  placeholder="Ingresa el título"
                  disabled={formData.title === DEFAULT_TITLE}
                />
                {formData.title !== DEFAULT_TITLE && (
                  <div className="flex justify-between items-center mt-1">
                    <span
                      className={`text-xs ${getCharacterCountClass(
                        formData.title.length,
                        CHARACTER_LIMITS.TITLE
                      )}`}
                    >
                      {formData.title.length}/{CHARACTER_LIMITS.TITLE}{" "}
                      caracteres
                    </span>
                    {formData.title.length >= CHARACTER_LIMITS.TITLE && (
                      <span className="text-xs text-red-500">
                        Límite alcanzado
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700">Descripción</label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">Mostrar</span>
                    <Switch
                      checked={displayConfig.showText}
                      onChange={(checked) =>
                        updateDisplayConfig({ showText: checked })
                      }
                    />
                  </div>
                </div>
                <textarea
                  name="landingText"
                  value={displayConfig.text}
                  onChange={(e) => {
                    const limitedValue = validateAndLimitCharacters(
                      e.target.value,
                      CHARACTER_LIMITS.DESCRIPTION
                    );
                    setDisplayConfig((prev) => ({
                      ...prev,
                      text: limitedValue,
                    }));
                    setFormData((prev) => ({
                      ...prev,
                      landingText: JSON.stringify({
                        ...displayConfig,
                        text: limitedValue,
                      }),
                    }));
                  }}
                  rows={3}
                  className="w-full text-sm p-2 border border-gray-200 rounded-md"
                  placeholder="Ingresa la descripción"
                  disabled={!displayConfig.showText}
                />
                {displayConfig.showText && (
                  <div className="flex justify-between items-center mt-1">
                    <span
                      className={`text-xs ${getCharacterCountClass(
                        displayConfig.text.length,
                        CHARACTER_LIMITS.DESCRIPTION
                      )}`}
                    >
                      {displayConfig.text.length}/{CHARACTER_LIMITS.DESCRIPTION}{" "}
                      caracteres
                    </span>
                    {displayConfig.text.length >=
                      CHARACTER_LIMITS.DESCRIPTION && (
                      <span className="text-xs text-red-500">
                        Límite alcanzado
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Columna 2: Imágenes Desktop y Mobile */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="space-y-6">
              {/* Sección de Imagen Desktop */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900 flex items-center gap-2">
                    Imagen Desktop
                    <div className="group relative">
                      <FaQuestionCircle className="text-rosa cursor-help" />
                      <div className="absolute left-0 top-6 z-10 w-96 rounded-md bg-white p-2 text-base text-gray-600 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                        Peso máximo de la imagen 5MB
                      </div>
                    </div>
                  </h3>
                </div>

                <div className="text-center">
                  {isMainImageUploaded ? (
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Tu fotografía{" "}
                        <span className="font-bold">
                          {fileName || "POST PIXELUP"}
                        </span>{" "}
                        ya ha sido cargada.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleClearImage(false)}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Cambiar Imagen Desktop
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-3 transition-colors cursor-pointer bg-white ${
                        imageValidationError.desktop
                          ? "border-red-300 hover:border-red-400 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className={`w-12 h-8 mb-4 ${
                            imageValidationError.desktop
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <p
                          className={`text-sm ${
                            imageValidationError.desktop
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {imageValidationError.desktop
                            ? "Error: Imagen no válida o muy pesada"
                            : "Subir imagen Desktop (PNG, JPG, GIF)"}
                        </p>
                        {imageValidationError.desktop && (
                          <p className="text-xs text-red-500 mt-1">
                            Máximo 5MB, formatos: PNG, JPG, WebP
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => handleImageChange(e, false)}
                  />
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Comentarios Adicionales */}
              <div
                className="mt-4 mb-4 flex items-center rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800  "
                role="alert"
              >
                <svg
                  className="me-3 inline h-4 w-4 shrink-0"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <div>
                  <span className="font-medium"></span> ¿No sabes cómo bajarle
                  el peso a tu imagen?
                  <div className="">
                    <button
                      onClick={handleOpenPesoImagenModal}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      Haz click aquí
                    </button>
                  </div>
                </div>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-200 my-6"></div>

              {/* Sección de Imagen Mobile */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-md font-medium text-gray-900 flex items-center gap-2">
                    Imagen Mobile
                    <div className="group relative">
                      <FaQuestionCircle className="text-rosa cursor-help" />
                      <div className="absolute left-0 top-6 z-10 w-96 rounded-md bg-white p-2 text-base text-gray-600 shadow-lg opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                        Peso máximo de la imagen 5MB
                      </div>
                    </div>
                  </h3>
                </div>

                <div className="text-center">
                  {isMobileImageUploaded ? (
                    <div className="flex flex-col items-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Tu fotografía mobile{" "}
                        <span className="font-bold">
                          {mobileFileName || "POST PIXELUP MOBILE"}
                        </span>{" "}
                        ya ha sido cargada.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleClearImage(true)}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Cambiar Imagen Mobile
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => mobileFileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-3 transition-colors cursor-pointer bg-white ${
                        imageValidationError.mobile
                          ? "border-red-300 hover:border-red-400 bg-red-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className={`w-12 h-8 mb-4 ${
                            imageValidationError.mobile
                              ? "text-red-400"
                              : "text-gray-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <p
                          className={`text-sm ${
                            imageValidationError.mobile
                              ? "text-red-600"
                              : "text-gray-500"
                          }`}
                        >
                          {imageValidationError.mobile
                            ? "Error: Imagen no válida o muy pesada"
                            : "Subir imagen Mobile (PNG, JPG, GIF)"}
                        </p>
                        {imageValidationError.mobile && (
                          <p className="text-xs text-red-500 mt-1">
                            Máximo 5MB, formatos: PNG, JPG, WebP
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={mobileFileInputRef}
                    onChange={(e) => handleImageChange(e, true)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna 3: Controles de Botones */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-md font-medium text-gray-900 mb-4">Botones</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700">Botón 1</label>
                  <Switch
                    checked={displayConfig.showButton1}
                    onChange={handleButton1Toggle}
                  />
                </div>
                <input
                  type="text"
                  value={displayConfig.button1Text}
                  onChange={(e) => {
                    const limitedValue = validateAndLimitCharacters(
                      e.target.value,
                      getButtonTextLimit(1)
                    );
                    setDisplayConfig((prev) => ({
                      ...prev,
                      button1Text: limitedValue,
                    }));
                  }}
                  className={`w-full text-sm p-2 border rounded-md mb-2 ${
                    displayConfig.showButton1 &&
                    displayConfig.button1Text.length > getButtonTextLimit(1)
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Texto del botón"
                  disabled={!displayConfig.showButton1}
                />
                {displayConfig.showButton1 && (
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-xs ${getCharacterCountClass(
                        displayConfig.button1Text.length,
                        getButtonTextLimit(1)
                      )}`}
                    >
                      {displayConfig.button1Text.length}/{getButtonTextLimit(1)}{" "}
                      caracteres
                    </span>
                    {displayConfig.button1Text.length >=
                      getButtonTextLimit(1) && (
                      <span className="text-xs text-red-500">
                        Límite alcanzado
                      </span>
                    )}
                  </div>
                )}
                {displayConfig.showButton1 &&
                  displayConfig.button1Text.length > getButtonTextLimit(1) && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      ⚠️ El texto excede el límite de {getButtonTextLimit(1)}{" "}
                      caracteres.
                      {displayConfig.showButton2
                        ? " Reduce el texto o desactiva el Botón 2 para permitir hasta 18 caracteres."
                        : " Reduce el texto para continuar."}
                    </div>
                  )}
                <input
                  type="text"
                  value={displayConfig.button1Link}
                  onChange={(e) => {
                    setDisplayConfig((prev) => ({
                      ...prev,
                      button1Link: e.target.value,
                    }));
                  }}
                  onBlur={(e) => {
                    const formattedLink = formatURL(e.target.value);
                    setDisplayConfig((prev) => ({
                      ...prev,
                      button1Link: formattedLink,
                    }));
                  }}
                  className="w-full text-sm p-2 border border-gray-200 rounded-md"
                  placeholder="Link del botón"
                  disabled={!displayConfig.showButton1}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm text-gray-700">Botón 2</label>
                  <Switch
                    checked={displayConfig.showButton2}
                    onChange={handleButton2Toggle}
                  />
                </div>
                <input
                  type="text"
                  value={displayConfig.button2Text}
                  onChange={(e) => {
                    const limitedValue = validateAndLimitCharacters(
                      e.target.value,
                      getButtonTextLimit(2)
                    );
                    setDisplayConfig((prev) => ({
                      ...prev,
                      button2Text: limitedValue,
                    }));
                  }}
                  className={`w-full text-sm p-2 border rounded-md mb-2 ${
                    displayConfig.showButton2 &&
                    displayConfig.button2Text.length > getButtonTextLimit(2)
                      ? "border-red-300 bg-red-50"
                      : "border-gray-200"
                  }`}
                  placeholder="Texto del botón"
                  disabled={!displayConfig.showButton2}
                />
                {displayConfig.showButton2 && (
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className={`text-xs ${getCharacterCountClass(
                        displayConfig.button2Text.length,
                        getButtonTextLimit(2)
                      )}`}
                    >
                      {displayConfig.button2Text.length}/{getButtonTextLimit(2)}{" "}
                      caracteres
                    </span>
                    {displayConfig.button2Text.length >=
                      getButtonTextLimit(2) && (
                      <span className="text-xs text-red-500">
                        Límite alcanzado
                      </span>
                    )}
                  </div>
                )}
                {displayConfig.showButton2 &&
                  displayConfig.button2Text.length > getButtonTextLimit(2) && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                      ⚠️ El texto excede el límite de {getButtonTextLimit(2)}{" "}
                      caracteres.
                      {displayConfig.showButton1
                        ? " Reduce el texto o desactiva el Botón 1 para permitir hasta 18 caracteres."
                        : " Reduce el texto para continuar."}
                    </div>
                  )}
                <input
                  type="text"
                  value={displayConfig.button2Link}
                  onChange={(e) => {
                    setDisplayConfig((prev) => ({
                      ...prev,
                      button2Link: e.target.value,
                    }));
                  }}
                  onBlur={(e) => {
                    const formattedLink = formatURL(e.target.value);
                    setDisplayConfig((prev) => ({
                      ...prev,
                      button2Link: formattedLink,
                    }));
                  }}
                  className="w-full text-sm p-2 border border-gray-200 rounded-md"
                  placeholder="Link del botón"
                  disabled={!displayConfig.showButton2}
                />
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <label className="text-sm text-gray-700">
                      Banner Clickeable
                    </label>
                    <p className="text-xs text-gray-500">
                      Todo el banner será un enlace
                    </p>
                  </div>
                  <Switch
                    checked={displayConfig.fullBannerLink}
                    onChange={handleFullBannerLinkToggle}
                  />
                </div>
                <input
                  type="text"
                  value={displayConfig.fullBannerLinkUrl}
                  onChange={(e) => {
                    setDisplayConfig((prev) => ({
                      ...prev,
                      fullBannerLinkUrl: e.target.value,
                    }));
                  }}
                  onBlur={(e) => {
                    const formattedLink = formatURL(e.target.value);
                    setDisplayConfig((prev) => ({
                      ...prev,
                      fullBannerLinkUrl: formattedLink,
                    }));
                  }}
                  className="w-full text-sm p-2 border border-gray-200 rounded-md"
                  placeholder="Link del banner completo"
                  disabled={!displayConfig.fullBannerLink}
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de Recorte Desktop */}
      {isDesktopModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Recortar Imagen Desktop
                </h2>
              </div>
              <button
                onClick={() => {
                  setMainImage(null);
                  setIsDesktopModalOpen(false);
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
                  image={mainImage || ""}
                  crop={cropDesktop}
                  zoom={zoomDesktop}
                  aspect={
                    parseFloat(desktopAspect.split("/")[0]) /
                    parseFloat(desktopAspect.split("/")[1])
                  }
                  onCropChange={setCropDesktop}
                  onZoomChange={setZoomDesktop}
                  onCropComplete={(croppedArea, croppedAreaPixels) =>
                    handleCropComplete(croppedArea, croppedAreaPixels, false)
                  }
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom
                  </label>
                  <input
                    type="range"
                    value={zoomDesktop}
                    min={1}
                    max={3}
                    step={0.01}
                    aria-labelledby="Zoom"
                    onChange={(e) => {
                      setZoomDesktop(parseFloat(e.target.value));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleCrop(false)}
                    className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recortar y Continuar
                  </button>
                  <button
                    onClick={() => {
                      setMainImage(null);
                      setIsDesktopModalOpen(false);
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

      {/* Modal de Recorte Mobile */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Recortar Imagen Mobile
                </h2>
              </div>
              <button
                onClick={() => {
                  setMobileImage(null);
                  setIsMobileModalOpen(false);
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
                  image={mobileImage || ""}
                  crop={cropMobile}
                  zoom={zoomMobile}
                  aspect={
                    parseFloat(mobileAspect.split("/")[0]) /
                    parseFloat(mobileAspect.split("/")[1])
                  }
                  onCropChange={setCropMobile}
                  onZoomChange={setZoomMobile}
                  onCropComplete={(croppedArea, croppedAreaPixels) =>
                    handleCropComplete(croppedArea, croppedAreaPixels, true)
                  }
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom
                  </label>
                  <input
                    type="range"
                    value={zoomMobile}
                    min={1}
                    max={3}
                    step={0.01}
                    aria-labelledby="Zoom"
                    onChange={(e) => {
                      setZoomMobile(parseFloat(e.target.value));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => handleCrop(true)}
                    className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recortar y Continuar
                  </button>
                  <button
                    onClick={() => {
                      setMobileImage(null);
                      setIsMobileModalOpen(false);
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

      {/* Modal de Confirmación de Borrado */}
      {isDeleteModalOpen && (
        <Modal
          showModal={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                ¿Estás seguro de que deseas eliminar este banner?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Esta acción no se puede deshacer. El banner será eliminado
                permanentemente.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteImage}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Eliminando...
                    </>
                  ) : (
                    "Sí, eliminar banner"
                  )}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Alerta para Banner Clickeable */}
      {isAlertModalOpen && (
        <Modal
          showModal={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se pueden activar los botones
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Debes desactivar el banner clickeable antes de poder activar los
                botones individuales.
              </p>
              <button
                onClick={() => setIsAlertModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Entendido
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de Peso de Imagen */}
      <ModalPesoImagen
        showModal={isPesoImagenModalOpen}
        onClose={() => setIsPesoImagenModalOpen(false)}
      />
    </div>
  );
};

export default BannerPrincipal01BO;
