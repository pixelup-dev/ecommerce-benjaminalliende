"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewCategories } from "@/app/config/previewData";

interface TextContent {
  title: string;
  mainText: string;
  bookText: string;
  buttonText: string;
  buttonText2: string;
  buttonLink: string;
  buttonLink2: string;
}

const BannerPrincipal03Preview = () => {
  // Usar las primeras 2 categorías de previewCategories para simular las 2 imágenes requeridas
  const bannerImages = previewCategories.slice(0, 2);

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

  // Parsear el contenido de texto para ambas imágenes
  const textContent1 = parseLandingText(bannerImages[0].landingText);
  const textContent2 = parseLandingText(bannerImages[1].landingText);

  return (
    <section className="py-0 pt-2">
      <div className="mx-auto">
        {/* Layout para mobile: caja1 → botón1 → caja2 → botón2 */}
        <div className="block lg:hidden">
          {/* Primera imagen del banner */}
          <div className="relative min-h-[400px] flex items-center justify-center">
            <img
              src={bannerImages[0].mainImage.url}
              alt={textContent1.title || bannerImages[0].title}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/50 z-10" />
            <div className="relative z-20 flex flex-col items-center justify-center max-w-lg mx-auto h-full w-full text-center px-6 py-8">
              <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                {textContent1.title || bannerImages[0].title}
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
                  href={textContent1.buttonLink || '#'}
                  className="inline-block bg-primary text-white px-4 py-2 rounded-lg text-base hover:scale-105 transition-colors shadow-lg"
                >
                  {textContent1.buttonText || previewData.epigrafe || 'Ver más'}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Primer botón adicional (mobile) */}
          <div className="w-full">
            <a
              href={textContent1.buttonLink2 || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary w-full text-white px-4 py-3 text-base hover:bg-dark flex items-center justify-between gap-2"
            >
              {textContent1.buttonText2 || 'Adquiere mi bloc Notas Aquí nace mi Historia'}
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
              src={bannerImages[1].mainImage.url}
              alt={textContent2.title || bannerImages[1].title}
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/50 z-10" />
            <div className="relative z-20 flex flex-col items-center justify-center max-w-lg mx-auto h-full w-full text-center px-6 py-8">
              <h2 className="text-2xl font-bold text-white mb-3 drop-shadow-lg leading-tight">
                {textContent2.title || bannerImages[1].title}
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
                  href={textContent2.buttonLink || '#'}
                  className="inline-block bg-white text-dark px-4 py-2 rounded-lg text-base hover:scale-105 transition-colors shadow-lg"
                >
                  {textContent2.buttonText || previewData.epigrafe || 'Ver más'}
                </Link>
              </div>
            </div>
          </div>
          
          {/* Segundo botón adicional (mobile) */}
          <div className="w-full">
            <a
              href={textContent2.buttonLink2 || '#'}
              className="bg-dark w-full text-white px-4 py-3 text-base hover:bg-primary flex items-center justify-between gap-2"
            >
              {textContent2.buttonText2 || 'Talleres Personalizados para profesionales'}
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
                src={bannerImages[0].mainImage.url}
                alt={textContent1.title || bannerImages[0].title}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-black/50 z-10" />
              <div className="relative z-20 flex flex-col items-center justify-center max-w-lg mx-auto h-full w-full text-center px-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
                  {textContent1.title || bannerImages[0].title}
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
                    href={textContent1.buttonLink || '#'}
                    target="_blank"
                    className="inline-block bg-primary text-white px-6 py-3 rounded-lg text-lg hover:scale-105 transition-colors shadow-lg"
                  >
                    {textContent1.buttonText || previewData.epigrafe || 'Ver más'}
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Segunda imagen del banner */}
            <div className="relative h-[500px] flex items-center justify-center">
              <img
                src={bannerImages[1].mainImage.url}
                alt={textContent2.title || bannerImages[1].title}
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
              <div className="absolute inset-0 bg-black/50 z-10" />
              <div className="relative z-20 flex flex-col items-center justify-center max-w-lg mx-auto h-full w-full text-center px-6">
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
                  {textContent2.title || bannerImages[1].title}
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
                    href={textContent2.buttonLink || '#'}
                    target="_blank"
                    className="inline-block bg-white text-dark px-6 py-3 rounded-lg text-lg hover:scale-105 transition-colors shadow-lg"
                  >
                    {textContent2.buttonText || previewData.epigrafe || 'Ver más'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sección de botones adicionales (desktop) */}
          <div className="flex flex-row justify-center w-full">
            <div className="w-1/2">
              <a
                href={textContent1.buttonLink2 || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary w-full text-white px-6 py-3 text-lg hover:bg-dark flex items-center justify-between gap-2"
              >
                {textContent1.buttonText2 || 'Adquiere mi bloc Notas Aquí nace mi Historia'}
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
                href={textContent2.buttonLink2 || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-dark w-full text-white px-6 py-3 text-lg hover:bg-primary flex items-center justify-between gap-2"
              >
                {textContent2.buttonText2 || 'Talleres Personalizados para profesionales'}
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

export default BannerPrincipal03Preview;