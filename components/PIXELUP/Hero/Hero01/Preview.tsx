"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero01Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  return (
    <section className="w-full bg-gray-100">
      <div className="text-gray-600 body-font">
        <div className="max-w-6xl mx-auto w-full px-4 md:px-0 py-8 lg:py-24 flex flex-col-reverse lg:flex-row items-center justify-center">
          {/* Contenedor de imagen con centrado completo en dispositivos móviles */}
          <div className="flex w-full md:flex-1 items-center justify-center mt-6 lg:mt-0 lg:order-1">
            <img
              alt={previewCategories[0]?.title || "Hero Image"}
              className="object-cover shadow-lg rounded-lg w-96"
              src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
              style={{ borderRadius: "var(--radius)" }}
            />
          </div>
          {/* Contenedor de texto centrado completamente en dispositivos móviles */}
          <div className="w-full md:flex-1 flex flex-col items-center text-center lg:items-start lg:text-left lg:order-2 mt-4 md:mt-8 lg:mt-0">
            <h4 className="text-primary text-lg md:text-xl">
              {previewData.epigrafe || "Descubre"}
            </h4>
            <h1 className="mt-2 text-3xl md:text-5xl font-bold leading-tight text-foreground">
              {previewData.titulo || "Título Principal del Hero"}
            </h1>
            <p className="text-base md:text-lg text-foreground py-3 mx-2 md:mx-8 lg:mx-0">
              {previewData.texto || "Este es un texto descriptivo para el hero principal que explica el contenido de la sección."}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero01Preview;