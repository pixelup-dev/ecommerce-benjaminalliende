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

const Nosotros01: React.FC = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("left");
  const visibleCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 4;

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_NOSOTROS01_ID}`;

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
      const bannerId = `${process.env.NEXT_PUBLIC_NOSOTROS01_ID}`;

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
          {bannerData.images.length > visibleCount && (
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
            bannerData.images.length === 1 
              ? 'md:grid-cols-1 lg:grid-cols-1 max-w-md mx-auto' 
              : 'md:grid-cols-2 lg:grid-cols-4'
          } gap-8 snap-x snap-mandatory md:snap-none`}>
            {getTestimoniosToShow().map((image, index) => (
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
                    src={image.mainImage.url}
                    alt={image.title}
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg text-primary mb-1">
                    {image.title}
                  </h3>
                  <p className="text-xs text-primary/80 font-semibold mb-2 uppercase tracking-wide">
                    {image.buttonLink}
                  </p>
                  <p className="text-gray-600 text-sm italic mb-3">
                      {parseDisplayConfig(image.landingText).text}
                    </p>

                </div>
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

export default Nosotros01;
