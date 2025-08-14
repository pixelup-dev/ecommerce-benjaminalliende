"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader";
import { useSocialNetworks } from "@/context/SocialNetworksContext";

// Componentes de iconos SVG para redes sociales
const InstagramIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const TikTokIcon = () => (
  <svg
    className="w-6 h-6"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
);

interface SocialNetwork {
  name: string;
  url: string;
  enabled: boolean;
  icon: React.ReactNode;
}

interface ReviewSettingsProps {
  // Props si las necesitas
}

// Función auxiliar exportada para obtener la configuración de redes sociales
export const getSocialNetworksConfig = async () => {
  try {
    const contentBlockId =
      process.env.NEXT_PUBLIC_REDESSOCIALES_CONTENTBLOCK || "REDESSOCIALES";

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
    );

    if (response.data.contentBlock?.contentText) {
      try {
        const savedNetworks = JSON.parse(response.data.contentBlock.contentText);
        // Agregar iconos a las redes sociales
        return savedNetworks.map((network: any) => ({
          ...network,
          icon: getSocialNetworkIcon(network.name),
        }));
      } catch (parseError) {
        console.warn("El contenido no es JSON válido, usando configuración por defecto:", response.data.contentBlock.contentText);
        return [];
      }
    }
    return [];
  } catch (error) {
    console.error("Error cargando configuración de redes sociales:", error);
    return [];
  }
};

// Función para obtener el icono correspondiente a una red social (ahora exportada)
export const getSocialNetworkIcon = (networkName: string) => {
  switch (networkName.toLowerCase()) {
    case "instagram":
      return <InstagramIcon />;
    case "facebook":
      return <FacebookIcon />;
    case "whatsapp":
      return <WhatsAppIcon />;
    case "linkedin":
      return <LinkedInIcon />;
    case "tiktok":
      return <TikTokIcon />;
    default:
      return <InstagramIcon />; // Icono por defecto
  }
};

