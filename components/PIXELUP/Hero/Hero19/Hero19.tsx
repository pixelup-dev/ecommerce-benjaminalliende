"use client";
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
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

interface Habito {
  id: string;
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  mainImageLink: string;
  mobileImageLink?: string | null;
  creationDate: string;
  orderNumber: number;
  image?: {
    url: string;
    name: string;
    type: string;
    size: number | null;
    data: string;
  };
  mainImage?: {
    url: string;
    name: string;
    type: string;
    size: number | null;
    data: string;
  };
}

interface HabitoTextContent {
  title: string;
  description: string;
  icon: string;
}

interface TextContent {
  sectionTitle: string;
  mainTitle: string;
  description: string;
  ctaTitle: string;
  ctaDescription: string;
  horarios: string;
  buttonText: string;
  buttonLink: string;
}

interface BannerData {
  images: Habito[];
}

const Hero19: React.FC = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [textContent, setTextContent] = useState<TextContent>({
    sectionTitle: "Busca el Equilibrio",
    mainTitle: "Cambia tus hábitos, agenda tu bienestar",
    description: "Descubre cómo pequeños cambios pueden transformar tu vida. Agenda tu consulta personalizada para comenzar tu camino hacia el equilibrio y el bienestar A veces solo necesitamos a alguien que nos escuchen, nos guíen y nos muestre un camino más eficaz para sentirnos motivados y estar en plena salud",
    ctaTitle: "Agenda tu consulta personalizada",
    ctaDescription: "Tu bienestar comienza con un primer paso.",
    horarios: "Lunes a Jueves: 09:00 - 19:00\nSábado: 10:00 - 14:00",
    buttonText: "Agenda tu consulta",
    buttonLink: "#contacto",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [viewport, setViewport] = useState<{ width: number; habitosPerView: number }>({ width: 0, habitosPerView: 1 });

  // Función para parsear el JSON del textContent general
  const parseTextContent = (landingText: string): TextContent => {
    try {
      return JSON.parse(landingText);
    } catch (error) {
      return {
        sectionTitle: "Busca el Equilibrio",
        mainTitle: "Cambia tus hábitos, agenda tu bienestar",
        description: "Descubre cómo pequeños cambios pueden transformar tu vida. Agenda tu consulta personalizada para comenzar tu camino hacia el equilibrio y el bienestar A veces solo necesitamos a alguien que nos escuchen, nos guíen y nos muestre un camino más eficaz para sentirnos motivados y estar en plena salud",
        ctaTitle: "Agenda tu consulta personalizada",
        ctaDescription: "Tu bienestar comienza con un primer paso.",
        horarios: "Lunes a Jueves: 09:00 - 19:00\nSábado: 10:00 - 14:00",
        buttonText: "Agenda tu consulta",
        buttonLink: "#contacto",
      };
    }
  };

  // Función para parsear el JSON del landingText del hábito
  const parseHabitoTextContent = (landingText: string): HabitoTextContent => {
    try {
      return JSON.parse(landingText);
    } catch (error) {
      return {
        title: "",
        description: "",
        icon: "heart",
      };
    }
  };

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

  const fetchHabitosData = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_HERO19_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      
      setBannerData(response.data.banner);
    } catch (error) {
      console.error("Error al obtener los datos de hábitos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTextContent = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_HERO19_CONTENTBLOCK || "";

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (response.data.code === 0 && response.data.contentBlock) {
        try {
          const parsedData = JSON.parse(response.data.contentBlock.contentText);
          setTextContent(parsedData);
        } catch (error) {
          console.error("Error al parsear JSON del content block:", error);
        }
      }
    } catch (error) {
      console.error("Error al obtener el contenido de texto:", error);
    }
  };

  useEffect(() => {
    fetchHabitosData();
    fetchTextContent();
  }, []);

  // Manejar responsive
  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      let habitosPerView = 1;
      
      if (width < 768) habitosPerView = 1; // Mobile
      else if (width < 1024) habitosPerView = 2; // Tablet
      else habitosPerView = 2; // Desktop
      
      setViewport({ width, habitosPerView });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Función para ir al siguiente slide
  const nextSlide = useCallback(() => {
    if (bannerData && bannerData.images.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % bannerData.images.length);
    }
  }, [bannerData]);

  // Función para ir al slide anterior
  const prevSlide = useCallback(() => {
    if (bannerData && bannerData.images.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + bannerData.images.length) % bannerData.images.length);
    }
  }, [bannerData]);

  // Función para ir a un slide específico
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Función para obtener los hábitos visibles en el carrusel
  const getVisibleHabitos = useCallback(() => {
    if (!bannerData || bannerData.images.length === 0) return [];
    
    const habitos = bannerData.images;
    const visibleHabitos = [];
    
    // Mostrar hábitos según el viewport
    for (let i = 0; i < viewport.habitosPerView; i++) {
      const index = (currentSlide + i) % habitos.length;
      visibleHabitos.push(habitos[index]);
    }
    
    return visibleHabitos;
  }, [bannerData, currentSlide, viewport.habitosPerView]);

  // Autoplay del carrusel
  useEffect(() => {
    if (!isAutoPlaying || !bannerData || bannerData.images.length <= viewport.habitosPerView) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 4000); // Cambiar cada 4 segundos

    return () => clearInterval(interval);
  }, [isAutoPlaying, bannerData, nextSlide, viewport.habitosPerView]);

  // Pausar autoplay al hacer hover
  const handleMouseEnter = useCallback(() => {
    if (bannerData && bannerData.images.length > viewport.habitosPerView) {
      setIsAutoPlaying(false);
    }
  }, [bannerData, viewport.habitosPerView]);

  const handleMouseLeave = useCallback(() => {
    if (bannerData && bannerData.images.length > viewport.habitosPerView) {
      setIsAutoPlaying(true);
    }
  }, [bannerData, viewport.habitosPerView]);

  if (loading) {
    return (
      <div role="status" className="w-full animate-pulse rtl:space-x-reverse md:flex md:items-center">
        <div className="flex items-center justify-center w-full h-96 bg-gray-300 rounded dark:bg-gray-700">
          <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
          </svg>
        </div>
      </div>
    );
  }

  if (!bannerData || bannerData.images.length === 0) {
    return <div className="w-full text-center p-6">No hay hábitos para mostrar</div>;
  }

  return (
    <section className="py-12 md:py-20 relative overflow-hidden" id="consulta">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16 relative z-10">
        <div className="mb-8 md:mb-10 text-center">
          <span className="inline-block mb-2 text-primary font-semibold text-lg md:text-xl">
            {textContent.sectionTitle}
          </span>
          <h2 className="text-4xl max-w-2xl mx-auto md:text-5xl uppercase font-ubuntu font-bold text-dark mb-4 leading-tight">
            {textContent.mainTitle}
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
            {textContent.description}
          </p>
        </div>
        
        <div className="flex flex-col xl:flex-row gap-6 md:gap-10 items-stretch">
          {/* Agenda tu hora */}
          <div className="flex flex-col justify-center h-full bg-dark rounded-2xl shadow-xl p-4 md:p-10 border border-gray-100 w-full xl:w-1/2 max-w-md mx-auto xl:mx-0 order-2 xl:order-1">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center border-b border-white pb-2">
              {textContent.ctaTitle}
            </h3>
            <p className="text-white mb-4 text-center leading-tight py-2">
              {textContent.ctaDescription}
            </p>
            <div className="mb-4 w-full p-2 md:p-4 border-2 border-white border-dotted rounded-lg">
              <div className="flex flex-col gap-1 text-center">
                <span className="font-semibold text-white">Horarios:</span>
                <div className="text-white whitespace-pre-line text-sm md:text-base">
                  {textContent.horarios}
                </div>
              </div>
            </div>
            <a
              href={textContent.buttonLink}
              className="bg-white hover:bg-white text-primary font-bold px-6 md:px-8 py-3 md:py-4 rounded-xl shadow-lg transition mt-4 w-full text-center"
            >
              {textContent.buttonText}
            </a>
          </div>
          
          {/* Carrusel de hábitos */}
          <div className="relative flex-1 flex items-center w-full xl:w-1/2 max-w-2xl mx-auto xl:mx-0 order-1 xl:order-2">
            {/* Carrusel o Grid según la cantidad de hábitos */}
            {bannerData.images.length <= viewport.habitosPerView ? (
              // Grid estático para pocos hábitos
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-6xl mx-auto h-full min-h-[300px] md:min-h-[400px]">
                {bannerData.images.map((habito, index) => {
                  const habitoTextContent = parseHabitoTextContent(habito.landingText);
                  
                  return (
                    <div key={habito.id} className="relative rounded-xl overflow-hidden w-full h-full flex items-center justify-center group shadow-md border border-gray-100 bg-white min-h-[250px] md:min-h-[300px]">
                      <img
                        src={habito.mainImage?.url || habito.mainImage?.data || habito.image?.url || habito.image?.data || "/img/placeholder-image.jpg"}
                        alt={habitoTextContent.title || habito.title}
                        className="absolute inset-0 w-full h-full object-cover z-0"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-60 z-10 group-hover:bg-opacity-70 transition-all" />
                      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-white px-4 py-6">
                        <div className="mb-3 md:mb-4">
                          {getIconComponent(habitoTextContent.icon)}
                        </div>
                        <h4 className="text-lg md:text-xl font-semibold mb-2 drop-shadow-lg text-center">
                          {habitoTextContent.title || habito.title}
                        </h4>
                        <p className="text-xs md:text-sm drop-shadow-lg text-center max-w-[90%]">
                          {habitoTextContent.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Carrusel para más hábitos
              <div 
                className="relative w-full max-w-6xl mx-auto h-full min-h-[300px] "
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {/* Contenedor del carrusel */}
                <div className="overflow-hidden h-full">
                  <div className="flex gap-4 md:gap-6 justify-center h-full">
                    {getVisibleHabitos().map((habito, index) => {
                      const habitoTextContent = parseHabitoTextContent(habito.landingText);
                      
                      return (
                        <div 
                          key={`${habito.id}-${currentSlide}-${index}`} 
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
                            src={habito.mainImage?.url || habito.mainImage?.data || habito.image?.url || habito.image?.data || "/img/placeholder-image.jpg"}
                            alt={habitoTextContent.title || habito.title}
                            className="absolute inset-0 w-full h-full object-cover z-0"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-60 z-10 group-hover:bg-opacity-70 transition-all" />
                          <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-white px-4 py-6">
                            <div className="mb-3 md:mb-4">
                              {getIconComponent(habitoTextContent.icon)}
                            </div>
                            <h4 className="text-lg md:text-xl font-semibold mb-2 drop-shadow-lg text-center">
                              {habitoTextContent.title || habito.title}
                            </h4>
                            <p className="text-xs md:text-sm drop-shadow-lg text-center max-w-[90%]">
                              {habitoTextContent.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Botones de navegación - Solo mostrar si hay más de 1 hábito visible */}
                {bannerData.images.length > viewport.habitosPerView && (
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
                {bannerData.images.length > viewport.habitosPerView && (
                  <div className="flex justify-center mt-4 space-x-2">
                    {Array.from({ length: bannerData.images.length }, (_, index) => (
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

export default Hero19; 