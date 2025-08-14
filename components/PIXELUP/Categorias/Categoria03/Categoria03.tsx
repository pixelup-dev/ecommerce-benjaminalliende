"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const Categoria03 = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA03_ID}`;

      const BannersCategory = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
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

  return (
    <section id="banner" className="w-full z-10">
      {bannerData && (
        <div>
          <div className="card-group flex flex-wrap gap-8 justify-center items-center p-4">
            {bannerData.map((banner: any) => (
              <div 
                key={banner.id} 
                className="card group md:w-96 w-full h-[500px] rounded-lg overflow-hidden relative transition duration-500 cursor-pointer transform md:hover:scale-105" style={{ borderRadius: "var(--radius)" }}
              >
                <img 
                  src={banner.mainImage.url}
                  loading="lazy"
                  alt={banner.title}
                  className="w-full h-full object-cover pointer-events-none transition duration-500"
                  style={{ borderRadius: 'var(--radius)' }}
                />
                <div className="bg-gradient-to-t from-black via-transparent to-transparent absolute bottom-0 w-full h-3/4 transition duration-300"></div>
                <div className="flex items-center justify-center absolute inset-0 p-4 opacity-100 transition duration-500 ease-in-out bg-black bg-opacity-70 md:opacity-0 md:group-hover:opacity-100">
                  <div className="text-center text-white">
                    <h1 className="text-3xl font-bold text-white">{banner.title}</h1>
                    <p className="text-sm mt-2">{banner.description || 'Descripción no disponible'}</p>
                    <Link 
                      href={banner.buttonLink}
                      className="inline-block bg-secondary hover:bg-primary text-foreground font-bold py-2 px-4 mt-4" style={{ borderRadius: "var(--radius)" }}
                    >
                      Ver más
                    </Link>
                  </div>
                </div>
                <div className="absolute bottom-0 w-full p-4 text-center transition duration-500 group-hover:opacity-0 hidden md:block">
                  <h1 className="text-xl font-bold text-white">{banner.title}</h1>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default Categoria03;

