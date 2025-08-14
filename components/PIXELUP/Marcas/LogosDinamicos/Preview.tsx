"use client";
import React from "react";
import Marquee from "react-fast-marquee";
import { previewData } from "@/app/config/previewData";

const LogosDinamicosPreview = () => {
  const marcas = [
    { nombre: "Marca 1", logo: "/img/pixelup/pixelup-white.png" },
    { nombre: "Marca 2", logo: "/img/avatardefault.jpg" },
    { nombre: "Marca 3", logo: "/img/bg-login.png" },
    { nombre: "Marca 4", logo: "/img/pixelup/pixelup-white.png" },
    { nombre: "Marca 5", logo: "/img/avatardefault.jpg" },
    { nombre: "Marca 6", logo: "/img/bg-login.png" }
  ];

  return (
    <div className="relative py-8 bg-gray-100">
      <Marquee
        speed={20}
        gradient={false}
        pauseOnHover={true}
        loop={0}
        className=""
      >
        {marcas.map((marca, index) => (
          <div
            key={index}
            className="rounded-full w-40 h-40 flex items-center justify-center mx-16"
          >
            <img
              src={marca.logo}
              alt={marca.nombre}
              className="w-32 h-32 object-contain"
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
};

export default LogosDinamicosPreview;