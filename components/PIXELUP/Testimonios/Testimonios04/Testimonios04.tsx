"use client";
import { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import "./quill-custom.css";

interface Testimonio {
  id: string;
  nombre: string;
  texto: string;
}

interface ContentBlock {
  id: string;
  title: string;
  contentText: string; // Aquí guardaremos el JSON de testimonios
}

export default function Testimonios04() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);

  const fetchTestimonios = async () => {
    try {
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS04_CONTENTBLOCK}`;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const testimoniosData = JSON.parse(
        response.data.contentBlock.contentText || "[]"
      );
      console.log("Testimonios parseados:", testimoniosData);
      setTestimonios(testimoniosData);
    } catch (error) {
      console.error("Error al obtener los testimonios:", error);
    }
  };

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
    setCurrentIndex((prevIndex) => 
      prevIndex + 1 >= testimonios.length ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex - 1 < 0 ? testimonios.length - 1 : prevIndex - 1
    );
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

  if (!testimonios.length) return null;

  return (
    <section className="py-16 relative" style={{ borderRadius: "var(--radius)" }}>
      {/* Imagen de fondo */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src="https://www.tooltyp.com/wp-content/uploads/2014/10/1900x920-8-beneficios-de-usar-imagenes-en-nuestros-sitios-web.jpg"
          alt="Fondo de testimonios"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/40"></div>
      </div>

      <div className=" mx-auto px-4 md:px-8 max-w-7xl relative z-10">
        <div className="max-w-3xl">
          {/* Carrusel de Testimonios */}
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-10 md:p-14" style={{ borderRadius: "var(--radius)" }}>
              <div className="mb-6">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              {isLoaded && testimonios.length > 0 ? (
                <>
                  <div
                    className="text-xl md:text-2xl font-lora text-primary italic mb-8 leading-relaxed testimonio-content"
                    dangerouslySetInnerHTML={{ __html: testimonios[currentIndex].texto }}
                  />

                  <div className="border-t border-primary/30 pt-6">
                    <h3 className="text-xl font-medium text-primary">
                      {testimonios[currentIndex].nombre}
                    </h3>
                  </div>

                  {/* Controles de navegación */}
                  <div className="flex justify-end gap-2 mt-6">
                    <button 
                      onClick={prevSlide}
                      className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
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
                        className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
                    >
                      <svg
                        className="w-6 h-6"
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
                </>
              ) : (
                <div className="text-center text-gray-500">
                  No hay testimonios disponibles
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}