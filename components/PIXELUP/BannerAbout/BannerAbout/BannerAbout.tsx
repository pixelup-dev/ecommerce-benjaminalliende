"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { globalConfig } from "@/app/config/GlobalConfig";

interface ConfigOptions {
  desktop: {
    showTitle: boolean;
    showLandingText: boolean;
    showButton: boolean;
    textAlignment: string;
    textContent: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
  mobile: {
    showTitle: boolean;
    showLandingText: boolean;
    showButton: boolean;
    textAlignment: string;
    textContent: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
}

const BannerPrincipal = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // Estado para almacenar la configuración extraída del JSON
  const [config, setConfig] = useState<ConfigOptions>({
    desktop: {
      showTitle: true,
      showLandingText: true,
      showButton: true,
      textAlignment: "center",
      textContent: "",
      title: "",
      buttonText: "",
      buttonLink: "",
    },
    mobile: {
      showTitle: true,
      showLandingText: true,
      showButton: true,
      textAlignment: "center",
      textContent: "",
      title: "",
      buttonText: "",
      buttonLink: "",
    },
  });

  // Obtener los aspectos de las imágenes desde la configuración global específica para BannerAbout
  const desktopAspect = globalConfig.bannerAboutAspects.desktop;
  const mobileAspect = globalConfig.bannerAboutAspects.mobile;

  // Estilos para la sombra del texto
  const shadowTextStyle = {
    textShadow: "0px 0px 8px rgba(0, 0, 0, 0.8)",
  };

  const fetchBannerHome = async () => {
    try {
      const bannerId = `${process.env.NEXT_PUBLIC_BANNER_ABOUT_ID}`;

      // Obtener datos del banner base
      const bannerResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          cache: "no-store",
          next: { revalidate: 0 },
        }
      );

      if (!bannerResponse.ok) {
        throw new Error(
          `Error en la petición del banner base: ${bannerResponse.status}`
        );
      }

      const responseData = await bannerResponse.json();
      console.log("Respuesta de la API:", responseData);

      // Verificar que la respuesta tenga la estructura esperada
      if (!responseData || !responseData.banner) {
        throw new Error("La estructura de datos del banner no es válida");
      }

      // Configuración por defecto
      let configData: ConfigOptions = {
        desktop: {
          showTitle: true,
          showLandingText: true,
          showButton: true,
          textAlignment: "center",
          textContent: "",
          title: responseData.banner.title || "",
          buttonText: responseData.banner.buttonText || "",
          buttonLink: responseData.banner.buttonLink || "",
        },
        mobile: {
          showTitle: true,
          showLandingText: true,
          showButton: true,
          textAlignment: "center",
          textContent: "",
          title: responseData.banner.title || "",
          buttonText: responseData.banner.buttonText || "",
          buttonLink: responseData.banner.buttonLink || "",
        },
      };

      // Intentar extraer la configuración del JSON en landingText del banner base
      try {
        if (
          responseData.banner.landingText &&
          responseData.banner.landingText.trim().startsWith("{")
        ) {
          const parsedConfig = JSON.parse(responseData.banner.landingText);
          if (parsedConfig && typeof parsedConfig === "object") {
            // Usar la configuración guardada
            configData = parsedConfig;
            console.log("Configuración extraída:", configData);
          }
        }
      } catch (error) {
        console.error("Error al parsear la configuración JSON:", error);
      }

      // Establecer los datos del banner y la configuración
      setBannerData(responseData);
      setConfig(configData);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los datos del banner:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial

  return (
    <section
      id="banner"
      className="w-full z-10"
    >
      {loading ? (
        <section
          id="banner"
          className="w-full z-10 animate-pulse"
        >
          <div className="relative font-[sans-serif] before:absolute before:w-full before:h-full before:inset-0 before:bg-gray-300 before:opacity-50 before:z-10">
            <div className="absolute inset-0 w-full h-full bg-gray-200"></div>
            <div className="min-h-[300px] md:min-h-[400px] relative z-10 h-full max-w-[95%] mx-auto flex flex-col justify-center items-center text-center text-white p-6">
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        </section>
      ) : (
        bannerData && (
          <>
            {/* Desktop Banner */}
            <div className="hidden md:block relative">
              {bannerData?.banner?.images?.[0]?.mainImage?.url && (
                <div
                  className="relative w-full"
                  style={{ aspectRatio: desktopAspect }}
                >
                  <img
                    src={bannerData.banner.images[0].mainImage.url}
                    alt={bannerData.banner.title || "Banner"}
                    className="w-full h-full object-cover min-h-[400px]"
                  />
                  {(config.desktop.showTitle ||
                    config.desktop.showLandingText ||
                    config.desktop.showButton) && (
                    <div className="absolute inset-0 bg-black bg-opacity-30">
                      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 py-8 w-full">
                        <div className="max-w-[95%] mx-auto w-full px-4 pt-4">
                          <div
                            className={`${
                              config.desktop.textAlignment === "center"
                                ? "text-center mx-auto"
                                : config.desktop.textAlignment === "right"
                                ? "text-right ml-auto"
                                : "text-left"
                            } ${
                              config.desktop.textAlignment !== "center"
                                ? "max-w-2xl"
                                : "max-w-3xl"
                            }`}
                          >
                            {config.desktop.showTitle &&
                              config.desktop.title && (
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 ">
                                  {config.desktop.title}
                                </h2>
                              )}

                            {config.desktop.showLandingText &&
                              config.desktop.textContent && (
                                <p
                                  className={`text-lg md:text-xl text-white mb-6 `}
                                >
                                  {config.desktop.textContent}
                                </p>
                              )}

                            {config.desktop.showButton &&
                              config.desktop.buttonText && (
                                <div>
                                  <a
                                    href={config.desktop.buttonLink || "#"}
                                    className="inline-block bg-white text-primary px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors text-lg "
                                  >
                                    {config.desktop.buttonText}
                                  </a>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Banner */}
            <div className="block md:hidden relative">
              {bannerData?.banner?.images?.[0]?.mobileImage?.url && (
                <div
                  className="relative w-full min-h-[300px]"
                  style={{ aspectRatio: mobileAspect }}
                >
                  <img
                    src={bannerData.banner.images[0].mobileImage.url}
                    alt={bannerData.banner.title || "Banner"}
                    className="w-full h-full object-cover"
                  />
                  {(config.mobile.showTitle ||
                    config.mobile.showLandingText ||
                    config.mobile.showButton) && (
                    <div className="absolute inset-0 bg-black bg-opacity-30">
                      <div className="absolute inset-0 flex flex-col justify-center w-full">
                        <div className="w-full  max-w-[90%] mx-auto px-2 py-10">
                          <div
                            className={`${
                              config.mobile.textAlignment === "center"
                                ? "text-center mx-auto"
                                : config.mobile.textAlignment === "right"
                                ? "text-right ml-auto"
                                : "text-left"
                            } ${
                              config.mobile.textAlignment !== "center"
                                ? "max-w-xs"
                                : ""
                            }`}
                          >
                            {config.mobile.showTitle && config.mobile.title && (
                              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 ">
                                {config.mobile.title}
                              </h2>
                            )}

                            {config.mobile.showLandingText &&
                              config.mobile.textContent && (
                                <p
                                  className={`text-base text-white mb-5 leading-5 `}
                                >
                                  {config.mobile.textContent}
                                </p>
                              )}

                            {config.mobile.showButton &&
                              config.mobile.buttonText && (
                                <div className="mt-2">
                                  <a
                                    href={config.mobile.buttonLink || "#"}
                                    className="inline-block bg-white text-primary px-5 py-2.5 rounded-md font-medium hover:bg-gray-100 transition-colors shadow-md"
                                  >
                                    {config.mobile.buttonText}
                                  </a>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )
      )}
    </section>
  );
};

export default BannerPrincipal;
