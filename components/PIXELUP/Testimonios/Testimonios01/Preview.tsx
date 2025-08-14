"use client";
import React, { useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { previewData } from "@/app/config/previewData";

const Testimonios01Preview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const testimonios = [
    {
      id: "1",
      nombre: "María García",
      texto: "Excelente servicio y productos de calidad. Muy recomendado."
    },
    {
      id: "2", 
      nombre: "Carlos López",
      texto: "La mejor experiencia de compra que he tenido. Volveré seguro."
    },
    {
      id: "3",
      nombre: "Ana Martínez", 
      texto: "Productos increíbles y atención al cliente excepcional."
    }
  ];

  useEffect(() => {
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

  return (
    <section className="bg-gray-100 overflow-hidden py-12" style={{ borderRadius: "var(--radius)" }}>
      <div className="mx-auto px-6">
        <h2 className="text-4xl mb-12 text-center">
          <span className="text-sm uppercase tracking-[0.3em] block mb-3">
            Experiencias
          </span>
          Testimonios
        </h2>

        <div className="relative px-4 md:px-10">
          <div className="overflow-hidden relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {getTestimoniosToShow().map((testimonio, idx) => (
                <div
                  key={`${currentIndex}-${idx}`}
                  className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/10 backdrop-blur-sm flex flex-col justify-between transform transition-all duration-300 hover:shadow-lg"
                >
                  <div
                    className="leading-relaxed mb-4 text-sm testimonio-content"
                    dangerouslySetInnerHTML={{ __html: testimonio.texto }}
                  />
                  <div className="flex items-center mt-auto">
                    <div className="h-px w-8 bg-primary mr-3"></div>
                    <span className="font-medium">
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
      </div>
    </section>
  );
};

export default Testimonios01Preview;