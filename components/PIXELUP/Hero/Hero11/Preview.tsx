"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero11Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  return (
    <section id="banner" className="w-full">
      <section className="w-full">
        <div className="text-gray-600 body-font">
          <div className="py-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
            <hr className="border-gray-200 mb-12" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Columna de Texto - 8/12 del espacio */}
              <div className="lg:col-span-8 lg:pr-10">
                <div className="text-gray-700 leading-relaxed">
                  <div className="text-gray-700 leading-relaxed mb-4">
                    {previewData.texto || "Este es un texto descriptivo para el hero principal que explica el contenido de la sección. Aquí puedes incluir información detallada sobre los servicios, productos o propuesta de valor de tu empresa."}
                  </div>
                </div>
              </div>

              {/* Columna de Imagen - 4/12 del espacio */}
              <div className="lg:col-span-4 shadow-lg rounded-lg overflow-hidden">
                <img
                  className="w-full h-auto object-cover relative z-0"
                  style={{ borderRadius: "var(--radius)" }}
                  alt={previewData.titulo || "Hero Image"}
                  src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Hero11Preview;