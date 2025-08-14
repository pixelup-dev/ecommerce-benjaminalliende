"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const LogosFijosPreview = () => {
  const marcas = [
    { nombre: "Marca 1", logo: "/img/pixelup/pixelup-white.png" },
    { nombre: "Marca 2", logo: "/img/avatardefault.jpg" },
    { nombre: "Marca 3", logo: "/img/bg-login.png" },
    { nombre: "Marca 4", logo: "/img/pixelup/pixelup-white.png" },
    { nombre: "Marca 5", logo: "/img/avatardefault.jpg" },
    { nombre: "Marca 6", logo: "/img/bg-login.png" }
  ];

  return (
    <section className="bg-gray-100">
      <div className="mx-auto w-full max-w-7xl px-5 md:px-10">
        <div className="bg-gray-100 grid grid-cols-2 items-center justify-center gap-8 rounded-md bg-background p-16 px-8 py-12 sm:grid-cols-3 md:gap-16">
          {marcas.map((marca, index) => (
            <div key={index} className="flex items-center justify-center">
              <img
                src={marca.logo}
                alt={marca.nombre}
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

export default LogosFijosPreview;