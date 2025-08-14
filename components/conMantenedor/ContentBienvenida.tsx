/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
function ContentBienvenida() {
  const [loading, setLoading] = useState(false);
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const fetchBannerHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = "4d3ecc4f-9e2a-4295-9c77-80fc1fc16ec0";

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const bannerImage = productTypeResponse.data.contentBlock;
      setBannerData(bannerImage);
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
    <section className="py-6">
      <div className=" text-[#333] p-8 font-[sans-serif]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl  font-bold uppercase font-oswald   text-dark">
            {bannerData?.title}
          </h2>
          <div className="mt-4">
            <p className="text-base  text-dark font-oswald">
              {bannerData?.contentText}
            </p>
          </div>
        </div>
        {/* <div className="flex max-w-[500px] mx-auto justify-between mt-12">
          <img
            src="/img/banners/icon_corazon.png"
            className=" h-20"
            alt=""
          />
          <img
            src="/img/banners/icon-diosa.png"
            className="h-20"
            alt=""
          />
          <img
            src="/img/banners/icon-hechoamano.png"
            className="h-20"
            alt=""
          />
        </div> */}
      </div>
    </section>
  );
}

export default ContentBienvenida;
