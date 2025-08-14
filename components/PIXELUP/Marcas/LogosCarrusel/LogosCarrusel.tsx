/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
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
  <div className="relative py-8 bg-gray-50">
    <div className="flex justify-center space-x-4 py-8">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="w-40 h-40 bg-gray-200 rounded-lg animate-pulse mx-4"
        />
      ))}
    </div>
  </div>
);

const LogosCarrusel: React.FC = () => {
  const [logoData, setLogoData] = useState<LogoImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LOGOSCARRUSEL_ID}`;

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
    <div className="bg-gray-100">
      <div className="mx-auto rounded-lg p-2  ">{/* md:pb-16 py-12 md:py-20  */}
{/*         <h3 className="mb-2 mt-6 text-center text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
          Nuestras Alianzas
        </h3> */}
        
        <div className="mx-auto max-w-2xl">
          <div className=" pt-8">
            <div className="relative px-12">
              <Swiper
                modules={[Navigation, Pagination]}
                spaceBetween={20}
                navigation={{
                  nextEl: '.swiper-button-next',
                  prevEl: '.swiper-button-prev',
                }}
                pagination={{
                  clickable: true,
                  el: '.swiper-pagination',
                }}
                loop={true}
                breakpoints={{
                  320: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 3 },
                }}
                className="mySwiper !pb-12"
              >
                {logoData.map((logo, index) => (
                  <SwiperSlide key={index}>
                    <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-lg border border-gray-200 bg-white p-2 shadow-md">
                      <img
                        src={logo.mainImage.url || logo.mainImage.data}
                        alt={`Logo de alianza ${index + 1}`}
                        className="h-32 w-32 transform object-contain transition-transform hover:scale-105"
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              <div className="swiper-button-prev !text-dark after:!text-2xl !-left-4"></div>
              <div className="swiper-button-next !text-dark after:!text-2xl !-right-4"></div>
              
              <div className="swiper-pagination !bottom-0"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogosCarrusel;