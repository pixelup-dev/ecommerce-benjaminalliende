"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";

interface Categoria02Props {
  Categoria02Data: {
    titulo: string;
    categoria1: string;
    img1: string;
    categoria2: string;
    img2: string;
    categoria3: string;
    img3: string;
  };
}

const Categoria02: React.FC<Categoria02Props> = ({ Categoria02Data }) => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true);
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA02_ID}`;
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

  const defaultImage = "/img/placeholder.webp";
  const getDefaultBanner = (index: number) => {
    return bannerData && bannerData[index]
      ? bannerData[index]
      : { mainImage: { url: defaultImage }, title: "Titulo por defecto", buttonLink: "#" };
  };

  return (
    <div className="py-16">
      {bannerData && (
        <div className="grid grid-cols-1 md:grid-cols-3">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="group cursor-pointer relative h-[400px] md:h-[500px] overflow-hidden"
            >
              <Link href={getDefaultBanner(index).buttonLink}>
                <img
                  src={getDefaultBanner(index).mainImage.url}
                  alt={getDefaultBanner(index).title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 group-hover:opacity-20 transition-opacity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-80" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                  <div className="transform group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl md:text-3xl text-white font-bold mb-3">
                {getDefaultBanner(index).landingText}
                    </h3>
{/*                     <p className="text-gray-200 mb-2 text-base">
                    {getDefaultBanner(index).title} 
                    </p> */}
                    <button className="bg-white text-black px-8 py-3 rounded font-bold transition-all duration-300 hover:bg-primary hover:text-white" style={{ borderRadius: "var(--radius)" }}>
                      Explorar Categoría
                    </button>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
              <div className="text-center mt-12">
          <Link href="/tienda" className="bg-primary font-light text-md  text-white hover:scale-105 px-8 py-2 rounded  transition-all" style={{ borderRadius: "var(--radius)" }}>
            Ir a la Tienda
          </Link>
        </div>
    </div>
    
  );
};

export default Categoria02;