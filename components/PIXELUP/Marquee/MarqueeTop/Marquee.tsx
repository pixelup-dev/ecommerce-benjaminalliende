"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Marquee from "react-fast-marquee";
import { getCookie } from "cookies-next";

function MarqueeTOP() {
  const [loading, setLoading] = useState(false);
  const [bannerData, setBannerData] = useState<any | null>(null);

  const fetchMarqueeHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_MARQUEE_TOP_CONTENTBLOCK}`;
      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      const bannerImage = productTypeResponse.data.contentBlock;
      setBannerData(bannerImage);
    } catch (error) {
      console.error("Error al obtener maruqetop:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    fetchMarqueeHome();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial
  return (
    <section className="w-full">
      <div className="flex items-center max-md:flex-col bg-primary font-medium text-white px-8 py-4 font-sans uppercase">
        {/*         <div className="max-md:mt-4">
          <h3 className="bg-white text-blue-500 font-semibold py-2 px-4 rounded text-sm hover:bg-slate-100 mx-6">
            {bannerData?.title}
          </h3>{" "}
        </div> */}
        <p className="text-sm sm:text-base flex-1 text-center py-1">
          <Marquee
            speed={40}
            gradient={false}
          >
            {bannerData?.contentText}
          </Marquee>
        </p>
      </div>
    </section>
  );
}

export default MarqueeTOP;
