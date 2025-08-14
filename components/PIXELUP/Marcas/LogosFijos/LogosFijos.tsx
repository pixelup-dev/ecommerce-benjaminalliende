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
  <section>
    <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-24 lg:py-32">
      <div className="md:mb-12 mb-6 h-10 bg-gray-200 rounded animate-pulse w-1/3 mx-auto" />
      <div className="grid grid-cols-2 items-center justify-center gap-8 rounded-md bg-background p-16 px-8 py-12 sm:grid-cols-3 md:gap-16">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex items-center justify-center">
            <div className="w-full h-24 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const LogosFijos: React.FC = () => {
  const [logoData, setLogoData] = useState<LogoImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LOGOSFIJOS_ID}`;

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
    <section className="bg-gray-100">
      <div className="mx-auto w-full max-w-7xl px-5  md:px-10 "> {/* py-16 md:py-24 lg:py-32 */}
{/*         <h1 className="md:mb-12 mb-6 text-3xl leading-9 text-center font-extrabold text-foreground sm:text-4xl sm:leading-10 py-2">
          Nuestras Marcas
        </h1> */}
        <div className="bg-gray-100 grid grid-cols-2 items-center justify-center gap-8 rounded-md bg-background p-16 px-8 py-12 sm:grid-cols-3 md:gap-16">
          {logoData.map((logo, index) => (
            <div key={index} className="flex items-center justify-center">
              <img
                src={logo.mainImage.url || logo.mainImage.data}
                alt={`Logo ${index + 1}`}
                className="max-w-full sm:max-w-[40%]"
                style={{ borderRadius: 'var(--radius)' }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogosFijos;