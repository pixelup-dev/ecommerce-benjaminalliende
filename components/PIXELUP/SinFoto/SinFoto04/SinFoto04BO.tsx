"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader-t";

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
  contentText: string;
}

interface ContentData {
  title: string;
  box1: BoxContent;
  box2: BoxContent;
  box3: BoxContent;
  box4: BoxContent;
  box5: BoxContent;
  box6: BoxContent;
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const SinFoto04BO: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO04_CONTENTBLOCK || "";
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);

  // Estado para los datos del formulario
  const [formData, setFormData] = useState<ContentData>({
    title: "",
    box1: { title: "", contentText: "" },
    box2: { title: "", contentText: "" },
    box3: { title: "", contentText: "" },
    box4: { title: "", contentText: "" },
    box5: { title: "", contentText: "" },
    box6: { title: "", contentText: "" },
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
                        {/* Mensaje de alerta informativa */}
                        <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Este es un preview referencial, por lo cual algunos elementos pueden no quedar correctamente organizados.</span>
              </div>
            </div>
            <section className="py-16 bg-white">
              <div className="mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
                  {formData.title || "Título Principal"}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[formData.box1, formData.box2, formData.box3, formData.box4, formData.box5, formData.box6].map((box, index) => (
                    <div key={index} className="bg-gray-50 p-8 rounded-2xl hover:shadow-xl transition-all duration-300">
                      <div className="w-16 h-16 bg-[#F5A623]/10 rounded-full flex items-center justify-center mb-6">
                        <svg
                          className="w-8 h-8 text-[#F5A623]"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {index === 0 && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          )}
                          {index === 1 && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                            />
                          )}
                          {index === 2 && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          )}
                          {index === 3 && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          )}
                          {index === 4 && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                            />
                          )}
                          {index === 5 && (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            />
                          )}
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold mb-4">{box.title}</h3>
                      <p className="text-gray-600">{box.contentText}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Formulario de edición */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          {/* Título principal */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-normal text-primary">
              Título Principal <span className="text-primary">*</span>
            </h3>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
              required
            />
          </div>

          {/* Boxes Forms */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((boxNum) => {
              const boxKey = `box${boxNum}` as keyof ContentData;
              const boxData = formData[boxKey] as BoxContent;
              return (
                <div key={boxNum} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-normal text-primary mb-4">Box {boxNum}</h3>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-normal text-primary">
                        Título <span className="text-primary">*</span>
                      </h3>
                      <input
                        type="text"
                        value={boxData.title}
                        onChange={(e) => handleChange("title", e.target.value, boxNum - 1)}
                        className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <h3 className="font-normal text-primary">
                        Contenido <span className="text-primary">*</span>
                      </h3>
                      <textarea
                        value={boxData.contentText}
                        onChange={(e) => handleChange("contentText", e.target.value, boxNum - 1)}
                        className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="text-white shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded flex-wrap mt-6"
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar Sección"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default SinFoto04BO;