"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero09Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 4);

  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Columna de Imágenes */}
            <div className="grid grid-cols-2 gap-4 relative">
              {previewCategories.map((category, index) => (
                <div key={index} className="relative z-10" style={{ borderRadius: "var(--radius)" }}>
                  <img
                    src={category.mainImage.url}
                    alt={`Proyecto personalizado ${index + 1}`}
                    className="rounded-lg shadow-lg object-cover h-48 w-full"
                  />
                </div>
              ))}
              {/* Imágenes de respaldo si no hay suficientes */}
              {previewCategories.length < 4 &&
                Array.from({ length: 4 - previewCategories.length }).map((_, index) => (
                  <div key={`default-${index}`} className="relative z-10" style={{ borderRadius: "var(--radius)" }}>
                    <img
                      src={`/cubico/${index + 1}.webp`}
                      alt={`Proyecto personalizado ${previewCategories.length + index + 1}`}
                      className="rounded-lg shadow-lg object-cover h-48 w-full"
                    />
                  </div>
                ))}
              <div className="absolute inset-0 bg-primary/10 -z-10 transform rotate-6 rounded-lg"></div>
            </div>

            {/* Columna de Texto */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                {previewData.titulo || "Proyectos Personalizados a tu Medida"}
              </h2>
              <div className="text-lg text-gray-600">
                {previewData.texto || "Descripción de nuestros proyectos personalizados y servicios especializados."}
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Diseño Personalizado
                    </h3>
                    <div className="text-gray-600">
                      Creamos soluciones únicas adaptadas a tus necesidades específicas y preferencias de estilo.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      Calidad Garantizada
                    </h3>
                    <div className="text-gray-600">
                      Utilizamos materiales de primera calidad y técnicas avanzadas para resultados excepcionales.
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => window.open("#", "_blank")}
                  className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-3 font-semibold"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {previewData.epigrafe || "Contacta con nosotros"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero09Preview;