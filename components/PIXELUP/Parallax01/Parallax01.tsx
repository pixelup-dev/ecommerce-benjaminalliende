/* eslint-disable @next/next/no-img-element */

"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

const Parallax01: React.FC = () => {
  const ParallaxData = {
    BannerId: process.env.NEXT_PUBLIC_BANNERPRINCIPAL02_ID,
  };

  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const BannerId = ParallaxData.BannerId;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${BannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const bannerImage = productTypeResponse.data.banner;
      setBannerData(bannerImage.images);
      console.log(bannerImage.images, "bannerImage");
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
    <div>
      {bannerData && (
        <div
          className="relative mx-auto h-[450px] overflow-hidden bg-cover bg-fixed bg-center bg-no-repeat shadow-lg"
          style={{ backgroundImage: `url(${bannerData[0].mainImage.url})` }}
        >
          <div className="absolute inset-0 bg-black opacity-60"></div>{" "}
          {/* Cuadro de opacidad */}
          <div className="relative h-full flex justify-center items-center">
            <div className="text-center text-primary">
              <div className="font-bold text-white uppercase text-4xl sm:text-6xl font-oswald">
                {bannerData[0].title}
              </div>
              {/*           <div className="mt-4 text-lg sm:text-xl font-bold text-primary-foreground">
            {subtitulo}
          </div> */}
              <div
                className="mt-8 text-lg sm:text-xl leading-7 text-secondary max-w-3xl font-kalam px-10"
                dangerouslySetInnerHTML={{ __html: bannerData[0].landingText }}
              />

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Parallax01;
