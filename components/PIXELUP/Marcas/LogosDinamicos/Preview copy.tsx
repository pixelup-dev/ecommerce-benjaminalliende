"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { previewData } from "@/app/config/previewData";

const LogosCarruselPreview = () => {
  const marcas = [
    { nombre: "Marca 1", logo: "/img/pixelup/pixelup-white.png" },
    { nombre: "Marca 2", logo: "/img/avatardefault.jpg" },
    { nombre: "Marca 3", logo: "/img/bg-login.png" },
    { nombre: "Marca 4", logo: "/img/pixelup/pixelup-white.png" },
    { nombre: "Marca 5", logo: "/img/avatardefault.jpg" },
    { nombre: "Marca 6", logo: "/img/bg-login.png" }
  ];

  return (
    <div className="bg-gray-100">
      <div className="mx-auto rounded-lg p-2">
        <div className="mx-auto max-w-2xl">
          <div className="pt-8">
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
                {marcas.map((marca, index) => (
                  <SwiperSlide key={index}>
                    <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-lg border border-gray-200 bg-white p-2 shadow-md">
                      <img
                        src={marca.logo}
                        alt={marca.nombre}
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

export default LogosCarruselPreview;