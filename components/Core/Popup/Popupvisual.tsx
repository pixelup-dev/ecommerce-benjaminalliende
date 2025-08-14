"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { Montserrat, Oswald, Roboto } from "next/font/google";
import { toast } from "react-hot-toast";

// Configuración de las fuentes
const montserrat = Montserrat({ subsets: ["latin"] });
const oswald = Oswald({ subsets: ["latin"] });
const roboto = Roboto({ weight: ["400", "500"], subsets: ["latin"] });

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
}

interface BannerData {
  images: BannerImage[];
}

interface PopupVisualProps {
  onClose?: () => void;
}

const PopVisual: React.FC<PopupVisualProps> = ({ onClose }) => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isPopupEnabled, setIsPopupEnabled] = useState<boolean>(false);
  const [showButton2Link, setShowButton2Link] = useState<boolean>(false);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Cupón copiado al portapapeles");
  };

  const fetchPopupConfig = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_POPUP_CONTENTBLOCK;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const data = response.data.contentBlock;
      let popupConfig;
      try {
        popupConfig = JSON.parse(data.contentText || '{"enabled": false}');
      } catch {
        popupConfig = { enabled: false };
      }

      setIsPopupEnabled(popupConfig.enabled);
    } catch (error) {
      console.error("Error al obtener la configuración del popup:", error);
      setIsPopupEnabled(false);
    }
  };

  useEffect(() => {
    fetchPopupConfig();
  }, []);

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_POPUP_BANNER_ID}`;

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
    if (isPopupEnabled) {
      fetchBannerHome();
    }
  }, [isPopupEnabled]);

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
      };
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

  if (!bannerData || !isPopupEnabled) {
    return null;
  }

  const currentImage = bannerData.images[0];
  const config = parseDisplayConfig(currentImage.landingText);
  const buttonData = parseButtonTextData(currentImage.buttonText);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fondo oscurecido */}
          <div 
            className={`fixed inset-0 backdrop-blur-sm ${
              (currentImage.buttonLink !== "#" || 
              currentImage.title !== "Banner" || 
              (config.showText && config.text) || 
              (config.showPrice || config.showValue) || 
              (config.showButton1 || config.showButton2)) 
                ? "bg-black bg-opacity-50" 
                : "bg-transparent"
            }`}
            onClick={handleClose}
          />
          
          {/* Contenedor del popup */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-[90%] mx-4 overflow-hidden">
            {/* Imagen de fondo */}
            <div className="relative h-[500px]">
              <img
                src={currentImage.mainImage.url}
                alt={process.env.NEXT_PUBLIC_NOMBRE_TIENDA || 'pixelup.cl'}
                className="w-full h-full object-cover"
              />
              {/* Overlay oscuro */}
              <div className={`absolute inset-0 ${
                (currentImage.buttonLink !== "#" || 
                currentImage.title !== "Banner" || 
                (config.showText && config.text) || 
                (config.showPrice || config.showValue) || 
                (config.showButton1 || config.showButton2)) 
                  ? "bg-black bg-opacity-20" 
                  : "bg-transparent"
              }`} />
            </div>

            {/* Contenido */}
            <div className={`absolute inset-0 flex flex-col justify-center p-8 text-white ${
              config.contentAlignment === "center" 
                ? "items-center text-center" 
                : config.contentAlignment === "right"
                ? "items-end text-right"
                : "items-start text-left"
            }`}>
              {/* Epígrafe */}
              {currentImage.buttonLink !== "#" && (
                <span className="text-primary text-sm uppercase tracking-widest mb-4 drop-shadow-md">
                  {currentImage.buttonLink}
                </span>
              )}

              {/* Título */}
              {currentImage.title !== "Banner" && (
                <h2 className={`${oswald.className} text-4xl md:text-5xl font-bold mb-6 tracking-tight drop-shadow-md`}>
                  {currentImage.title}
                </h2>
              )}

              {/* Descripción */}
              {config.showText && config.text && (
                <div
                  className={`${roboto.className} mb-8 text-lg leading-relaxed max-w-2xl drop-shadow-md`}
                  dangerouslySetInnerHTML={{ __html: config.text }}
                />
              )}

              {/* Precios y Valores */}
              {(config.showPrice || config.showValue) && (
                <div className="flex items-center gap-4 mb-8">
                  {config.showPrice && buttonData.price && (
                    <span className="bg-white/5 backdrop-blur-sm text-white px-4 py-2 rounded text-sm drop-shadow-md">
                      {buttonData.price}
                    </span>
                  )}
                  {config.showValue && buttonData.value && (
                    <span className="bg-white/5 backdrop-blur-sm text-white px-4 py-2 rounded text-sm drop-shadow-md">
                      {buttonData.value}
                    </span>
                  )}
                </div>
              )}

              {/* Botones */}
              {!config.fullBannerLink && (
                <div className="flex flex-wrap gap-4">
                  {config.showButton1 && config.button1Text && (
                    <Link
                      href={config.button1Link}
                      className="bg-primary/60 text-white px-8 py-2 rounded-lg hover:bg-primary transition-all cursor-pointer drop-shadow-md"
                    >
                      {config.button1Text}
                    </Link>
                  )}
                  {config.showButton2 && config.button2Text && !showButton2Link && (
                    <button
                      onClick={() => setShowButton2Link(true)}
                      className="relative inline-block bg-white text-black border border-white/20 px-8 py-2 rounded-lg hover:bg-white/10 transition-all backdrop-blur-sm cursor-pointer drop-shadow-md"
                    >
                      {config.button2Text}
                    </button>
                  )}
                  {showButton2Link && config.showButton2 && (
                    <div className="flex items-center gap-2">
                      <div className="bg-white backdrop-blur-sm text-black px-8 py-2 rounded-lg drop-shadow-md">
                        {config.button2Link}
                      </div>
                      <button
                        onClick={() => handleCopyToClipboard(config.button2Link)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors bg-white backdrop-blur-sm"
                        title="Copiar cupón"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="black"
                          className="w-5 h-5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botón de cerrar */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors duration-200 z-50"
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
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PopVisual;
