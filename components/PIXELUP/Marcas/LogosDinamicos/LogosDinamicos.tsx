/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import axios from "axios";
import { getCookie } from "cookies-next";

interface LogoImage {
  id: string;
  mainImage: {
    url: string;
    data: string;
  };
}

const LogoSkeleton = () => (
  <div className="relative py-8 bg-gray-100">
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
      <div className="w-20 h-20 bg-gray-200 rounded-full animate-pulse" />
    </div>
    <div className="flex justify-center space-x-4 py-8">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="w-24 h-24 bg-gray-200 rounded-full animate-pulse mx-4"
        />
      ))}
    </div>
  </div>
);

const LogosDinamicos: React.FC = () => {
  const [logoData, setLogoData] = useState<LogoImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LOGOSDINAMICO_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      setLogoData(response.data.banner.images);
    } catch (error) {
      console.error("Error al obtener los logos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  if (loading) {
    return <LogoSkeleton />;
  }

  return (
    <div className="relative py-8 bg-gray-100">
      {/*  bg-gray-100 */}

      <Marquee
        speed={20}
        gradient={false}
        pauseOnHover={true}
        loop={0}
        className=""
      >
        {logoData.map((logo, index) => (
          <div
            key={index}
            className="rounded-full w-40 h-40 flex items-center justify-center mx-16"
          >
            <img
              src={logo.mainImage.url || logo.mainImage.data}
              alt={`Logo ${index + 1}`}
              className="w-32 h-32 object-contain"
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default LogosDinamicos;
