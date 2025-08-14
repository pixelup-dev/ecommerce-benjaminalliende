"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero06Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  return (
    <section className="w-full bg-foreground/5">
      <div className="text-gray-600 body-font">
        <div className="py-6 md:py-10 mx-auto px-4 md:px-0">
          <div className="max-w-5xl mx-auto">
            {/* Historia */}
            <div className="mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-center text-gray-800">
                {previewData.titulo || "Nuestra Historia"}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 md:gap-8 items-center">
                <div className="relative h-[250px] md:h-[350px] overflow-hidden shadow-lg transform hover:scale-[1.02] transition-transform duration-300" style={{ borderRadius: "var(--radius)" }}>
                  <img
                    src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
                    alt="Historia de la empresa"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-4">
                  <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                    {previewData.texto || "Fundada en 2020, Cubico Modular nació con la visión de revolucionar la industria de la construcción modular. Lo que comenzó como un pequeño taller de diseño se ha convertido en una empresa líder en soluciones modulares para diversos sectores."}
                  </p>
                </div>
              </div>
            </div>

            {/* Misión y Visión */}
            <div className="grid md:grid-cols-2 gap-6 md:gap-12">
              <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{ borderRadius: "var(--radius)" }}>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">
                  Nuestra Misión
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Proporcionar soluciones modulares innovadoras y sostenibles que transformen espacios en entornos funcionales y eficientes, adaptándonos a las necesidades específicas de cada cliente y contribuyendo al desarrollo sostenible.
                </p>
              </div>
              <div className="bg-white p-6 md:p-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1" style={{ borderRadius: "var(--radius)" }}>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-800">
                  Nuestra Visión
                </h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed">
                  Ser líderes en el mercado de soluciones modulares, reconocidos por nuestra innovación, calidad y compromiso con la sostenibilidad, estableciendo nuevos estándares en el diseño y construcción de espacios modulares.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero06Preview;