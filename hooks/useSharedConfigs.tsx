import { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { HomeConfig } from "@/app/utils/homeConfig";
import { AboutConfig } from "@/app/utils/aboutConfig";

interface SharedConfigs {
  homeActiveComponents: string[];
  aboutVisibleComponents: string[];
  loading: boolean;
  error: string | null;
}

export const useSharedConfigs = (): SharedConfigs => {
  const [homeActiveComponents, setHomeActiveComponents] = useState<string[]>([]);
  const [aboutVisibleComponents, setAboutVisibleComponents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedConfigs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = getCookie("AdminTokenAuth");
        
        // Usar Promise.all para cargar ambas configuraciones en paralelo
        const [homeResponse, aboutResponse] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_HOME_CONFIG_CONTENTBLOCK || "home-config-default"}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
          ),
          axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_ABOUT_CONFIG_CONTENTBLOCK || "about-config-default"}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
          )
        ]);

        // Procesar configuración de Home
        let homeComponents: string[] = [];
        if (homeResponse.data.code === 0 && homeResponse.data.contentBlock) {
          try {
            const config: HomeConfig = JSON.parse(homeResponse.data.contentBlock.contentText);
            homeComponents = config.visibleComponents || [];
          } catch {
            homeComponents = [];
          }
        }
        setHomeActiveComponents(homeComponents);

        // Procesar configuración de About
        let aboutComponents: string[] = [];
        if (aboutResponse.data.code === 0 && aboutResponse.data.contentBlock) {
          try {
            const config: AboutConfig = JSON.parse(aboutResponse.data.contentBlock.contentText);
            aboutComponents = config.visibleComponents || [];
          } catch {
            aboutComponents = [];
          }
        }
        setAboutVisibleComponents(aboutComponents);

      } catch (error) {
        console.error("Error cargando configuraciones compartidas:", error);
        setError("Error al cargar configuraciones");
        setHomeActiveComponents([]);
        setAboutVisibleComponents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedConfigs();
  }, []);

  return {
    homeActiveComponents,
    aboutVisibleComponents,
    loading,
    error,
  };
}; 