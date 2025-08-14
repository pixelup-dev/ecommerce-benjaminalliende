"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";
import { useLogo } from "@/context/LogoContext";
import FooterPreview from "./FooterPreview";
import RedesSociales from "@/components/Core/RedesSociales/RedesSociales";
import { useSocialNetworks } from "@/context/SocialNetworksContext";
import { mainMenuConfig } from "@/app/config/menulinks";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";

interface FooterConfig {
  // Configuración general
  title: string;
  description: string;
  copyrightText: string;

  // Configuración de plantilla
  selectedTemplate: string;

  // Configuración de secciones
  showLogo: boolean;
  showMenuLinks: boolean; // Enlaces del menú principal
  showLinks: boolean; // Enlaces personalizados
  showCollections: boolean;
  showSocial: boolean;
  showDescription: boolean;

  // Configuración de estilo
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  logoSize: number; // Tamaño del logo (1-5)

  // Landing text para configuraciones avanzadas (JSON)
  landingText: string;

  // Configuración de enlaces personalizados
  customLinks: {
    title: string;
    url: string;
    enabled: boolean;
  }[];
}

// Nueva interfaz para las configuraciones del landingText
interface FooterDisplayConfig {
  backgroundImage: {
    enabled: boolean;
    url: string;
    overlay: {
      enabled: boolean;
      color: string;
      opacity: number;
    };
  };
}

const defaultConfig: FooterConfig = {
  title: "Footer",
  description: "Descripción del footer",
  copyrightText: `© ${new Date().getFullYear()} ${
    process.env.NEXT_PUBLIC_NOMBRE_TIENDA || "Mi Tienda"
  } | Todos los derechos reservados.`,

  selectedTemplate: "Footer02",

  showLogo: true,
  showMenuLinks: true,
  showLinks: true,
  showCollections: true,
  showSocial: true,
  showDescription: false,

  backgroundColor: "#1f2937",
  textColor: "#ffffff",
  accentColor: "#f59e0b",
  logoSize: 64, // Tamaño por defecto en píxeles

  landingText: JSON.stringify({
    backgroundImage: {
      enabled: false,
      url: "",
      overlay: {
        enabled: true,
        color: "#000000",
        opacity: 0.7,
      },
    },
  }),

  customLinks: [
    {
      title: "Política de Privacidad",
      url: "/politica-privacidad",
      enabled: true,
    },
    {
      title: "Términos y Condiciones",
      url: "/terminos-condiciones",
      enabled: true,
    },
    { title: "Política de Devoluciones", url: "/devoluciones", enabled: true },
  ],
};

interface Footer01BOProps {
  planType?: "basic" | "advanced";
}

// Componente Switch reutilizable
const SectionSwitch = ({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="sr-only peer"
      disabled={disabled}
    />
    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
  </label>
);

// Componente de Header Colapsable
const CollapsibleSectionHeader = ({
  title,
  isOpen,
  onToggle,
  isEnabled = true,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  isEnabled?: boolean;
}) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold">{title}</h3>
    {isEnabled && (
      <button
        onClick={onToggle}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center space-x-2"
      >
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span>{isOpen ? "Ocultar" : "Mostrar"} Configuración</span>
      </button>
    )}
  </div>
);

