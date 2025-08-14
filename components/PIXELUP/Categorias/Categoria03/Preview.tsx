"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Categoria03Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 3);
  
  return (
    <section id="banner" className="w-full z-10">
      <div>
        <div className="card-group flex flex-wrap gap-8 justify-center items-center p-4">
          {previewCategories.map((banner, index) => (
            <div 
              key={index} 
              className="card group md:w-96 w-full h-[500px] rounded-lg overflow-hidden relative transition duration-500 cursor-pointer transform md:hover:scale-105" style={{ borderRadius: "var(--radius)" }}
            >
              <img 
                src={banner.mainImage.url}
                loading="lazy"
                alt={banner.title}
                className="w-full h-full object-cover pointer-events-none transition duration-500"
                style={{ borderRadius: 'var(--radius)' }}
              />
              <div className="bg-gradient-to-t from-black via-transparent to-transparent absolute bottom-0 w-full h-3/4 transition duration-300"></div>
              <div className="flex items-center justify-center absolute inset-0 p-4 opacity-100 transition duration-500 ease-in-out bg-black bg-opacity-70 md:opacity-0 md:group-hover:opacity-100">
                <div className="text-center text-white">
                  <h1 className="text-3xl font-bold text-white">{banner.title}</h1>
                  <p className="text-sm mt-2">{banner.landingText || 'Descripción no disponible'}</p>
                  <Link 
                    href={banner.buttonLink}
                    className="inline-block bg-secondary hover:bg-primary text-foreground font-bold py-2 px-4 mt-4" style={{ borderRadius: "var(--radius)" }}
                  >
                    Ver más
                  </Link>
                </div>
              </div>
              <div className="absolute bottom-0 w-full p-4 text-center transition duration-500 group-hover:opacity-0 hidden md:block">
                <h1 className="text-xl font-bold text-white">{banner.title}</h1>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categoria03Preview;