"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";

const Categoria07 = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const defaultImage = "/img/placeholder.webp";

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true);
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA07_ID}`;
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerCategoryHome();
  }, []);

  const getDefaultBanner = (index: number) => {
    return bannerData && bannerData[index]
      ? bannerData[index]
      : { mainImage: { url: defaultImage }, title: "Titulo por defecto", buttonLink: "#", landingText: "Descripción por defecto" };
  };

  const getOrderedBanners = () => {
    const orderedBanners = [...Array(5)].map((_, index) => {
      const existingBanner = bannerData?.find((banner: any) => banner.orderNumber === index + 1);
      return existingBanner || getDefaultBanner(index);
    });
    return orderedBanners;
  };

  return (
    <div className="py-8 pb-16">
      <div className="max-w-[1920px] mx-auto px-4">
        {bannerData && (
          <div className="grid grid-cols-1 gap-4">
            {/* Contenedor superior - 2 categorías grandes (orden 1 y 2) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[0, 1].map((index) => {
                const banner = getOrderedBanners()[index];
                return (
                  <Link key={index} href={banner.buttonLink}>
                    <div className="relative h-[300px] md:h-[400px] group overflow-hidden rounded" style={{ borderRadius: "var(--radius)" }}>
                      <img
                        src={banner.mainImage.url}
                        alt={banner.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                        <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                          {banner.title}
                        </h3>
                        <p className="text-white/90 text-sm lg:text-base mb-4 max-w-md">
                          {banner.landingText}
                        </p>
                        <button className="bg-transparent border border-white/50 hover:bg-white hover:text-stone-900 text-white py-2 px-6 backdrop-blur-sm transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
                          Ver más
                        </button>
                      </div>
                    </div>  
                  </Link>
                );
              })}
            </div>

            {/* Contenedor inferior - 3 categorías pequeñas (orden 3, 4 y 5) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[2, 3, 4].map((index) => {
                const banner = getOrderedBanners()[index];  
                return (
                  <Link key={index} href={banner.buttonLink}>
                    <div className="relative h-[250px] group overflow-hidden rounded" style={{ borderRadius: "var(--radius)" }}>
                      <img
                        src={banner.mainImage.url}
                        alt={banner.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-xl font-bold text-white mb-2">
                          {banner.title}
                        </h3>
                        <p className="text-white/80 text-sm mb-4">
                          {banner.landingText}
                        </p>
                        <button className="text-sm bg-transparent border border-white/50 hover:bg-white hover:text-stone-900 text-white py-1.5 px-4 backdrop-blur-sm transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
                          Ver más
                        </button>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categoria07;