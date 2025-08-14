"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Categoria10Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 3);
  
  const defaultImage = "/img/placeholder.webp";
  const getDefaultBanner = (index: number) => {
    return previewCategories[index]
      ? previewCategories[index]
      : { mainImage: { url: defaultImage }, title: "Titulo por defecto", buttonLink: "#" };
  };

  return (
    <div className="py-16 px-4 mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
        {[0, 1, 2].map((index) => (
          <div
            key={index}
            className="relative h-[300px] group overflow-hidden cursor-pointer"
          >
            <Link href={getDefaultBanner(index).buttonLink}>
              <img
                src={getDefaultBanner(index).mainImage.url}
                alt={getDefaultBanner(index).title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-70"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white text-right">
                <h3 className="font-poiret text-3xl mb-2">
                  {getDefaultBanner(index).title}
                </h3>
                <div className="inline-flex items-center justify-end gap-1">
                  <a
                    href={getDefaultBanner(index).buttonLink}
                    className="font-montserrat text-[14px] border-b border-white/30 group-hover:border-white transition-all"
                  >
                    Ver Todos
                  </a>
                  <span className="text-xs">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-chevron-right-icon lucide-chevron-right"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="text-center mt-12 hidden">
        <Link href="/tienda" className="bg-primary font-light text-md text-white hover:scale-105 px-8 py-2 rounded transition-all">
          Ir a la Tienda
        </Link>
      </div>
    </div>
  );
};

export default Categoria10Preview;