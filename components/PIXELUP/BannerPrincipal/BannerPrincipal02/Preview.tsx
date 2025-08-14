"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewCategories } from "@/app/config/previewData";

const BannerPrincipal02Preview = () => {
  // Usar las primeras 2 categorías de previewCategories para simular las 2 imágenes requeridas
  const bannerImages = previewCategories.slice(0, 2);

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2">
      {bannerImages.map((image, index) => (
        <div key={index} className="relative h-[600px] overflow-hidden group">
          <img
            src={image.mainImage.url}
            alt={image.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6">
            <span className="text-sm uppercase tracking-wider mb-2">
              {image.title}
            </span>
            <h2 className="text-4xl font-bold mb-4">
              {image.landingText}
            </h2>
            <div 
             
              className="bg-white text-black px-8 py-3 uppercase text-sm tracking-wider hover:bg-primary hover:text-white transition-colors duration-300"
              style={{ borderRadius: "var(--radius)" }}
            >
              {previewData.epigrafe || "Ver Más"}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default BannerPrincipal02Preview;