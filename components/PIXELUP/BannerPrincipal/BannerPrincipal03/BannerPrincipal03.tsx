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
  buttonLink2: string;
  buttonText2: string;
}

interface BannerData {
  images: BannerImage[];
}

interface TextContent {
  title: string;
  mainText: string;
  bookText: string;
  buttonText: string;
  buttonText2: string;
  buttonLink: string;
  buttonLink2: string;
}

const BannerPrincipal03: React.FC = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Función para parsear el JSON del landingText
  const parseLandingText = (landingText: string): TextContent => {
    try {
      return JSON.parse(landingText);
    } catch (error) {
      // Si no es JSON válido, crear estructura por defecto
      return {
        title: "",
        mainText: landingText || "",
        bookText: "",
        buttonText: "",
        buttonText2: "",
        buttonLink: "",
        buttonLink2: "",
      };
    }
  };

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_BANNERPRINCIPAL03_ID}`;

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

  if (loading) {
    return <div role="status" className="w-full animate-pulse rtl:space-x-reverse md:flex md:items-center">
      <div className="flex items-center justify-center w-full h-96 bg-gray-300 rounded dark:bg-gray-700">
        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
          <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
        </svg>
      </div>
    </div>;
  }

  if (!bannerData || bannerData.images.length < 2) {
    return <div className="w-full text-center p-6">Se requieren exactamente 2 imágenes para este banner</div>;
  }

  // Parsear el contenido de texto para ambas imágenes
  const textContent1 = parseLandingText(bannerData.images[0].landingText);
  const textContent2 = parseLandingText(bannerData.images[1].landingText);

  return (
    <section className="py-0 pt-2">
      <div className="mx-auto">
        {/* Layout para mobile: caja1 → botón1 → caja2 → botón2 */}
        <div className="block lg:hidden">
          {/* Primera imagen del banner */}
          <div className="relative min-h-[400px] flex items-center justify-center">
            <img
              src={bannerData.images[0].mainImage.url}
              alt={textContent1.title || bannerData.images[0].title}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/50 z-10" />
            <div className="relative z-20 flex flex-col items-center justify-center max-w-lg mx-auto h-full w-full text-center px-6 py-8">
            <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                {textContent1.title || bannerData.images[0].title}
              </h2>
              <p className="text-sm text-white mb-4 drop-shadow-lg leading-tight">
                {textContent1.mainText}
              </p>
              {textContent1.bookText && (
                <p className="text-sm text-white mb-4 drop-shadow-lg leading-tight">
                  {textContent1.bookText}
                </p>
              )}
              <div className="flex flex-col gap-2 w-full">
                <Link
                  href={textContent1.buttonLink || bannerData.images[0].buttonLink || '#'}
                  className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-base hover:scale-105 transition-colors shadow-lg"
                >
                  {textContent1.buttonText || bannerData.images[0].buttonText || 'Ver más'}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Primer botón adicional (mobile) */}
          <div className="w-full">
            <a
              href={textContent1.buttonLink2 || bannerData.images[0].buttonLink2 || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary w-full text-white px-4 py-3 text-base hover:bg-dark flex items-center justify-between gap-2"
            >
              {textContent1.buttonText2 || bannerData.images[0].buttonText2 || 'Adquiere mi bloc Notas Aquí nace mi Historia'}
              <span className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-move-right-icon lucide-move-right"
                >
                  <path d="M18 8L22 12L18 16" />
                  <path d="M2 12H22" />
                </svg>
              </span>
            </a>
          </div>
          
          {/* Segunda imagen del banner */}
          <div className="relative min-h-[400px] flex items-center justify-center">
            <img
              src={bannerData.images[1].mainImage.url}
              alt={textContent2.title || bannerData.images[1].title}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/50 z-10" />
            <div className="relative z-20 flex flex-col items-center justify-center max-w-lg mx-auto h-full w-full text-center px-6 py-8">
            <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                {textContent2.title || bannerData.images[1].title}
              </h2>
              <p className="text-sm text-white mb-4 drop-shadow-lg leading-tight">
                {textContent2.mainText}
              </p>
              {textContent2.bookText && (
                <p className="text-sm text-white mb-4 drop-shadow-lg leading-tight">
                  {textContent2.bookText}
                </p>
              )}

              <div className="flex flex-col gap-2 w-full">
                <Link
                  href={textContent2.buttonLink || bannerData.images[1].buttonLink || '#'}
                  className="inline-block bg-white text-dark px-4 py-2 rounded-lg text-base hover:scale-105 transition-colors shadow-lg"
                >
                  {textContent2.buttonText || bannerData.images[1].buttonText || 'Ver más'}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Segundo botón adicional (mobile) */}
          <div className="w-full">
            <a
              href={textContent2.buttonLink2 || bannerData.images[1].buttonLink2 || '#'}
              className="bg-dark w-full text-white px-4 py-3 text-base hover:bg-primary flex items-center justify-between gap-2"
            >
              {textContent2.buttonText2 || bannerData.images[1].buttonText2 || 'Talleres Personalizados para profesionales'}
              <span className="text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-move-right-icon lucide-move-right"
                >
                  <path d="M18 8L22 12L18 16" />
                  <path d="M2 12H22" />
                </svg>
              </span>
            </a>
          </div>
        </div>

        {/* Layout para desktop: grid de 2 columnas */}
        <div className="hidden lg:block">
          <div className="grid grid-cols-2 gap-0 overflow-hidden shadow-xl">
            {/* Primera imagen del banner */}
            <div className="relative h-[500px] flex items-center justify-center">
              <img
                src={bannerData.images[0].mainImage.url}
                alt={textContent1.title || bannerData.images[0].title}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-black/50 z-10" />
              <div className="relative z-20 flex flex-col items-center justify-center max-w-lg mx-auto h-full w-full text-center px-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
                  {textContent1.title || bannerData.images[0].title}
                </h2>
                <p className="text-base text-white mb-6 drop-shadow-lg leading-tight">
                  {textContent1.mainText}
                </p>
                {textContent1.bookText && (
                  <p className="text-base text-white mb-6 drop-shadow-lg leading-tight">
                    {textContent1.bookText}
                  </p>
                )}
                <div className="flex flex-col gap-3 w-full">
                  <Link
                    href={textContent1.buttonLink || bannerData.images[0].buttonLink || '#'}
                    target="_blank"
                    className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-lg hover:scale-105 transition-colors shadow-lg"
                  >
                    {textContent1.buttonText || bannerData.images[0].buttonText || 'Ver más'}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Segunda imagen del banner */}
            <div className="relative h-[500px] flex items-center justify-center">
              <img
                src={bannerData.images[1].mainImage.url}
                alt={textContent2.title || bannerData.images[1].title}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-black/50 z-10" />
              <div className="relative z-20 flex flex-col items-center justify-center max-w-lg mx-auto h-full w-full text-center px-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
                  {textContent2.title || bannerData.images[1].title}
                </h2>
                <p className="text-base text-white mb-6 drop-shadow-lg leading-tight">
                  {textContent2.mainText}
                </p>
                {textContent2.bookText && (
                  <p className="text-base text-white mb-6 drop-shadow-lg leading-tight">
                    {textContent2.bookText}
                  </p>
                )}

                <div className="flex flex-col gap-3 w-full">
                  <Link
                    href={textContent2.buttonLink || bannerData.images[1].buttonLink || '#'}
                    target="_blank"
                    className="inline-block bg-white text-dark px-6 py-3 rounded-lg text-lg hover:scale-105 transition-colors shadow-lg"
                  >
                    {textContent2.buttonText || bannerData.images[1].buttonText || 'Ver más'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección de botones adicionales (desktop) */}
          <div className="flex flex-row justify-center w-full">
            <div className="w-1/2">
              <a
                href={textContent1.buttonLink2 || bannerData.images[0].buttonLink2 || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary w-full text-white px-6 py-3 text-lg hover:bg-dark flex items-center justify-between gap-2"
              >
                {textContent1.buttonText2 || bannerData.images[0].buttonText2 || 'Adquiere mi bloc Notas Aquí nace mi Historia'}
                <span className="text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-move-right-icon lucide-move-right"
                  >
                    <path d="M18 8L22 12L18 16" />
                    <path d="M2 12H22" />
                  </svg>
                </span>
              </a>
            </div>

            <div className="w-1/2 flex items-center gap-4">
              <a
                href={textContent2.buttonLink2 || bannerData.images[1].buttonLink2 || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-dark w-full text-white px-6 py-3 text-lg hover:bg-primary flex items-center justify-between gap-2"
              >
                {textContent2.buttonText2 || bannerData.images[1].buttonText2 || 'Talleres Personalizados para profesionales'}
                <span className="text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-move-right-icon lucide-move-right"
                  >
                    <path d="M18 8L22 12L18 16" />
                    <path d="M2 12H22" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

    export default BannerPrincipal03;