export default function Footer01BO({ planType = "advanced" }: Footer01BOProps) {
  const [config, setConfig] = useState<FooterConfig>(defaultConfig);
  const [displayConfig, setDisplayConfig] = useState<FooterDisplayConfig>({
    backgroundImage: {
      enabled: false,
      url: "",
      overlay: {
        enabled: true,
        color: "#000000",
        opacity: 0.7,
      },
    },
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [displayConfigLoaded, setDisplayConfigLoaded] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<string>(
    config.selectedTemplate
  );
  const [showStyleSection, setShowStyleSection] = useState(false);
  const [showSocialSection, setShowSocialSection] = useState(false);
  const [showCustomLinksSection, setShowCustomLinksSection] = useState(false);
  const [showGeneralSection, setShowGeneralSection] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [collectionsLoading, setCollectionsLoading] = useState(false);
  const { logo } = useLogo();
  const { socialNetworks: socialNetworksConfig } = useSocialNetworks();

  // Estados para imagen de fondo del footer
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [bannerLoading, setBannerLoading] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const isBasicPlan = planType === "basic";

  // Funciones de parsing para displayConfig (similar al banner principal)
  const parseFooterDisplayConfig = (
    landingText: string | undefined | null
  ): FooterDisplayConfig => {
    // Valores por defecto seguros
    const defaultDisplayConfig: FooterDisplayConfig = {
      backgroundImage: {
        enabled: false,
        url: "",
        overlay: {
          enabled: true,
          color: "#000000", // Se mantiene por compatibilidad, pero se usa backgroundColor
          opacity: 0.7,
        },
      },
    };

    try {
      // Si no hay landingText o está vacío, retornar valores por defecto
      if (!landingText || landingText.trim() === "") {
        console.log("📝 landingText vacío, usando configuración por defecto");
        return defaultDisplayConfig;
      }

      // Intentar parsear el JSON
      const parsed = JSON.parse(landingText);

      // Si no es un objeto válido, retornar valores por defecto
      if (!parsed || typeof parsed !== "object") {
        console.log(
          "📝 landingText no es un objeto válido, usando configuración por defecto"
        );
        return defaultDisplayConfig;
      }

      // Construir la configuración con valores seguros
      return {
        backgroundImage: {
          enabled:
            parsed.backgroundImage?.enabled ??
            defaultDisplayConfig.backgroundImage.enabled,
          url:
            parsed.backgroundImage?.url ||
            defaultDisplayConfig.backgroundImage.url,
          overlay: {
            enabled:
              parsed.backgroundImage?.overlay?.enabled ??
              defaultDisplayConfig.backgroundImage.overlay.enabled,
            color: "#000000", // Se mantiene por compatibilidad, pero se usa backgroundColor
            opacity:
              parsed.backgroundImage?.overlay?.opacity ??
              defaultDisplayConfig.backgroundImage.overlay.opacity,
          },
        },
      };
    } catch (error) {
      console.log(
        "📝 Error al parsear landingText, usando configuración por defecto:",
        error
      );
      return defaultDisplayConfig;
    }
  };

  const updateFooterDisplayConfig = (updates: Partial<FooterDisplayConfig>) => {
    const newDisplayConfig = { ...displayConfig, ...updates };
    setDisplayConfig(newDisplayConfig);

    // Actualizar también el config.landingText
    setConfig((prev) => ({
      ...prev,
      landingText: JSON.stringify(newDisplayConfig),
    }));
  };

  // Función para sincronizar el color del overlay con el backgroundColor
  const updateBackgroundColor = (color: string) => {
    // Actualizar el color de fondo
    handleConfigChange("backgroundColor", color);

    // Actualizar también el color del overlay para que coincida
    updateFooterDisplayConfig({
      backgroundImage: {
        ...displayConfig.backgroundImage,
        overlay: {
          ...displayConfig.backgroundImage.overlay,
          color: color,
        },
      },
    });
  };

  // Templates disponibles
  const templates = [
    {
      id: "Footer02",
      name: "Moderno",
      description: "Diseño moderno con layout más espacioso",
      image: "/components/PIXELUP/Footer/Footer02/Footer02.png",
    },
    {
      id: "Footer03",
      name: "Minimalista",
      description: "Diseño limpio y minimalista",
      image: "/components/PIXELUP/Footer/Footer03/Footer03.png",
    },
  ];

  // Las redes sociales ahora se obtienen del contexto automáticamente

  // Cargar configuración del footer
  const fetchFooterConfig = async () => {
    console.log("🚀 Iniciando fetchFooterConfig...");
    try {
      setLoading(true);
      const contentBlockId =
        process.env.NEXT_PUBLIC_FOOTER_CONFIG_CONTENTBLOCK ||
        "footer-config-default";

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      console.log(
        "📥 Respuesta del content block:",
        response.data.contentBlock
      );

      if (response.data.contentBlock?.contentText) {
        try {
          const savedConfig = JSON.parse(
            response.data.contentBlock.contentText
          );
          const mergedConfig = { ...defaultConfig, ...savedConfig };

          // Si el template es Footer01 o Footer04 (eliminados), cambiar a Footer02
          if (
            mergedConfig.selectedTemplate === "Footer01" ||
            mergedConfig.selectedTemplate === "Footer04"
          ) {
            mergedConfig.selectedTemplate = "Footer02";
          }

          setConfig(mergedConfig);

          // Parsear displayConfig desde landingText
          const parsedDisplayConfig = parseFooterDisplayConfig(
            mergedConfig.landingText
          );
          console.log("📥 DisplayConfig cargado:", parsedDisplayConfig);
          console.log("📥 LandingText original:", mergedConfig.landingText);
          console.log(
            "📥 Imagen enabled:",
            parsedDisplayConfig.backgroundImage.enabled
          );
          setDisplayConfig(parsedDisplayConfig);
          setDisplayConfigLoaded(true);
        } catch (error) {
          console.error("Error al parsear configuración del footer:", error);
          const fallbackDisplayConfig = parseFooterDisplayConfig(
            defaultConfig.landingText
          );
          console.log("📥 DisplayConfig fallback:", fallbackDisplayConfig);
          setConfig(defaultConfig);
          setDisplayConfig(fallbackDisplayConfig);
          setDisplayConfigLoaded(true);
        }
      } else {
        console.log(
          "📥 No hay configuración guardada, usando valores por defecto"
        );
        const defaultDisplayConfig = parseFooterDisplayConfig(
          defaultConfig.landingText
        );
        console.log("📥 Default DisplayConfig:", defaultDisplayConfig);
        setConfig(defaultConfig);
        setDisplayConfig(defaultDisplayConfig);
        setDisplayConfigLoaded(true);
      }
    } catch (error) {
      console.error("Error al cargar configuración del footer:", error);
      const errorDisplayConfig = parseFooterDisplayConfig(
        defaultConfig.landingText
      );
      console.log("📥 Error DisplayConfig:", errorDisplayConfig);
      setConfig(defaultConfig);
      setDisplayConfig(errorDisplayConfig);
      setDisplayConfigLoaded(true);
    } finally {
      setLoading(false);
      console.log("✅ fetchFooterConfig terminado");
    }
  };

  // Cargar colecciones reales
  const fetchCollections = async () => {
    try {
      setCollectionsLoading(true);
      const siteid = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${siteid}`
      );

      console.log("🔍 Respuesta de colecciones:", {
        code: response.data.code,
        totalCollections: response.data.collections?.length || 0,
        collections: response.data.collections,
      });

      if (response.data.code === 0 && response.data.collections) {
        // Filtrar colecciones activas y excluir las del banner navbar si existen
        const excludedIds = process.env.NEXT_PUBLIC_BANNER_NAVBAR || "";
        const allCollections = response.data.collections;

        console.log("🔍 Filtros aplicados:", {
          excludedIds,
          totalBeforeFilter: allCollections.length,
        });

        // Filtrar correctamente - usar split si hay múltiples IDs separados por comas
        const excludedIdsArray = excludedIds
          ? excludedIds.split(",").map((id) => id.trim())
          : [];

        const filteredCollections = allCollections
          .filter((collection: any) => {
            // Excluir IDs del banner navbar
            const isExcluded = excludedIdsArray.includes(collection.id);
            // Verificar si está activa (algunas APIs usan 'ACTIVE', otras 'active', otras no tienen este campo)
            const isActive =
              !collection.statusCode ||
              collection.statusCode === "ACTIVE" ||
              collection.statusCode === "active";

            console.log(`📋 Colección "${collection.title}":`, {
              id: collection.id,
              statusCode: collection.statusCode,
              isExcluded,
              isActive,
              willInclude: !isExcluded && isActive,
            });

            return !isExcluded && isActive;
          })
          .sort((a: any, b: any) => a.title.localeCompare(b.title))
          .slice(0, 6); // Limitar a 6 colecciones para el footer

        console.log("✅ Colecciones filtradas para footer:", {
          total: filteredCollections.length,
          collections: filteredCollections.map((c: any) => ({
            id: c.id,
            title: c.title,
            statusCode: c.statusCode,
          })),
        });

        setCollections(filteredCollections);
      } else {
        console.warn(
          "⚠️ No se recibieron colecciones o código de respuesta incorrecto"
        );
        setCollections([]);
      }
    } catch (error) {
      console.error("❌ Error al cargar colecciones:", error);
      setCollections([]);
    } finally {
      setCollectionsLoading(false);
    }
  };

  // Cargar imagen de fondo del footer desde banner
  const fetchFooterBanner = async (silent = false) => {
    console.log("🚀 Iniciando fetchFooterBanner...");
    try {
      setBannerLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = process.env.NEXT_PUBLIC_FOOTER_BANNER_ID;

      console.log("🔍 Footer Banner Debug:", {
        bannerId,
        token: token ? "Token presente" : "Token faltante",
        apiUrl: process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE,
        siteId: process.env.NEXT_PUBLIC_API_URL_SITEID,
      });

      if (!bannerId || bannerId === "PENDIENTE_CONFIGURAR") {
        console.warn(
          "⚠️ No se ha configurado NEXT_PUBLIC_FOOTER_BANNER_ID en las variables de entorno"
        );
        toast.error(
          "Para usar imágenes de fondo, primero debes configurar NEXT_PUBLIC_FOOTER_BANNER_ID en el archivo .env.local"
        );
        return;
      }

      if (!token) {
        console.warn("⚠️ Token de autenticación no encontrado");
        toast.error("No se encontró token de autenticación");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;
      console.log("📡 Realizando petición a:", url);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📥 Respuesta de banner:", {
        status: response.status,
        code: response.data.code,
        bannerImages: response.data.bannerImages,
        totalImages: response.data.bannerImages?.length || 0,
      });

      const bannerImages = response.data.bannerImages;
      if (bannerImages && bannerImages.length > 0) {
        console.log("✅ Banner images encontradas:", {
          totalImages: bannerImages.length,
          firstImageUrl: bannerImages[0].mainImage?.url,
          firstImageData: bannerImages[0].mainImage
            ? "Imagen presente"
            : "Sin imagen",
        });

        setBannerData(bannerImages);

        // Actualizar solo la URL de la imagen, manteniendo el estado enabled existente
        const imageUrl = bannerImages[0].mainImage?.url || "";
        console.log("🔄 fetchFooterBanner - Actualizando solo URL:", imageUrl);
        console.log(
          "🔄 fetchFooterBanner - displayConfig actual:",
          displayConfig
        );

        setDisplayConfig((prevDisplayConfig) => ({
          ...prevDisplayConfig,
          backgroundImage: {
            ...prevDisplayConfig.backgroundImage,
            url: imageUrl,
          },
        }));

        if (imageUrl) {
          console.log("🖼️ Imagen de fondo del footer cargada:", imageUrl);
          if (!silent) {
            toast.success("Imagen de fondo del footer cargada exitosamente");
          }
        } else {
          console.warn("⚠️ Banner encontrado pero sin imagen URL");
          if (!silent) {
            toast("Banner encontrado pero sin imagen configurada");
          }
        }
      } else {
        console.warn("⚠️ No se encontraron imágenes en el banner");
        toast("No se encontraron imágenes en el banner del footer");
      }
    } catch (error) {
      console.error("❌ Error al cargar banner del footer:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        if (status === 401) {
          toast.error("Error de autenticación. Verifica tu sesión.");
        } else if (status === 404) {
          toast.error("Banner no encontrado. Verifica el ID configurado.");
        } else {
          toast.error(`Error al cargar imagen: ${message}`);
        }

        console.error("Detalles del error:", {
          status,
          message,
          config: error.config?.url,
        });
      } else {
        toast.error("Error de red al cargar la imagen de fondo");
      }
    } finally {
      setBannerLoading(false);
      console.log("✅ fetchFooterBanner terminado");
    }
  };

  // Manejar cambio de imagen
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setBackgroundImage(result);
        setIsImageModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Completar crop
  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  // Aplicar crop y comprimir imagen
  const handleCrop = async () => {
    if (!backgroundImage) return;

    try {
      const croppedImage = await getCroppedImg(
        backgroundImage,
        croppedAreaPixels
      );
      if (!croppedImage) {
        console.error("Error al recortar la imagen");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 0.9,
      };

      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      setBackgroundImage(base64);
      setIsImageModalOpen(false);
      toast.success("Imagen procesada correctamente");
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  // Convertir a base64
  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Limpiar imagen
  const handleClearImage = () => {
    setBackgroundImage(null);
    updateFooterDisplayConfig({
      backgroundImage: {
        ...displayConfig.backgroundImage,
        url: "",
      },
    });
  };

  // Guardar imagen en el banner
  const saveFooterBannerImage = async (silent = false) => {
    if (!backgroundImage) return;

    try {
      const token = getCookie("AdminTokenAuth");
      const bannerId = process.env.NEXT_PUBLIC_FOOTER_BANNER_ID;

      if (!bannerId) {
        toast.error("NEXT_PUBLIC_FOOTER_BANNER_ID no configurado");
        return;
      }

      // Convertir base64 a blob para obtener el tamaño real
      const response = await fetch(backgroundImage);
      const blob = await response.blob();

      const imageInfo = {
        name: "footerBG",
        type: "image/jpeg",
        size: blob.size, // Tamaño real del archivo
        data: backgroundImage,
      };

      const imageData = {
        title: "Footer Background",
        landingText: "Footer Background Image",
        buttonLink: "#", // Valor por defecto consistente
        buttonText: "Footer Background", // Valor por defecto consistente
        mainImageLink: "#", // Valor por defecto consistente
        orderNumber: 1,
        mainImage: imageInfo,
      };

      // Primero obtener el banner para ver si ya tiene imágenes
      const bannerResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const existingImages = bannerResponse.data?.bannerImages || [];

      if (existingImages.length > 0) {
        // Actualizar la primera imagen existente
        const firstImageId = existingImages[0].id;
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${firstImageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          imageData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Crear nueva imagen si no existe ninguna
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          imageData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Recargar banner para obtener la URL actualizada
      await fetchFooterBanner(true); // silent = true
      if (!silent) {
        toast.success("Imagen de fondo guardada correctamente");
      }
    } catch (error) {
      console.error("Error al guardar imagen de fondo:", error);
      if (!silent) {
        toast.error("Error al guardar la imagen de fondo");
      }
    }
  };

  // Guardar configuración del footer
  const saveFooterConfig = async () => {
    try {
      setSaving(true);
      const token = getCookie("AdminTokenAuth");

      // 1. Primero guardar la imagen si hay una pendiente
      if (backgroundImage) {
        try {
          console.log("💾 Guardando imagen de fondo...");
          await saveFooterBannerImage(true); // silent = true
        } catch (error) {
          console.error("Error al guardar imagen:", error);
          toast.error("Error al guardar la imagen de fondo");
          return; // No continuar si falla la imagen
        }
      }

      // 2. Luego guardar la configuración del content block
      const contentBlockId =
        process.env.NEXT_PUBLIC_FOOTER_CONFIG_CONTENTBLOCK ||
        "footer-config-default";

      // Asegurar que config.landingText esté sincronizado con displayConfig
      const configToSave = {
        ...config,
        landingText: JSON.stringify(displayConfig),
      };

      console.log("💾 Guardando configuración del footer...");
      console.log("💾 DisplayConfig a guardar:", displayConfig);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "Configuración del Footer",
          contentText: JSON.stringify(configToSave),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 0) {
        toast.success("Footer guardado exitosamente");
        // Limpiar imagen temporal después de guardar
        setBackgroundImage(null);
        // Revalidar cache
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/" }),
        });
      }
    } catch (error) {
      console.error("Error al guardar configuración del footer:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  // Restaurar configuración por defecto
  const resetConfig = () => {
    setConfig(defaultConfig);
    toast.success("Configuración restaurada por defecto");
  };

  // Manejar cambios en la configuración
  const handleConfigChange = (key: keyof FooterConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Manejar cambios en enlaces personalizados
  const handleCustomLinkChange = (index: number, field: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      customLinks: prev.customLinks.map((link, i) =>
        i === index ? { ...link, [field]: value } : link
      ),
    }));
  };

  // Agregar nuevo enlace personalizado
  const addCustomLink = () => {
    setConfig((prev) => ({
      ...prev,
      customLinks: [
        ...prev.customLinks,
        {
          title: "",
          url: "",
          enabled: true, // Mantener para compatibilidad con el backend
        },
      ],
    }));
  };

  // Eliminar enlace personalizado
  const removeCustomLink = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      customLinks: prev.customLinks.filter((_, i) => i !== index),
    }));
  };

  // Obtener el template seleccionado
  const selectedTemplate =
    templates.find((t) => t.id === config.selectedTemplate) || templates[0];

  useEffect(() => {
    const initializeFooter = async () => {
      // Cargar configuración primero
      await fetchFooterConfig();
      // Luego cargar colecciones e imagen en paralelo
      await Promise.all([
        fetchCollections(),
        fetchFooterBanner(false), // mostrar toast normalmente en carga inicial
      ]);
    };

    initializeFooter();
    // Las redes sociales se cargan automáticamente desde el contexto
  }, []);

  // Sincronizar previewTemplate con la plantilla seleccionada
  useEffect(() => {
    setPreviewTemplate(config.selectedTemplate);
  }, [config.selectedTemplate]);

  // Todas las secciones siempre inician cerradas - expansión solo manual

  // Obtener enlaces del menú de navegación real
  const realMenuItems = mainMenuConfig.showInFooter
    ? mainMenuConfig.links
        .filter((link) => link.isVisible && link.title !== "Colecciones")
        .map((link) => ({
          title: link.title,
          path: link.path,
        }))
    : [];

  // Crear configuración para el preview que incluye datos reales
  const configWithSocialNetworks = {
    ...config,
    socialNetworks: socialNetworksConfig,
    collections: collections.map((collection) => ({
      id: collection.id,
      title: collection.title,
      slug:
        collection.slug || collection.title.toLowerCase().replace(/\s+/g, "-"),
    })),
    menuItems: realMenuItems,
    // Incluir imagen de fondo si está disponible desde el banner
    backgroundImage: {
      ...displayConfig.backgroundImage,
      url: bannerData?.[0]?.mainImage?.url || displayConfig.backgroundImage.url,
    },
  };

  if (loading || collectionsLoading || bannerLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Vista previa del footer */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Vista Previa del Footer - {selectedTemplate.name}
          </h3>
          {collectionsLoading && (
            <div className="flex items-center text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
              Cargando colecciones...
            </div>
          )}
        </div>
        <FooterPreview
          config={configWithSocialNetworks}
          selectedTemplate={config.selectedTemplate}
        />
      </div>

      {/* Secciones Visibles - PRIMERA SECCIÓN */}
      <div className="border rounded-lg p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Logo */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="font-medium">Logo</span>
            </div>
            <SectionSwitch
              checked={config.showLogo}
              onChange={(checked) => handleConfigChange("showLogo", checked)}
            />
          </div>

          {/* Enlaces del Menú */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </div>
              <div>
                <span className="font-medium">Enlaces del Menú</span>
                <p className="text-xs text-gray-500">
                  Automático - Sin configuración adicional
                </p>
              </div>
            </div>
            <SectionSwitch
              checked={config.showMenuLinks}
              onChange={(checked) =>
                handleConfigChange("showMenuLinks", checked)
              }
            />
          </div>

          {/* Enlaces Personalizados */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <span className="font-medium">
                Enlaces Personalizados
                {isBasicPlan && (
                  <span className="text-xs text-gray-400 ml-1">(Pro)</span>
                )}
              </span>
            </div>
            <SectionSwitch
              checked={config.showLinks}
              onChange={(checked) => handleConfigChange("showLinks", checked)}
              disabled={isBasicPlan}
            />
          </div>

          {/* Colecciones */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <span className="font-medium">Colecciones</span>
            </div>
            <SectionSwitch
              checked={config.showCollections}
              onChange={(checked) =>
                handleConfigChange("showCollections", checked)
              }
            />
          </div>

          {/* Redes Sociales */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-pink-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2a1 1 0 011 1v3m0 0v11"
                  />
                </svg>
              </div>
              <span className="font-medium">Redes Sociales</span>
            </div>
            <SectionSwitch
              checked={config.showSocial}
              onChange={(checked) => handleConfigChange("showSocial", checked)}
            />
          </div>

          {/* Descripción */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="font-medium">Descripción</span>
            </div>
            <SectionSwitch
              checked={config.showDescription}
              onChange={(checked) =>
                handleConfigChange("showDescription", checked)
              }
            />
          </div>
        </div>
        {isBasicPlan && (
          <p className="text-xs text-gray-500 mt-4 text-center">
            ⭐ Plan Básico: Solo puedes configurar Logo, Enlaces del Menú,
            Colecciones, Redes Sociales y Descripción
          </p>
        )}
      </div>

      {/* Configuración de Colores y Plantilla */}
      <div className="border rounded-lg p-4">
        <CollapsibleSectionHeader
          title="Estilo y Plantilla"
          isOpen={showStyleSection}
          onToggle={() => setShowStyleSection(!showStyleSection)}
        />

        {showStyleSection && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna Izquierda: Plantilla y Colores */}
            <div className="space-y-4">
              {/* Plantilla */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          selectedTemplate.id === "Footer01"
                            ? "#10b981"
                            : "#6b7280",
                      }}
                    ></div>
                    <p className="text-sm font-medium text-gray-700">
                      Plantilla Activa:
                    </p>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedTemplate.name}
                    </span>
                  </div>
                  {!isBasicPlan && (
                    <button
                      onClick={() => {
                        setPreviewTemplate(config.selectedTemplate);
                        setShowTemplateModal(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                        />
                      </svg>
                      <span>Cambiar</span>
                    </button>
                  )}
                </div>
              </div>
              {/* Tamaño del Logo - Solo visible si showLogo está activo */}
              {config.showLogo && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tamaño del Logo
                  </label>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Pequeño</span>
                      <span className="text-xs font-medium text-gray-700">
                        {config.logoSize}px
                      </span>
                      <span className="text-xs text-gray-500">Grande</span>
                    </div>
                    <input
                      type="range"
                      min="32"
                      max="120"
                      step="4"
                      value={config.logoSize}
                      onChange={(e) =>
                        handleConfigChange("logoSize", parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>32px</span>
                      <span>64px</span>
                      <span>96px</span>
                      <span>120px</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Ajusta el tamaño del logo en píxeles (altura)
                  </p>
                </div>
              )}
              {/* Colores */}
              <div className="border rounded-lg p-3 bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Colores
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Color de Fondo
                    </label>
                    <input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => updateBackgroundColor(e.target.value)}
                      className="w-full h-8 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Color de Texto
                    </label>
                    <input
                      type="color"
                      value={config.textColor}
                      onChange={(e) =>
                        handleConfigChange("textColor", e.target.value)
                      }
                      className="w-full h-8 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      Color de Acento
                    </label>
                    <input
                      type="color"
                      value={config.accentColor}
                      onChange={(e) =>
                        handleConfigChange("accentColor", e.target.value)
                      }
                      className="w-full h-8 border rounded"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  El color de fondo se usa también para el overlay
                </p>
              </div>
            </div>

            {/* Columna Derecha: Imagen de Fondo */}
            <div className="space-y-4">
              <div className="border rounded-lg p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">
                      Imagen de Fondo
                    </span>
                  </div>
                  {displayConfigLoaded ? (
                    <SectionSwitch
                      checked={displayConfig.backgroundImage.enabled}
                      onChange={(checked) => {
                        console.log("🔄 Switch cambió a:", checked);
                        updateFooterDisplayConfig({
                          backgroundImage: {
                            ...displayConfig.backgroundImage,
                            enabled: checked,
                          },
                        });
                      }}
                    />
                  ) : (
                    <div className="w-11 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                  )}
                </div>

                {displayConfigLoaded &&
                  displayConfig.backgroundImage.enabled && (
                    <div className="space-y-3">
                      {/* Advertencia compacta */}
                      {(!process.env.NEXT_PUBLIC_FOOTER_BANNER_ID ||
                        process.env.NEXT_PUBLIC_FOOTER_BANNER_ID ===
                          "PENDIENTE_CONFIGURAR") && (
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
                          ⚠️ Configura NEXT_PUBLIC_FOOTER_BANNER_ID en
                          .env.local
                        </div>
                      )}

                      <input
                        type="file"
                        accept="image/*"
                        id="footerBackgroundImage"
                        className="hidden"
                        onChange={handleImageChange}
                      />

                      {/* Upload/Preview */}
                      {bannerData?.[0]?.mainImage?.url || backgroundImage ? (
                        <div className="space-y-2">
                          <div className="relative w-full h-24 rounded overflow-hidden border">
                            <img
                              src={
                                backgroundImage || bannerData[0]?.mainImage?.url
                              }
                              alt="Footer Background"
                              className="w-full h-full object-cover"
                            />
                            {/* Overlay preview con color y opacidad reales */}
                            {displayConfig.backgroundImage.overlay.enabled && (
                              <div
                                className="absolute inset-0"
                                style={{
                                  backgroundColor: config.backgroundColor,
                                  opacity:
                                    displayConfig.backgroundImage.overlay
                                      .opacity,
                                }}
                              />
                            )}
                            {/* Indicador de vista previa */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className=" px-2 py-1 rounded text-white text-xs">
                                Vista previa
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <label
                              htmlFor="footerBackgroundImage"
                              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 cursor-pointer"
                            >
                              Cambiar
                            </label>

                            {backgroundImage && (
                              <button
                                onClick={() => saveFooterBannerImage(false)}
                                className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                              >
                                Guardar
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <label
                          htmlFor="footerBackgroundImage"
                          className="border-dashed border-2 border-gray-300 rounded p-4 text-center cursor-pointer hover:border-gray-400 transition-colors block"
                        >
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-6 h-6 text-gray-400 mb-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <p className="text-gray-600 text-xs font-medium">
                              Subir Imagen
                            </p>
                            <p className="text-xs text-gray-400">1920x800px</p>
                          </div>
                        </label>
                      )}

                      {/* Configuración de Overlay */}
                      <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-medium text-gray-600">
                              Overlay
                            </span>
                            <p className="text-xs text-gray-400">
                              Usa color de fondo
                            </p>
                          </div>
                          <SectionSwitch
                            checked={
                              displayConfig.backgroundImage.overlay.enabled
                            }
                            onChange={(checked) =>
                              updateFooterDisplayConfig({
                                backgroundImage: {
                                  ...displayConfig.backgroundImage,
                                  overlay: {
                                    ...displayConfig.backgroundImage.overlay,
                                    enabled: checked,
                                  },
                                },
                              })
                            }
                          />
                        </div>

                        {/* Opacidad */}
                        {displayConfig.backgroundImage.overlay.enabled && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-gray-600">
                                Opacidad
                              </span>
                              <span className="text-xs text-gray-500">
                                {Math.round(
                                  displayConfig.backgroundImage.overlay
                                    .opacity * 100
                                )}
                                %
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={
                                displayConfig.backgroundImage.overlay.opacity
                              }
                              onChange={(e) =>
                                updateFooterDisplayConfig({
                                  backgroundImage: {
                                    ...displayConfig.backgroundImage,
                                    overlay: {
                                      ...displayConfig.backgroundImage.overlay,
                                      opacity: parseFloat(e.target.value),
                                    },
                                  },
                                })
                              }
                              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuración General */}
      <div className="border rounded-lg p-4">
        <CollapsibleSectionHeader
          title="Descripción"
          isOpen={showGeneralSection}
          onToggle={() => setShowGeneralSection(!showGeneralSection)}
        />

        {showGeneralSection && (
          <div className="w-full">
            <div>
              <textarea
                value={config.description}
                onChange={(e) =>
                  handleConfigChange("description", e.target.value)
                }
                className="w-full px-3 py-2 border rounded-md"
                rows={3}
                placeholder="Descripción que aparecerá en el footer..."
              />
              <p className="text-xs text-gray-500 mt-2">
                {isBasicPlan && " Disponible en todos los planes."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Redes Sociales - Solo visible si está activado */}
      {config.showSocial && (
        <div className="border rounded-lg p-4">
          <CollapsibleSectionHeader
            title="Configuración de Redes Sociales"
            isOpen={showSocialSection}
            onToggle={() => setShowSocialSection(!showSocialSection)}
          />

          {showSocialSection && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-4">
                Configura las redes sociales que aparecerán en tu footer. Esta
                configuración se sincroniza automáticamente con toda la tienda.
              </p>
              <RedesSociales />
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  💡 Los cambios en las redes sociales se aplicarán
                  automáticamente al footer y otros componentes de la tienda.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enlaces Personalizados - Solo visible si está activado y es plan avanzado */}
      {config.showLinks && !isBasicPlan && (
        <div className="border rounded-lg p-4">
          <CollapsibleSectionHeader
            title="Enlaces Personalizados"
            isOpen={showCustomLinksSection}
            onToggle={() => setShowCustomLinksSection(!showCustomLinksSection)}
          />

          {showCustomLinksSection && (
            <div className="space-y-4">
              {/* Encabezado con contador y botón agregar */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">
                    Enlaces ({config.customLinks.length})
                  </span>
                </div>
                <button
                  onClick={addCustomLink}
                  className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span>Agregar Enlace</span>
                </button>
              </div>

              {/* Lista de enlaces */}
              {config.customLinks.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg
                    className="w-8 h-8 text-gray-400 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  <p className="text-gray-500 text-sm">
                    No hay enlaces personalizados
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Haz clic en el botón de arriba para crear uno
                  </p>
                </div>
              ) : (
                config.customLinks.map((link, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 bg-white relative"
                  >
                    {/* Botón eliminar */}
                    <button
                      onClick={() => removeCustomLink(index)}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors flex items-center justify-center"
                      title="Eliminar enlace"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>

                    {/* Número del enlace */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                        {index + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        Enlace {index + 1}
                      </span>
                    </div>

                    {/* Campos del enlace */}
                    <div className="space-y-3">
                      {/* Título y URL */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            Título del enlace
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Política de Privacidad"
                            value={link.title}
                            onChange={(e) =>
                              handleCustomLinkChange(
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">
                            URL del enlace
                          </label>
                          <input
                            type="url"
                            placeholder="https://ejemplo.com/politica"
                            value={link.url}
                            onChange={(e) =>
                              handleCustomLinkChange(
                                index,
                                "url",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de Selección de Plantilla */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-7xl w-full max-h-[95vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">
                Seleccionar Plantilla del Footer
              </h3>
              <div className="flex items-center space-x-3">
                {config.selectedTemplate !== previewTemplate && (
                  <button
                    onClick={() => {
                      handleConfigChange("selectedTemplate", previewTemplate);
                      setShowTemplateModal(false);
                      toast.success(
                        `Plantilla "${
                          templates.find((t) => t.id === previewTemplate)?.name
                        }" seleccionada`
                      );
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Seleccionar Esta Plantilla
                  </button>
                )}
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
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

            <div className="flex flex-col h-[470px]">
              {/* Vista Previa - Arriba */}
              <div className="h-80 p-2 border-b">
                {/* Preview Container */}
                <div className="h-full border rounded-lg overflow-hidden bg-white">
                  <div className="w-full h-full overflow-auto">
                    <FooterPreview
                      config={{
                        ...configWithSocialNetworks,
                        selectedTemplate: previewTemplate,
                      }}
                      selectedTemplate={previewTemplate}
                    />
                  </div>
                </div>
              </div>

              {/* Lista de Plantillas - Abajo */}
              <div className="flex-1 p-4 flex flex-col ">
                <div className="grid grid-cols-2  gap-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      className={`p-3 rounded-lg cursor-pointer transition-all border ${
                        previewTemplate === template.id
                          ? "bg-blue-100 border-blue-300 border-2"
                          : config.selectedTemplate === template.id
                          ? "bg-green-50 border-green-300 border-2"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => setPreviewTemplate(template.id)}
                    >
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-2">
                          {config.selectedTemplate === template.id && (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                          <h5 className="font-medium text-gray-900">
                            {template.name}
                          </h5>
                          {previewTemplate === template.id &&
                            config.selectedTemplate !== template.id && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full ml-2"></div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700 text-center">
                  💡 Haz click en una plantilla para ver la vista previa arriba
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cropper para Imagen de Fondo */}
      {isImageModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Recortar Imagen de Fondo
                </h2>
                <p className="text-sm text-gray-600">
                  Ajusta el recorte para optimizar la imagen de fondo del footer
                </p>
              </div>
              <button
                onClick={() => {
                  setBackgroundImage(null);
                  setIsImageModalOpen(false);
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
              <div className="relative h-96 w-full bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={backgroundImage || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
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
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1x</span>
                    <span>3x</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setBackgroundImage(null);
                      setIsImageModalOpen(false);
                    }}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCrop}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recortar y Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={resetConfig}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Restaurar por Defecto
        </button>
        <button
          onClick={saveFooterConfig}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "Guardando..." : "Guardar Configuración"}
        </button>
      </div>
    </div>
  );
}
