"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { previewData } from "@/app/config/previewData";

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

const BannerPrincipal01Preview = () => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [isTablet, setIsTablet] = useState<boolean>(false);

  // Detectar el tipo de dispositivo
  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 850);
      setIsTablet(width > 850 && width <= 1560);
    };

    // Verificar inmediatamente al cargar
    checkDeviceType();

    // Agregar listener
    window.addEventListener("resize", checkDeviceType);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkDeviceType);
    };
  }, []);

  // Función para obtener el aspect ratio según el dispositivo
  const getCurrentAspectRatio = () => {
    if (isMobile) return "16/9";
    if (isTablet) return "21/9";
    return "21/9";
  };

  // Configuración de display para preview
  const displayConfig: DisplayConfig = {
    text: previewData.texto || "",
    showText: true,
    showPrice: false,
    showValue: false,
    showButton1: true,
    showButton2: false,
    button1Text: previewData.epigrafe || "Ver Más",
    button2Text: "Botón 2",
    button1Link: "#",
    button2Link: "#",
    contentAlignment: "left",
    fullBannerLink: false,
    fullBannerLinkUrl: "#",
    baseTypography: "montserrat",
    titleTypography: "montserrat",
  };

  return (
    <section
      className="relative overflow-hidden w-full"
      style={{
        aspectRatio: getCurrentAspectRatio(),
      }}
    >
      {/* Contenedor de imagen de fondo */}
      <div
        className="absolute inset-0 w-full"
        style={{
          aspectRatio: getCurrentAspectRatio(),
        }}
      >
        <div className="absolute inset-0">
          {/* Imagen de fondo con gradiente */}
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-purple-600 relative">
            {/* Overlay para mejorar legibilidad del texto */}
            <div className="absolute inset-0 bg-black/30" />
            
            {/* Imagen de fondo si existe */}
            {previewData.imagen && (
              <img
                src={previewData.imagen}
                alt="Banner Preview"
                className="w-full h-full object-cover opacity-40"
              />
            )}
          </div>
        </div>
      </div>

      {/* Contenido del banner */}
      <div className="relative h-full z-20">
        <div className="h-full mx-auto px-14 sm:px-20 md:px-20 lg:px-24">
          <div
            className={`flex flex-col justify-center h-full ${
              displayConfig.contentAlignment === "center"
                ? "items-center text-center mx-auto"
                : displayConfig.contentAlignment === "right"
                ? "items-end text-right ml-auto"
                : "items-start text-left"
            } max-w-2xl`}
          >
            {/* Epígrafe */}
            {displayConfig.showButton1 && displayConfig.button1Text && (
              <span
                className={`text-white text-[10px] sm:text-sm uppercase tracking-widest sm:mb-4 drop-shadow-md font-${displayConfig.baseTypography}`}
              >
                {displayConfig.button1Text}
              </span>
            )}

            {/* Título */}
            {previewData.titulo && (
              <h2
                className={`text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white font-light mb-2 sm:mb-6 leading-tight drop-shadow-md font-${displayConfig.titleTypography}`}
              >
                {previewData.titulo}
              </h2>
            )}

            {/* Texto descriptivo */}
            {displayConfig.showText && displayConfig.text && (
              <p
                className={`text-white text-[0.9rem] sm:text-lg md:text-xl mb-6 sm:mb-8 leading-tight drop-shadow-md font-${displayConfig.baseTypography}`}
              >
                {displayConfig.text}
              </p>
            )}

            {/* Botones */}
            {!displayConfig.fullBannerLink && (
              <div className="flex flex-wrap gap-3 sm:gap-4 relative z-20">
                {displayConfig.showButton1 && displayConfig.button1Text && (
                  <Link
                    href={displayConfig.button1Link}
                    target="_self"
                    className={`bg-primary/60 text-white px-6 sm:px-8 py-3 sm:py-4 rounded text-sm sm:text-base hover:bg-primary transition-all cursor-pointer drop-shadow-md font-${displayConfig.baseTypography}`}
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    {displayConfig.button1Text}
                  </Link>
                )}
                {displayConfig.showButton2 && displayConfig.button2Text && (
                  <Link
                    href={displayConfig.button2Link}
                    target="_self"
                    className={`relative inline-block bg-white/5 text-white border border-white/20 px-6 sm:px-8 py-3 sm:py-4 rounded text-sm sm:text-base hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer drop-shadow-md z-20 font-${displayConfig.baseTypography}`}
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    {displayConfig.button2Text}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BannerPrincipal01Preview;