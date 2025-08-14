"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Categoria07Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 5);
  
  const defaultImage = "/img/placeholder.webp";

  const getDefaultBanner = (index: number) => {
    return previewCategories[index]
      ? previewCategories[index]
      : { mainImage: { url: defaultImage }, title: "Titulo por defecto", buttonLink: "#", landingText: "Descripción por defecto" };
  };

  const getOrderedBanners = () => {
    const orderedBanners = [...Array(5)].map((_, index) => {
      const existingBanner = previewCategories.find((banner: any) => banner.id === index + 1);
      return existingBanner || getDefaultBanner(index);
    });
    return orderedBanners;
  };

  return (
    <div className="py-8 pb-16">
      <div className="max-w-[1920px] mx-auto px-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Contenedor superior - 2 categorías grandes (orden 1 y 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1].map((index) => {
              const banner = getOrderedBanners()[index];
              return (
                <Link key={index} href={banner.buttonLink}>
                  <div className="relative h-[300px] md:h-[400px] group overflow-hidden rounded" style={{ borderRadius: "var(--radius)" }}>
                    <img
                      src={banner.mainImage.url}
                      alt={banner.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                        {banner.title}
                      </h3>
                      <p className="text-white/90 text-sm lg:text-base mb-4 max-w-md">
                        {banner.landingText}
                      </p>
                      <button className="bg-transparent border border-white/50 hover:bg-white hover:text-stone-900 text-white py-2 px-6 backdrop-blur-sm transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
                        Ver más
                      </button>
                    </div>
                  </div>  
                </Link>
              );
            })}
          </div>

          {/* Contenedor inferior - 3 categorías pequeñas (orden 3, 4 y 5) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[2, 3, 4].map((index) => {
              const banner = getOrderedBanners()[index];  
              return (
                <Link key={index} href={banner.buttonLink}>
                  <div className="relative h-[250px] group overflow-hidden rounded" style={{ borderRadius: "var(--radius)" }}>
                    <img
                      src={banner.mainImage.url}
                      alt={banner.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-xl font-bold text-white mb-2">
                        {banner.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-4">
                        {banner.landingText}
                      </p>
                      <button className="text-sm bg-transparent border border-white/50 hover:bg-white hover:text-stone-900 text-white py-1.5 px-4 backdrop-blur-sm transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
                        Ver más
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categoria07Preview;