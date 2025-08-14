"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Modal from "@/components/Core/Modals/ModalSeo"; // Asegúrate de importar el modal
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";
import Image from "next/image";
import { globalConfig } from "@/app/config/GlobalConfig";

// Cargar react-quill dinámicamente para evitar problemas de SSR (Server-Side Rendering)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface ConfigOptions {
  desktop: {
    showTitle: boolean;
    showLandingText: boolean;
    showButton: boolean;
    textAlignment: string;
    textContent: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
  mobile: {
    showTitle: boolean;
    showLandingText: boolean;
    showButton: boolean;
    textAlignment: string;
    textContent: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
}

const BannerAboutBO: React.FC<any> = () => {
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);

  // Obtener los aspectos de las imágenes desde la configuración global específica para BannerAbout
  const desktopAspect = globalConfig.bannerAboutAspects.desktop;
  const mobileAspect = globalConfig.bannerAboutAspects.mobile;

  // Estilos para la sombra del texto
  const shadowTextStyle = {
    textShadow: "0px 0px 8px rgba(0, 0, 0, 0.8)",
  };

  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImageHero, setMainImageHero] = useState<string | null>(null);
  // States for image cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formDataHero, setFormDataHero] = useState<any>({
    title: "pixelup.cl",
    landingText: "pixelup.cl",
    buttonLink: "pixelup.cl",
    buttonText: "pixelup.cl",
  });

  // Estado para las opciones de configuración
  const [configOptions, setConfigOptions] = useState<ConfigOptions>({
    desktop: {
      showTitle: true,
      showLandingText: true,
      showButton: true,
      textAlignment: "center",
      textContent: "",
      title: "",
      buttonText: "",
      buttonLink: "",
    },
    mobile: {
      showTitle: true,
      showLandingText: true,
      showButton: true,
      textAlignment: "center",
      textContent: "",
      title: "",
      buttonText: "",
      buttonLink: "",
    },
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [updatedBannerData, setUpdatedBannerData] = useState({
    title: "pixelup.cl",
    landingText: "pixelup.cl",
    buttonLink: "pixelup.cl",
    buttonText: "pixelup.cl",
    mainImageLink: "pixelup.cl",
    orderNumber: 1, // Modifica este valor según tu lógica
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const [originalFileName, setOriginalFileName] = useState<string>("");

  const MAX_CHARACTERS = 150;
  const ALERT_CHARACTERS = 150;
  const MAX_TITLE_CHARACTERS = 45;

  // Agregar nuevos estados para la imagen móvil
  const [previewImageHero, setPreviewImageHero] = useState<string | null>(null);
  const [isPreviewImageUploaded, setIsPreviewImageUploaded] = useState(false);
  const [isPreviewImageModalOpen, setIsPreviewImageModalOpen] = useState(false);

  // Agregar estado para controlar la vista previa
  const [previewMode, setPreviewMode] = useState<"desktop" | "tablet">(
    "desktop"
  );

  // Agregar nuevos estados para la imagen móvil
  const [mobileImageHero, setMobileImageHero] = useState<string | null>(null);
  const [isMobileImageUploaded, setIsMobileImageUploaded] = useState(false);
  const [isMobileImageModalOpen, setIsMobileImageModalOpen] = useState(false);

  // Estado para controlar qué vista se está editando (desktop o mobile)
  const [activeView, setActiveView] = useState<"desktop" | "mobile">("desktop");

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_BANNER_ABOUT_ID}`;

      // Obtener datos del banner base
      const bannerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          next: { revalidate: 0 },
        }
      );

      if (!bannerResponse.ok) {
        throw new Error(
          `Error en la petición del banner base: ${bannerResponse.status}`
        );
      }

      const bannerBaseData = await bannerResponse.json();
      console.log("Banner base:", bannerBaseData);

      // Obtener datos de las imágenes del banner
      const imagesResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
          next: { revalidate: 0 },
        }
      );

      if (!imagesResponse.ok) {
        throw new Error(
          `Error en la petición de imágenes: ${imagesResponse.status}`
        );
      }

      const imagesData = await imagesResponse.json();
      const bannerImage = imagesData.bannerImages[0];
      console.log("Banner image:", bannerImage);

      // Combinar los datos
      const combinedData = {
        ...bannerBaseData.banner,
        images: [bannerImage],
      };

      setBannerData([bannerImage]);

      // Intentar extraer la configuración del JSON en landingText del banner base
      let extractedConfig = {
        desktop: {
          showTitle: true,
          showLandingText: true,
          showButton: true,
          textAlignment: "center",
          textContent: bannerImage.landingText || "pixelup.cl",
          title: bannerBaseData.banner.title || "pixelup.cl",
          buttonText: bannerBaseData.banner.buttonText || "pixelup.cl",
          buttonLink: bannerBaseData.banner.buttonLink || "pixelup.cl",
        },
        mobile: {
          showTitle: true,
          showLandingText: true,
          showButton: true,
          textAlignment: "center",
          textContent: bannerImage.landingText || "pixelup.cl",
          title: bannerBaseData.banner.title || "pixelup.cl",
          buttonText: bannerBaseData.banner.buttonText || "pixelup.cl",
          buttonLink: bannerBaseData.banner.buttonLink || "pixelup.cl",
        },
      };

      try {
        // Verificar si landingText del banner base contiene un JSON válido
        if (
          bannerBaseData.banner.landingText &&
          bannerBaseData.banner.landingText.trim().startsWith("{")
        ) {
          const parsedConfig = JSON.parse(bannerBaseData.banner.landingText);
          if (parsedConfig && typeof parsedConfig === "object") {
            // Usar la configuración guardada y sincronizar mobile con desktop
            extractedConfig = {
              ...extractedConfig,
              ...parsedConfig,
              mobile: {
                ...parsedConfig.mobile,
                title: parsedConfig.desktop.title,
                textContent: parsedConfig.desktop.textContent,
                buttonText: parsedConfig.desktop.buttonText,
                buttonLink: parsedConfig.desktop.buttonLink,
                showTitle: parsedConfig.desktop.showTitle,
                showLandingText: parsedConfig.desktop.showLandingText,
                showButton: parsedConfig.desktop.showButton,
              },
            };
          }
        }
      } catch (error) {
        console.error("Error al parsear la configuración JSON:", error);
      }

      // Actualizar configOptions con los datos extraídos
      setConfigOptions(extractedConfig);

      // Actualizar formDataHero con los datos del banner
      setFormDataHero({
        title: extractedConfig.desktop.title,
        landingText: extractedConfig.desktop.textContent,
        buttonLink: extractedConfig.desktop.buttonLink,
        buttonText: extractedConfig.desktop.buttonText,
        mainImageLink: bannerImage.mainImageLink,
        orderNumber: bannerImage.orderNumber,
        mainImage: bannerImage.mainImage,
        mobileImage: bannerImage.mobileImage,
      });

      // Establecer las imágenes si existen
      if (bannerImage.mainImage?.url) {
        setMainImageHero(bannerImage.mainImage.url);
      }
      if (bannerImage.mobileImage?.url) {
        setMobileImageHero(bannerImage.mobileImage.url);
      }
    } catch (error) {
      console.error("Error al obtener los datos del banner:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataHero({ ...formDataHero, [name]: value });
  };

  const handleEditorChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      setFormDataHero({ ...formDataHero, landingText: value });
      setConfigOptions({
        ...configOptions,
        desktop: {
          ...configOptions.desktop,
          textContent: value,
        },
      });
    }
  };

  // Función para actualizar las opciones de configuración
  const handleConfigChange = (name: string, value: any) => {
    // Manejar rutas anidadas como "desktop.showTitle"
    if (name.includes(".")) {
      const [section, property] = name.split(".");
      setConfigOptions((prevConfigOptions) => ({
        ...prevConfigOptions,
        [section]: {
          ...prevConfigOptions[section as keyof typeof prevConfigOptions],
          [property]: value,
        },
        // Sincronizar mobile con desktop para todas las propiedades
        ...(section === "desktop" && {
          mobile: {
            ...prevConfigOptions.mobile,
            [property]: value,
          },
        }),
      }));
    } else {
      // Para propiedades de nivel superior (si las hay)
      setConfigOptions((prevConfigOptions) => ({
        ...prevConfigOptions,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validar si el texto descriptivo supera el límite de caracteres
    const textContentLength = configOptions.desktop.textContent.length;
    if (textContentLength > MAX_CHARACTERS) {
      setIsAlertModalOpen(true); // Mostrar el modal de alerta
      return; // Evitar el envío del formulario
    }
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_BANNER_ABOUT_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_BANNER_ABOUT_IMGID}`;

      // Sincronizar los valores de mobile con desktop
      const updatedConfig = {
        ...configOptions,
        mobile: {
          ...configOptions.mobile,
          title: configOptions.desktop.title,
          textContent: configOptions.desktop.textContent,
          buttonText: configOptions.desktop.buttonText || "Ver más", // Valor por defecto
          buttonLink: configOptions.desktop.buttonLink || "/", // Valor por defecto
          showTitle: configOptions.desktop.showTitle,
          showLandingText: configOptions.desktop.showLandingText,
          showButton: configOptions.desktop.showButton,
        },
      };

      // Crear un JSON con la configuración
      const configJSON = JSON.stringify(updatedConfig);

      // Primero, actualizar el banner base para guardar la configuración JSON en landingText
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: formDataHero.title,
            landingText: configJSON, // Guardar la configuración como JSON en landingText del banner base
            buttonText: formDataHero.buttonText || "Ver más", // Valor por defecto
            buttonLink: formDataHero.buttonLink || "/", // Valor por defecto
          }),
          cache: "no-store",
          next: { revalidate: 0 },
        }
      );

      // Preparar los datos para actualizar la imagen del banner
      const updateData = {
        ...formDataHero,
        landingText: formDataHero.landingText, // Solo guardar el contenido del texto en la imagen
        orderNumber: formDataHero.orderNumber,
        buttonText: formDataHero.buttonText || "Ver más", // Valor por defecto
        buttonLink: formDataHero.buttonLink || "/", // Valor por defecto
      };

      // Eliminar ambas imágenes del objeto base
      delete updateData.mainImage;
      delete updateData.mobileImage;

      // Agregar solo las imágenes que han sido modificadas
      if (isMainImageUploaded) {
        updateData.mainImage = formDataHero.mainImage;
      }
      if (isMobileImageUploaded) {
        updateData.mobileImage = formDataHero.mobileImage;
      }

      // Actualizar la imagen del banner
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
          cache: "no-store",
          next: { revalidate: 0 },
        }
      );

      if (!response.ok) {
        throw new Error(`Error en la petición: ${response.status}`);
      }

      fetchBannerHome();
    } catch (error) {
      console.error("Error updating banner:", error);
    } finally {
      setLoading(false);
      setIsMainImageUploaded(false);
      setIsMobileImageUploaded(false);
    }
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    imageKey: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name); // Guardar el nombre del archivo original
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);

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
        setIsModalOpen(true); // Abrir el modal para recortar la imagen
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null); // Limpiar la imagen seleccionada
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Prevenir comportamiento predeterminado del Tab
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

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
        maxSizeMB: 1,
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 1,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: originalFileName, // Usar el nombre del archivo original
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      setFormDataHero((prevFormDataHero: any) => ({
        ...prevFormDataHero,
        mainImage: imageInfo,
      }));
      setMainImageHero(base64);
      setIsModalOpen(false);
      setIsMainImageUploaded(true);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  const handlePreviewImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setPreviewImageHero(result);
        setIsPreviewImageModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePreviewCrop = async () => {
    if (!previewImageHero) return;

    try {
      const croppedImage = await getCroppedImg(
        previewImageHero,
        croppedAreaPixels
      );
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
        initialQuality: 1,
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
        previewImage: imageInfo,
      }));
      setPreviewImageHero(base64);
      setIsPreviewImageModalOpen(false);
      setIsPreviewImageUploaded(true);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  const handleClearPreviewImage = () => {
    setPreviewImageHero(null);
    setIsPreviewImageUploaded(false);
    setFormDataHero((prevFormDataHero: any) => ({
      ...prevFormDataHero,
      previewImage: {
        name: "",
        type: "",
        size: null,
        data: "",
      },
    }));
  };

  const handleMobileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMobileImageHero(result);
        setIsMobileImageUploaded(true);
        setIsMobileImageModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMobileCrop = async () => {
    if (!mobileImageHero) return;

    try {
      const croppedImage = await getCroppedImg(
        mobileImageHero,
        croppedAreaPixels
      );
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
        initialQuality: 1,
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
        mobileImage: imageInfo,
      }));
      setMobileImageHero(base64);
      setIsMobileImageModalOpen(false);
      setIsMobileImageUploaded(true);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  const handleClearMobileImage = () => {
    setMobileImageHero(null);
    setIsMobileImageUploaded(false);
    setFormDataHero((prevFormDataHero: any) => ({
      ...prevFormDataHero,
      mobileImage: {
        name: "",
        type: "",
        size: null,
        data: "",
      },
    }));
  };

  // Función para manejar el cambio de imagen principal (desktop)
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOriginalFileName(file.name); // Asegurar que el nombre del archivo se guarde
      const reader = new FileReader();
      reader.onload = () => {
        setMainImageHero(reader.result as string);
        setFormDataHero((prevFormDataHero: any) => ({
          ...prevFormDataHero,
          mainImage: {
            ...prevFormDataHero.mainImage,
            name: file.name, // Asignar el nombre del archivo
          },
        }));
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const ImagePreview = ({
    src,
    alt = "Preview",
  }: {
    src: string;
    alt?: string;
  }) => {
    return (
      <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("Error al cargar la imagen");
            e.currentTarget.src = "/placeholder-image.jpg";
          }}
        />
      </div>
    );
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
    <div className="w-full">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 p-6 bg-white rounded-lg shadow">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
          >
            {/* Vista previa y selector de vista */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <div
                className="relative w-full overflow-hidden rounded-lg shadow-lg border border-gray-200"
                style={{
                  aspectRatio:
                    activeView === "desktop" ? desktopAspect : mobileAspect,
                  maxWidth: activeView === "mobile" ? "720px" : "100%",
                  maxHeight: activeView === "mobile" ? "400px" : "400px",
                  margin: activeView === "mobile" ? "0 auto" : "0",
                }}
              >
                <img
                  src={
                    activeView === "desktop"
                      ? mainImageHero || "/placeholder.png"
                      : mobileImageHero || "/placeholder.png"
                  }
                  alt="Banner preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Overlay y texto - solo mostrar si al menos un elemento está activado */}
                {(configOptions.desktop.showTitle ||
                  configOptions.desktop.showLandingText ||
                  configOptions.desktop.showButton) && (
                  <div className="absolute inset-0 flex flex-col justify-center px-6 py-6 bg-black bg-opacity-40 w-full">
                    <div className="w-full max-w-[95%] mx-auto px-4">
                      <div
                        className={`${
                          activeView === "desktop"
                            ? configOptions.desktop.textAlignment === "center"
                              ? "text-center mx-auto max-w-3xl"
                              : configOptions.desktop.textAlignment === "right"
                              ? "text-right ml-auto max-w-2xl"
                              : "text-left max-w-2xl"
                            : configOptions.desktop.textAlignment === "center"
                            ? "text-center mx-auto"
                            : configOptions.desktop.textAlignment === "right"
                            ? "text-right ml-auto max-w-xs"
                            : "text-left max-w-xs"
                        }`}
                      >
                        {configOptions.desktop.showTitle && (
                          <h2
                            className={`${
                              activeView === "desktop"
                                ? "text-3xl md:text-4xl"
                                : "text-2xl md:text-3xl"
                            } font-bold text-white mb-3 drop-shadow-lg`}
                            style={shadowTextStyle}
                          >
                            {configOptions.desktop.title}
                          </h2>
                        )}
                        {configOptions.desktop.showLandingText && (
                          <p
                            className={`${
                              activeView === "desktop" ? "text-lg" : "text-base"
                            } text-white mb-4 drop-shadow-lg`}
                            style={shadowTextStyle}
                          >
                            {configOptions.desktop.textContent}
                          </p>
                        )}
                        {configOptions.desktop.showButton && (
                          <div>
                            <button
                              className={`inline-block px-${
                                activeView === "desktop" ? "6" : "5"
                              } py-${
                                activeView === "desktop" ? "3" : "2.5"
                              } bg-white text-black rounded-md shadow-md font-medium`}
                            >
                              {configOptions.desktop.buttonText}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Botones de vista */}
            <div className="flex justify-center gap-4">
              <button
                className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                  activeView === "desktop"
                    ? "bg-primary text-secondary"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView("desktop");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                  />
                </svg>
                Desktop
              </button>
              <button
                className={`px-4 py-2 rounded-full flex items-center gap-2 ${
                  activeView === "mobile"
                    ? "bg-primary text-secondary"
                    : "bg-gray-200 text-gray-700"
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView("mobile");
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3"
                  />
                </svg>
                Mobile
              </button>
            </div>
            {/* Botones de alineación */}
            <div className="flex gap-2 my-4">
              <button
                type="button"
                className={`flex-1 p-2 border rounded-md ${
                  configOptions[activeView].textAlignment === "left"
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() =>
                  handleConfigChange(`${activeView}.textAlignment`, "left")
                }
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
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 9.5H12"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 14.5H21"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 19.5H12"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={`flex-1 p-2 border rounded-md ${
                  configOptions[activeView].textAlignment === "center"
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() =>
                  handleConfigChange(`${activeView}.textAlignment`, "center")
                }
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
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 9.5H18"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 14.5H21"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 19.5H18"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <button
                type="button"
                className={`flex-1 p-2 border rounded-md ${
                  configOptions[activeView].textAlignment === "right"
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
                onClick={() =>
                  handleConfigChange(`${activeView}.textAlignment`, "right")
                }
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
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 9.5H21"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3 14.5H21"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 19.5H21"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Carga de imágenes */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-4">
                  {/* Imagen Desktop */}
                  <div className="flex-1">
                    <label className="font-medium text-gray-700 mb-2 block">
                      Imagen para escritorio
                    </label>
                    {mainImageHero ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-600">Imagen cargada</p>
                        <button
                          type="button"
                          onClick={() => handleClearImage(setMainImageHero)}
                          className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors w-fit"
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="desktop-image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                            Seleccionar imagen
                          </p>
                        </div>
                        <input
                          id="desktop-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMainImageChange(e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Imagen Mobile */}
                  <div className="flex-1">
                    <label className="font-medium text-gray-700 mb-2 block">
                      Imagen para móvil
                    </label>
                    {mobileImageHero ? (
                      <div className="flex flex-col gap-2">
                        <p className="text-sm text-gray-600">Imagen cargada</p>
                        <button
                          type="button"
                          onClick={handleClearMobileImage}
                          className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors w-fit"
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor="mobile-image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                            Seleccionar imagen
                          </p>
                        </div>
                        <input
                          id="mobile-image-upload"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMobileImageChange(e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido del banner */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Contenido del banner */}
              <div className="flex-1 bg-gray-50 p-5 rounded-lg">
                <div className="flex flex-col gap-4">
                  {/* Título */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="title"
                        className="font-medium text-gray-700"
                      >
                        Título
                      </label>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="showTitle"
                          checked={configOptions.desktop.showTitle}
                          onChange={(e) =>
                            handleConfigChange(
                              "desktop.showTitle",
                              e.target.checked
                            )
                          }
                          className="opacity-0 w-0 h-0"
                        />
                        <span
                          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
                            configOptions.desktop.showTitle
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                          onClick={() =>
                            handleConfigChange(
                              "desktop.showTitle",
                              !configOptions.desktop.showTitle
                            )
                          }
                        >
                          <span
                            className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all duration-300 ${
                              configOptions.desktop.showTitle
                                ? "transform translate-x-6"
                                : ""
                            }`}
                          ></span>
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={configOptions.desktop.title}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= MAX_TITLE_CHARACTERS) {
                          handleConfigChange("desktop.title", value);
                          if (formDataHero.title !== value) {
                            setFormDataHero({
                              ...formDataHero,
                              title: value,
                            });
                          }
                        }
                      }}
                      className={`px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        !configOptions.desktop.showTitle ? "opacity-50" : ""
                      }`}
                      placeholder="Ingresa el título del banner"
                      disabled={!configOptions.desktop.showTitle}
                      maxLength={MAX_TITLE_CHARACTERS}
                    />
                    <p
                      className={`text-sm ${
                        configOptions.desktop.title.length >
                        MAX_TITLE_CHARACTERS
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {`${configOptions.desktop.title.length}/${MAX_TITLE_CHARACTERS} caracteres`}
                    </p>
                  </div>

                  {/* Texto descriptivo */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="landingText"
                        className="font-medium text-gray-700"
                      >
                        Texto descriptivo
                      </label>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="showLandingText"
                          checked={configOptions.desktop.showLandingText}
                          onChange={(e) =>
                            handleConfigChange(
                              "desktop.showLandingText",
                              e.target.checked
                            )
                          }
                          className="opacity-0 w-0 h-0"
                        />
                        <span
                          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
                            configOptions.desktop.showLandingText
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                          onClick={() =>
                            handleConfigChange(
                              "desktop.showLandingText",
                              !configOptions.desktop.showLandingText
                            )
                          }
                        >
                          <span
                            className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all duration-300 ${
                              configOptions.desktop.showLandingText
                                ? "transform translate-x-6"
                                : ""
                            }`}
                          ></span>
                        </span>
                      </div>
                    </div>
                    <textarea
                      id="landingText"
                      name="landingText"
                      value={configOptions.desktop.textContent}
                      onChange={(e) => {
                        handleConfigChange(
                          "desktop.textContent",
                          e.target.value
                        );
                        if (formDataHero.landingText !== e.target.value) {
                          setFormDataHero({
                            ...formDataHero,
                            landingText: e.target.value,
                          });
                        }
                      }}
                      className={`px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                        !configOptions.desktop.showLandingText
                          ? "opacity-50"
                          : ""
                      }`}
                      rows={4}
                      placeholder="Ingresa el texto descriptivo del banner"
                      disabled={!configOptions.desktop.showLandingText}
                    />
                    <p
                      className={`text-sm ${
                        configOptions.desktop.textContent.length >
                        ALERT_CHARACTERS
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {`${configOptions.desktop.textContent.length}/${MAX_CHARACTERS} caracteres`}
                    </p>
                  </div>

                  {/* Texto del botón */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="buttonText"
                        className="font-medium text-gray-700"
                      >
                        Texto del botón
                      </label>
                      <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                        <input
                          type="checkbox"
                          id="showButton"
                          checked={configOptions.desktop.showButton}
                          onChange={(e) =>
                            handleConfigChange(
                              "desktop.showButton",
                              e.target.checked
                            )
                          }
                          className="opacity-0 w-0 h-0"
                        />
                        <span
                          className={`absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-full transition-all duration-300 ${
                            configOptions.desktop.showButton
                              ? "bg-blue-600"
                              : "bg-gray-300"
                          }`}
                          onClick={() =>
                            handleConfigChange(
                              "desktop.showButton",
                              !configOptions.desktop.showButton
                            )
                          }
                        >
                          <span
                            className={`absolute h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition-all duration-300 ${
                              configOptions.desktop.showButton
                                ? "transform translate-x-6"
                                : ""
                            }`}
                          ></span>
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="w-full">
                        <input
                          type="text"
                          id="buttonText"
                          name="buttonText"
                          value={configOptions.desktop.buttonText}
                          onChange={(e) => {
                            handleConfigChange(
                              "desktop.buttonText",
                              e.target.value
                            );
                            if (formDataHero.buttonText !== e.target.value) {
                              setFormDataHero({
                                ...formDataHero,
                                buttonText: e.target.value,
                              });
                            }
                          }}
                          className={`w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                            !configOptions.desktop.showButton
                              ? "opacity-50"
                              : ""
                          }`}
                          placeholder="Texto del botón"
                          disabled={!configOptions.desktop.showButton}
                        />
                      </div>
                      <div className="w-full">
                        <input
                          type="text"
                          id="buttonLink"
                          name="buttonLink"
                          value={configOptions.desktop.buttonLink}
                          onChange={(e) => {
                            handleConfigChange(
                              "desktop.buttonLink",
                              e.target.value
                            );
                            if (formDataHero.buttonLink !== e.target.value) {
                              setFormDataHero({
                                ...formDataHero,
                                buttonLink: e.target.value,
                              });
                            }
                          }}
                          className={`w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                            !configOptions.desktop.showButton
                              ? "opacity-50"
                              : ""
                          }`}
                          placeholder="Enlace del botón (ej: /productos)"
                          disabled={!configOptions.desktop.showButton}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6 border-t pt-6">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-primary text-secondary rounded-md hover:bg-secondary hover:text-primary transition-colors shadow-md flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                    Guardando...
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
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal para recortar imagen */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Recortar Imagen
                </h2>
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
                  aspect={
                    activeView === "desktop"
                      ? eval(desktopAspect)
                      : eval(mobileAspect)
                  }
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

      {/* Modal para recortar imagen móvil */}
      {isMobileImageModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Recortar Imagen Móvil
                </h2>
              </div>
              <button
                onClick={() => {
                  setMobileImageHero(null);
                  setIsMobileImageModalOpen(false);
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
                  image={mobileImageHero || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={eval(mobileAspect)}
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
                    onClick={handleMobileCrop}
                    className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recortar y Continuar
                  </button>
                  <button
                    onClick={() => {
                      setMobileImageHero(null);
                      setIsMobileImageModalOpen(false);
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

      {/* Modal de alerta para texto descriptivo */}
      {isAlertModalOpen && (
        <Modal
          showModal={isAlertModalOpen}
          onClose={() => setIsAlertModalOpen(false)}
          title="Alerta de caracteres"
        >
          <div className="p-4">
            <p className="text-gray-700">
              El texto descriptivo supera el límite de caracteres permitido.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAlertModalOpen(false)}
                className="px-4 py-2 bg-dark text-white rounded-md hover:bg-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BannerAboutBO;
