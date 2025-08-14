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

export default function Testimonios01() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);

  const fetchTestimonios = async () => {
    try {
      const contentBlockId = `${process.env.NEXT_PUBLIC_TESTIMONIOS_CONTENTBLOCK}`;
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

  if (!testimonios.length) return null;

  return (
    <section className=" bg-gray-100 overflow-hidden py-12" style={{ borderRadius: "var(--radius)" }}> {/* py-20 */}
      <div className=" mx-auto px-6">
        <h2 className="text-4xl  mb-12 text-center"> {/* font-kalam text-[#4A6741] */}
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
                    className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/10 backdrop-blur-sm flex flex-col justify-between transform transition-all duration-300 hover:shadow-lg"
                  >
                    <div
                      className=" leading-relaxed mb-4 text-sm testimonio-content" /* text-[#4A6741] italic */
                      dangerouslySetInnerHTML={{ __html: testimonio.texto }}
                    />
                    <div className="flex items-center mt-auto">
                      <div className="h-px w-8 bg-primary mr-3"></div>
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
                <ChevronLeftIcon className="h-6 w-6 text-primary" />
              </button>

              <div className="flex justify-center gap-2">
                {[...Array(totalSlides)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      Math.floor(currentIndex / visibleCount) === index
                        ? "bg-primary w-4"
                        : "bg-primary/30 w-2"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="bg-white p-2 rounded-full shadow-lg hover:bg-[#F5F7F2] transition-all"
              >
                <ChevronRightIcon className="h-6 w-6 text-primary" />
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
  );
}