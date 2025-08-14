"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";
import AboutConfigManager from "@/app/components/AboutConfigManager";
import { AboutConfig } from "@/app/utils/aboutConfig";
import { useSubscriptionPlan } from "@/hooks/useSubscriptionPlan";
import { useSharedConfigs } from "@/hooks/useSharedConfigs";
import { availableComponents, getComponentsForPage } from "@/app/config/availableComponents";
import { useDynamicComponents } from "@/hooks/useDynamicComponents";

export default function AboutUsPage() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});
  const [aboutConfig, setAboutConfig] = useState<AboutConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Usar el hook personalizado para verificación de suscripción
  const { hasAdvancedOrProPlan, currentPlan, loading: subscriptionLoading, error: subscriptionError } = useSubscriptionPlan();
  
  // Usar el hook para configuraciones compartidas
  const { homeActiveComponents, loading: sharedConfigsLoading, error: sharedConfigsError } = useSharedConfigs();

  // Usar el hook para componentes dinámicos
  const { renderComponent } = useDynamicComponents({
    page: 'about',
    type: 'back'
  });

  // Cargar configuración de About
  const fetchAboutConfig = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const configId =
        process.env.NEXT_PUBLIC_ABOUT_CONFIG_CONTENTBLOCK ||
        "about-config-default";

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${configId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (response.data.code === 0 && response.data.contentBlock) {
        try {
          const config = JSON.parse(response.data.contentBlock.contentText);
          // Validar que la configuración tenga la estructura correcta
          if (config.visibleComponents && config.order) {
            setAboutConfig(config);
          } else {
            throw new Error("Configuración inválida");
          }
        } catch (error) {
          console.log("Usando configuración por defecto:", error);
          // Si no hay configuración, usar configuración por defecto
          const defaultConfig: AboutConfig = {
            visibleComponents: availableComponents.map((comp) => comp.id),
            order: availableComponents.map((comp) => comp.id),
          };
          setAboutConfig(defaultConfig);
        }
      } else {
        // Si no hay respuesta válida, usar configuración por defecto
        const defaultConfig: AboutConfig = {
          visibleComponents: availableComponents.map((comp) => comp.id),
          order: availableComponents.map((comp) => comp.id),
        };
        setAboutConfig(defaultConfig);
      }
    } catch (error) {
      console.error("Error al cargar configuración de About:", error);
      // Configuración por defecto
      const defaultConfig: AboutConfig = {
        visibleComponents: availableComponents.map((comp) => comp.id),
        order: availableComponents.map((comp) => comp.id),
      };
      setAboutConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  // Guardar configuración de About
  const saveAboutConfig = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const configId =
        process.env.NEXT_PUBLIC_ABOUT_CONFIG_CONTENTBLOCK ||
        "about-config-default";

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${configId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "Configuración de About Us",
          contentText: JSON.stringify(aboutConfig),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 0) {
        toast.success("Configuración guardada exitosamente");
        // Revalidar cache
        await fetch("/api/revalidate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: "/nosotros" }),
        });
      }
    } catch (error) {
      console.error("Error al guardar configuración:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en la configuración
  const handleConfigChange = (newConfig: AboutConfig) => {
    setAboutConfig(newConfig);
  };

  // Restaurar configuración por defecto
  const resetAboutConfig = () => {
    const defaultConfig: AboutConfig = {
      visibleComponents: availableComponents.map((comp) => comp.id),
      order: availableComponents.map((comp) => comp.id),
    };
    setAboutConfig(defaultConfig);
    toast.success("Configuración restaurada por defecto");
  };

  useEffect(() => {
    fetchAboutConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const newState = {
        ...prev,
        [sectionId]: !prev[sectionId],
      };

      if (newState[sectionId] && sectionRefs.current[sectionId]) {
        setTimeout(() => {
          sectionRefs.current[sectionId]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }

      return newState;
    });
  };

  if (loading && !aboutConfig) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  // Obtener componentes ordenados según la configuración
  const orderedComponents =
    aboutConfig?.order
      ?.map((componentId: string) => {
        const componentInfo = availableComponents.find(
          (comp) => comp.id === componentId
        );
        if (!componentInfo) return null;

        return {
          ...componentInfo,
          component: renderComponent(componentId),
        };
      })
      .filter(Boolean) || [];

  return (
    <section className="gap-4 flex flex-col py-10 mx-4">
      <title>Content block - About</title>
      
      {/* Componentes ordenados */}
      {orderedComponents.map((section: any) => {
        // Verificar si el componente está compartido con Home
        const isHomeComponent = homeActiveComponents.includes(section.id);

        return (
          <div
            key={section.id}
            ref={(el) => (sectionRefs.current[section.id] = el)}
            className="rounded-sm border w-full border-stroke bg-white shadow-default dark:border-black dark:bg-black"
            style={{ borderRadius: "var(--radius)" }}
          >
            <div
              className="text-sm flex gap-2 font-medium border-b p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-2 items-center">
                  <div>{section.title}</div>
                </div>
                <div className="flex gap-2 items-center">
                  {isHomeComponent && (
                    <div className="relative group">
                      <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-normal break-words z-10 min-w-[200px] max-w-[320px]">
                        Al editar este componente aquí, también se editará en la pantalla de inicio
                        <div className="absolute top-full right-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  )}
                  {openSections[section.id] ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 15.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
            <div
              className={`transition-all duration-300 overflow-hidden ${
                openSections[section.id] ? "py-6 px-8" : "h-0 py-0 px-8"
              }`}
            >
              {section.component}
            </div>
          </div>
        );
      })}

      {/* Mensaje de restricción para usuarios sin plan Avanzado o Pro */}
      {!subscriptionLoading && !hasAdvancedOrProPlan && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm text-red-700">
                <p>La configuración de About Us es exclusiva del Plan Avanzado y Plan Pro. Puedes actualizar tu plan en la sección <a href="/dashboard/suscripciones/estado" rel="noopener noreferrer" className="underline">Suscripción.</a></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de configuración con drag and drop */}
      <div className={`rounded-sm border w-full border-stroke bg-white shadow-default dark:border-black dark:bg-black mb-6 ${
        !hasAdvancedOrProPlan ? 'opacity-50 pointer-events-none' : ''
      }`}>
        <div className="p-6">
          {aboutConfig && (
            <AboutConfigManager
              availableComponents={getComponentsForPage('about')}
              config={aboutConfig}
              onConfigChange={handleConfigChange}
              onSave={saveAboutConfig}
              onReset={resetAboutConfig}
              loading={loading}
              homeActiveComponents={homeActiveComponents}
            />
          )}
        </div>
      </div>
    </section>
  );
}
