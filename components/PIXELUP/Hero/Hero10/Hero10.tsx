/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Hero10: React.FC = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_HERO10_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO10_IMGID}`;

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
    <section className="py-8 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            <div className="space-y-6 md:space-y-8 order-2 md:order-1">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="bg-primary/10 p-2 md:p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 md:h-8 md:w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {bannerData?.[0]?.title || "Nuestros Servicios"}
                </h2>
              </div>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                {(() => {
                  try {
                    return JSON.parse(bannerData?.[0]?.landingText || "{}").descripcion || "Descripción de nuestros servicios";
                  } catch {
                    return "Descripción de nuestros servicios";
                  }
                })()}
              </p>
              <div className="space-y-3 md:space-y-4">
                {(() => {
                  try {
                    const servicios = JSON.parse(bannerData?.[0]?.landingText || "{}").servicios || [];
                    return servicios.map((servicio: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3 md:space-x-4">
                        <div className="bg-primary/10 p-1.5 md:p-2 rounded-full mt-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 md:h-5 md:w-5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                            {servicio.titulo || `Servicio ${index + 1}`}
                          </h3>
                          <p className="text-gray-600 text-xs md:text-sm">
                            {servicio.descripcion || `Descripción del servicio ${index + 1}`}
                          </p>
                        </div>
                      </div>
                    ));
                  } catch {
                    return null;
                  }
                })()}
              </div>
              <div className="pt-2 md:pt-4">
                <a
                  href={(() => {
                    try {
                      return JSON.parse(bannerData?.[0]?.landingText || "{}").buttonLink || bannerData?.[0]?.buttonLink || "#";
                    } catch {
                      return bannerData?.[0]?.buttonLink || "#";
                    }
                  })()}
                    className="inline-flex items-center justify-center w-full md:w-auto bg-primary text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-primary/80 transition-colors duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  <span>{(() => {
                    try {
                      return JSON.parse(bannerData?.[0]?.landingText || "{}").buttonText || bannerData?.[0]?.buttonText || "Solicitar Servicio";
                    } catch {
                      return bannerData?.[0]?.buttonText || "Solicitar Servicio";
                    }
                  })()}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5 ml-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div className="relative order-1 md:order-2 mb-6 md:mb-0">
              <div className="absolute inset-0 bg-primary rounded-2xl transform rotate-3"></div>
              <img
                src={bannerData?.[0]?.mainImage?.url || "/tsuki/1.webp"}
                alt="Servicios"
                className="relative rounded-2xl shadow-xl object-cover w-full h-[300px] md:h-[500px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero10;