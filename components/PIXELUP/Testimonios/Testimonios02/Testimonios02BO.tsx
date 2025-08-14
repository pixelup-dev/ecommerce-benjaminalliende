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
  ciudad: string;
  texto: string;
}

const TestimoniosBO: React.FC = () => {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [nuevoTestimonio, setNuevoTestimonio] = useState({
    nombre: "",
    ciudad: "",
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
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS02_CONTENTBLOCK}`;

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
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS02CONTENTBLOCK}`;

      // Crear el nuevo testimonio
      const nuevoTestimonioData = {
        id: Date.now().toString(),
        nombre: nuevoTestimonio.nombre,
        ciudad: nuevoTestimonio.ciudad,
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
      setNuevoTestimonio({ nombre: "", ciudad: "", texto: "" });
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
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS02_CONTENTBLOCK}`;

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
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Lo que dicen nuestros clientes
                </h2>
                <p className="text-lg text-gray-600">
                  Experiencias reales de quienes ya confiaron en nosotros
                </p>
              </div>

              {isLoaded && testimonios.length > 0 ? (
                <div className="relative px-4 md:px-10">
                  <div className="overflow-hidden relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                      {getTestimoniosToShow().map((testimonio, idx) => (
                        <div
                          key={`${currentIndex}-${idx}`}
                          className="bg-gray-100 p-8 rounded-2xl"
                        >
                          <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-[#F9AF2A] rounded-full flex items-center justify-center text-xl font-bold text-white">
                              {testimonio.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{testimonio.nombre}</h3>
                              <p className="text-gray-600 text-sm">{testimonio.ciudad}</p>
                            </div>
                          </div>
                          <div
                            className="text-gray-600 leading-relaxed mb-4"
                            dangerouslySetInnerHTML={{
                              __html: testimonio.texto,
                            }}
                          />
                          <div className="flex gap-1 mt-4">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-[#F9AF2A]"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navegación y indicadores */}
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={prevSlide}
                      className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeftIcon className="h-6 w-6 text-gray-900" />
                    </button>

                    <div className="flex justify-center gap-2">
                      {[...Array(totalSlides)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            Math.floor(currentIndex / visibleCount) === index
                              ? "bg-[#F9AF2A]"
                              : "bg-gray-300"
                          }`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={nextSlide}
                      className="bg-white p-3 rounded-full shadow-lg hover:bg-gray-50 transition-colors"
                    >
                      <ChevronRightIcon className="h-6 w-6 text-gray-900" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-normal text-primary">
                  Nombre Usuario <span className="text-primary">*</span>
                </h3>
                <input
                  type="text"
                  placeholder="Nombre Cliente"
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
                <h3 className="font-normal text-primary">
                  Ciudad <span className="text-primary">*</span>
                </h3>
                <input
                  type="text"
                  value={nuevoTestimonio.ciudad}
                  placeholder="Ciudad, país"
                  onChange={(e) =>
                    setNuevoTestimonio({
                      ...nuevoTestimonio,
                      ciudad: e.target.value,
                    })
                  }
                  className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                  required
                />
              </div>
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
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">{testimonio.nombre}</h3>
                <span className="text-gray-500">|</span>
                <h3 className="font-medium text-gray-900">{testimonio.ciudad}</h3>
              </div>
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

export default TestimoniosBO;