const RedesSociales: React.FC<ReviewSettingsProps> = () => {
  const {
    socialNetworks: contextSocialNetworks,
    loading,
    error: contextError,
    updateSocialNetworks,
    saveSocialNetworks,
  } = useSocialNetworks();

  // Estado local para la UI
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [originalSocialNetworks, setOriginalSocialNetworks] = useState<
    SocialNetwork[]
  >([]);
  const [showAddMore, setShowAddMore] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Todas las redes sociales disponibles para agregar
  const allAvailableNetworks: SocialNetwork[] = [
    {
      name: "WhatsApp",
      url: "",
      enabled: false,
      icon: <WhatsAppIcon />,
    },
    {
      name: "LinkedIn",
      url: "",
      enabled: false,
      icon: <LinkedInIcon />,
    },
    {
      name: "TikTok",
      url: "",
      enabled: false,
      icon: <TikTokIcon />,
    },
  ];

  // Sincronizar el estado local con el contexto
  useEffect(() => {
    if (contextSocialNetworks.length > 0) {
      // Agregar iconos a las redes sociales del contexto
      const networksWithIcons = contextSocialNetworks.map((network) => ({
        ...network,
        icon: getSocialNetworkIcon(network.name),
      }));
      setSocialNetworks(networksWithIcons);
      // Solo actualizar originalSocialNetworks en la carga inicial
      if (isInitialLoad) {
        setOriginalSocialNetworks(networksWithIcons);
        setIsInitialLoad(false);
      }
    } else if (!loading) {
      // Si no hay redes sociales en el contexto y ya terminó de cargar, usar valores por defecto
      const defaultNetworks = [
        {
          name: "Instagram",
          url: "",
          enabled: false,
          icon: <InstagramIcon />,
        },
        {
          name: "Facebook",
          url: "",
          enabled: false,
          icon: <FacebookIcon />,
        },
      ];
      setSocialNetworks(defaultNetworks);
      setOriginalSocialNetworks(defaultNetworks);
      setIsInitialLoad(false);
    }
  }, [contextSocialNetworks, loading, isInitialLoad]);

  // Guardar configuración de redes sociales usando el contexto
  const saveSocialNetworksSettings = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // Limpiar los datos antes de guardar, eliminando los iconos (componentes React)
      const cleanSocialNetworks = socialNetworks.map((network) => ({
        name: network.name,
        url: network.url,
        enabled: network.enabled,
      }));

      const success = await saveSocialNetworks(cleanSocialNetworks);

      if (success) {
        toast.success("Configuración de redes sociales guardada correctamente");
        setOriginalSocialNetworks([...socialNetworks]);
        setIsInitialLoad(false);
        // El contexto ya se actualiza inmediatamente con cada cambio
      } else {
        toast.error("Error al guardar la configuración de redes sociales");
      }
    } catch (error) {
      console.error("Error guardando configuración de redes sociales:", error);
      toast.error("Error al guardar la configuración de redes sociales");
    } finally {
      setSaving(false);
    }
  };

  // Actualizar una red social específica
  const updateSocialNetwork = (
    index: number,
    field: keyof SocialNetwork,
    value: string | boolean
  ) => {
    const updatedNetworks = [...socialNetworks];
    updatedNetworks[index] = {
      ...updatedNetworks[index],
      [field]: value,
    };
    setSocialNetworks(updatedNetworks);

    // Actualizar inmediatamente el contexto para la vista previa
    const cleanNetworks = updatedNetworks.map((network) => ({
      name: network.name,
      url: network.url,
      enabled: network.enabled,
    }));
    updateSocialNetworks(cleanNetworks);
  };

  // Agregar una red social
  const addSocialNetwork = (network: SocialNetwork) => {
    const updatedNetworks = [...socialNetworks, network];
    setSocialNetworks(updatedNetworks);
    setShowAddMore(false);
    toast.success(`${network.name} agregada correctamente`);

    // Actualizar inmediatamente el contexto para la vista previa
    const cleanNetworks = updatedNetworks.map((network) => ({
      name: network.name,
      url: network.url,
      enabled: network.enabled,
    }));
    updateSocialNetworks(cleanNetworks);
  };

  // Remover una red social
  const removeSocialNetwork = (index: number) => {
    const networkName = socialNetworks[index].name;
    const updatedNetworks = socialNetworks.filter((_, i) => i !== index);
    setSocialNetworks(updatedNetworks);
    toast.success(`${networkName} eliminada correctamente`);

    // Actualizar inmediatamente el contexto para la vista previa
    const cleanNetworks = updatedNetworks.map((network) => ({
      name: network.name,
      url: network.url,
      enabled: network.enabled,
    }));
    updateSocialNetworks(cleanNetworks);
  };

  // Obtener redes sociales disponibles para agregar (que no estén ya agregadas)
  const getAvailableNetworksToAdd = () => {
    const currentNetworkNames = socialNetworks.map((network) => network.name);
    return allAvailableNetworks.filter(
      (network) => !currentNetworkNames.includes(network.name)
    );
  };

  // Función para obtener el icono correspondiente a una red social
  const getSocialNetworkIcon = (networkName: string) => {
    switch (networkName.toLowerCase()) {
      case "instagram":
        return <InstagramIcon />;
      case "facebook":
        return <FacebookIcon />;
      case "whatsapp":
        return <WhatsAppIcon />;
      case "linkedin":
        return <LinkedInIcon />;
      case "tiktok":
        return <TikTokIcon />;
      default:
        return <InstagramIcon />; // Icono por defecto
    }
  };

  // Función para detectar si hay cambios
  const hasChanges = () => {
    if (socialNetworks.length !== originalSocialNetworks.length) {
      return true;
    }

    return socialNetworks.some((network, index) => {
      const original = originalSocialNetworks[index];
      return (
        !original ||
        network.name !== original.name ||
        network.url !== original.url ||
        network.enabled !== original.enabled
      );
    });
  };

  // Manejar errores del contexto
  useEffect(() => {
    if (contextError) {
      setError(contextError);
      toast.error(contextError);
    }
  }, [contextError]);

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Configuración de Redes Sociales
        </h2>
        <div className="flex items-center space-x-2">
          {hasChanges() && (
            <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded-md flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 14.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              Cambios pendientes
            </span>
          )}
          <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-md flex items-center">
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            Vista previa en tiempo real
          </span>
        </div>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              Esta configuración se sincroniza automáticamente con el footer y
              otros componentes de la tienda.{" "}
              <strong>
                Los cambios se ven inmediatamente en la vista previa {" "} 
              </strong>
              y se aplicarán permanentemente al guardar.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {socialNetworks.map((network, index) => (
          <div
            key={network.name}
            className="bg-gray-50 p-6 rounded-lg border border-gray-200"
          >
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-gray-600">{network.icon}</div>
                  <h3 className="text-lg font-medium text-gray-700">
                    {network.name}
                  </h3>
                </div>
                <div className="flex items-center space-x-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={network.enabled}
                      onChange={(e) =>
                        updateSocialNetwork(index, "enabled", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                  {socialNetworks.length > 2 && (
                    <button
                      onClick={() => removeSocialNetwork(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar red social"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {network.enabled && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    URL de {network.name}
                  </label>
                  <input
                    type="url"
                    value={network.url}
                    onChange={(e) =>
                      updateSocialNetwork(index, "url", e.target.value)
                    }
                    placeholder={`https://${network.name.toLowerCase()}.com/tu-perfil`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-white"
                  />
                  <p className="text-xs text-gray-500">
                    Ejemplo: https://{network.name.toLowerCase()}.com/tu-perfil
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Botón para agregar más redes sociales */}
        {getAvailableNetworksToAdd().length > 0 && (
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 border-dashed">
            <button
              onClick={() => setShowAddMore(true)}
              className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg
                className="w-5 h-5"
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
              <span>Agregar más redes sociales</span>
            </button>
          </div>
        )}

        {/* Modal para agregar redes sociales */}
        {showAddMore && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Agregar red social
                </h3>
                <button
                  onClick={() => setShowAddMore(false)}
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

              <div className="space-y-3">
                {getAvailableNetworksToAdd().map((network) => (
                  <button
                    key={network.name}
                    onClick={() => addSocialNetwork(network)}
                    className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="text-gray-600">{network.icon}</div>
                    <span className="font-medium text-gray-700">
                      {network.name}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowAddMore(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center w-full">
          <button
            onClick={saveSocialNetworksSettings}
            disabled={saving || !hasChanges()}
            className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
              hasChanges() && !saving
                ? "bg-primary text-white hover:bg-primary/80 focus:ring-2 focus:ring-primary/20"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
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
              "Guardar Configuración"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RedesSociales;
