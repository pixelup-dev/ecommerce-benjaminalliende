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
import { Switch } from "@/components/Core/Switch";
import { toast } from "react-hot-toast";
import Link from "next/link";
import PopVisual from "./Popupvisual";

interface ParallaxBannerImage {
  id: string;
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
  mainImageLink: string;
  orderNumber: number;
  mainImage?: any;
}

interface ParallaxButtonTextData {
  price: string;
  value: string;
  show: boolean;
}

interface ParallaxDisplayConfig {
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
}

interface ParallaxBannerData {
  images: ParallaxBannerImage[];
}

const Popup: React.FC = () => {
  const [parallaxFileName, setParallaxFileName] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [enablePopup, setEnablePopup] = useState<boolean>(false);
  const [popupConfig, setPopupConfig] = useState<{ enabled: boolean } | null>(null);
  const [pendingChanges, setPendingChanges] = useState<{ enabled: boolean } | null>(null);

  const [isParallaxMainImageUploaded, setIsParallaxMainImageUploaded] = useState(false);
  const [isParallaxAddingImage, setIsParallaxAddingImage] = useState<boolean>(false);
  const parallaxFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isParallaxPreviewImageUploaded, setIsParallaxPreviewImageUploaded] = useState(false);
  const [parallaxBannerData, setParallaxBannerData] = useState<ParallaxBannerImage[]>([]);
  const [parallaxCurrentIndex, setParallaxCurrentIndex] = useState<number>(0);
  const [parallaxFormData, setParallaxFormData] = useState<ParallaxBannerImage>({
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
  });
  const [parallaxLoading, setParallaxLoading] = useState<boolean>(true);
  const [parallaxSkeletonLoading, setParallaxSkeletonLoading] = useState<boolean>(true);
  const [parallaxMainImage, setParallaxMainImage] = useState<string | null>(null);

  const [parallaxCrop, setParallaxCrop] = useState({ x: 0, y: 0 });
  const [parallaxZoom, setParallaxZoom] = useState(1);
  const [parallaxCroppedAreaPixels, setParallaxCroppedAreaPixels] = useState<any>(null);
  const [isParallaxModalOpen, setIsParallaxModalOpen] = useState(false);
  const [isParallaxDeleteModalOpen, setIsParallaxDeleteModalOpen] = useState(false);

  const [parallaxButtonTextData, setParallaxButtonTextData] = useState<ParallaxButtonTextData>({
    price: "",
    value: "",
    show: false,
  });

  const [showParallaxControlPanel, setShowParallaxControlPanel] = useState(true);

  const [parallaxDisplayConfig, setParallaxDisplayConfig] = useState<ParallaxDisplayConfig>({
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

  const PARALLAX_DEFAULT_TITLE = "Banner";
  const PARALLAX_DEFAULT_BUTTON_LINK = "#";

  const [isParallaxPreviewExpanded, setIsParallaxPreviewExpanded] = useState(false);
  const [isParallaxPreviewVisible, setIsParallaxPreviewVisible] = useState(true);

  const [isParallaxAlertModalOpen, setIsParallaxAlertModalOpen] = useState(false);

  const parseParallaxButtonTextData = (buttonText: string): ParallaxButtonTextData => {
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

  const fetchParallaxHome = async () => {
    try {
      setParallaxLoading(true);
      setParallaxSkeletonLoading(true);
      const token = getCookie("AdminTokenAuth");
      const parallaxId = `${process.env.NEXT_PUBLIC_POPUP_BANNER_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${parallaxId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Asegurar que cada imagen tenga los valores por defecto si están vacíos
      const imagesWithDefaults = response.data.bannerImages.map(
        (image: ParallaxBannerImage) => ({
          ...image,
          title: image.title || PARALLAX_DEFAULT_TITLE,
          buttonLink: image.buttonLink || PARALLAX_DEFAULT_BUTTON_LINK,
          mainImageLink: image.mainImageLink || "#",
        })
      );

      setParallaxBannerData(imagesWithDefaults);
      if (imagesWithDefaults.length > 0) {
        const initialImage = imagesWithDefaults[0];
        const parsedButtonText = parseParallaxButtonTextData(initialImage.buttonText);
        setParallaxButtonTextData(parsedButtonText);
        const parsedLandingText = parseParallaxDisplayConfig(initialImage.landingText);
        setParallaxDisplayConfig(parsedLandingText);
        setParallaxFormData({
          ...initialImage,
          title: initialImage.title || PARALLAX_DEFAULT_TITLE,
          buttonLink: initialImage.buttonLink || PARALLAX_DEFAULT_BUTTON_LINK,
          mainImageLink: initialImage.mainImageLink || "#",
        });
        setParallaxMainImage(initialImage.mainImage.url || initialImage.mainImage.data);
      }
    } catch (error) {
      console.error("Error al obtener los datos del banner:", error);
    } finally {
      setParallaxLoading(false);
      setParallaxSkeletonLoading(false);
    }
  };

  const fetchPopupConfig = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = process.env.NEXT_PUBLIC_POPUP_CONTENTBLOCK;
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.contentBlock;
      let popupConfig;
      try {
        popupConfig = JSON.parse(data.contentText || '{"enabled": false}');
      } catch {
        popupConfig = { enabled: false };
      }

      setEnablePopup(popupConfig.enabled);
      setPopupConfig(data);
    } catch (error) {
      console.error("Error al obtener la configuración del popup:", error);
      toast.error("Error al obtener la configuración del popup.");
    }
  };

  useEffect(() => {
    fetchParallaxHome();
    fetchPopupConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleParallaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParallaxFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleParallaxImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setParallaxFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setParallaxMainImage(result);
        setIsParallaxModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleParallaxCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setParallaxCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleParallaxCrop = async () => {
    if (!parallaxMainImage) return;

    try {
      const croppedImage = await getCroppedImg(parallaxMainImage, parallaxCroppedAreaPixels);
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
        name: parallaxFileName || "banner-image.jpg",
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      setParallaxFormData((prevFormData) => ({
        ...prevFormData,
        mainImage: imageInfo,
      }));

      setParallaxMainImage(base64);
      setIsParallaxModalOpen(false);
      setIsParallaxMainImageUploaded(true);
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

  const handleParallaxClearImage = () => {
    setParallaxMainImage(null);
    setIsParallaxMainImageUploaded(false);
    setParallaxFormData((prev) => ({
      ...prev,
      mainImage: {
        url: "",
        name: "",
        type: "",
        size: null,
        data: "",
      },
    }));
    if (parallaxFileInputRef.current) {
      parallaxFileInputRef.current.value = "";
    }
  };

  const handleParallaxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleParallaxSubmit llamado");
    try {
      setParallaxLoading(true);
      const token = getCookie("AdminTokenAuth");
      if (!token) {
        toast.error("No se encontró el token de autenticación");
        return;
      }

      const parallaxId = `${process.env.NEXT_PUBLIC_POPUP_BANNER_ID}`;
      if (!parallaxId) {
        toast.error("No se encontró el ID del banner");
        return;
      }

      // Asegurarse de que la URL del banner clickeable esté formateada
      const formattedFullBannerLinkUrl = parallaxDisplayConfig.fullBannerLink
        ? formatURL(parallaxDisplayConfig.fullBannerLinkUrl)
        : "";

      // Preparar los datos base a enviar
      const baseData = {
        title:
          parallaxFormData.title === PARALLAX_DEFAULT_TITLE || !parallaxFormData.title
            ? PARALLAX_DEFAULT_TITLE
            : parallaxFormData.title,
        landingText: JSON.stringify({
          ...parallaxDisplayConfig,
          fullBannerLinkUrl: formattedFullBannerLinkUrl,
        }),
        buttonText: JSON.stringify({
          price: parallaxButtonTextData.price || "",
          value: parallaxButtonTextData.value || "",
          show: parallaxButtonTextData.show,
        }),
        buttonLink:
          parallaxFormData.buttonLink === PARALLAX_DEFAULT_BUTTON_LINK || !parallaxFormData.buttonLink
            ? PARALLAX_DEFAULT_BUTTON_LINK
            : parallaxFormData.buttonLink,
        mainImageLink: parallaxFormData.mainImageLink || "#",
        orderNumber: parallaxFormData.orderNumber,
      };

      // Solo incluir la imagen si ha sido modificada
      const dataToSend = isParallaxMainImageUploaded
        ? { ...baseData, mainImage: parallaxFormData.mainImage }
        : baseData;

      console.log("Datos a enviar:", dataToSend);

      const url = isParallaxAddingImage
        ? `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${parallaxId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        : `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${parallaxId}/images/${parallaxFormData.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

      const response = await axios({
        method: isParallaxAddingImage ? "POST" : "PUT",
        url,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: dataToSend,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success(
          isParallaxAddingImage
            ? "Banner creado exitosamente"
            : "Banner actualizado exitosamente"
        );
        await fetchParallaxHome();
        if (isParallaxAddingImage) {
          setIsParallaxAddingImage(false);
        }
        // Resetear el estado de la imagen después de un guardado exitoso
        setIsParallaxMainImageUploaded(false);
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
            (isParallaxAddingImage
              ? "Error al crear el banner. Por favor, intente nuevamente."
              : "Error al actualizar el banner. Por favor, intente nuevamente.")
        );
      } else {
        toast.error(
          isParallaxAddingImage
            ? "Error al crear el banner. Por favor, intente nuevamente."
            : "Error al actualizar el banner. Por favor, intente nuevamente."
        );
      }
    } finally {
      setParallaxLoading(false);
    }
  };

  const handleParallaxDeleteImage = async () => {
    try {
      setParallaxLoading(true);
      const token = getCookie("AdminTokenAuth");

      const parallaxId = `${process.env.NEXT_PUBLIC_POPUP_BANNER_ID}`;
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${parallaxId}/images/${parallaxFormData.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Banner eliminado exitosamente");
      setIsParallaxDeleteModalOpen(false);
      fetchParallaxHome();
    } catch (error) {
      console.error("Error al borrar la imagen del banner:", error);
      toast.error(
        "Error al eliminar el banner. Por favor, intente nuevamente."
      );
    } finally {
      setParallaxLoading(false);
    }
  };

  const handleParallaxNextImage = async () => {
    setParallaxSkeletonLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const nextIndex = (parallaxCurrentIndex + 1) % parallaxBannerData.length;
    const nextImage = parallaxBannerData[nextIndex];

    const nextConfig = parseParallaxDisplayConfig(nextImage.landingText);
    setParallaxDisplayConfig(nextConfig);

    // Parsear y validar el buttonText
    const parsedButtonText = parseParallaxButtonTextData(nextImage.buttonText);
    setParallaxButtonTextData(parsedButtonText);

    setParallaxCurrentIndex(nextIndex);
    setParallaxFormData({
      ...nextImage,
      title: nextImage.title || PARALLAX_DEFAULT_TITLE,
      buttonLink: nextImage.buttonLink || PARALLAX_DEFAULT_BUTTON_LINK,
      mainImageLink: nextImage.mainImageLink || "#",
    });
    setParallaxMainImage(nextImage.mainImage.url || nextImage.mainImage.data);
    setIsParallaxMainImageUploaded(false);
    setParallaxSkeletonLoading(false);
  };

  const handleParallaxPrevImage = async () => {
    setParallaxSkeletonLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    const prevIndex =
      (parallaxCurrentIndex - 1 + parallaxBannerData.length) % parallaxBannerData.length;
    const prevImage = parallaxBannerData[prevIndex];

    const prevConfig = parseParallaxDisplayConfig(prevImage.landingText);
    setParallaxDisplayConfig(prevConfig);

    // Parsear y validar el buttonText
    const parsedButtonText = parseParallaxButtonTextData(prevImage.buttonText);
    setParallaxButtonTextData(parsedButtonText);

    setParallaxCurrentIndex(prevIndex);
    setParallaxFormData({
      ...prevImage,
      title: prevImage.title || PARALLAX_DEFAULT_TITLE,
      buttonLink: prevImage.buttonLink || PARALLAX_DEFAULT_BUTTON_LINK,
      mainImageLink: prevImage.mainImageLink || "#",
    });
    setParallaxMainImage(prevImage.mainImage.url || prevImage.mainImage.data);
    setIsParallaxMainImageUploaded(false);
    setParallaxSkeletonLoading(false);
  };
  const handleParallaxAddImageClick = () => {
    if (isParallaxAddingImage) {
      // Si ya estamos en el estado de agregar, esto cancela la operación
      setParallaxFormData({
        id: parallaxBannerData[parallaxCurrentIndex]?.id || "",
        title: parallaxBannerData[parallaxCurrentIndex]?.title || PARALLAX_DEFAULT_TITLE,
        landingText: parallaxBannerData[parallaxCurrentIndex]?.landingText || "",
        buttonLink: parallaxBannerData[parallaxCurrentIndex]?.buttonLink || PARALLAX_DEFAULT_BUTTON_LINK,
        buttonText: parallaxBannerData[parallaxCurrentIndex]?.buttonText || "",
        mainImageLink: parallaxBannerData[parallaxCurrentIndex]?.mainImageLink || "#",
        orderNumber: parallaxBannerData[parallaxCurrentIndex]?.orderNumber || 1,
        mainImage: parallaxBannerData[parallaxCurrentIndex]?.mainImage || {
          url: "",
          name: "",
          type: "",
          size: null,
          data: "",
        },
      });
      setParallaxMainImage(
        parallaxBannerData[parallaxCurrentIndex]?.mainImage?.url ||
          parallaxBannerData[parallaxCurrentIndex]?.mainImage?.data ||
          null
      );
      setIsParallaxAddingImage(false);
      setIsParallaxMainImageUploaded(false);
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

      setParallaxFormData({
        id: "",
        title: PARALLAX_DEFAULT_TITLE,
        landingText: initialLandingText,
        buttonLink: PARALLAX_DEFAULT_BUTTON_LINK,
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
      });

      // Establecer la configuración inicial de visualización
      setParallaxDisplayConfig({
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

      // Establecer la configuración inicial del botón
      setParallaxButtonTextData({
        price: "",
        value: "",
        show: false,
      });

      setParallaxMainImage(null);
      setIsParallaxAddingImage(true);
      parallaxFileInputRef.current?.click();
      setIsParallaxMainImageUploaded(false);
    }
  };

  const handleParallaxButtonTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setParallaxButtonTextData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
        show:
          Boolean(value) || Boolean(name === "price" ? prev.value : prev.price),
      };

      // Actualizar formData.buttonText con el nuevo JSON
      setParallaxFormData((prevForm) => ({
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

  // Modificar la función parseParallaxDisplayConfig
  const parseParallaxDisplayConfig = (landingText: string): ParallaxDisplayConfig => {
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
      };
    }
  };

  // Modificar la función updateParallaxDisplayConfig para que solo actualice el estado local
  const updateParallaxDisplayConfig = (updates: Partial<ParallaxDisplayConfig>) => {
    const newParallaxDisplayConfig = { ...parallaxDisplayConfig, ...updates };
    setParallaxDisplayConfig(newParallaxDisplayConfig);

    // Actualizar el formData.landingText con la nueva configuración
    setParallaxFormData((prev) => ({
      ...prev,
      landingText: JSON.stringify(newParallaxDisplayConfig),
    }));
  };

  // Modificar el manejo del checkbox para el título
  const handleParallaxTitleToggle = (checked: boolean) => {
    setParallaxFormData((prev) => ({
      ...prev,
      title: checked ? "" : PARALLAX_DEFAULT_TITLE,
    }));
  };

  // Modificar el manejo del checkbox para el buttonLink
  const handleParallaxButtonLinkToggle = (checked: boolean) => {
    setParallaxFormData((prev) => ({
      ...prev,
      buttonLink: checked ? "" : PARALLAX_DEFAULT_BUTTON_LINK,
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

  const handleParallaxFullBannerLinkToggle = (checked: boolean) => {
    if (checked && (parallaxDisplayConfig.showButton1 || parallaxDisplayConfig.showButton2)) {
      setIsParallaxAlertModalOpen(true);
      return;
    }
    updateParallaxDisplayConfig({ fullBannerLink: checked });
  };

  const handleParallaxButton1Toggle = (checked: boolean) => {
    if (checked && parallaxDisplayConfig.fullBannerLink) {
      setIsParallaxAlertModalOpen(true);
      return;
    }
    updateParallaxDisplayConfig({ showButton1: checked });
  };

  const handleParallaxButton2Toggle = (checked: boolean) => {
    if (checked && parallaxDisplayConfig.fullBannerLink) {
      setIsParallaxAlertModalOpen(true);
      return;
    }
    updateParallaxDisplayConfig({ showButton2: checked });
  };

  const handlePopupToggle = async (checked: boolean) => {
    setEnablePopup(checked);
    await updatePopupConfig(checked);
  };

  const handlePopupUpdate = async () => {
    if (!pendingChanges) return;
    
    await updatePopupConfig(pendingChanges.enabled);
    setPendingChanges(null);
  };

  const updatePopupConfig = async (enabled: boolean) => {
    if (!popupConfig) return;

    try {
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = process.env.NEXT_PUBLIC_POPUP_CONTENTBLOCK;
      const popupConfigData = {
        enabled: enabled
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "popup",
          contentText: JSON.stringify(popupConfigData),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Configuración del popup actualizada exitosamente.");
      setPopupConfig((prev) => ({
        ...prev!,
        contentText: JSON.stringify(popupConfigData),
      }));
    } catch (error) {
      console.error("Error al actualizar la configuración del popup:", error);
      toast.error("Error al actualizar la configuración del popup.");
    }
  };

  if (parallaxLoading) {
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
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuración de Popup
      </h2>
      {popupConfig ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between min-h-[2rem]">
                <label className="text-lg font-medium text-gray-700">
                  Habilitar Popup
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enablePopup}
                    onChange={(e) => handlePopupToggle(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Solo mostrar la configuración si el popup está habilitado */}
              {enablePopup && (
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Botones de acción principales */}
                  <div className="flex w-full mb-6">
                    <div className="flex gap-2">
                      {parallaxBannerData.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setIsParallaxDeleteModalOpen(true)}
                          className="py-2 px-4 rounded bg-red-600 hover:bg-red-700 text-white font-medium text-sm"
                        >
                          Borrar Banner
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2 ml-auto w-full">
                      <button
                        type="button"
                        onClick={() => setShowPreview(true)}
                        className="flex-1 py-2 px-4 rounded bg-gray-600 hover:bg-gray-700 text-white font-medium text-sm flex items-center justify-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Vista Previa
                      </button>

                      <button
                        type="submit"
                        form="parallaxForm"
                        disabled={parallaxLoading}
                        className="flex-1 py-2 px-4 rounded bg-primary hover:bg-secondary text-white font-medium text-sm flex items-center justify-center"
                      >
                        {parallaxLoading && (
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
                        {parallaxLoading
                          ? "Guardando..."
                          : isParallaxAddingImage
                          ? "Crear Banner"
                          : "Actualizar"}
                      </button>
                    </div>
                  </div>

                  {/* Panel de Control */}
                  <form
                    id="parallaxForm"
                    onSubmit={handleParallaxSubmit}
                    className="space-y-6"
                  >
                    {/* Grid de 3 columnas para los controles */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Columna 1: Controles de Contenido */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-md font-medium text-gray-900 mb-4">
                          Contenido
                        </h3>
                        <div className="space-y-4">
                          {/* Controles de alineación */}
                          <div>
                            <label className="text-sm text-gray-700 mb-2 block">
                              Alineación del contenido
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  updateParallaxDisplayConfig({ contentAlignment: "left" })
                                }
                                className={`flex-1 p-2 border rounded-md ${
                                  parallaxDisplayConfig.contentAlignment === "left"
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
                                  updateParallaxDisplayConfig({ contentAlignment: "center" })
                                }
                                className={`flex-1 p-2 border rounded-md ${
                                  parallaxDisplayConfig.contentAlignment === "center"
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
                                  updateParallaxDisplayConfig({ contentAlignment: "right" })
                                }
                                className={`flex-1 p-2 border rounded-md ${
                                  parallaxDisplayConfig.contentAlignment === "right"
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
                                  checked={parallaxFormData.buttonLink !== PARALLAX_DEFAULT_BUTTON_LINK}
                                  onChange={handleParallaxButtonLinkToggle}
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              name="buttonLink"
                              value={
                                parallaxFormData.buttonLink === PARALLAX_DEFAULT_BUTTON_LINK
                                  ? ""
                                  : parallaxFormData.buttonLink
                              }
                              onChange={handleParallaxChange}
                              className="w-full text-sm p-2 border border-gray-200 rounded-md"
                              placeholder="Ingresa el epígrafe"
                              disabled={parallaxFormData.buttonLink === PARALLAX_DEFAULT_BUTTON_LINK}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm text-gray-700">Título</label>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-1">Mostrar</span>
                                <Switch
                                  checked={parallaxFormData.title !== PARALLAX_DEFAULT_TITLE}
                                  onChange={handleParallaxTitleToggle}
                                />
                              </div>
                            </div>
                            <input
                              type="text"
                              name="title"
                              value={parallaxFormData.title === PARALLAX_DEFAULT_TITLE ? "" : parallaxFormData.title}
                              onChange={handleParallaxChange}
                              className="w-full text-sm p-2 border border-gray-200 rounded-md"
                              placeholder="Ingresa el título"
                              disabled={parallaxFormData.title === PARALLAX_DEFAULT_TITLE}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm text-gray-700">Descripción</label>
                              <div className="flex items-center">
                                <span className="text-xs text-gray-500 mr-1">Mostrar</span>
                                <Switch
                                  checked={parallaxDisplayConfig.showText}
                                  onChange={(checked) =>
                                    updateParallaxDisplayConfig({ showText: checked })
                                  }
                                />
                              </div>
                            </div>
                            <textarea
                              name="landingText"
                              value={parallaxDisplayConfig.text}
                              onChange={(e) => {
                                const newText = e.target.value;
                                setParallaxDisplayConfig((prev) => ({
                                  ...prev,
                                  text: newText,
                                }));
                                setParallaxFormData((prev) => ({
                                  ...prev,
                                  landingText: JSON.stringify({
                                    ...parallaxDisplayConfig,
                                    text: newText,
                                  }),
                                }));
                              }}
                              rows={3}
                              className="w-full text-sm p-2 border border-gray-200 rounded-md"
                              placeholder="Ingresa la descripción"
                              disabled={!parallaxDisplayConfig.showText}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Columna 2: Imagen y Precios */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {/* Sección de Imagen */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-md font-medium text-gray-900">
                              Imagen del Pop Up
                            </h3>
                          </div>

                          <div className="text-center">
                            {isParallaxMainImageUploaded ? (
                              <div className="flex flex-col items-center">
                                <p className="text-sm text-gray-600 mb-2">
                                  Tu fotografía{" "}
                                  <span className="font-bold">
                                    {parallaxFileName || "POST PIXELUP"}
                                  </span>{" "}
                                  ya ha sido cargada.
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                  Actualiza para ver los cambios.
                                </p>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (parallaxFileInputRef.current) {
                                      parallaxFileInputRef.current.click();
                                    }
                                  }}
                                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
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
                                  Seleccionar otra Imagen
                                </button>
                              </div>
                            ) : (
                              <div
                                onClick={() => parallaxFileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 transition-colors cursor-pointer bg-white"
                              >
                                <div className="flex flex-col items-center">
                                  <svg
                                    className="w-12 h-12 text-gray-400 mb-4"
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
                                  <p className="text-sm text-gray-500">
                                    PNG, JPG, GIF hasta 5MB
                                  </p>
                                </div>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={parallaxFileInputRef}
                              onChange={handleParallaxImageChange}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Columna 3: Controles de Botones */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-md font-medium text-gray-900 mb-4">Botón</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm text-gray-700">Botón 1</label>
                              <Switch
                                checked={parallaxDisplayConfig.showButton1}
                                onChange={handleParallaxButton1Toggle}
                              />
                            </div>
                            <input
                              type="text"
                              value={parallaxDisplayConfig.button1Text}
                              onChange={(e) => {
                                setParallaxDisplayConfig((prev) => ({
                                  ...prev,
                                  button1Text: e.target.value,
                                }));
                              }}
                              className="w-full text-sm p-2 border border-gray-200 rounded-md mb-2"
                              placeholder="Texto del botón"
                              disabled={!parallaxDisplayConfig.showButton1}
                            />
                            <input
                              type="text"
                              value={parallaxDisplayConfig.button1Link}
                              onChange={(e) => {
                                setParallaxDisplayConfig((prev) => ({
                                  ...prev,
                                  button1Link: e.target.value,
                                }));
                              }}
                              onBlur={(e) => {
                                const formattedLink = formatURL(e.target.value);
                                setParallaxDisplayConfig((prev) => ({
                                  ...prev,
                                  button1Link: formattedLink,
                                }));
                              }}
                              className="w-full text-sm p-2 border border-gray-200 rounded-md"
                              placeholder="Link del botón"
                              disabled={!parallaxDisplayConfig.showButton1}
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="text-sm text-gray-700">Botón Revelable</label>
                              <Switch
                                checked={parallaxDisplayConfig.showButton2}
                                onChange={handleParallaxButton2Toggle}
                              />
                            </div>
                            <input
                              type="text"
                              value={parallaxDisplayConfig.button2Text}
                              onChange={(e) => {
                                setParallaxDisplayConfig((prev) => ({
                                  ...prev,
                                  button2Text: e.target.value,
                                }));
                              }}
                              className="w-full text-sm p-2 border border-gray-200 rounded-md mb-2"
                              placeholder="Texto del botón"
                              disabled={!parallaxDisplayConfig.showButton2}
                            />
                            <input
                              type="text"
                              value={parallaxDisplayConfig.button2Link}
                              onChange={(e) => {
                                setParallaxDisplayConfig((prev) => ({
                                  ...prev,
                                  button2Link: e.target.value,
                                }));
                              }}
                              className="w-full text-sm p-2 border border-gray-200 rounded-md"
                              placeholder="Cupón de descuento"
                              disabled={!parallaxDisplayConfig.showButton2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Modal de Recorte */}
      {isParallaxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Recortar Imagen</h2>
              </div>
              <button
                onClick={() => {
                  setParallaxMainImage(null);
                  setIsParallaxModalOpen(false);
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
                  image={parallaxMainImage || ""}
                  crop={parallaxCrop}
                  zoom={parallaxZoom}
                  aspect={4 / 3}
                  onCropChange={setParallaxCrop}
                  onZoomChange={setParallaxZoom}
                  onCropComplete={handleParallaxCropComplete}
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom
                  </label>
                  <input
                    type="range"
                    value={parallaxZoom}
                    min={1}
                    max={3}
                    step={0.01}
                    aria-labelledby="Zoom"
                    onChange={(e) => {
                      setParallaxZoom(parseFloat(e.target.value));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleParallaxCrop}
                    className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recortar y Continuar
                  </button>
                  <button
                    onClick={() => {
                      setParallaxMainImage(null);
                      setIsParallaxModalOpen(false);
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

      {/* Modal de Alerta para Banner Clickeable */}
      {isParallaxAlertModalOpen && (
        <Modal
          showModal={isParallaxAlertModalOpen}
          onClose={() => setIsParallaxAlertModalOpen(false)}
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
                onClick={() => setIsParallaxAlertModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Entendido
              </button>
            </div>
          </div>
        </Modal>
      )}
      {showPreview && <PopVisual onClose={() => setShowPreview(false)} />}
    </div>
  );
};

export default Popup;
