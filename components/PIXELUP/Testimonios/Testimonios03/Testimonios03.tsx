"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface BannerImage {
  mainImage: any;
  url: string;
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
  mainImageLink: string;
}

interface ButtonTextData {
  price: string;
  value: string;
  show: boolean;
}

interface DisplayConfig {
  text: string;
  showPrice: boolean;
  showValue: boolean;
  showScheduleButton: boolean;
  showDetailsButton: boolean;
}

interface BannerData {
  images: BannerImage[];
}

const Testimonios03: React.FC = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const visibleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 4;

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_TESTIMONIOS03_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      setBannerData(response.data.banner);
    } catch (error) {
      console.error("Error al obtener los datos del banner:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
  }, []);

  useEffect(() => {
    if (bannerData && bannerData.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % bannerData.images.length;
          return nextIndex;
        });
      }, 8000);
      return () => clearInterval(interval);
    }
  }, [bannerData]);

  const nextSlide = () => {
    if (!bannerData) return;
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + visibleCount;
      return nextIndex < bannerData.images.length ? nextIndex : 0;
    });
  };

  const prevSlide = () => {
    if (!bannerData) return;
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - visibleCount;
      return nextIndex < 0 
        ? Math.max(bannerData.images.length - visibleCount, 0)
        : nextIndex;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index * visibleCount);
  };

  const getTestimoniosToShow = () => {
    if (!bannerData) return [];
    if (bannerData.images.length <= visibleCount) return bannerData.images;
    
    const testimoniosToShow = [];
    for (let i = 0; i < visibleCount && currentIndex + i < bannerData.images.length; i++) {
      testimoniosToShow.push(bannerData.images[currentIndex + i]);
    }
    // Si no tenemos suficientes testimonios para llenar la vista, añadimos desde el principio
    if (testimoniosToShow.length < visibleCount) {
      for (let i = 0; testimoniosToShow.length < visibleCount; i++) {
        testimoniosToShow.push(bannerData.images[i]);
      }
    }
    return testimoniosToShow;
  };

  const totalSlides = bannerData ? Math.ceil(bannerData.images.length / visibleCount) : 0;

  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    setTextAlign(alignment);
  };

  const parseButtonTextData = (buttonText: string): ButtonTextData => {
    try {
      const parsed = JSON.parse(buttonText);
      return {
        price: parsed.price || "",
        value: parsed.value || "",
        show: parsed.show ?? true,
      };
    } catch {
      return { price: buttonText, value: "", show: true };
    }
  };

  const parseDisplayConfig = (landingText: string): DisplayConfig => {
    try {
      if (typeof landingText === "string") {
        let parsed = JSON.parse(landingText);

        if (typeof parsed.text === "string" && parsed.text.startsWith("{")) {
          const nestedParsed = JSON.parse(parsed.text);
          parsed = {
            ...parsed,
            text: nestedParsed.text || "",
          };
        }

        return {
          text: parsed.text || "",
          showPrice: parsed.showPrice ?? true,
          showValue: parsed.showValue ?? true,
          showScheduleButton: parsed.showScheduleButton ?? true,
          showDetailsButton: parsed.showDetailsButton ?? true,
        };
      }
      return {
        text: landingText,
        showPrice: true,
        showValue: true,
        showScheduleButton: true,
        showDetailsButton: true,
      };
    } catch {
      return {
        text: landingText,
        showPrice: true,
        showValue: true,
        showScheduleButton: true,
        showDetailsButton: true,
      };
    }
  };

  const updateDisplayConfig = async (
    landingText: string,
    updates: Partial<DisplayConfig>
  ) => {
    try {
      const currentConfig = parseDisplayConfig(landingText);
      const newConfig = { ...currentConfig, ...updates };
      const bannerId = `${process.env.NEXT_PUBLIC_TESTIMONIOS03_ID}`;

      // Actualizar el banner en la base de datos
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          banner: {
            images: bannerData?.images.map((image, index) =>
              index === currentIndex
                ? { ...image, landingText: JSON.stringify(newConfig) }
                : image
            ),
          },
        }
      );

      // Actualizar el estado local
      if (bannerData) {
        setBannerData({
          ...bannerData,
          images: bannerData.images.map((image, index) =>
            index === currentIndex
              ? { ...image, landingText: JSON.stringify(newConfig) }
              : image
          ),
        });
      }
    } catch (error) {
      console.error("Error al actualizar la configuración:", error);
      // Aquí podrías agregar una notificación de error para el usuario
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        className="w-full animate-pulse rtl:space-x-reverse md:flex md:items-center"
      >
        <div className="flex items-center justify-center w-full h-96 bg-gray-300 rounded dark:bg-gray-700">
          <svg
            className="w-10 h-10 text-gray-200 dark:text-gray-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 18"
          >
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
          </svg>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!bannerData) {
    return (
      <div className="w-full text-center p-6">No banner data available</div>
    );
  }

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
          {bannerData.images.length > visibleCount && (
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
            bannerData.images.length === 1 
              ? 'md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto' 
              : 'md:grid-cols-2 lg:grid-cols-4'
          } gap-8 snap-x snap-mandatory md:snap-none`}>
            {getTestimoniosToShow().map((image, index) => (
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
                          src={image.mainImage.url}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" style={{ borderRadius: "var(--radius)" }}>
                          <div className="absolute bottom-0 inset-x-0 p-2">
                            <p className="text-white font-medium text-center">
                              {image.title}
                            </p>
                            <p className="text-white/80 text-sm text-center">
                              {image.buttonLink}
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
                    {parseDisplayConfig(image.landingText).text}
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

          {bannerData.images.length > visibleCount && (
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

export default Testimonios03;
