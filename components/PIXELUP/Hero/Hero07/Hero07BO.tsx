"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader-t";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

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
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const Hero07BO: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_HERO07_CONTENTBLOCK || "";
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);

  // Funciones para manejar URLs de YouTube
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const convertToEmbedUrl = (url: string): string => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return url;
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playlist=${videoId}&rel=0&modestbranding=1&controls=0&showinfo=0&enablejsapi=1`;
  };

  // Estado para los datos del formulario
  const [formData, setFormData] = useState<ContentData>({
    title: "",
    paragraph: "",
    listItems: ["", "", ""],
    buttonText: "",
    buttonLink: "",
    videoUrl: ""
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
            videoUrl: ""
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
        videoUrl: ""
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
        toast.success("Sección actualizada exitosamente");
      }
    } catch (error) {
      console.error("Error al actualizar datos:", error);
      toast.error("Error al actualizar la sección. Por favor, intente nuevamente.");
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

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link'
  ];

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
            <section className="py-16 bg-white">
              <div className="mx-auto px-8 max-w-[90%]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Columna de Texto */}
                  <div className="space-y-6">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                      {formData.title}
                    </h2>
                    <div 
                      className="text-lg text-gray-600 mb-6"
                      dangerouslySetInnerHTML={{ __html: formData.paragraph }}
                    />
                    <div className="space-y-4">
                      {formData.listItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-8 bg-black text-white px-8 py-3 rounded-md hover:bg-black/50 transition-colors inline-flex items-center gap-2">
                      {formData.buttonText}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Columna de Video */}
                  <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full"
                      src={formData.videoUrl}
                      title="Video corporativo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
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
              <div className="mt-2 mb-4">
                <ReactQuill
                  value={formData.paragraph}
                  onChange={(content) => handleChange("paragraph", content)}
                  modules={modules}
                  formats={formats}
                  className="h-48 mb-12"
                />
              </div>
            </div>

            <div>
              <h3 className="font-normal text-primary mb-2">
                Elementos de la lista <span className="text-primary">*</span>
              </h3>
              <textarea
                value={formData.listItems.join('\n')}
                onChange={(e) => {
                  const items = e.target.value.split('\n');
                  setFormData(prev => ({ ...prev, listItems: items }));
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const textarea = e.target as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const value = textarea.value;
                    const newValue = value.substring(0, start) + '\n' + value.substring(end);
                    const items = newValue.split('\n');
                    setFormData(prev => ({ ...prev, listItems: items }));
                  }
                }}
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                placeholder="Ingrese cada elemento en una nueva línea"
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

export default Hero07BO;
