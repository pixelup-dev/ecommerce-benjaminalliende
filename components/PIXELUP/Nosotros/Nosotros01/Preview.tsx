"use client";
import React, { useState } from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Nosotros01Preview = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const previewCategories = previewDataExtended.categorias.slice(0, 4);
  const visibleCount = 4;

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + visibleCount;
      return nextIndex < previewCategories.length ? nextIndex : 0;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - visibleCount;
      return nextIndex < 0 
        ? Math.max(previewCategories.length - visibleCount, 0)
        : nextIndex;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index * visibleCount);
  };

  const getTestimoniosToShow = () => {
    if (previewCategories.length <= visibleCount) return previewCategories;
    
    const testimoniosToShow = [];
    for (let i = 0; i < visibleCount && currentIndex + i < previewCategories.length; i++) {
      testimoniosToShow.push(previewCategories[currentIndex + i]);
    }
    if (testimoniosToShow.length < visibleCount) {
      for (let i = 0; testimoniosToShow.length < visibleCount; i++) {
        testimoniosToShow.push(previewCategories[i]);
      }
    }
    return testimoniosToShow;
  };

  const totalSlides = Math.ceil(previewCategories.length / visibleCount);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-light text-primary mt-4">
            Conoce a Nuestro Equipo
          </h2>
          <div className="h-1 w-32 bg-primary/80 mx-auto mt-6 mb-6"></div>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            Profesionales apasionados por la sostenibilidad y el desarrollo responsable.
          </p>
        </div>

        <div className="relative px-4 md:px-10">
          {previewCategories.length > visibleCount && (
            <div className="absolute -left-4 lg:-left-8 top-1/2 -translate-y-1/2 flex justify-between items-center w-[calc(100%+32px)] lg:w-[calc(100%+64px)]">
              <button
                onClick={prevSlide}
                className="w-12 h-12 bg-[#5B488E]/5 rounded shadow-lg flex items-center justify-center text-[#81C4BA] hover:text-[#1B9C84] transition-colors z-10"
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
                className="w-12 h-12 bg-[#5B488E]/5 rounded shadow-lg flex items-center justify-center text-[#81C4BA] hover:text-[#1B9C84] transition-colors z-10"
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
            previewCategories.length === 1 
              ? 'md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto' 
              : 'md:grid-cols-2 lg:grid-cols-4'
          } gap-8 snap-x snap-mandatory md:snap-none`}>
            {getTestimoniosToShow().map((categoria, index) => (
              <div
                key={`${currentIndex}-${index}`}
                className="group bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-center"
                style={{
                  boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                  borderRadius: "var(--radius)",
                  minWidth: typeof window !== 'undefined' && window.innerWidth < 768 ? '100%' : 'auto',
                }}
              >
                {/* Contenedor de la foto */}
                <div className="h-60 overflow-hidden">
                  <img
                    src={categoria.mainImage.url}
                    alt={categoria.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg text-primary mb-1">
                    {categoria.title}
                  </h3>
                  <p className="text-xs text-primary/80 font-semibold mb-2 uppercase tracking-wide">
                    {categoria.landingText}
                  </p>
                  <p className="text-gray-600 text-sm italic mb-3">
                    {previewData.texto || "Descripción del miembro del equipo"}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {previewCategories.length > visibleCount && (
            <div className="flex justify-center gap-2 mt-8">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded transition-all duration-300 ${
                    Math.floor(currentIndex / visibleCount) === index
                      ? "w-8 bg-[#5B488E]"
                      : "w-4 bg-[#5B488E]/20 md:hover:bg-[#5B488E]/40"
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

export default Nosotros01Preview;