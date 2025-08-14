"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { globalConfig } from "@/app/config/GlobalConfig";

interface BannerImage {
  mainImage: any;
  mobileImage?: any;
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
  showText: boolean;
  showPrice: boolean;
  showValue: boolean;
  showButton1: boolean;
  showButton2: boolean;
  button1Text: string;
  button2Text: string;
  button1Link: string;
  button2Link: string;
  contentAlignment: "left" | "center" | "right";
  fullBannerLink: boolean;
  fullBannerLinkUrl: string;
  baseTypography: string;
  titleTypography: string;
}

interface BannerData {
  images: BannerImage[];
}

const BannerPrincipal01: React.FC = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">(
    "left"
  );

  // Obtener los aspectos de las imágenes desde la configuración global
  const desktopAspect = globalConfig.bannerPrincipalAspects.desktop;
  const mobileAspect = globalConfig.bannerPrincipalAspects.mobile;
  const tabletAspect = globalConfig.bannerPrincipalAspects.tablet;

  // Agregar constantes para valores por defecto
  const DEFAULT_TITLE = "Banner";
  const DEFAULT_BUTTON_LINK = "#";

  // Detectar el tipo de dispositivo con debounce para mejor rendimiento
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 850);
      setIsTablet(width > 850 && width <= 1560);
    };

    // Función con debounce para evitar múltiples actualizaciones
    let timeoutId: NodeJS.Timeout;
    const debouncedCheckDevice = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkDeviceType, 100);
    };

    // Verificar inmediatamente al cargar
    checkDeviceType();

    // Agregar listener con debounce
    window.addEventListener("resize", debouncedCheckDevice);

    // Cleanup
    return () => {
      window.removeEventListener("resize", debouncedCheckDevice);
      clearTimeout(timeoutId);
    };
  }, []);

  // Precargar imágenes
  useEffect(() => {
    if (bannerData?.images) {
      bannerData.images.forEach((image) => {
        if (image.mainImage?.url) {
          const img = new Image();
          img.src = image.mainImage.url;
        }
        if (image.mobileImage?.url) {
          const img = new Image();
          img.src = image.mobileImage.url;
        }
      });
    }
  }, [bannerData]);

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_BANNERPRINCIPAL01_ID}`;

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
    if (bannerData && bannerData.images.length > 1 && !isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % bannerData.images.length;
          return nextIndex;
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [bannerData, isPaused]);

  const handlePrev = () => {
    if (!bannerData) return;
    const prevIndex =
      (currentIndex - 1 + bannerData.images.length) % bannerData.images.length;
    setCurrentIndex(prevIndex);
  };

  const handleNext = () => {
    if (!bannerData) return;
    const nextIndex = (currentIndex + 1) % bannerData.images.length;
    setCurrentIndex(nextIndex);
  };

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
          showText: parsed.showText ?? false,
          showPrice: parsed.showPrice ?? false,
          showValue: parsed.showValue ?? false,
          showButton1: parsed.showButton1 ?? false,
          showButton2: parsed.showButton2 ?? false,
          button1Text: parsed.button1Text || "Botón 1",
          button2Text: parsed.button2Text || "Botón 2",
          button1Link: parsed.button1Link || "#",
          button2Link: parsed.button2Link || "#",
          contentAlignment: parsed.contentAlignment || "left",
          fullBannerLink: parsed.fullBannerLink ?? false,
          fullBannerLinkUrl: parsed.fullBannerLinkUrl || "#",
          baseTypography: parsed.baseTypography || "montserrat",
          titleTypography: parsed.titleTypography || "montserrat",
        };
      }
      return {
        text: landingText,
        showText: false,
        showPrice: false,
        showValue: false,
        showButton1: false,
        showButton2: false,
        button1Text: "Botón 1",
        button2Text: "Botón 2",
        button1Link: "#",
        button2Link: "#",
        contentAlignment: "left",
        fullBannerLink: false,
        fullBannerLinkUrl: "#",
        baseTypography: "montserrat",
        titleTypography: "montserrat",
      };
    } catch {
      return {
        text: landingText,
        showText: false,
        showPrice: false,
        showValue: false,
        showButton1: false,
        showButton2: false,
        button1Text: "Botón 1",
        button2Text: "Botón 2",
        button1Link: "#",
        button2Link: "#",
        contentAlignment: "left",
        fullBannerLink: false,
        fullBannerLinkUrl: "#",
        baseTypography: "montserrat",
        titleTypography: "montserrat",
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
      const bannerId = `${process.env.NEXT_PUBLIC_BANNERPRINCIPAL01_ID}`;

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

  const shouldShowOverlay = (image: BannerImage): boolean => {
    const config = parseDisplayConfig(image.landingText);
    const buttonData = parseButtonTextData(image.buttonText);

    // Solo mostrar overlay si hay elementos de texto o botones activos
    return Boolean(
      image.buttonLink !== DEFAULT_BUTTON_LINK || // Epígrafe activo
        image.title !== DEFAULT_TITLE || // Título activo
        (config.showText && config.text && config.text.trim() !== "") || // Texto descriptivo activo y con contenido
        (buttonData.show &&
          ((config.showPrice && buttonData.price) ||
            (config.showValue && buttonData.value))) || // Precios/valores activos y con contenido
        (config.showButton1 && config.button1Text) || // Botón 1 activo y con texto
        (config.showButton2 && config.button2Text) // Botón 2 activo y con texto
    );
  };

  // Función para obtener el aspect ratio según el dispositivo
  const getCurrentAspectRatio = () => {
    if (isMobile) return mobileAspect;
    if (isTablet) return tabletAspect;
    return desktopAspect;
  };

  if (loading) {
    return (
      <div
        role="status"
        className="w-full animate-pulse  rtl:space-x-reverse md:flex md:items-center"
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

  const currentImage = bannerData.images[currentIndex];
  const multipleImages = bannerData.images.length > 1;

  return (
    <section
      className={`relative overflow-hidden w-full`}
      style={{
        aspectRatio: getCurrentAspectRatio(),
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Contenedor de imágenes */}
      <div
        className={`absolute inset-0 w-full`}
        style={{
          aspectRatio: getCurrentAspectRatio(),
        }}
      >
        {bannerData.images.map((image, index) => {
          const config = parseDisplayConfig(image.landingText);

          // Lógica simplificada: mobile usa mobileImage, tablet y desktop usan mainImage
          const imageToShow =
            isMobile && image.mobileImage?.url
              ? image.mobileImage
              : image.mainImage;
          const nextImageToShow =
            isMobile && image.mobileImage?.url
              ? image.mainImage
              : image.mobileImage;

          return (
            <div
              key={index}
              className="absolute inset-0"
              style={{
                opacity: index === currentIndex ? 1 : 0,
                transition: "all 800ms cubic-bezier(0.4, 0, 0.2, 1)",
                visibility:
                  Math.abs(index - currentIndex) <= 1 ? "visible" : "hidden",
              }}
            >
              {/* Imagen principal visible */}
              <img
                src={imageToShow.url}
                alt={image.title !== DEFAULT_TITLE ? image.title : ""}
                className="w-full h-full object-cover"
                style={{
                  transition: "transform 800ms cubic-bezier(0.4, 0, 0.2, 1)",
                  transform:
                    index === currentIndex ? "scale(1)" : "scale(1.05)",
                }}
                loading={index === 0 ? "eager" : "lazy"}
              />

              {/* Imagen alternativa precargada pero oculta */}
              {nextImageToShow?.url && (
                <img
                  src={nextImageToShow.url}
                  alt=""
                  className="hidden"
                  aria-hidden="true"
                />
              )}

              {shouldShowOverlay(image) && index === currentIndex && (
                <div
                  className="absolute inset-0 bg-black/50"
                  style={{
                    pointerEvents: "none",
                    transition: "opacity 800ms cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: index === currentIndex ? 0.3 : 0,
                  }}
                />
              )}
              {config.fullBannerLink &&
                config.fullBannerLinkUrl &&
                index === currentIndex && (
                  <Link
                    href={config.fullBannerLinkUrl}
                    className="absolute inset-0 z-30 cursor-pointer pointer-events-auto"
                    target="_self"
                    prefetch={true}
                  >
                    <span className="sr-only">Ver más</span>
                  </Link>
                )}
            </div>
          );
        })}
      </div>

      {/* Contenido del banner */}
      <div className="relative h-full z-20">
        <div className="h-full mx-auto px-14 sm:px-20 md:px-20 lg:px-24">
          <div
            className={`flex flex-col justify-center h-full ${(() => {
              const config = parseDisplayConfig(currentImage.landingText);
              switch (config.contentAlignment) {
                case "center":
                  return "items-center text-center mx-auto";
                case "right":
                  return "items-end text-right ml-auto";
                default:
                  return "items-start text-left";
              }
            })()} max-w-2xl`}
          >
            {currentImage.buttonLink !== DEFAULT_BUTTON_LINK && (
              <span
                className={`text-white text-[10px] sm:text-sm uppercase tracking-widest sm:mb-4 drop-shadow-md font-${
                  parseDisplayConfig(currentImage.landingText).baseTypography
                }`}
              >
                {currentImage.buttonLink}
              </span>
            )}

            {currentImage.title !== DEFAULT_TITLE && (
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white font-light mb-2 sm:mb-6 leading-tight drop-shadow-md font-${
                  parseDisplayConfig(currentImage.landingText).titleTypography
                }`}
              >
                {currentImage.title}
              </h2>
            )}

            {/* Texto descriptivo */}
            {parseDisplayConfig(currentImage.landingText).showText &&
              parseDisplayConfig(currentImage.landingText).text && (
                <p
                  className={`text-white text-[0.9rem] sm:text-lg md:text-xl mb-6 sm:mb-8 leading-tight drop-shadow-md font-${
                    parseDisplayConfig(currentImage.landingText).baseTypography
                  }`}
                >
                  {parseDisplayConfig(currentImage.landingText).text}
                </p>
              )}

            {/* Mostrar precio y valor según la configuración */}
            {(parseDisplayConfig(currentImage.landingText).showPrice ||
              parseDisplayConfig(currentImage.landingText).showValue) && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6 sm:mb-8">
                {parseDisplayConfig(currentImage.landingText).showPrice &&
                  parseButtonTextData(currentImage.buttonText).price && (
                    <span
                      className={`bg-white/5 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm drop-shadow-md font-${
                        parseDisplayConfig(currentImage.landingText)
                          .baseTypography
                      }`}
                    >
                      {parseButtonTextData(currentImage.buttonText).price}
                    </span>
                  )}
                {parseDisplayConfig(currentImage.landingText).showValue &&
                  parseButtonTextData(currentImage.buttonText).value && (
                    <span
                      className={`bg-white/5 backdrop-blur-sm text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded text-xs sm:text-sm drop-shadow-md font-${
                        parseDisplayConfig(currentImage.landingText)
                          .baseTypography
                      }`}
                    >
                      {parseButtonTextData(currentImage.buttonText).value}
                    </span>
                  )}
              </div>
            )}

            {/* Botones */}
            {(() => {
              const config = parseDisplayConfig(currentImage.landingText);
              if (config.fullBannerLink) return null; // No mostrar botones si el banner es clickeable
              return (
                <div className="flex flex-wrap gap-3 sm:gap-4 relative z-20">
                  {config.showButton1 && config.button1Text && (
                    <Link
                      href={config.button1Link}
                      target="_self"
                      className={`bg-primary/60 text-white px-6 sm:px-8 py-3 sm:py-4 rounded text-sm sm:text-base hover:bg-primary transition-all cursor-pointer drop-shadow-md font-${config.baseTypography}`}
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      {config.button1Text}
                    </Link>
                  )}
                  {config.showButton2 && config.button2Text && (
                    <Link
                      href={config.button2Link}
                      target="_self"
                      className={`relative inline-block bg-white/5 text-white border border-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded text-sm sm:text-base hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer drop-shadow-md z-20 font-${config.baseTypography}`}
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      {config.button2Text}
                    </Link>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      {bannerData.images.length > 1 && (
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between items-center z-40 pointer-events-none">
          <button
            onClick={handlePrev}
            className="pointer-events-auto ml-2 sm:ml-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors relative z-50"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
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
            onClick={handleNext}
            className="pointer-events-auto mr-2 sm:mr-4 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors relative z-50"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
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

      {/* Indicador de posición */}
      {bannerData.images.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1.5 sm:gap-2 z-40 pointer-events-none">
          {bannerData.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`pointer-events-auto h-1 transition-all duration-300 rounded relative z-50 ${
                index === currentIndex
                  ? "w-6 sm:w-8 bg-white"
                  : "w-3 sm:w-4 bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Ir a la imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default BannerPrincipal01;
