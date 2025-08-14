"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader";
import dynamic from "next/dynamic";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import toast, { Toaster } from 'react-hot-toast';

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import "./quill-custom.css";

interface Testimonio {
  id: string;
  nombre: string;
  texto: string;
}

const Testimonios06BO: React.FC = () => {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [nuevoTestimonio, setNuevoTestimonio] = useState({
    nombre: "",
    texto: "",
  });

  useEffect(() => {
    fetchTestimonios();
    setIsLoaded(true);
    const updateVisibleCount = () => {
      if (window.matchMedia("(min-width: 640px)").matches) {
        setVisibleCount(2); // tablet y desktop
      } else {
        setVisibleCount(1); // mobile
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + visibleCount;
      return nextIndex < testimonios.length ? nextIndex : prevIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - visibleCount;
      return nextIndex < 0
        ? Math.max(testimonios.length - visibleCount, 0)
        : nextIndex;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index * visibleCount);
  };

  const getTestimoniosToShow = () => {
    const testimoniosToShow = [];
    for (
      let i = 0;
      i < visibleCount && currentIndex + i < testimonios.length;
      i++
    ) {
      testimoniosToShow.push(testimonios[currentIndex + i]);
    }
    return testimoniosToShow;
  };

  const totalSlides = Math.ceil(testimonios.length / visibleCount);

  const fetchTestimonios = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS06_CONTENTBLOCK}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);
      const testimoniosData = JSON.parse(
        response.data.contentBlock.contentText || "[]"
      );
      console.log("Testimonios parseados:", testimoniosData);
      setTestimonios(testimoniosData);
    } catch (error) {
      console.error("Error al obtener los testimonios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS06_CONTENTBLOCK}`;

      // Crear el nuevo testimonio
      const nuevoTestimonioData = {
        id: Date.now().toString(),
        nombre: nuevoTestimonio.nombre,
        texto: nuevoTestimonio.texto,
      };

      // Combinar el nuevo testimonio con los existentes
      const testimoniosActualizados = [...testimonios, nuevoTestimonioData];

      // Enviar la actualización con todos los testimonios
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "Testimonios",
          contentText: JSON.stringify(testimoniosActualizados), // Enviamos el array actualizado
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/api/v1/content-blocks/${contentBlockId}`,
        }),
      });

      fetchTestimonios();
      setNuevoTestimonio({ nombre: "", texto: "" });
      toast.success("Testimonio agregado exitosamente");
    } catch (error) {
      console.error("Error al agregar el testimonio:", error);
      toast.error("Error al agregar el testimonio");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonio = async (testimonioId: string) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS06_CONTENTBLOCK}`;

      // Primero obtenemos los testimonios actuales
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Parseamos los testimonios actuales
      const currentTestimonios = JSON.parse(
        response.data.contentBlock.contentText || "[]"
      );

      // Filtramos el testimonio a eliminar
      const updatedTestimonios = currentTestimonios.filter(
        (t: Testimonio) => t.id !== testimonioId
      );

      // Actualizamos con los testimonios restantes
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "Testimonios",
          contentText: JSON.stringify(updatedTestimonios),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchTestimonios();
      toast.success("Testimonio eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar el testimonio:", error);
      toast.error("Error al eliminar el testimonio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPreview) {
      console.log("Testimonios en vista previa:", testimonios);
    }
  }, [showPreview, testimonios]);

  if (loading) {
    return <Loader />;
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <Toaster position="top-center" />
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
          >
            {showPreview ? (
              <>
                <span className="pl-2">Ocultar Vista Previa</span>
              </>
            ) : (
              <>
                <span className="pl-2">Mostrar Vista Previa</span>
              </>
            )}
          </button>
        </div>

        {showPreview && (
          <section className="py-16 relative">
            {/* Imagen de fondo */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src="/shakti/bg.jpg"
                alt="Fondo de testimonios"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/30"></div>
            </div>

            <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">
              {isLoaded && testimonios.length > 0 ? (
                <div className="relative">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {getTestimoniosToShow().map((testimonio, idx) => (
                      <div key={`${currentIndex}-${idx}`} className="relative">
                        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8 md:p-12">
                          <div className="mb-6">
                            <svg
                              className="w-8 h-8 text-primary"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                            </svg>
                          </div>

                          <div
                            className="text-lg md:text-xl font-lora text-dark italic mb-8 leading-relaxed testimonio-content"
                            dangerouslySetInnerHTML={{ __html: testimonio.texto }}
                          />

                          <div className="border-t border-primary/20 pt-6">
                            <h3 className="text-xl font-medium text-dark">
                              {testimonio.nombre}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Navegación */}
                  <div className="flex justify-center gap-3 mt-8">
                    <button
                      onClick={prevSlide}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-dark hover:bg-primary hover:text-white transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-dark hover:bg-primary hover:text-white transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-white">
                  No hay testimonios disponibles
                </div>
              )}
            </div>
          </section>
        )}

        {/* Formulario para agregar testimonios */}
        <form
          onSubmit={handleSubmit}
          className="mb-8"
        >
          <div className="space-y-4">
            <div>
            <h3 className="font-normal text-primary">
                    Nombre Usuario <span className="text-primary">*</span>
                  </h3>
              <input
                type="text"
                value={nuevoTestimonio.nombre}
                onChange={(e) =>
                  setNuevoTestimonio({
                    ...nuevoTestimonio,
                    nombre: e.target.value,
                  })
                }
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Testimonio
              </label>
              <div className="mt-1">
                <ReactQuill
                  theme="snow"
                  value={nuevoTestimonio.texto}
                  onChange={(content) =>
                    setNuevoTestimonio({
                      ...nuevoTestimonio,
                      texto: content,
                    })
                  }
                  className="h-[200px] mb-12"
                  modules={{
                    toolbar: [
                      [{ size: ["small"] }], // solo permitimos el tamaño 'small'
                      ["bold", "italic", "underline"],
                      ["clean"],
                    ],
                  }}
                  formats={["size", "bold", "italic", "underline"]}
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.4",
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              className=" text-white shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded flex-wrap mt-6"
            >
              Agregar Testimonio
            </button>
          </div>
        </form>

        {/* Lista de testimonios */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonios.map((testimonio) => (
            <div
              key={testimonio.id}
              className="relative group bg-gray-50 p-4 rounded-lg"
            >
              <h3 className="font-medium text-gray-900">{testimonio.nombre}</h3>
              <div
                className="mt-2 text-gray-600 testimonio-content"
                dangerouslySetInnerHTML={{ __html: testimonio.texto }}
              />
              <button
                onClick={() => handleDeleteTestimonio(testimonio.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonios06BO;