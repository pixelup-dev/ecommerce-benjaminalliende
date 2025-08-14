/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface BannerImage {
  id: string;
  mainImage: {
    url: string;
    data?: string;
  };
}

interface ContentBlockData {
  epigrafe: string;
  mainTitle: string;
  mainDescription: string;
  imageText: string; // Texto que aparece junto a las fotos
  features: {
    title1: string;
    title2: string;
    title3: string;
    title4: string;
  };
  casos: string[];
  historia: {
    titulo: string;
    texto: string;
  };
}

function Hero17() {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [contentData, setContentData] = useState<ContentBlockData>({
    epigrafe: "",
    mainTitle: "",
    mainDescription: "",
    imageText: "",
    features: {
      title1: "",
      title2: "",
      title3: "",
      title4: "",
    },
    casos: [],
    historia: {
      titulo: "",
      texto: "",
    },
  });
  const [loading, setLoading] = useState(true);
  const [showCasosModal, setShowCasosModal] = useState(false);
  const [showHistoriaModal, setShowHistoriaModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch imágenes desde la API de banners
      const imagesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO17_IMGID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (imagesResponse.data?.banner?.images) {
        setBannerImages(imagesResponse.data.banner.images);
      }

      // Fetch contenido desde el contentblock
      const contentResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_HERO17_CONTENTBLOCK}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      console.log('Content response:', contentResponse.data);

      if (contentResponse.data?.contentBlock?.contentText) {
        try {
          const parsed = JSON.parse(contentResponse.data.contentBlock.contentText);
          console.log('Parsed content:', parsed);
          setContentData(parsed);
        } catch (error) {
          console.error("Error al parsear el contenido:", error);
          // Usar datos por defecto si hay error al parsear
          setContentData({
              epigrafe: "Hola, Soy ....",
            mainTitle: "Tu cuerpo habla… y yo te enseño a escucharlo",
            mainDescription: "Acompaño a mujeres, hombres y niños a mejorar su salud digestiva, emocional y hormonal con un enfoque integrativo, natural y personalizado.",
            imageText: "Experiencia Profesional",
            features: {
              title1: "Enfoque Integrativo",
              title2: "Tratamiento Natural",
              title3: "Enfoque Personalizado",
              title4: "Resultados Garantizados"
            },
            casos: [
              "Problemas digestivos",
              "Desequilibrios hormonales",
              "Problemas emocionales",
              "Salud infantil"
            ],
            historia: {
              titulo: "Mi Historia",
              texto: "Soy ...., especialista en ...."
            }
          });
        }
      } else {
        console.log('No contentText found in response, usando datos por defecto');
        // Usar datos por defecto si no hay contentText
        setContentData({
          epigrafe: "Hola, Soy ....",
          mainTitle: "Tu cuerpo habla… y yo te enseño a escucharlo",
          mainDescription: "Acompaño a mujeres, hombres y niños a mejorar su salud digestiva, emocional y hormonal con un enfoque integrativo, natural y personalizado.",
          imageText: "Experiencia Profesional",
          features: {
            title1: "Enfoque Integrativo",
            title2: "Tratamiento Natural",
            title3: "Enfoque Personalizado",
            title4: "Resultados Garantizados"
          },
          casos: [
            "Problemas digestivos",
            "Desequilibrios hormonales",
            "Problemas emocionales",
            "Salud infantil"
          ],
          historia: {
            titulo: "Mi Historia",
            texto: "Soy ...., especialista en ...."
          }
        });
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", error.response?.data);
        if (error.response?.status === 404) {
          console.log('Contentblock no encontrado (404), usando datos por defecto');
        }
      }
      // Usar datos por defecto si hay error
      setContentData({
        epigrafe: "Hola, Soy ....",
        mainTitle: "Tu cuerpo habla… y yo te enseño a escucharlo",
        mainDescription: "Acompaño a mujeres, hombres y niños a mejorar su salud digestiva, emocional y hormonal con un enfoque integrativo, natural y personalizado.",
        imageText: "Experiencia Profesional",
        features: {
          title1: "Enfoque Integrativo",
          title2: "Tratamiento Natural",
          title3: "Enfoque Personalizado",
          title4: "Resultados Garantizados"
        },
        casos: [
          "Problemas digestivos",
          "Desequilibrios hormonales",
          "Problemas emocionales",
          "Salud infantil"
        ],
        historia: {
          titulo: "Mi Historia",
          texto: "Soy ...., especialista en ...."
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Función para renderizar texto con saltos de línea
  const renderTextWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Función para cerrar modales
  const closeModal = () => {
    setShowCasosModal(false);
    setShowHistoriaModal(false);
  };

  // Manejar clic fuera del modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  // Manejar tecla ESC
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (showCasosModal || showHistoriaModal) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showCasosModal, showHistoriaModal]);

  if (loading) {
    return (
      <section className="py-6  md:py-10 lg:py-16 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-12 px-4 md:px-8">
        <div className="relative flex-1 flex justify-center min-h-[320px] sm:min-h-[360px] md:min-h-[400px] lg:min-h-[420px] lg:min-w-[420px] mb-6 lg:mb-0">
          {/* Imagen base - Solo visible en desktop */}
          <div className="hidden lg:block rounded-3xl overflow-hidden shadow-lg w-80 h-[28rem] bg-gray-200 animate-pulse rotate-[-16deg] -ml-20"></div>
          {/* Imagen principal - Visible en mobile, superpuesta en desktop */}
          <div className="lg:absolute lg:-right-20 lg:-top-4 rounded-2xl md:rounded-3xl overflow-hidden w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-64 lg:h-80 border-2 md:border-4 border-[#f4f0f1] bg-gray-200 animate-pulse lg:rotate-[14deg] z-10"></div>
        </div>
        <div className="flex-1 lg:ml-8 xl:ml-28 space-y-4 sm:space-y-6">
          <div className="h-4 sm:h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-12 sm:h-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-24 sm:h-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="h-6 sm:h-8 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <div className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse w-full"></div>
            <div className="h-10 sm:h-12 bg-gray-200 rounded animate-pulse w-full"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="py-6 pt-12 md:py-10 lg:py-16 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-6 lg:gap-12 px-4 md:px-8">
        {/* Imágenes responsive - Mobile: 2 imágenes superpuestas pequeñas, Desktop: 2 superpuestas grandes */}
        <div className="relative flex-1 flex justify-center mb-6 lg:mb-0">
          {/* Imagen base - Visible en mobile y desktop */}
          <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-lg w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-[28rem] bg-white rotate-[-12deg] sm:rotate-[-14deg] lg:rotate-[-16deg] -ml-20 min-h-[250px]">
            {bannerImages[0] ? (
              <img
                src={bannerImages[0].mainImage.url}
                alt="Imagen principal"
                className="object-cover w-full h-full"
              />
            ) : (
              <img
                src="/pixelup.webp"
                alt="Imagen por defecto"
                className="object-cover w-full h-full"
              />
            )}
          </div>
          
          {/* Imagen principal - Superpuesta en mobile y desktop */}
          <div className="absolute -right-20 lg:right-0 xl:-right-20 top-12  rounded-xl md:rounded-2xl lg:rounded-3xl overflow-hidden w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-80 border-2 md:border-4 border-[#f4f0f1] bg-[#f4f0f1] rotate-[8deg] sm:rotate-[10deg] lg:rotate-[14deg] z-10 min-h-[200px]">
            {bannerImages[1] ? (
              <img
                src={bannerImages[1].mainImage.url}
                alt="Imagen secundaria"
                className="object-cover w-full h-full"
              />
            ) : (
              <img
                src="/pixelup.webp"
                alt="Imagen por defecto"
                className="object-cover w-full h-full"
              />
            )}
          </div>
          
          {/* Línea punteada decorativa - Visible en mobile y desktop */}
          <svg
            className="absolute right-0 top-[140px] sm:top-[160px] md:top-[180px] lg:top-[300px] z-20 w-12 h-6 sm:w-16 sm:h-8 lg:w-20 lg:h-10"
            viewBox="0 0 80 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 2 C40 40, 60 0, 78 38"
              stroke="black"
              strokeWidth="2"
              strokeDasharray="4 4"
              fill="none"
            />
          </svg>
          
          {/* Tarjeta de experiencia - Visible en mobile y desktop */}
          <div className="absolute -right-2 sm:-right-4 lg:-right-8 top-[200px] sm:top-[170px] md:top-[190px] lg:top-[335px] bg-white text-dark border-primary border font-bold px-3 py-2 sm:px-4 sm:py-2 lg:px-6 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-xl shadow-lg text-xs sm:text-sm lg:text-lg items-center gap-1 sm:gap-2 z-30 flex">
            <span className="text-xs sm:text-sm lg:text-base font-normal">
              {contentData.imageText}
            </span>
          </div>
        </div>

        {/* Texto y características */}
        <div className="flex-1 lg:ml-8 xl:ml-28">
          <span className="inline-block mb-2 text-primary font-semibold text-lg sm:text-xl">
            {contentData.epigrafe}
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase font-ubuntu font-bold text-dark mb-4 leading-tight">
            {contentData.mainTitle}
          </h1>
          <div
            className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8"
            dangerouslySetInnerHTML={{ __html: contentData.mainDescription }}
          />
          {/* Características */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {contentData.features.title1 && (
              <div className="flex items-center gap-2">
                <span className="text-primary mr-2 bg-white rounded-md p-1 sm:p-2 px-2 sm:px-3 border-primary border-dashed border-2 text-sm">
                  ✔
                </span>
                <span className="text-sm sm:text-base">{contentData.features.title1}</span>
              </div>
            )}
            {contentData.features.title2 && (
              <div className="flex items-center gap-2">
                <span className="text-primary mr-2 bg-white rounded-md p-1 sm:p-2 px-2 sm:px-3 border-primary border-dashed border-2 text-sm">
                  ✔
                </span>
                <span className="text-sm sm:text-base">{contentData.features.title2}</span>
              </div>
            )}
            {contentData.features.title3 && (
              <div className="flex items-center gap-2">
                <span className="text-primary mr-2 bg-white rounded-md p-1 sm:p-2 px-2 sm:px-3 border-primary border-dashed border-2 text-sm">
                  ✔
                </span>
                <span className="text-sm sm:text-base">{contentData.features.title3}</span>
              </div>
            )}
            {contentData.features.title4 && (
              <div className="flex items-center gap-2">
                <span className="text-primary mr-2 bg-white rounded-md p-1 sm:p-2 px-2 sm:px-3 border-primary border-dashed border-2 text-sm">
                  ✔
                </span>
                <span className="text-sm sm:text-base">{contentData.features.title4}</span>
              </div>
            )}
          </div>
          {/* Botones */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <button
              onClick={() => setShowCasosModal(true)}
              className="bg-primary hover:scale-105 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg transition w-full text-center text-sm sm:text-base"
            >
              Casos que Acompaño
            </button>
            <button
              onClick={() => setShowHistoriaModal(true)}
              className="bg-dark hover:scale-105 text-white font-bold px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg transition w-full text-center text-sm sm:text-base"
            >
              Mi Historia
            </button>
          </div>
        </div>
      </section>

      {/* Modal de Casos */}
      {showCasosModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[70vh] flex flex-col mt-24">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-dark">Casos que acompaño</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {contentData.casos && contentData.casos.length > 0 ? (
                  contentData.casos.map((caso, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <span className="text-primary font-bold text-lg mt-1">•</span>
                      <p className="text-gray-700">{caso}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No hay casos disponibles</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historia */}
      {showHistoriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[70vh] flex flex-col mt-24">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-dark">
                {contentData.historia.titulo}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed">
                  {contentData.historia.texto ? (
                    <div dangerouslySetInnerHTML={{ __html: contentData.historia.texto }} />
                  ) : (
                    <p>No hay historia disponible</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Hero17;