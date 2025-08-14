"use client";
import React, { useState } from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Testimonios03Preview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 4;
  const previewCategories = previewDataExtended.categorias.slice(0, 4);

  const testimonios = [
    {
      nombre: "María García",
      cargo: "Cliente Satisfecha",
      texto: "Excelente servicio y productos de calidad. Muy recomendado.",
      imagen: previewCategories[0]?.mainImage.url || "/img/placeholder.webp"
    },
    {
      nombre: "Carlos López",
      cargo: "Cliente Frecuente", 
      texto: "La mejor experiencia de compra que he tenido. Volveré seguro.",
      imagen: previewCategories[1]?.mainImage.url || "/img/placeholder.webp"
    },
    {
      nombre: "Ana Martínez",
      cargo: "Cliente VIP",
      texto: "Productos increíbles y atención al cliente excepcional.",
      imagen: previewCategories[2]?.mainImage.url || "/img/placeholder.webp"
    },
    {
      nombre: "Luis Rodríguez",
      cargo: "Cliente Regular",
      texto: "Servicio profesional y productos de primera calidad.",
      imagen: previewCategories[3]?.mainImage.url || "/img/placeholder.webp"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + visibleCount;
      return nextIndex < testimonios.length ? nextIndex : 0;
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
    if (testimonios.length <= visibleCount) return testimonios;
    
    const testimoniosToShow = [];
    for (let i = 0; i < visibleCount && currentIndex + i < testimonios.length; i++) {
      testimoniosToShow.push(testimonios[currentIndex + i]);
    }
    if (testimoniosToShow.length < visibleCount) {
      for (let i = 0; testimoniosToShow.length < visibleCount; i++) {
        testimoniosToShow.push(testimonios[i]);
      }
    }
    return testimoniosToShow;
  };

  const totalSlides = Math.ceil(testimonios.length / visibleCount);

  return (
    <section className="py-24 bg-white" style={{ borderRadius: "var(--radius)" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-primary text-sm uppercase tracking-widest">
            Testimonios
          </span>
          <h2 className="text-4xl font-light text-primary mt-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Historias reales de familias que confían en nosotros para el cuidado
            de sus mascotas
          </p>
        </div>

        <div className="relative px-4 md:px-10">
          {testimonios.length > visibleCount && (
            <div className="absolute -left-4 lg:-left-8 top-1/2 -translate-y-1/2 flex justify-between items-center w-[calc(100%+32px)] lg:w-[calc(100%+64px)]">
              <button
                onClick={prevSlide}
                className="w-12 h-12 bg-primary/5 rounded shadow-lg flex items-center justify-center text-primary hover:text-primary transition-colors z-10"
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
                className="w-12 h-12 bg-primary/5 rounded shadow-lg flex items-center justify-center text-primary hover:text-primary transition-colors z-10"
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
          )}

          <div className={`grid grid-cols-1 ${
            testimonios.length === 1 
              ? 'md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto' 
              : 'md:grid-cols-2 lg:grid-cols-4'
          } gap-8 snap-x snap-mandatory md:snap-none`}>
            {getTestimoniosToShow().map((testimonio, index) => (
              <div
                key={`${currentIndex}-${index}`}
                className="my-8 group relative bg-white p-4 shadow-lg transform md:hover:-rotate-2 transition-all duration-300 snap-center"
                style={{
                  borderRadius: "var(--radius)",
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  minWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto',
                }}
              >
                {/* Contenedor de la foto estilo Polaroid */}
                <div className="relative bg-white" style={{ borderRadius: "var(--radius)" }}>
                  <div className="relative pt-[100%]">
                    <div className="absolute inset-0 p-3">
                      <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
                        <img
                          src={testimonio.imagen}
                          alt={testimonio.nombre}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" style={{ borderRadius: "var(--radius)" }}>
                          <div className="absolute bottom-0 inset-x-0 p-2">
                            <p className="text-white font-medium text-center">
                              {testimonio.nombre}
                            </p>
                            <p className="text-white/80 text-sm text-center">
                              {testimonio.cargo}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonio en una "nota adhesiva" */}
                <div className="mt-4 bg-primary/5 p-4 rounded-lg transform -rotate-1" style={{ borderRadius: "var(--radius)" }}>
                  <svg
                    className="w-6 h-6 text-primary mb-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-gray-600 text-sm italic mb-3">
                    &ldquo;{testimonio.texto}&rdquo;
                  </p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 text-primary"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Cinta adhesiva decorativa */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-4 bg-primary/10 transform -rotate-3" />
              </div>
            ))}
          </div>

          {testimonios.length > visibleCount && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded transition-all duration-300 ${
                    Math.floor(currentIndex / visibleCount) === index
                      ? "w-8 bg-primary"
                      : "w-4 bg-primary/20 md:hover:bg-primary/40"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonios03Preview;