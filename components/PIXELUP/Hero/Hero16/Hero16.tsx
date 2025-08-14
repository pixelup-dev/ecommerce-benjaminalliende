/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface BannerImage {
  id: string;
  mainImage: {
    url: string;
    data?: string;
  };
}

interface ContentData {
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
}

interface LandingTextContent {
  mainTitle: string;
  mainDescription: string;
  features: {
    title1: string;
    description1: string;
    title2: string;
    description2: string;
  };
  buttonText: string;
  // Campos de control de visibilidad
  showMainTitle: boolean;
  showMainDescription: boolean;
  showFeature1: boolean;
  showFeature2: boolean;
  showButton: boolean;
}

function Hero16() {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [content, setContent] = useState<ContentData>({
    title: "",
    landingText: "",
    buttonLink: "",
    buttonText: "",
  });
  const [parsedContent, setParsedContent] = useState<LandingTextContent>({
    mainTitle: "",
    mainDescription: "",
    features: {
      title1: "",
      description1: "",
      title2: "",
      description2: "",
    },
    buttonText: "",
    // Valores por defecto para visibilidad
    showMainTitle: true,
    showMainDescription: true,
    showFeature1: true,
    showFeature2: true,
    showButton: true,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const imagesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO16_IMGID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (imagesResponse.data?.banner?.images) {
        setBannerImages(imagesResponse.data.banner.images);
      }

      const contentResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO16_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (contentResponse.data?.banner) {
        setContent(contentResponse.data.banner);
        try {
          const parsed = JSON.parse(
            contentResponse.data.banner.landingText || "{}"
          );
          // Asegurar que los campos de visibilidad estén presentes
          const validContent = {
            mainTitle: parsed.mainTitle || "",
            mainDescription: parsed.mainDescription || "",
            features: {
              title1: parsed.features?.title1 || "",
              description1: parsed.features?.description1 || "",
              title2: parsed.features?.title2 || "",
              description2: parsed.features?.description2 || "",
            },
            buttonText: parsed.buttonText || "",
            // Campos de visibilidad con valores por defecto
            showMainTitle: parsed.showMainTitle ?? true,
            showMainDescription: parsed.showMainDescription ?? true,
            showFeature1: parsed.showFeature1 ?? true,
            showFeature2: parsed.showFeature2 ?? true,
            showButton: parsed.showButton ?? true,
          };
          setParsedContent(validContent);
        } catch (error) {
          console.error("Error al parsear el contenido:", error);
        }
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (bannerImages.length > 0 && !isModalOpen) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [bannerImages, isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + bannerImages.length) % bannerImages.length
    );
  };

  if (loading) {
    return (
      <section className="md:py-20 bg-gray-50">
        <div className="mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="h-[400px] bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2].map((index) => (
                    <div
                      key={index}
                      className="h-20 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        {/* Carrusel de Imágenes */}
        <div className="w-full lg:w-1/2 relative">
          <div className="relative h-64 md:h-80 lg:h-full overflow-hidden">
            {bannerImages.length > 0 ? (
              <>
                {bannerImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={`absolute inset-0 transition-transform duration-500 ${
                      index === currentIndex
                        ? "translate-x-0"
                        : index < currentIndex
                        ? "-translate-x-full"
                        : "translate-x-full"
                    }`}
                  >
                    <img
                      src={image.mainImage.url}
                      alt={`Proyecto personalizado ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={openModal}
                    />
                  </div>
                ))}

                {/* Controles del carrusel */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
                  {bannerImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded transition-colors duration-300 ${
                        currentIndex === index
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>

                {/* Flechas de navegación */}
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-2 rounded transition-colors duration-300"
                  aria-label="Imagen anterior"
                >
                  <svg
                    className="w-6 h-6 text-white"
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
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-2 rounded transition-colors duration-300"
                  aria-label="Siguiente imagen"
                >
                  <svg
                    className="w-6 h-6 text-white"
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
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No hay imágenes disponibles</p>
              </div>
            )}
          </div>
        </div>
        {/* Columna de Texto */}
        <div className="w-full lg:w-1/2 p-6 bg-white">
          <div className="max-w-2xl mx-auto py-10">
            {/* Título Principal - Solo se muestra si showMainTitle es true */}
            {parsedContent.showMainTitle && (
              <h2 className="text-4xl text-primary font-bold mb-4 pt-4 leading-tight">
                {parsedContent.mainTitle ||
                  "Proyectos Personalizados a tu Medida"}
              </h2>
            )}

            {/* Descripción Principal - Solo se muestra si showMainDescription es true */}
            {parsedContent.showMainDescription && (
              <div
                className="text-md text-gray-600 mb-6"
                dangerouslySetInnerHTML={{
                  __html: parsedContent.mainDescription,
                }}
              />
            )}

            <div className="space-y-4">
              {/* Característica 1 - Solo se muestra si showFeature1 es true */}
              {parsedContent.showFeature1 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-primary">
                    {parsedContent.features.title1}
                  </h3>
                  <div
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: parsedContent.features.description1,
                    }}
                  />
                </div>
              )}

              {/* Característica 2 - Solo se muestra si showFeature2 es true */}
              {parsedContent.showFeature2 && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-primary">
                    {parsedContent.features.title2}
                  </h3>
                  <div
                    className="text-gray-600"
                    dangerouslySetInnerHTML={{
                      __html: parsedContent.features.description2,
                    }}
                  />
                </div>
              )}
            </div>



            {/* Botón - Solo se muestra si showButton es true */}
            {parsedContent.showButton && (
              <div className="pt-12">
                <Link
                  href={content.buttonLink}
                  id="boton-contacto-box"
                  className="bg-primary text-white px-8 py-4 font-semibold hover:bg-primary/80 transition-colors duration-300"
                  style={{ borderRadius: "var(--radius)" }}

                >
                  {parsedContent.buttonText || "Contacta con nosotros"}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Imagen */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Botón de cerrar */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Imagen actual */}
            <img
              src={bannerImages[currentIndex]?.mainImage.url}
              alt={`Proyecto personalizado ${currentIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />

            {/* Botones de navegación */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Indicador de imagen actual */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-50">
              {bannerImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index === currentIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

  export default Hero16;
