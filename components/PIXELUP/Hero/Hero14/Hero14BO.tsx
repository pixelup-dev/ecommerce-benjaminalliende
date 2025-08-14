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
  paragraph: string;
  listItems: string[];
  buttonText: string;
  buttonLink: string;
  videoUrl: string;
  videoUrl2: string;
  videoTitle1: string;

  videoTitle2: string;

}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const Hero14BO: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_HERO14_CONTENTBLOCK || "";
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);

  // Funciones para manejar URLs de YouTube
  const extractYouTubeId = (url: string): string | null => {
    // Manejo de URLs de YouTube Shorts
    if (url.includes('youtube.com/shorts/')) {
      const shortsMatch = url.match(/youtube\.com\/shorts\/([^?&]+)/);
      return shortsMatch ? shortsMatch[1] : null;
    }
    
    // Manejo de URLs normales de YouTube
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const convertToEmbedUrl = (url: string): string => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return url;
    
    // Para shorts, usamos el formato de embed normal
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playlist=${videoId}&rel=0&modestbranding=1&controls=0&showinfo=0&enablejsapi=1`;
  };

  // Estado para los datos del formulario
  const [formData, setFormData] = useState<ContentData>({
    title: "",
    paragraph: "",
    listItems: ["", "", ""],
    buttonText: "",
    buttonLink: "",
    videoUrl: "",
    videoUrl2: "",
    videoTitle1: "",

    videoTitle2: "",

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
          setFormData({
            title: "",
            paragraph: "",
            listItems: ["", "", ""],
            buttonText: "",
            buttonLink: "",
            videoUrl: "",
            videoUrl2: "",
            videoTitle1: "",
            videoTitle2: "",
          });
        }
      }
    } catch (error) {
      console.error("Error al obtener datos:", error);
      // En caso de error, mantener los valores por defecto
      setFormData({
        title: "",
        paragraph: "",
        listItems: ["", "", ""],
        buttonText: "",
        buttonLink: "",
        videoUrl: "",
        videoUrl2: "",
        videoTitle1: "",
        videoTitle2: "",
      });
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
    field: keyof ContentData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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
            <section className="py-12 bg-white">
              <div className="mx-auto px-4">
                {/* Encabezado con estilo consistente */}
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center max-w-[90%] mx-auto px-4">
                    <div className="flex-grow h-px bg-gray-200"></div>
                    <h2 className="font-oldStandard text-2xl md:text-3xl text-gray-900 px-4">
                      {formData.title}
                    </h2>
                    <div className="flex-grow h-px bg-gray-200"></div>
                  </div>
                  <h4 className="font-poppins text-md text-primary uppercase tracking-wider -mt-2">
                    {formData.paragraph}
                  </h4>
                </div>

                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Columna video 1 */}
                    <div className="aspect-video overflow-hidden shadow-lg"  style={{ borderRadius: "var(--radius)" }}
                    >
                      <iframe
                        className="w-full h-full shadow-lg"
                        src={formData.videoUrl}
                        title="Video 1"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />

                    </div>

                    {/* Columna video 2 */}
                    <div className="aspect-video overflow-hidden shadow-lg"  style={{ borderRadius: "var(--radius)" }}
                    >
                      <iframe
                        className="w-full h-full  shadow-lg"
                        src={formData.videoUrl2}
                        title="Video 2"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />

                    </div>
                  </div>
                  <div className="flex justify-center mt-6">
                    <button className="bg-primary text-white px-4 py-2" style={{ borderRadius: "var(--radius)" }}>
                      {formData.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Formulario de edición */}
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <h3 className="font-normal text-primary">
                Título <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <h3 className="font-normal text-primary">
                Párrafo <span className="text-primary">*</span>
              </h3>
              <textarea
                value={formData.paragraph}
                onChange={(e) => handleChange("paragraph", e.target.value)}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                rows={4}
                required
              />
            </div>

            <div>
              <h3 className="font-normal text-primary">
                Texto del botón <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={formData.buttonText}
                onChange={(e) => handleChange("buttonText", e.target.value)}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <h3 className="font-normal text-primary">
                Link del botón <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={formData.buttonLink}
                onChange={(e) => handleChange("buttonLink", e.target.value)}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div>
              <h3 className="font-normal text-primary">
                URL del video (YouTube) <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={formData.videoUrl}
                onChange={(e) => {
                  const url = e.target.value;
                  const embedUrl = convertToEmbedUrl(url);
                  handleChange("videoUrl", embedUrl);
                }}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                placeholder="Ej: https://www.youtube.com/watch?v=VIDEO_ID"
                required
              />
            </div>

            <div>
              <h3 className="font-normal text-primary">
                URL del segundo video (YouTube) <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={formData.videoUrl2}
                onChange={(e) => {
                  const url = e.target.value;
                  const embedUrl = convertToEmbedUrl(url);
                  handleChange("videoUrl2", embedUrl);
                }}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                placeholder="Ej: https://www.youtube.com/watch?v=VIDEO_ID"
                required
              />
            </div>




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

export default Hero14BO;
