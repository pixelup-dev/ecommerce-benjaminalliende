"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero12Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  return (
    <section id="banner" className="w-full">
      <section className="w-full bg-white">
        <div className="text-gray-600 body-font">
          <div className="py-6 md:py-10 px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center">
              {/* Columna de imagen */}
              <div className="order-2 lg:order-1 col-span-1">
                <img
                  className="w-full h-auto object-contain max-h-[300px] md:max-h-none"
                  alt="hero"
                  src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
                  style={{ borderRadius: "var(--radius)" }}
                />
              </div>

              {/* Columna de Texto */}
              <div className="order-1 lg:order-2 col-span-1">
                <div className="text-gray-700">
                  <h2 className="text-2xl md:text-4xl text-primary/80 mb-3 md:mb-4 font-lilita-one">
                    {previewData.titulo || "Título Principal del Hero"}
                  </h2>
                  <div className="h-1 w-16 md:w-20 bg-primary mb-4 md:mb-6"></div>

                  <div className="space-y-3 md:space-y-4">
                    <div className="leading-relaxed text-[13px] md:text-[14px]">
                      {previewData.texto || "Este es un texto descriptivo para el hero principal que explica el contenido de la sección. Aquí puedes incluir información detallada sobre los servicios, productos o propuesta de valor de tu empresa."}
                    </div>
                    <p className="text-xl md:text-2xl text-primary mb-2 font-lilita-one">
                      {previewData.epigrafe || "Subtítulo destacado"}
                    </p>

                    <p className="leading-relaxed text-[13px] md:text-[14px]">
                      Información adicional sobre los servicios o productos que ofreces. Este texto complementa la información principal y proporciona más contexto al usuario.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
};

export default Hero12Preview;