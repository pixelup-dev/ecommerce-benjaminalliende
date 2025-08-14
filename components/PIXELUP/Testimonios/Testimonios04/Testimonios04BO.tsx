"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader";
import dynamic from "next/dynamic";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import "./quill-custom.css";

interface Testimonio {
  id: string;
  nombre: string;
  texto: string;
}

const Testimonios04BO: React.FC = () => {
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
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setVisibleCount(3); // desktop
      } else if (window.matchMedia("(min-width: 640px)").matches) {
        setVisibleCount(2); // tablet
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
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS04_CONTENTBLOCK}`;

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
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS04_CONTENTBLOCK}`;

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
    } catch (error) {
      console.error("Error al agregar el testimonio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonio = async (testimonioId: string) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS04_CONTENTBLOCK}`;

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
    } catch (error) {
      console.error("Error al eliminar el testimonio:", error);
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
    <section className="w-full  mx-auto ">
      <div className="bg-white p-4 mb-8">
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
          <section className="py-12 bg-white overflow-hidden">
            <div className="container mx-auto px-6">
              <h2 className="text-4xl mb-12 text-center"> {/* font-kalam text-[#4A6741]  */}
                <span className="text-sm uppercase tracking-[0.3em] block mb-3 "> {/* text-[#8BA888] font-montserrat */}
                  Experiencias
                </span>
                Testimonios
              </h2>

              {isLoaded && testimonios.length > 0 ? (
                <div className="relative px-4 md:px-10">
                  <div className="overflow-hidden relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                      {getTestimoniosToShow().map((testimonio, idx) => (
                        <div
                          key={`${currentIndex}-${idx}`}
                          className="p-6 bg-gradient-to-br from-[#4A6741]/5 to-[#6B8E4E]/10 rounded-lg border border-[#D8E2DC] backdrop-blur-sm flex flex-col justify-between transform transition-all duration-300 hover:shadow-lg"
                        >
                          <div
                            className="leading-relaxed mb-4 text-sm testimonio-content" /* text-[#4A6741] italic  */
                            dangerouslySetInnerHTML={{
                              __html: testimonio.texto,
                            }}
                          />
                          <div className="flex items-center mt-auto">
                            <div className="h-px w-8 bg-[#6B8E4E] mr-3"></div>
                            <span className=" font-medium"> {/* text-[#6B8E4E] */}
                              {testimonio.nombre}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navegación y indicadores */}
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={prevSlide}
                      className="bg-white p-2 rounded-full shadow-lg hover:bg-[#F5F7F2] transition-all"
                    >
                      <ChevronLeftIcon className="h-6 w-6 text-[#4A6741]" />
                    </button>

                    <div className="flex justify-center gap-2">
                      {[...Array(totalSlides)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`h-2 rounded-full transition-all ${
                            Math.floor(currentIndex / visibleCount) === index
                              ? "bg-[#4A6741] w-4"
                              : "bg-[#4A6741]/30 w-2"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextSlide}
                      className="bg-white p-2 rounded-full shadow-lg hover:bg-[#F5F7F2] transition-all"
                    >
                      <ChevronRightIcon className="h-6 w-6 text-[#4A6741]" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  No hay testimonios disponibles
                </div>
              )}
            </div>
                        {/* Mensaje de alerta informativa */}
                        <div className="p-4 mt-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Este es un preview referencial, por lo cual algunos elementos pueden no quedar correctamente organizados.</span>
              </div>
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

export default Testimonios04BO;