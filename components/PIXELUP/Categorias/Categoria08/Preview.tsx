"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Categoria08Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 2);
  
  const defaultImage = "/img/placeholder.webp";
  const getDefaultBanner = (index: number) => {
    return previewCategories[index]
      ? previewCategories[index]
      : { mainImage: { url: defaultImage }, title: "Titulo por defecto", buttonLink: "#", landingText: "Descripción no disponible" };
  };

  return (
    <div className="">
      <div className="grid grid-cols-2 gap-0">
        {[0, 1].map((index) => (
          <div
            key={index}
            className="relative h-[400px] group overflow-hidden cursor-pointer"
          >
            <Link href={getDefaultBanner(index).buttonLink}>
              <img
                src={getDefaultBanner(index).mainImage.url}
                alt={getDefaultBanner(index).title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                <div className="text-center">
                  <h3 className="text-4xl font-poiret text-white mb-2">
                    {getDefaultBanner(index).landingText}
                  </h3>
                  <a
                    href={getDefaultBanner(index).buttonLink}
                    className="inline-block text-montserrat px-6 py-1 text-white border-b border-white/30 group-hover:border-white transition-all text-sm"
                  >
                    Comprar Ahora
                  </a>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      {/* <div className="text-center mt-12">
        <Link href="/tienda" className="bg-primary font-light text-md text-white hover:scale-105 px-8 py-2 rounded transition-all">
          Ir a la Tienda
        </Link>
      </div> */}
    </div>
  );
};

export default Categoria08Preview;