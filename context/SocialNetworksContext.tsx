"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

interface SocialNetwork {
  name: string;
  url: string;
  enabled: boolean;
}

interface SocialNetworksContextType {
  socialNetworks: SocialNetwork[];
  loading: boolean;
  error: string | null;
  updateSocialNetworks: (networks: SocialNetwork[]) => void;
  refreshSocialNetworks: () => Promise<void>;
  saveSocialNetworks: (networks: SocialNetwork[]) => Promise<boolean>;
}

const SocialNetworksContext = createContext<
  SocialNetworksContextType | undefined
>(undefined);

interface SocialNetworksProviderProps {
  children: ReactNode;
}

export const SocialNetworksProvider: React.FC<SocialNetworksProviderProps> = ({
  children,
}) => {
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar redes sociales desde el contentblock
  const loadSocialNetworks = async () => {
    try {
      setLoading(true);
      setError(null);

      const contentBlockId =
        process.env.NEXT_PUBLIC_REDESSOCIALES_CONTENTBLOCK || "REDESSOCIALES";

      // Intentar con la API pública primero (para el frontend)
      let response;
      try {
        response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
      } catch (publicError) {
        // Si falla, intentar con la API del BO (para el dashboard)
        const token = getCookie("AdminTokenAuth");
        if (token) {
          response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        } else {
          throw publicError;
        }
      }

      if (response.data.contentBlock?.contentText) {
        try {
          const savedNetworks = JSON.parse(
            response.data.contentBlock.contentText
          );
          setSocialNetworks(savedNetworks);
        } catch (parseError) {
          console.warn("El contenido no es JSON válido, usando configuración por defecto:", response.data.contentBlock.contentText);
          // Configuración por defecto si el contenido no es JSON válido
          setSocialNetworks([
            { name: "Instagram", url: "", enabled: false },
            { name: "Facebook", url: "", enabled: false },
          ]);
        }
      } else {
        // Configuración por defecto
        setSocialNetworks([
          { name: "Instagram", url: "", enabled: false },
          { name: "Facebook", url: "", enabled: false },
        ]);
      }
    } catch (error) {
      console.error("Error cargando redes sociales:", error);
      setError("Error al cargar las redes sociales");
      // Configuración por defecto en caso de error
      setSocialNetworks([
        { name: "Instagram", url: "", enabled: false },
        { name: "Facebook", url: "", enabled: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Guardar redes sociales en el contentblock
  const saveSocialNetworks = async (
    networks: SocialNetwork[]
  ): Promise<boolean> => {
    try {
      const token = getCookie("AdminTokenAuth");
      if (!token) {
        throw new Error("No hay token de autenticación");
      }

      const contentBlockId =
        process.env.NEXT_PUBLIC_REDESSOCIALES_CONTENTBLOCK || "REDESSOCIALES";

      // Limpiar los datos antes de guardar (eliminar propiedades que no son serializables)
      const cleanNetworks = networks.map((network) => ({
        name: network.name,
        url: network.url,
        enabled: network.enabled,
      }));

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "redes-sociales",
          contentText: JSON.stringify(cleanNetworks),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setSocialNetworks(networks);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error guardando redes sociales:", error);
      setError("Error al guardar las redes sociales");
      return false;
    }
  };

  // Actualizar redes sociales en el estado local
  const updateSocialNetworks = (networks: SocialNetwork[]) => {
    setSocialNetworks(networks);
  };

  // Refrescar redes sociales
  const refreshSocialNetworks = async () => {
    await loadSocialNetworks();
  };

  // Cargar redes sociales al inicializar
  useEffect(() => {
    loadSocialNetworks();
  }, []);

  const value: SocialNetworksContextType = {
    socialNetworks,
    loading,
    error,
    updateSocialNetworks,
    refreshSocialNetworks,
    saveSocialNetworks,
  };

  return (
    <SocialNetworksContext.Provider value={value}>
      {children}
    </SocialNetworksContext.Provider>
  );
};

// Hook para usar el contexto
export const useSocialNetworks = (): SocialNetworksContextType => {
  const context = useContext(SocialNetworksContext);
  if (context === undefined) {
    throw new Error(
      "useSocialNetworks debe ser usado dentro de un SocialNetworksProvider"
    );
  }
  return context;
};

// Función auxiliar para obtener el icono de una red social (mantenida para compatibilidad)
export const getSocialNetworkIcon = (networkName: string) => {
  // Esta función se puede mantener aquí o en el componente que la necesite
  // Por ahora la mantengo para compatibilidad con el código existente
  return null; // Los iconos se manejarán en los componentes específicos
};
