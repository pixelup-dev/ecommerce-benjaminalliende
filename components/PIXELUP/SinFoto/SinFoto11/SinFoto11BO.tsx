"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader-t";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { FaHandshake, FaShieldAlt } from "react-icons/fa";
import toast, { Toaster } from 'react-hot-toast';

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
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
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;  
  };
}

const SinFoto11BO: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO11_CONTENTBLOCK || "";
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);

  const availableIcons = [
    "Handshake", "Shield", "Store", "Heart", "Star", "CheckCircle",
    "Award", "Lightbulb", "Users", "Settings", "Globe", "Target",
    "TrendingUp", "Zap", "Leaf", "Sun", "Moon", "Cloud",
    "UsersRound", "Scale", "Eye", "Telescope", "Rocket", "BookOpenCheck",
    "ChartSpline", "FileChartColumnIncreasing", "SearchCheck"
  ];

  // Función para renderizar el icono dinámicamente
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="text-2xl text-primary" />;
  };

  // Estado para los datos del formulario
  const [formData, setFormData] = useState<ContentData>({
    epigrafe: "",
    titulo: "",
    contenido: "",
    box1: { title: "", icon: "Handshake" },
    box2: { title: "", icon: "Shield" },
    box3: { title: "", icon: "Store" },
    box4: { title: "", icon: "Handshake" },
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

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${ContentBlockId}?siteId=${siteId}`,
        {
          title: "SinFoto Content",
          contentText: JSON.stringify(formData),
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
            <div className="py-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
              {/* Título Principal de la Sección - CENTRADO CON EPÍGRAFE Y BAJADA */}
              <div className="text-center mb-6 relative">
                <p className="text-base font-semibold text-primary uppercase tracking-wider mb-2">
                  {formData.epigrafe}
                </p>
                <h2 className="text-4xl text-primary/70 mb-4 font-lilita-one">
                  {formData.titulo}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
                  {formData.contenido}
                </p>
                <div className="h-1 w-24 bg-primary mx-auto"></div>
              </div>

              {/* Fila de Iconos/Puntos Clave */}
              <div className="flex flex-col md:flex-row justify-around items-center text-center mb-6 space-y-4 md:space-y-0 z-30">
                {[formData.box1, formData.box2, formData.box3, formData.box4].map((box, index) => (
                  <React.Fragment key={index}>
                    <div className="flex flex-col items-center p-4">
                      <div className="text-3xl text-primary mb-2">
                        {renderIcon(box.icon)}
                      </div>
                      <h4 className="text-gray-600 text-sm text-center">
                        {box.title}
                      </h4>
                    </div>
                    {index < 3 && (
                      <>
                        <div className="hidden md:block h-12 w-px bg-gray-300"></div>
                        <div className="block md:hidden w-24 h-px bg-gray-300"></div>
                      </>
                    )}
                  </React.Fragment>
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

          {/* Boxes Forms */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        Icono <span className="text-primary">*</span>
                      </h3>
                      <select
                        value={boxData.icon}
                        onChange={(e) => handleChange("icon", e.target.value, boxNum - 1)}
                        className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        {availableIcons.map((icon) => (
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

export default SinFoto11BO;
