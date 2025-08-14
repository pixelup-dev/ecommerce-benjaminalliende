/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Hero01: React.FC = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const fetchBannerHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      /* `${BannerId}` */
      const bannerId = `${process.env.NEXT_PUBLIC_HERO01_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO01_IMGID}`;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const bannerImage = productTypeResponse.data.banner;
      setBannerData(bannerImage.images);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    fetchBannerHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial

  /* PARA QUE LA IMAGEN ESTE AL LADO IZQUIERDO LO UNICO QUE HAY QUE HACER ES CAMBIAR EL CONTENEDOR DE LA IMAGEN ANTES QUE LA DEL TEXTO */
  if (loading) {
    return (
      <div className="flex flex-col md:flex-row mx-10 md:mx-auto items-center justify-center py-40 animate-pulse max-w-2xl">
        <div className="flex items-center justify-center w-full md:max-w-[700px] min-h-[450px] bg-gray-300 rounded dark:bg-gray-700">
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
        <div className="w-full text-left mt-8 md:mt-0 md:ml-8">
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 w-20 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded-full dark:bg-gray-700 w-56 mb-4"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
          <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
        </div>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  return (
    <section className="w-full bg-gray-100">
      <div className="text-gray-600 body-font">
        {bannerData && (
          <div className="max-w-6xl mx-auto w-full px-4 md:px-0 py-8 lg:py-24 flex flex-col-reverse lg:flex-row items-center justify-center">
            {/* Contenedor de imagen con centrado completo en dispositivos móviles */}
            <div className="flex w-full md:flex-1 items-center justify-center mt-6 lg:mt-0 lg:order-1">
              <img
                alt={bannerData[0].title}
                className="object-cover shadow-lg rounded-lg w-96"
                src={bannerData[0].mainImage.url}
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            {/* Contenedor de texto centrado completamente en dispositivos móviles */}
            <div className="w-full md:flex-1 flex flex-col items-center text-center lg:items-start lg:text-left lg:order-2 mt-4 md:mt-8 lg:mt-0">
              <h4 className="text-primary text-lg md:text-xl">
                {bannerData[0].buttonText}
              </h4>
              <h1 className="mt-2 text-3xl md:text-5xl font-bold leading-tight text-foreground">
                {bannerData[0].title}
              </h1>
              <p className="text-base md:text-lg text-foreground py-3 mx-2 md:mx-8 lg:mx-0">
                {bannerData[0].landingText}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero01;
