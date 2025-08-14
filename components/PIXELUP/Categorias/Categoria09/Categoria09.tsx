"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface BannerImage {
  mainImage: any;
  url: string;
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
}

interface BannerData {
  images: BannerImage[];
}

const Categoria09: React.FC = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA09_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      setBannerData(response.data.banner);
    } catch (error) {
      console.error("Error al obtener los datos del banner:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
  }, []);

  if (loading) {
    return <div role="status" className="w-full animate-pulse rtl:space-x-reverse md:flex md:items-center">
      <div className="flex items-center justify-center w-full h-96 bg-gray-300 rounded dark:bg-gray-700">
        <svg className="w-10 h-10 text-gray-200 dark:text-gray-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 18">
          <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z"/>
        </svg>
      </div>
    </div>;
  }

  if (!bannerData || bannerData.images.length < 2) {
    return <div className="w-full text-center p-6">Se requieren exactamente 2 imágenes para este banner</div>;
  }

  return (
    <div className="pt-8">
      <div className="flex flex-col md:flex-row">
        {bannerData.images.map((image, index) => (
          <div

            key={index}
            className="relative h-[500px] md:w-1/2 overflow-hidden group cursor-pointer"
          >
            <img
              src={image.mainImage.url}
              alt={image.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110  hover:grayscale-0 hover:contrast-100 hover:brightness-100" /* filter grayscale contrast-125 brightness-90 */
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 group-hover:opacity-20 transition-opacity"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {image.title}
              </h3>
              <p className="text-white text-lg max-w-md mb-8">
                {image.landingText}
              </p>
              <Link
                href={image.buttonLink || '#'}
                className={`px-8 py-3 rounded font-bold transition-colors ${
                  index === 0
                    ? "bg-[#ca763b] hover:bg-[#ca763b]/90 text-white"
                    : "bg-[#134b42] hover:bg-[#134b42]/90 text-white"
                }`}
              >
                {image.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categoria09;
