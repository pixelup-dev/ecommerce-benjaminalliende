"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero18Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  // Datos estructurados para las cards
  const structuredContent = {
    epigrafe: previewData.epigrafe || "Conoce mi enfoque",
    titulo: previewData.titulo || "Conoce mi enfoque",
    parrafo: previewData.texto || "Te escucho con atención, evalúo tu historia, tus hábitos, tus emociones para ayudarte a identificar el origen de tus síntomas, no solo a silenciarlos.",
    linkBoton: "#",
    textoBoton: "Agenda tu consulta personalizada",
    cards: [
      { 
        titulo: "Evaluación Personalizada", 
        texto: "Analizo tu historial médico, hábitos y estilo de vida para crear un plan único." 
      },
      { 
        titulo: "Enfoque Holístico", 
        texto: "Considero todos los aspectos de tu salud: física, mental y emocional." 
      },
      { 
        titulo: "Seguimiento Continuo", 
        texto: "Acompaño tu proceso con evaluaciones regulares y ajustes según sea necesario." 
      },
      { 
        titulo: "Resultados Sostenibles", 
        texto: "Trabajamos juntos para lograr cambios duraderos en tu bienestar." 
      }
    ]
  };

  return (
    <section className="py-20 bg-gray-100" id="metodologia">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-10 text-center">
          <span className="inline-block mb-2 text-primary font-semibold text-xl uppercase">
            {structuredContent.epigrafe}
          </span>
          <h2 className="text-4xl max-w-3xl mx-auto md:text-5xl uppercase font-ubuntu font-bold text-dark mb-4 leading-tight">
            {structuredContent.titulo}
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
            {structuredContent.parrafo}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 mb-10">
          {/* Listado de características */}
          <div className="flex-1 space-y-6">
            {structuredContent.cards.map((card: any, index: number) => (
              <div key={index} className="bg-white p-6 mb-4 shadow flex items-center min-h-[100px]" style={{ borderRadius: "var(--radius)" }}>
                <div>
                  <h4 className="text-xl font-bold text-dark mb-1">
                    {card.titulo}
                  </h4>
                  <p className="text-gray-600 text-[15px] leading-tight">
                    {card.texto}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Imagen al lado */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-h-[600px] overflow-hidden shadow-xl" style={{ borderRadius: "var(--radius)" }}>
              <img
                src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
                alt="Imagen Hero 18"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href={structuredContent.linkBoton}
            target="_blank"
            className="bg-primary hover:scale-105 text-white font-bold px-8 py-4 shadow-lg transition inline-block"
            style={{ borderRadius: "var(--radius)" }}
          >
            {structuredContent.textoBoton}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero18Preview;