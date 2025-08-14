"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";
import { useLogo } from "@/context/LogoContext";
import FooterPreview from "../FooterPreview";
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

  // Configuración de imagen de fondo
  backgroundImage: {
    enabled: boolean;
    url: string;
    overlay: {
      enabled: boolean;
      color: string;
      opacity: number;
    };
  };

  // Configuración de enlaces personalizados
  customLinks: {
    title: string;
    url: string;
    enabled: boolean;
  }[];
}

const defaultConfig: FooterConfig = {
  title: "Footer",
  description: "Descripción del footer",
  copyrightText: `© ${new Date().getFullYear()} ${
    process.env.NEXT_PUBLIC_NOMBRE_TIENDA || "Mi Tienda"
  } | Todos los derechos reservados.`,

  selectedTemplate: "Footer01",

  showLogo: true,
  showMenuLinks: true,
  showLinks: true,
  showCollections: true,
  showSocial: true,
  showDescription: false,

  backgroundColor: "#1f2937",
  textColor: "#ffffff",
  accentColor: "#f59e0b",

  backgroundImage: {
    enabled: false,
    url: "",
    overlay: {
      enabled: true,
      color: "#000000",
      opacity: 0.7,
    },
  },

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
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
  const [showBackgroundSection, setShowBackgroundSection] = useState(false);

  const isBasicPlan = planType === "basic";

  // Templates disponibles
  const templates = [
    {
      id: "Footer01",
      name: "Clásico",
      description: "Diseño tradicional con logo, enlaces y redes sociales",
      image: "/components/PIXELUP/Footer/Footer01/Footer01.png",
    },
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
    {
      id: "Footer04",
      name: "Descriptivo",
      description: "Diseño con descripción prominente",
      image: "/components/PIXELUP/Footer/Footer04/Footer01.png",
    },
  ];

  // Las redes sociales ahora se obtienen del contexto automáticamente

  // Cargar configuración del footer
  const fetchFooterConfig = async () => {
    try {
      setLoading(true);
      const contentBlockId =
        process.env.NEXT_PUBLIC_FOOTER_CONFIG_CONTENTBLOCK ||
        "footer-config-default";

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (response.data.contentBlock?.contentText) {
        try {
          const savedConfig = JSON.parse(
            response.data.contentBlock.contentText
          );
          setConfig({ ...defaultConfig, ...savedConfig });
        } catch (error) {
          console.error("Error al parsear configuración del footer:", error);
          setConfig(defaultConfig);
        }
      }
    } catch (error) {
      console.error("Error al cargar configuración del footer:", error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
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
  const fetchFooterBanner = async () => {
    try {
      setBannerLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = process.env.NEXT_PUBLIC_FOOTER_BANNER_ID;

      if (!bannerId) {
        console.log("No se ha configurado FOOTER_BANNER_ID");
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const bannerImages = response.data.bannerImages;
      if (bannerImages && bannerImages.length > 0) {
        setBannerData(bannerImages);
        // Actualizar configuración con la URL de la imagen
        setConfig((prev) => ({
          ...prev,
          backgroundImage: {
            ...prev.backgroundImage,
            url: bannerImages[0].mainImage?.url || "",
          },
        }));
      }
    } catch (error) {
      console.error("Error al cargar banner del footer:", error);
    } finally {
      setBannerLoading(false);
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
    setConfig((prev) => ({
      ...prev,
      backgroundImage: {
        ...prev.backgroundImage,
        url: "",
      },
    }));
  };

  // Guardar imagen en el banner
  const saveFooterBannerImage = async () => {
    if (!backgroundImage) return;

    try {
      const token = getCookie("AdminTokenAuth");
      const bannerId = process.env.NEXT_PUBLIC_FOOTER_BANNER_ID;
      const bannerImageId = process.env.NEXT_PUBLIC_FOOTER_BANNER_IMGID || "1";

      if (!bannerId) {
        toast.error("No se ha configurado el ID del banner del footer");
        return;
      }

      const imageInfo = {
        name: "footerBG",
        type: "image/jpeg",
        size: null,
        data: backgroundImage,
      };

      const imageData = {
        title: "Footer Background",
        landingText: "Footer Background Image",
        buttonLink: "",
        buttonText: "",
        mainImageLink: "",
        orderNumber: 1,
        mainImage: imageInfo,
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        imageData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Recargar banner para obtener la URL actualizada
      await fetchFooterBanner();
      toast.success("Imagen de fondo guardada correctamente");
    } catch (error) {
      console.error("Error al guardar imagen de fondo:", error);
      toast.error("Error al guardar la imagen de fondo");
    }
  };

  // Guardar configuración del footer
  const saveFooterConfig = async () => {
    try {
      setSaving(true);
      const token = getCookie("AdminTokenAuth");
      const contentBlockId =
        process.env.NEXT_PUBLIC_FOOTER_CONFIG_CONTENTBLOCK ||
        "footer-config-default";

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "Configuración del Footer",
          contentText: JSON.stringify(config),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 0) {
        toast.success("Configuración del footer guardada exitosamente");
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

  // Obtener el template seleccionado
  const selectedTemplate =
    templates.find((t) => t.id === config.selectedTemplate) || templates[0];

  useEffect(() => {
    fetchFooterConfig();
    fetchCollections();
    fetchFooterBanner();
    // Las redes sociales se cargan automáticamente desde el contexto
  }, []);

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
      ...config.backgroundImage,
      url: bannerData?.[0]?.mainImage?.url || config.backgroundImage.url,
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
        <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
          💡 <strong>Vista previa con datos reales:</strong> Los enlaces de
          navegación y colecciones se obtienen directamente de tu configuración
          de tienda.
        </div>
      </div>

      {/* Secciones Visibles - PRIMERA SECCIÓN */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-6">Secciones Visibles</h3>
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
          <>
            <div className="flex items-center justify-between mb-4">
              {!isBasicPlan && (
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2 ml-auto"
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
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                  <span>Cambiar Plantilla</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Color de Fondo
                </label>
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) =>
                    handleConfigChange("backgroundColor", e.target.value)
                  }
                  className="w-full h-10 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Color de Texto
                </label>
                <input
                  type="color"
                  value={config.textColor}
                  onChange={(e) =>
                    handleConfigChange("textColor", e.target.value)
                  }
                  className="w-full h-10 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Color de Acento
                </label>
                <input
                  type="color"
                  value={config.accentColor}
                  onChange={(e) =>
                    handleConfigChange("accentColor", e.target.value)
                  }
                  className="w-full h-10 border rounded-md"
                />
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      selectedTemplate.id === "Footer01"
                        ? "#10b981"
                        : "#6b7280",
                  }}
                ></div>
                <span className="text-sm font-medium">
                  Plantilla actual: {selectedTemplate.name}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {selectedTemplate.description}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Configuración de Imagen de Fondo */}
      <div className="border rounded-lg p-4">
        <CollapsibleSectionHeader
          title="Imagen de Fondo"
          isOpen={showBackgroundSection}
          onToggle={() => setShowBackgroundSection(!showBackgroundSection)}
        />

        {showBackgroundSection && (
          <div className="space-y-6">
            {/* Switch para activar imagen de fondo */}
            <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-emerald-600"
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
                <span className="font-medium">Usar Imagen de Fondo</span>
              </div>
              <SectionSwitch
                checked={config.backgroundImage.enabled}
                onChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    backgroundImage: {
                      ...prev.backgroundImage,
                      enabled: checked,
                    },
                  }))
                }
              />
            </div>

            {/* Configuración de imagen (solo si está activada) */}
            {config.backgroundImage.enabled && (
              <>
                {/* Upload de imagen */}
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">
                    Imagen de Fondo
                  </h4>

                  <input
                    type="file"
                    accept="image/*"
                    id="footerBackgroundImage"
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  {/* Vista previa de imagen actual */}
                  {bannerData?.[0]?.mainImage?.url || backgroundImage ? (
                    <div className="space-y-3">
                      <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={backgroundImage || bannerData[0]?.mainImage?.url}
                          alt="Footer Background"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            Vista previa
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <label
                          htmlFor="footerBackgroundImage"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors cursor-pointer text-sm"
                        >
                          Cambiar Imagen
                        </label>
                        <button
                          onClick={handleClearImage}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                        >
                          Eliminar
                        </button>
                        {backgroundImage && (
                          <button
                            onClick={saveFooterBannerImage}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                          >
                            Guardar Imagen
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="footerBackgroundImage"
                      className="border-dashed border-2 border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
                    >
                      <div className="flex flex-col items-center">
                        <svg
                          className="w-12 h-12 text-gray-400 mb-2"
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
                        <p className="text-gray-600 font-medium">
                          Subir Imagen de Fondo
                        </p>
                        <p className="text-sm text-gray-400">
                          PNG, JPG o WebP (Recomendado: 1920x800px)
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Configuración de overlay */}
                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-md font-medium text-gray-700">
                    Configuración de Overlay
                  </h4>

                  {/* Switch para overlay */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Activar Overlay Oscuro
                    </label>
                    <SectionSwitch
                      checked={config.backgroundImage.overlay.enabled}
                      onChange={(checked) =>
                        setConfig((prev) => ({
                          ...prev,
                          backgroundImage: {
                            ...prev.backgroundImage,
                            overlay: {
                              ...prev.backgroundImage.overlay,
                              enabled: checked,
                            },
                          },
                        }))
                      }
                    />
                  </div>

                  {/* Configuración de overlay (solo si está activado) */}
                  {config.backgroundImage.overlay.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Color del overlay */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color del Overlay
                        </label>
                        <input
                          type="color"
                          value={config.backgroundImage.overlay.color}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              backgroundImage: {
                                ...prev.backgroundImage,
                                overlay: {
                                  ...prev.backgroundImage.overlay,
                                  color: e.target.value,
                                },
                              },
                            }))
                          }
                          className="w-full h-10 border rounded-md"
                        />
                      </div>

                      {/* Opacidad del overlay */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Opacidad:{" "}
                          {Math.round(
                            config.backgroundImage.overlay.opacity * 100
                          )}
                          %
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={config.backgroundImage.overlay.opacity}
                          onChange={(e) =>
                            setConfig((prev) => ({
                              ...prev,
                              backgroundImage: {
                                ...prev.backgroundImage,
                                overlay: {
                                  ...prev.backgroundImage.overlay,
                                  opacity: parseFloat(e.target.value),
                                },
                              },
                            }))
                          }
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                  💡 <strong>Consejo:</strong> Una imagen de fondo con overlay
                  mejora la legibilidad del texto del footer. Recomendamos usar
                  una opacidad del 70-80% para mantener un buen contraste.
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Configuración General */}
      <div className="border rounded-lg p-4">
        <CollapsibleSectionHeader
          title="Configuración General"
          isOpen={showGeneralSection}
          onToggle={() => setShowGeneralSection(!showGeneralSection)}
        />

        {showGeneralSection && (
          <div className="max-w-md">
            <div>
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
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
                Esta descripción aparecerá junto con el logo cuando esté
                activada. En la plantilla Footer04 aparece como sección
                separada.
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
              {config.customLinks.map((link, index) => (
                <div
                  key={index}
                  className="border rounded p-3"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={link.enabled}
                        onChange={(e) =>
                          handleCustomLinkChange(
                            index,
                            "enabled",
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      <span className="text-sm font-medium">Habilitado</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Título del enlace"
                      value={link.title}
                      onChange={(e) =>
                        handleCustomLinkChange(index, "title", e.target.value)
                      }
                      className="px-3 py-2 border rounded-md text-sm"
                    />
                    <input
                      type="url"
                      placeholder="URL del enlace"
                      value={link.url}
                      onChange={(e) =>
                        handleCustomLinkChange(index, "url", e.target.value)
                      }
                      className="px-3 py-2 border rounded-md text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Selección de Plantilla */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-semibold">
                Seleccionar Plantilla del Footer
              </h3>
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

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      config.selectedTemplate === template.id
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300 hover:shadow-md"
                    }`}
                    onClick={() => {
                      handleConfigChange("selectedTemplate", template.id);
                      setShowTemplateModal(false);
                      toast.success(
                        `Plantilla "${template.name}" seleccionada`
                      );
                    }}
                  >
                    <div className="aspect-video bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={template.image}
                        alt={template.name}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 225'%3E%3Crect width='400' height='225' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%236b7280' font-family='Arial' font-size='14'%3E" +
                            template.name +
                            "%3C/text%3E%3C/svg%3E";
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-lg">{template.name}</h4>
                      {config.selectedTemplate === template.id && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
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
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    {config.selectedTemplate === template.id ? (
                      <div className="w-full py-2 px-4 bg-blue-600 text-white rounded-md text-center text-sm font-medium">
                        Seleccionado
                      </div>
                    ) : (
                      <div className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-md text-center text-sm font-medium hover:bg-gray-50">
                        Seleccionar
                      </div>
                    )}
                  </div>
                ))}
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
