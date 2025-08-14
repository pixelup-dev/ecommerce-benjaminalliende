"use client";
import React, { useState, useCallback } from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";
import { 
  Dumbbell, 
  Apple, 
  Clock, 
  Heart, 
  Leaf, 
  BookOpen, 
  Target, 
  Zap,
  TrendingUp,
  Activity,
  Coffee,
  Moon
} from "lucide-react";

const Hero19Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 4);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [viewport] = useState<{ width: number; habitosPerView: number }>({ width: 1024, habitosPerView: 2 });

  // Función para obtener el icono según el nombre guardado
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "dumbbell":
        return <Dumbbell size={36} stroke="white" strokeWidth={2} />;
      case "apple":
        return <Apple size={36} stroke="white" strokeWidth={2} />;
      case "target":
        return <Target size={36} stroke="white" strokeWidth={2} />;
      case "zap":
        return <Zap size={36} stroke="white" strokeWidth={2} />;
      case "leaf":
        return <Leaf size={36} stroke="white" strokeWidth={2} />;
      case "book-open":
        return <BookOpen size={36} stroke="white" strokeWidth={2} />;
      case "clock":
        return <Clock size={36} stroke="white" strokeWidth={2} />;
      case "activity":
        return <Activity size={36} stroke="white" strokeWidth={2} />;
      case "trending-up":
        return <TrendingUp size={36} stroke="white" strokeWidth={2} />;
      case "coffee":
        return <Coffee size={36} stroke="white" strokeWidth={2} />;
      case "moon":
        return <Moon size={36} stroke="white" strokeWidth={2} />;
      default:
        return <Heart size={36} stroke="white" strokeWidth={2} />;
    }
  };

  // Función para ir al siguiente slide
  const nextSlide = useCallback(() => {
    if (previewCategories.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % previewCategories.length);
    }
  }, [previewCategories.length]);

  // Función para ir al slide anterior
  const prevSlide = useCallback(() => {
    if (previewCategories.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + previewCategories.length) % previewCategories.length);
    }
  }, [previewCategories.length]);

  // Función para ir a un slide específico
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Función para obtener los hábitos visibles en el carrusel
  const getVisibleHabitos = useCallback(() => {
    if (previewCategories.length === 0) return [];
    
    const visibleHabitos = [];
    
    // Mostrar hábitos según el viewport
    for (let i = 0; i < viewport.habitosPerView; i++) {
      const index = (currentSlide + i) % previewCategories.length;
      visibleHabitos.push(previewCategories[index]);
    }
    
    return visibleHabitos;
  }, [previewCategories, currentSlide, viewport.habitosPerView]);

  return (
    <section className="py-12 md:py-20 relative overflow-hidden" id="consulta">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="mb-8 md:mb-10 text-center">
          <span className="inline-block mb-2 text-primary font-semibold text-lg md:text-xl">
            {previewData.epigrafe || "Busca el Equilibrio"}
          </span>
          <h2 className="text-4xl max-w-2xl mx-auto md:text-5xl uppercase font-ubuntu font-bold text-dark mb-4 leading-tight">
            {previewData.titulo || "Cambia tus hábitos, agenda tu bienestar"}
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            {previewData.texto || "Descubre cómo pequeños cambios pueden transformar tu vida. Agenda tu consulta personalizada para comenzar tu camino hacia el equilibrio y el bienestar."}
          </p>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-6 md:gap-10 items-stretch">
          {/* Agenda tu hora */}
          <div className="flex flex-col justify-center h-full bg-dark rounded-2xl shadow-xl p-4 md:p-10 border border-gray-100 w-full xl:w-1/2 max-w-md mx-auto xl:mx-0 order-2 xl:order-1">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center border-b border-white pb-2">
              Agenda tu consulta personalizada
            </h3>
            <p className="text-white mb-4 text-center leading-tight py-2">
              Tu bienestar comienza con un primer paso.
            </p>
            <div className="mb-4 w-full p-2 md:p-4 border-2 border-white border-dotted rounded-lg">
              <div className="flex flex-col gap-1 text-center">
                <span className="font-semibold text-white">Horarios:</span>
                <div className="text-white whitespace-pre-line text-sm md:text-base">
                  Lunes a Jueves: 09:00 - 19:00{'\n'}Sábado: 10:00 - 14:00
                </div>
              </div>
            </div>
            <a
              href="#"
              className="bg-white hover:bg-white text-primary font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-lg transition mt-4 w-full text-center"
            >
              Agenda tu consulta
            </a>
          </div>
          
          {/* Carrusel de hábitos */}
          <div className="relative flex-1 flex items-center w-full xl:w-1/2 max-w-2xl mx-auto xl:mx-0 order-1 xl:order-2">
            {/* Carrusel o Grid según la cantidad de hábitos */}
            {previewCategories.length <= viewport.habitosPerView ? (
              // Grid estático para pocos hábitos
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-6xl mx-auto h-full min-h-[300px] md:min-h-[400px]">
                {previewCategories.map((category, index) => {
                  const habitNames = ["Ejercicio", "Nutrición", "Descanso", "Meditación"];
                  const habitDescriptions = [
                    "Mantén tu cuerpo activo y saludable",
                    "Alimenta tu bienestar desde adentro",
                    "Recupera tu energía naturalmente",
                    "Encuentra paz y claridad mental"
                  ];
                  const habitIcons = ["dumbbell", "apple", "moon", "leaf"];
                  
                  return (
                    <div key={index} className="relative rounded-xl overflow-hidden w-full h-full flex items-center justify-center group shadow-md border border-gray-100 bg-white min-h-[250px] md:min-h-[300px]">
                      <img
                        src={category.mainImage.url}
                        alt={habitNames[index] || category.title}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-60 z-10 group-hover:bg-opacity-70 transition-all" />
                      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-white px-4 py-6">
                        <div className="mb-3 md:mb-4">
                          {getIconComponent(habitIcons[index] || "heart")}
                        </div>
                        <h4 className="text-lg md:text-xl font-semibold mb-2 drop-shadow-lg text-center">
                          {habitNames[index] || category.title}
                        </h4>
                        <p className="text-xs md:text-sm drop-shadow-lg text-center max-w-[90%]">
                          {habitDescriptions[index] || "Descripción del hábito saludable"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Carrusel para más hábitos
              <div className="relative w-full max-w-6xl mx-auto h-full min-h-[300px]">
                {/* Contenedor del carrusel */}
                <div className="overflow-hidden h-full">
                  <div className="flex gap-4 md:gap-6 justify-center h-full">
                    {getVisibleHabitos().map((category, index) => {
                      const habitNames = ["Ejercicio", "Nutrición", "Descanso", "Meditación"];
                      const habitDescriptions = [
                        "Mantén tu cuerpo activo y saludable",
                        "Alimenta tu bienestar desde adentro",
                        "Recupera tu energía naturalmente",
                        "Encuentra paz y claridad mental"
                      ];
                      const habitIcons = ["dumbbell", "apple", "moon", "leaf"];
                      
                      return (
                        <div 
                          key={`${category.id}-${currentSlide}-${index}`} 
                          className="relative rounded-xl overflow-hidden w-full h-full flex items-center justify-center group shadow-md border border-gray-100 bg-white transition-all duration-700 ease-in-out transform min-h-[250px] md:min-h-[300px]"
                          style={{ 
                            width: viewport.habitosPerView === 1 ? '100%' : 'calc(50% - 12px)', 
                            minWidth: viewport.habitosPerView === 1 ? '280px' : '250px',
                            height: '100%',
                            opacity: 1,
                            transform: 'scale(1)'
                          }}
                        >
                          <img
                            src={category.mainImage.url}
                            alt={habitNames[index] || category.title}
                            className="absolute inset-0 w-full h-full object-cover z-0"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-60 z-10 group-hover:bg-opacity-70 transition-all" />
                          <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-white px-4 py-6">
                            <div className="mb-3 md:mb-4">
                              {getIconComponent(habitIcons[index] || "heart")}
                            </div>
                            <h4 className="text-lg md:text-xl font-semibold mb-2 drop-shadow-lg text-center">
                              {habitNames[index] || category.title}
                            </h4>
                            <p className="text-xs md:text-sm drop-shadow-lg text-center max-w-[90%]">
                              {habitDescriptions[index] || "Descripción del hábito saludable"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botones de navegación - Solo mostrar si hay más de 1 hábito visible */}
                {previewCategories.length > viewport.habitosPerView && (
                  <>
                    <button
                      onClick={prevSlide}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-dark/80 hover:bg-dark text-white p-2 rounded-full shadow-lg transition-colors z-30"
                      aria-label="Anterior"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={nextSlide}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-dark/80 hover:bg-dark text-white p-2 rounded-full shadow-lg transition-colors z-30"
                      aria-label="Siguiente"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Indicadores - Solo mostrar si hay más de 1 hábito visible */}
                {previewCategories.length > viewport.habitosPerView && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: previewCategories.length }, (_, index) => (
                      <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                          currentSlide === index 
                            ? 'bg-dark scale-125' 
                            : 'bg-gray-300 hover:bg-gray-400 hover:scale-110'
                        }`}
                        aria-label={`Ir al hábito ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero19Preview;