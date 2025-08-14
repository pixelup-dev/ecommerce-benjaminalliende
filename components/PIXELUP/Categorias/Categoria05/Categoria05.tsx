"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Categoria05 = () => {

  const [bannerData, setBannerData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA05_ID}`;
      const BannersCategory = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${siteId}`
      );
      const bannerImages = BannersCategory.data.banner.images;
      const sortedBannerImages = bannerImages.sort(
        (a: any, b: any) => a.orderNumber - b.orderNumber
      );
      setBannerData(sortedBannerImages);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    fetchBannerCategoryHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial

  const defaultImage = "/img/placeholder.webp";
  const getDefaultBanner = (index: number) => {
    return bannerData && bannerData[index]
      ? bannerData[index]
      : {
          mainImage: { url: defaultImage },
          title: "Titulo por defecto",
          buttonLink: "#",
        };
  };

  return (
    <div>
      {bannerData && (
        <div className="flex items-center justify-center px-4 lg:px-0">
          <div className="max-w-7xl mx-auto rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* COLGANTES */}
              <div className="relative flex flex-col items-center w-full">
                <Link
                  href={getDefaultBanner(0).buttonLink}
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <div
                    className="w-[326px] h-[220px] md:w-[300px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-cover bg-center mx-auto"
                    style={{
                      backgroundImage: `url(${
                        getDefaultBanner(0).mainImage.url
                      })`,
                      borderRadius: "var(--radius)",
                      backgroundPosition: "center center",
                    }}
                  >
                    <div
                      className="w-full h-full flex items-end justify-start p-4"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <h2 className="text-2xl md:text-4xl font-bold text-white">
                        {getDefaultBanner(0).title}
                      </h2>
                    </div>
                  </div>
                </Link>
              </div>
              {/* ANILLOS */}
              <div className="relative flex flex-col items-center w-full">
                <Link
                  href={getDefaultBanner(1).buttonLink}
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <div
                    className="w-[326px] h-[250px] md:w-[300px] md:h-[380px] lg:w-[600px] lg:h-[480px] bg-cover bg-center mx-auto"
                    style={{
                      backgroundImage: `url(${
                        getDefaultBanner(1).mainImage.url
                      })`,
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div
                      className="w-full h-full flex items-end justify-end p-4"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <h2 className="text-2xl md:text-4xl font-bold text-white">
                        {getDefaultBanner(1).title}
                      </h2>
                    </div>
                  </div>
                </Link>
              </div>
              {/* PULSERAS */}
              <div className="relative flex flex-col items-center w-full">
                <Link
                  href={getDefaultBanner(2).buttonLink}
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <div
                    className="w-[326px] h-[150px] md:w-[300px] md:h-[260px] lg:w-[600px] lg:h-[360px] bg-cover bg-center mx-auto"
                    style={{
                      backgroundImage: `url(${
                        getDefaultBanner(2).mainImage.url
                      })`,
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div
                      className="w-full h-full flex items-start justify-start p-4"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <h2 className="text-2xl md:text-4xl font-bold text-white">
                        {getDefaultBanner(2).title}
                      </h2>
                    </div>
                  </div>
                </Link>
              </div>
              {/* AROS */}
              <div className="relative flex flex-col items-center w-full mt-0 md:mt-[-120px]">
                <Link
                  href={getDefaultBanner(3).buttonLink}
                  rel="noopener noreferrer"
                  className="w-full"
                >
                  <div
                    className="w-[326px] h-[250px] md:w-[300px] md:h-[380px] lg:w-[600px] lg:h-[480px] bg-cover bg-center mx-auto"
                    style={{
                      backgroundImage: `url(${
                        getDefaultBanner(3).mainImage.url
                      })`,
                      borderRadius: "var(--radius)",
                    }}
                  >
                    <div
                      className="w-full h-full flex items-end justify-end p-4"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <h2 className="text-2xl md:text-4xl font-bold text-white">
                        {getDefaultBanner(3).title}
                      </h2>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categoria05;