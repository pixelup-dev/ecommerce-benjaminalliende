"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const ParallaxPreview = () => {
  return (
    <section className="w-full h-64 bg-cover bg-center bg-fixed relative" 
             style={{backgroundImage: 'url(' + (previewData.imagen || '/img/bg-login.png') + ')'}}>
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {previewData.titulo || "Efecto Parallax"}
          </h2>
          <p className="text-lg md:text-xl">
            {previewData.texto || "Efecto parallax con imagen de fondo y texto superpuesto."}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ParallaxPreview;