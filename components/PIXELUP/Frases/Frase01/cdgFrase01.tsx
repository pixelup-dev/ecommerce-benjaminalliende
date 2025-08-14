"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Marquee from "react-fast-marquee";

const Frase01: React.FC<any> = ({ id }) => {
  const [loading, setLoading] = useState(false);
  const [bannerData, setBannerData] = useState<any | null>(null);

  const fetchBannerHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_FRASE01_CONTENTBLOCK}`;   

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
  return (
    <section>
      <div className="m-16 flex text-center items-center max-md:flex-col font-medium text-primary px-6 font-sans">
        {/*  <div className="max-md:mt-4">
    <h3 className="bg-white text-blue-500 font-semibold py-2 px-4 rounded text-sm hover:bg-slate-100 mx-6">
      {bannerData?.title}
    </h3>
  </div>*/}
        <p className="text-2xl font-semibold flex-1 italic ">
          « {bannerData?.contentText} »
        </p>
      </div>
    </section>
  );
}

export default Frase01;
