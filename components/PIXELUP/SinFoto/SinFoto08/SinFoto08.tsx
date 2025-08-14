"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Marquee from "react-fast-marquee";
import Image from "next/image";


function SinFoto08() {
  const [loading, setLoading] = useState(false);
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const fetchSinFoto08 = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_SINFOTO08_CONTENTBLOCK}`;
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || null;
      const WelcomeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${siteId}`
      );

      const bannerImage = WelcomeResponse.data.contentBlock;
      setBannerData(bannerImage);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    fetchSinFoto08();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial

  if (loading) {
    return (
      <section className="bg-white dark:bg-gray-900 w-full ">
        <div className="container px-6 py-10 mx-auto animate-pulse">
          <h1 className="w-48 h-2 mx-auto bg-gray-200 rounded-lg dark:bg-gray-700" />

          <p className="w-64 h-2 mx-auto mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
          <p className="w-64 h-2 mx-auto mt-4 bg-gray-200 rounded-lg sm:w-80 dark:bg-gray-700" />

          <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg md:h-72 dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>

            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg md:h-72 dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>

            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg md:h-72 dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div>
      <section>
        <div className="relative bg-primary/60 min-h-[14rem] bg-cover bg-center md:bg-fixed flex items-center justify-center">
          <div className="w-full  px-4 text-center text-white flex flex-col items-center justify-center py-10">
            <div 
              className="italic max-w-[90%] md:max-w-[1200px] px-4 md:px-16 text-lg md:text-xl font-normal text-white"
              dangerouslySetInnerHTML={{ __html: bannerData?.contentText || "" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default SinFoto08;
