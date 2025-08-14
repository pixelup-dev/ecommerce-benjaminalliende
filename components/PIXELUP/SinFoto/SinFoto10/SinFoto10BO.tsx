"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader-t";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { popularIcons } from "@/utils/iconList";

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
  contentText: string;
  icon?: string; // Agregar campo para el icono
} 

interface ContentData {
  epigrafe: string;
  titulo: string;
  contenido: string;
  box1: BoxContent;
  box2: BoxContent;
  box3: BoxContent;
  box4: BoxContent; // Agregar box4
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}


const SinFoto10BO: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO10_CONTENTBLOCK || "";
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);

  // Función para renderizar iconos dinámicamente
  const renderIcon = (iconName: string, className: string = "text-2xl text-primary") => {
    if (!iconName) return null;
    
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return null;
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

  // Estado para los datos del formulario
  const [formData, setFormData] = useState<ContentData>({
    epigrafe: "",
    titulo: "",
    contenido: "",
    box1: { title: "", contentText: "", icon: "Heart" },
    box2: { title: "", contentText: "", icon: "Settings" },
    box3: { title: "", contentText: "", icon: "Smile" },
    box4: { title: "", contentText: "", icon: "Star" }, // Agregar box4
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;

      const response = await axios.get<ApiResponse>(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${ContentBlockId}?siteId=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 0 && response.data.contentBlock) {
        try {
          // Intentar parsear el contentText como JSON
          const parsedData = JSON.parse(response.data.contentBlock.contentText);
          setFormData(parsedData);
        } catch (error) {
          console.error("Error al parsear JSON:", error);
          // Si hay error al parsear, mantener los valores por defecto
        }
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;

      // Formatear el link del botón antes de enviar
      // const formattedLinkBoton = formatURL(formData.linkBoton); // Eliminado

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${ContentBlockId}?siteId=${siteId}`,
        {
          title: "SinFoto Content",
          contentText: JSON.stringify({
            ...formData,
            // linkBoton: formattedLinkBoton, // Eliminado
          }),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.code === 0) {
        // Revalidar el cache del cliente
        await fetch("/api/revalidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: `/api/v1/content-blocks/${ContentBlockId}`,
          }),
        });

        await fetchData();
      }
    } catch (error) {
      console.error("Error al actualizar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof ContentData | keyof BoxContent,
    value: string,
    boxIndex?: number
  ) => {
    if (boxIndex !== undefined) {
      // Actualizar datos de un box específico
      const boxKey = `box${boxIndex + 1}` as keyof ContentData;
      const boxData = formData[boxKey] as BoxContent;
      setFormData((prev) => ({
        ...prev,
        [boxKey]: {
          ...boxData,
          [field as keyof BoxContent]: value,
        },
      }));
    } else {
      // Actualizar datos principales
      setFormData((prev) => ({
        ...prev,
        [field as keyof ContentData]: value,
      }));
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-xl font-bold mb-2 sm:mb-0">Sección SinFoto</h2>
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
          >
            {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa"}
          </button>
        </div>

        {/* Vista previa */}
        {showPreview && (
          <div className="mb-8 overflow-x-auto">
            <h3 className="font-medium text-gray-700 mb-4">Vista Previa:</h3>
            <div className="py-16 px-4 max-w-7xl mx-auto">
              <div className="text-center mb-8">
                <p className="text-[16px] font-medium text-primary mb-1">
                  {formData.epigrafe}
                </p>
                <h2 className="text-5xl font-oswald text-stone-900 mb-2">
                  {formData.titulo}
                </h2>
                <p className="text-stone-600 text-sm max-w-2xl mx-auto">
                  {formData.contenido}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[formData.box1, formData.box2, formData.box3, formData.box4].map((box, index) => (
                  <div key={index} className="flex flex-col items-center text-center p-4 bg-gray-50">
                    <div className="mb-2 bg-primary p-3 rounded-full">
                      {renderIcon(box.icon || "Circle", "w-6 h-6 text-white")}
                    </div>
                    <h3 className="text-xl font-oswald text-stone-900 mb-1">
                      {box.title}
                    </h3>
                    <p className="text-stone-600 text-xs">
                      {box.contentText}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Formulario de edición */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div>
            <h3 className="font-normal text-primary">
              Epígrafe <span className="text-primary">*</span>
            </h3>
            <input
              type="text"
              value={formData.epigrafe}
              onChange={(e) => handleChange("epigrafe", e.target.value)}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Texto del epígrafe"
            />
          </div>

          <div>
            <h3 className="font-normal text-primary">
              Título <span className="text-primary">*</span>
            </h3>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Texto del título"
            />
          </div>

          <div>
            <h3 className="font-normal text-primary">
              Texto Principal <span className="text-primary">*</span>
            </h3>
            <textarea
              value={formData.contenido}
              onChange={(e) => handleChange("contenido", e.target.value)}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
              rows={3}
              placeholder="Texto principal de la sección"
            />
          </div>

          {/* Eliminado el botón de link */}
          

          {/* Boxes Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((boxNum) => {
              const boxKey = `box${boxNum}` as keyof ContentData;
              const boxData = formData[boxKey] as BoxContent;
              return (
                <div key={boxNum} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Box {boxNum}</h3>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-normal text-primary">
                        Título <span className="text-primary">*</span>
                      </h3>
                      <input
                        type="text"
                        value={boxData.title}
                        onChange={(e) => handleChange("title", e.target.value, boxNum - 1)}
                        className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                        style={{ borderRadius: "var(--radius)" }}
                      />
                    </div>
                    <div>
                      <h3 className="font-normal text-primary">
                        Contenido <span className="text-primary">*</span>
                      </h3>
                      <textarea
                        value={boxData.contentText}
                        onChange={(e) => handleChange("contentText", e.target.value, boxNum - 1)}
                        className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                        style={{ borderRadius: "var(--radius)" }}
                        rows={3}
                      />
                    </div>
                    <div>
                      <h3 className="font-normal text-primary">
                        Icono <span className="text-primary">*</span>
                      </h3>
                      <div className="relative">
                        <select
                          value={boxData.icon || "Circle"}
                          onChange={(e) => handleChange("icon", e.target.value, boxNum - 1)}
                          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 appearance-none bg-white"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          {popularIcons.map((iconName) => (
                            <option key={iconName} value={iconName}>
                              {iconName}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {/* Vista previa del icono seleccionado */}
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-sm text-gray-600">Vista previa:</span>
                        <div className="bg-primary/10 rounded-full p-2">
                          {renderIcon(boxData.icon || "Circle", "text-lg text-primary")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/80 transition-colors"
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar Sección"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SinFoto10BO;
