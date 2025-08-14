"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";
import { slugify } from "@/app/utils/slugify";

const Colecciones02Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 2);

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {previewCategories.map((coleccion, index) => (
          <div key={index} className="mb-16">
            <div className="text-center mb-12">
              <span className="text-sm uppercase tracking-wider text-gray-500">
                Descubre
              </span>
              <h2 className="text-3xl md:text-4xl text-gray-800 font-bold mt-2">
                {coleccion.title}
              </h2>
            </div>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Productos de ejemplo para el preview */}
                {[1, 2, 3, 4].map((productIndex) => (
                  <div key={productIndex} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4">
                    <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-gray-500 text-sm">Producto {productIndex}</span>
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">Producto de Ejemplo</h3>
                    <p className="text-gray-600 text-sm mb-2">Descripción del producto</p>
                    <div className="flex justify-between items-center">
                      <span className="text-primary font-bold">$99.99</span>
                      <button className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/80 transition-colors">
                        Agregar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <Link 
                href={`/tienda/colecciones/${slugify(coleccion.title)}`}
                className="bg-primary font-light text-md text-white hover:scale-105 px-8 py-2 hover:bg-primary/80 transition-all inline-block" style={{ borderRadius: "var(--radius)" }}
              >
                Ir a la Colección
              </Link>
            </div>
          </div>
        ))}

        {/* Fallback si no hay colecciones */}
        {previewCategories.length === 0 && (
          <>
            <div className="text-center mb-12">
              <span className="text-sm uppercase tracking-wider text-gray-500">
                Descubre
              </span>
              <h2 className="text-3xl md:text-4xl text-gray-800 font-bold mt-2">
                Nuestras Colecciones
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  id: 'default-1',
                  title: 'Próximamente',
                  previewImageUrl: '/img/placeholder.webp',
                  bannerText: 'Nuevas colecciones en camino',
                  buttonText: 'Próximamente'
                },
                {
                  id: 'default-2',
                  title: 'Próximamente',
                  previewImageUrl: '/img/placeholder.webp',
                  bannerText: 'Nuevas colecciones en camino',
                  buttonText: 'Próximamente'
                }
              ].map((coleccion, index) => (
                <div
                  key={index}
                  className="group relative cursor-pointer overflow-hidden rounded bg-white shadow-sm hover:shadow-xl transition-all duration-300" style={{ borderRadius: "var(--radius)" }}
                >
                  <div className="flex flex-col md:flex-row h-[400px] md:h-[250px]">
                    <div className="w-full md:w-1/2 h-full relative overflow-hidden">
                      <img
                        src={coleccion.previewImageUrl || "/carr/default.jpg"}
                        alt={coleccion.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center text-center bg-white">
                      <h3 className="text-xl text-gray-800 font-bold mb-3">
                        {coleccion.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6">
                        {coleccion.bannerText || "Descubre nuestra exclusiva colección"}
                      </p>
                      <span className="bg-gray-200 text-gray-600 px-6 py-2 text-sm font-bold cursor-not-allowed" style={{ borderRadius: "var(--radius)" }}>
                        {coleccion.buttonText}
                      </span>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Colecciones02Preview;