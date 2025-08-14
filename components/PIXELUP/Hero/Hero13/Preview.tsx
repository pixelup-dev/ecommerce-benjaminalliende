"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero13Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  return (
    <div className="">
      <div className="bg-white min-h-[350px] text-[#333] font-[sans-serif]">
        <div className="grid md:grid-cols-2 justify-center items-center max-md:text-center gap-8">
          <div className="max-w-2xl mx-auto p-4 px-6">
            <h2 className="text-3xl md:text-3xl font-extrabold font-kalam my-6 uppercase">
              {previewData.titulo || "Título Principal del Hero"}
            </h2>
            <div className="text-base">
              {previewData.texto || "Este es un texto descriptivo para el hero principal que explica el contenido de la sección. Aquí puedes incluir información detallada sobre los servicios, productos o propuesta de valor de tu empresa."}
            </div>
          </div>
          <div className="md:text-right max-md:mt-12 h-full">
            <img
              src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
              alt={previewData.titulo || "Hero Image"}
              className="w-full h-[600px] object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero13Preview;