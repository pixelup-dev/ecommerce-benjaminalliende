"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";

const BlogBanner = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_BANNER_BLOG_ID}`;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );


      const bannerImage = productTypeResponse.data.banner;
      setBannerData(bannerImage);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
  }, []);

  return (
    <>
      {loading ? (
        <section id="banner" className="w-full z-10 animate-pulse">
          <div className="relative font-[sans-serif] before:absolute before:w-full before:h-full before:inset-0 before:bg-gray-300 before:opacity-50 before:z-10">
            <div className="absolute inset-0 w-full h-full bg-gray-200"></div>
            <div className="min-h-[300px] relative z-10 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
              <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        </section>
      ) : bannerData ? (
        <section id="banner" className="w-full z-10">
          <div 
            className="carousel relative bg-cover bg-center text-white h-[300px] flex items-center justify-center"
            style={{ backgroundImage: `url(${bannerData.images[0].mainImage.url})` }}
          >
            <div className="carousel-item flex flex-col justify-center items-center w-full bg-gradient-to-r from-black/30 via-black/50 to-black/30 h-full">
              <div className="p-8 flex flex-col justify-center items-center">
                <h1 className="text-6xl font-bold mb-4 font-oswald">
                  {bannerData.images[0].title}
                </h1>
{/*                 <p 
                  className="mb-6"
                  dangerouslySetInnerHTML={{
                    __html: bannerData.images[0].landingText,
                  }}
                /> */}
              </div>
            </div>
          </div>
        </section>
      ) : (
        <div
          className="carousel relative bg-cover bg-center text-white h-[300px] flex items-center justify-center"
          style={{ backgroundImage: "url('/tosta/3431.jpg')" }}
        >
          <div className="carousel-item flex flex-col justify-center items-center w-full bg-gradient-to-r from-black/30 via-black/70 to-black/30 h-full">
            <div className="p-8 flex flex-col justify-center items-center">
              <h1 className="text-6xl font-bold mb-4 font-oswald">
                Tostaduria Maravilla
              </h1>
              <p className="mb-6">Descubre la mejor selección de frutos secos.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BlogBanner;
