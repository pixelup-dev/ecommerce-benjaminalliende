"use client";
import React, { useState, useEffect } from "react";
import { previewData } from "@/app/config/previewData";

const Testimonios02Preview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  const testimonios = [
    {
      nombre: "María García",
      ciudad: "Santiago",
      texto: "Excelente servicio y productos de calidad. Muy recomendado."
    },
    {
      nombre: "Carlos López",
      ciudad: "Valparaíso", 
      texto: "La mejor experiencia de compra que he tenido. Volveré seguro."
    },
    {
      nombre: "Ana Martínez",
      ciudad: "Concepción",
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
    <section className="py-20 bg-white" style={{ borderRadius: "var(--radius)" }}>
      <div className="mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-lg text-gray-600">
              Experiencias reales de quienes ya confiaron en nosotros
            </p>
          </div>

          <div className="relative">
            {/* Contenedor del carrusel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 transition-transform duration-300">
              {getTestimoniosToShow().map((testimonio, idx) => (
                <div
                  key={`${currentIndex}-${idx}`}
                  className="bg-gray-100 p-6 md:p-8 rounded-2xl select-none"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary rounded-full flex items-center justify-center text-lg md:text-xl font-bold text-white">
                      {testimonio.nombre.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg">{testimonio.nombre}</h3>
                      <p className="text-gray-600 text-xs md:text-sm">{testimonio.ciudad}</p>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm md:text-base leading-relaxed mb-3 md:mb-4">
                    &ldquo;{testimonio.texto}&rdquo;
                  </div>
                  <div className="flex gap-1 mt-3 md:mt-4">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 md:h-5 md:w-5 text-primary"
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

            {/* Indicadores de navegación */}
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    Math.floor(currentIndex / visibleCount) === index
                      ? "bg-primary"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonios02Preview;