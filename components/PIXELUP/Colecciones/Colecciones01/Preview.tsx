"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";
import { slugify } from "@/app/utils/slugify";

const Colecciones01Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 4);

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm uppercase tracking-wider text-gray-500">
            Descubre
          </span>
          <h2 className="text-3xl md:text-4xl text-gray-800 font-bold mt-2">
            Nuestras Colecciones
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {previewCategories.map((coleccion, index) => (
            <div
              key={index}
              className="group relative cursor-pointer overflow-hidden rounded bg-white shadow-sm hover:shadow-xl transition-all duration-300" style={{ borderRadius: "var(--radius)" }}
            >
              <div className="flex flex-col md:flex-row h-[400px] md:h-[250px]">
                <div className="w-full md:w-1/2 h-full relative overflow-hidden">
                  <img
                    src={coleccion.mainImage.url || "/carr/default.jpg"}
                    alt={coleccion.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center text-center bg-white">
                  <h3 className="text-xl text-gray-800 font-bold mb-3">
                    {coleccion.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {coleccion.landingText || "Descubre nuestra exclusiva colección"}
                  </p>
                  <Link 
                    href={`/tienda/colecciones/${slugify(coleccion.title)}`}
                    className="bg-black text-white px-6 py-2 text-sm font-bold hover:bg-primary/80 transition-colors hover:text-white" style={{ borderRadius: "var(--radius)" }}
                  >
                    Ver Colección
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link 
            href="/tienda/colecciones"
            className="bg-primary font-light text-md text-white hover:scale-105 px-8 py-2 hover:bg-primary/80 transition-all inline-block" style={{ borderRadius: "var(--radius)" }}
          >
            Ver Todas las Colecciones
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Colecciones01Preview;