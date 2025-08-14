"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader-t";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { FaStore, FaHandshake, FaShieldAlt } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';
import { popularIcons } from "@/utils/iconList";

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
  contentText: string;
  icon: string;
} 

interface ContentData {
  epigrafe: string;
  titulo: string;
  contenido: string;
  box1: BoxContent;
  box2: BoxContent;
  box3: BoxContent;
  box4: BoxContent;
  box5: BoxContent;
  textoBoton: string;
  linkBoton: string;
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const SinFoto12BO: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO12_CONTENTBLOCK || "";
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);



  // Función para renderizar el icono dinámicamente
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="text-[96px] text-green-800" />;
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
    box1: { title: "", contentText: "", icon: "Handshake" },
    box2: { title: "", contentText: "", icon: "Shield" },
    box3: { title: "", contentText: "", icon: "Store" },
    box4: { title: "", contentText: "", icon: "Handshake" },
    box5: { title: "", contentText: "", icon: "Shield" },
    textoBoton: "",
    linkBoton: "",
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
          toast.error("Error al procesar los datos");
        }
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar la sección");
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
      const formattedLinkBoton = formatURL(formData.linkBoton);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${ContentBlockId}?siteId=${siteId}`,
        {
          title: "SinFoto Content",
          contentText: JSON.stringify({
            ...formData,
            linkBoton: formattedLinkBoton,
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
        toast.success("Sección actualizada exitosamente");
      }
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      toast.error("Error al actualizar la sección");
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
      <Toaster />
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
            <section className="relative py-20 bg-green-900 text-white overflow-hidden">
              {/* Imagen de fondo con efecto parallax */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-fixed z-0 opacity-20"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
                  backgroundAttachment: "fixed",
                }}
              ></div>

              {/* Overlay con gradiente para mejorar la legibilidad */}
              <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-[#047DC8]/40 z-0"></div>

              <div className="relative z-10 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <span className="inline-block px-4 py-1 bg-[#047DC8] text-white text-sm uppercase tracking-wider rounded mb-4">
                    {formData.epigrafe}
                  </span>
                  <h2 className="text-5xl font-bold mb-6 font-lilita-one">
                    {formData.titulo}
                  </h2>
                  <div className="h-1 w-32 bg-[#047DC8] mx-auto mb-8"></div>
                  <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                    {formData.contenido}
                  </p>
                </div>

                <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start space-y-12 md:space-y-0 md:space-x-4">
                  {/* Línea conectora */}
                  <div
                    className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-[#047DC8]/50 transform -translate-y-1/2 z-0"
                    style={{ width: "calc(100% - 8rem)", left: "4rem" }}
                  ></div>

                  {[formData.box1, formData.box2, formData.box3, formData.box4, formData.box5].map((box, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center text-center relative z-10 w-full md:w-1/5 px-4 group"
                    >
                      <div className="w-24 h-24 bg-gray-50 rounded flex items-center justify-center text-4xl mb-6 shadow-xl">
                        {renderIcon(box.icon)}
                      </div>

                      <h3 className="text-xl mb-3 font-lilita-one group-hover:text-[#047DC8] transition-colors">
                        {box.title}
                      </h3>
                      <p className="text-white/90 text-sm md:text-xs leading-tight">
                        {box.contentText}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-16 text-center">
                  <Link
                    href={formData.linkBoton || '#'}
                    className="inline-block px-8 py-4 bg-lime-600 hover:bg-lime-700 text-white rounded transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    {formData.textoBoton || 'Texto del botón'}
                  </Link>
                </div>
              </div>
            </section>
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
              placeholder="Título de la sección"
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-normal text-primary">
                Texto del Botón <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={formData.textoBoton}
                onChange={(e) => handleChange("textoBoton", e.target.value)}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
                placeholder="Texto del botón"
              />
            </div>
            <div>
              <h3 className="font-normal text-primary">
                Link del Botón <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={formData.linkBoton}
                onChange={(e) => handleChange("linkBoton", e.target.value)}
                onBlur={(e) => {
                  const formattedLink = formatURL(e.target.value);
                  handleChange("linkBoton", formattedLink);
                }}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
                placeholder="URL del botón"
              />
            </div>
          </div>
          

          {/* Boxes Forms */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((boxNum) => {
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
                      <select
                        value={boxData.icon}
                        onChange={(e) => handleChange("icon", e.target.value, boxNum - 1)}
                        className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        {popularIcons.map((icon) => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 p-2 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center">
                          {renderIcon(boxData.icon)}
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

export default SinFoto12BO;
