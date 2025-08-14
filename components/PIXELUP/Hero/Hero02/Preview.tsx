"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero02Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  return (
    <section className="w-full bg-gray-100 py-12">
      <div className="mx-auto max-w-7xl relative">
        <div className="lg:px-0 flex justify-center">
          <div
            className="relative w-full h-[600px] bg-cover bg-center"
            style={{ borderRadius: "var(--radius)" }}
          >
            <img
              src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
              alt={previewData.titulo || "Hero Image"}
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
            />
            <div className="absolute top-1/2 left-1/2 lg:left-[24%] transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-4 md:p-8 rounded-lg shadow-lg max-w-lg text-gray-800 w-[90%] md:w-full">
              <h2 className="text-lg md:text-2xl font-bold mb-2 md:mb-4">
                {previewData.titulo || "Título Principal del Hero"}
              </h2>
              <div className="mb-2 md:mb-4 editortexto">
                {previewData.texto || "Este es un texto descriptivo para el hero principal que explica el contenido de la sección."}
              </div>
              <a
                href="#"
                className="text-primary hover:underline text-right"
              >
                {previewData.epigrafe || "Ver más"}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero02Preview;