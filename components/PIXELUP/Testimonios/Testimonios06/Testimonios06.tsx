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

export default function Testimonios06() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);

  const fetchTestimonios = async () => {
    try {
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS06_CONTENTBLOCK}`;
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
      setTestimonios(testimoniosData);
    } catch (error) {
      console.error("Error al obtener los testimonios:", error);
    }
  };

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
      return nextIndex >= testimonios.length ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - visibleCount;
      if (nextIndex < 0) {
        // Si estamos en modo tablet/desktop (2 testimonios), asegurarnos de mostrar los últimos 2
        const lastIndex = testimonios.length - visibleCount;
        return lastIndex;
      }
      return nextIndex;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index * visibleCount);
  };

  const getTestimoniosToShow = () => {
    const endIndex = Math.min(currentIndex + visibleCount, testimonios.length);
    return testimonios.slice(currentIndex, endIndex);
  };

  const totalSlides = Math.ceil(testimonios.length / visibleCount);

  if (!testimonios.length) return null;

  return (
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
  );
}