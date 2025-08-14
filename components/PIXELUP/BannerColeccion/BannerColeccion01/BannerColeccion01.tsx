/* eslint-disable @next/next/no-img-element */

"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { useParams } from "next/navigation";
import { useAPI } from "@/app/Context/ProductTypeContext";
import Loader from "@/components/common/Loader";
import ProductCard from "@/components/PIXELUP/ProductCards/ProductCards01/ProductCard01";
import Link from "next/link";

interface ConfigOptions {
  desktop: {
    showTitle: boolean;
    showBannerText: boolean;
    showButton: boolean;
    textAlignment: string;
    bannerText: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
  mobile: {
    showTitle: boolean;
    showBannerText: boolean;
    showButton: boolean;
    textAlignment: string;
    bannerText: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
}

interface BannerColeccion01BOProps {
  title?: string;
  text?: string;
  imageUrl?: string;
  previewImageUrl?: string;
  config?: ConfigOptions;
  isMobile?: boolean;
}

// Hook personalizado para detectar el tamaño de la pantalla
const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, [matches, query]);

  return matches;
};

const BannerColeccion01: React.FC<BannerColeccion01BOProps> = ({
  title,
  text,
  imageUrl,
  previewImageUrl,
  config: propConfig,
  isMobile = false,
}) => {
  // Estilos para la sombra del texto
  const shadowTextStyle = {
    textShadow: "0px 0px 8px rgba(0, 0, 0, 0.8)",
  };

  // Detectar si estamos en vista móvil
  const isMobileView = useMediaQuery("(max-width: 768px)");

  // Parsear la configuración si viene como string
  const config =
    typeof propConfig === "string" ? JSON.parse(propConfig) : propConfig;
  const currentConfig = isMobileView ? config?.mobile : config?.desktop;

  return (
    <div className="relative w-full">
      <img
        src={previewImageUrl || imageUrl}
        alt={title || "Collection banner"}
        className="w-full h-full object-cover block md:hidden"
      />
      <img
        src={imageUrl}
        alt={title || "Collection banner"}
        className="w-full h-full object-cover hidden md:block"
      />
      {currentConfig &&
        (currentConfig.showTitle ||
          currentConfig.showBannerText ||
          currentConfig.showButton) && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center px-6 py-6 w-full">
            <div className="w-full max-w-[95%] mx-auto px-4 ">
              <div
                className={`${
                  currentConfig.textAlignment === "center"
                    ? "text-center mx-auto max-w-3xl"
                    : currentConfig.textAlignment === "right"
                    ? "text-right ml-auto max-w-2xl"
                    : "text-left max-w-2xl"
                }`}
              >
                {currentConfig.showTitle && (
                  <h1
                    className={`${
                      isMobileView
                        ? "text-2xl md:text-3xl"
                        : "text-3xl md:text-4xl"
                    } font-bold text-white mb-3 drop-shadow-lg`}
                    style={shadowTextStyle}
                  >
                    {currentConfig.title || title}
                  </h1>
                )}
                {currentConfig.showBannerText && (
                  <p
                    className={`${
                      isMobileView ? "text-base" : "text-lg"
                    } text-white mb-4 drop-shadow-lg`}
                    style={shadowTextStyle}
                  >
                    {currentConfig.bannerText || text}
                  </p>
                )}
                {currentConfig.showButton && (
                  <div>
                    <Link
                      href={currentConfig.buttonLink}
                      className={`inline-block px-${
                        isMobileView ? "5" : "6"
                      } py-${
                        isMobileView ? "2.5" : "3"
                      } bg-white text-black rounded-md shadow-md font-medium hover:bg-gray-100 transition-colors`}
                    >
                      {currentConfig.buttonText}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default BannerColeccion01;
