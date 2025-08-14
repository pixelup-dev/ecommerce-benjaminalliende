"use client";
import React, { useState } from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero16Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 3);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        {/* Carrusel de Imágenes */}
        <div className="w-full lg:w-1/2 relative">
          <div className="relative h-64 md:h-80 lg:h-full overflow-hidden">
            {previewCategories.length > 0 ? (
              <>
                {previewCategories.map((category, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-transform duration-500 ${
                      index === currentIndex
                        ? "translate-x-0"
                        : index < currentIndex
                        ? "-translate-x-full"
                        : "translate-x-full"
                    }`}
                  >
                    <img
                      src={category.mainImage.url}
                      alt={`Proyecto personalizado ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer"
                    />
                  </div>
                ))}

                {/* Controles del carrusel */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
                  {previewCategories.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-3 h-3 rounded transition-colors duration-300 ${
                        currentIndex === index
                          ? "bg-white"
                          : "bg-white/50 hover:bg-white"
                      }`}
                    />
                  ))}
                </div>

                {/* Flechas de navegación */}
                <button
                  onClick={() => setCurrentIndex((prev) => (prev - 1 + previewCategories.length) % previewCategories.length)}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-2 rounded transition-colors duration-300"
                  aria-label="Imagen anterior"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentIndex((prev) => (prev + 1) % previewCategories.length)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 p-2 rounded transition-colors duration-300"
                  aria-label="Siguiente imagen"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No hay imágenes disponibles</p>
              </div>
            )}
          </div>
        </div>
        {/* Columna de Texto */}
        <div className="w-full lg:w-1/2 p-6 bg-white">
          <div className="max-w-2xl mx-auto py-10">
            {/* Título Principal */}
            <h2 className="text-4xl text-primary font-bold mb-4 pt-4 leading-tight">
              {previewData.titulo || "Proyectos Personalizados a tu Medida"}
            </h2>

            {/* Descripción Principal */}
            <div className="text-md text-gray-600 mb-6">
              {previewData.texto || "Descripción de nuestros proyectos personalizados y servicios especializados. Creamos soluciones únicas adaptadas a tus necesidades específicas."}
            </div>

            <div className="space-y-4">
              {/* Característica 1 */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">
                  Diseño Personalizado
                </h3>
                <div className="text-gray-600">
                  Creamos soluciones únicas adaptadas a tus necesidades específicas y preferencias de estilo.
                </div>
              </div>

              {/* Característica 2 */}
              <div>
                <h3 className="text-2xl font-semibold mb-4 text-primary">
                  Calidad Garantizada
                </h3>
                <div className="text-gray-600">
                  Utilizamos materiales de primera calidad y técnicas avanzadas para resultados excepcionales.
                </div>
              </div>
            </div>

            {/* Botón */}
            <div className="pt-12">
              <Link
                href="#"
                id="boton-contacto-box"
                className="bg-primary text-white px-8 py-4 font-semibold hover:bg-primary/80 transition-colors duration-300"
                style={{ borderRadius: "var(--radius)" }}
              >
                {previewData.epigrafe || "Contacta con nosotros"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero16Preview;