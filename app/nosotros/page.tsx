"use client";

import React, { useEffect, useState } from "react";
import { AboutConfig, fetchAboutConfig, getDefaultAboutConfig } from "@/app/utils/aboutConfig";
import ClientAboutComponents from "@/app/components/AboutHomeComponents";

function Nosotros() {
  const [config, setConfig] = useState<AboutConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAboutConfig = async () => {
    try {
      setLoading(true);
      const aboutConfig = await fetchAboutConfig();
      
      if (aboutConfig) {
        setConfig(aboutConfig);
      } else {
        // Usar configuración por defecto si no hay configuración guardada
        setConfig(getDefaultAboutConfig());
      }
    } catch (error) {
      console.error("Error al cargar configuración de About:", error);
      // Usar configuración por defecto en caso de error
      setConfig(getDefaultAboutConfig());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAboutConfig();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando página...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-600">Error al cargar la configuración</p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <ClientAboutComponents config={config} />
    </div>
  );
}

export default Nosotros;
