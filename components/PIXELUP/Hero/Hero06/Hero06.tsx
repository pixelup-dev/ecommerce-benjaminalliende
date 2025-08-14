/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Hero06: React.FC = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_HERO06_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO06_IMGID}`;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const bannerImage = productTypeResponse.data.banner;
      setBannerData(bannerImage.images);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <section className="w-full bg-foreground/5">
      <div className="text-gray-600 body-font">
        {bannerData && (
          <div className="py-6 md:py-10 mx-auto px-4 md:px-0">
            <div className="max-w-5xl mx-auto">
              {/* Historia */}
              <div className="mb-8 md:mb-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-800">
                  {bannerData[0].title || "Nuestra Historia"}
                </h2>
                <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-center">
                  <div className="relative h-[250px] md:h-[350px] overflow-hidden shadow-lg transform hover:scale-[1.02] transition-transform duration-300" style={{ borderRadius: "var(--radius)" }}  >
                    <img
                      src={bannerData[0].mainImage.url}
                      alt="Historia de la empresa"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                      {(() => {
                        try {
                          return JSON.parse(bannerData[0].landingText).descripcion || "Fundada en 2020, Cubico Modular nació con la visión de revolucionar la industria de la construcción modular. Lo que comenzó como un pequeño taller de diseño se ha convertido en una empresa líder en soluciones modulares para diversos sectores.";
                        } catch {
                          return "Fundada en 2020, Cubico Modular nació con la visión de revolucionar la industria de la construcción modular. Lo que comenzó como un pequeño taller de diseño se ha convertido en una empresa líder en soluciones modulares para diversos sectores.";
                        }
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Misión y Visión */}
              <div className="grid md:grid-cols-2 gap-6 md:gap-12">
                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{ borderRadius: "var(--radius)" }}>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">
                    Nuestra Misión
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    {(() => {
                      try {
                        return JSON.parse(bannerData[0].landingText).mision || "Proporcionar soluciones modulares innovadoras y sostenibles que transformen espacios en entornos funcionales y eficientes, adaptándonos a las necesidades específicas de cada cliente y contribuyendo al desarrollo sostenible.";
                      } catch {
                        return "Proporcionar soluciones modulares innovadoras y sostenibles que transformen espacios en entornos funcionales y eficientes, adaptándonos a las necesidades específicas de cada cliente y contribuyendo al desarrollo sostenible.";
                      }
                    })()}
                  </p>
                </div>
                <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{ borderRadius: "var(--radius)" }}>
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">
                    Nuestra Visión
                  </h3>
                  <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                    {(() => {
                      try {
                        return JSON.parse(bannerData[0].landingText).vision || "Ser líderes en el mercado de soluciones modulares, reconocidos por nuestra innovación, calidad y compromiso con la sostenibilidad, estableciendo nuevos estándares en el diseño y construcción de espacios modulares.";
                      } catch {
                        return "Ser líderes en el mercado de soluciones modulares, reconocidos por nuestra innovación, calidad y compromiso con la sostenibilidad, estableciendo nuevos estándares en el diseño y construcción de espacios modulares.";
                      }
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero06;