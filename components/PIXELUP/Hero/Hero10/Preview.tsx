"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero10Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  return (
    <section className="py-8 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
            <div className="space-y-6 md:space-y-8 order-2 md:order-1">
              <div className="flex items-center space-x-3 md:space-x-4">
                <div className="bg-primary/10 p-2 md:p-3 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 md:h-8 md:w-8 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {previewData.titulo || "Nuestros Servicios"}
                </h2>
              </div>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                {previewData.texto || "Descripción de nuestros servicios especializados y soluciones personalizadas."}
              </p>
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="bg-primary/10 p-1.5 md:p-2 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                      Servicio Personalizado
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      Atención individualizada adaptada a tus necesidades específicas
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="bg-primary/10 p-1.5 md:p-2 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                      Calidad Garantizada
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      Resultados excepcionales con materiales de primera calidad
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 md:space-x-4">
                  <div className="bg-primary/10 p-1.5 md:p-2 rounded-full mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-5 md:w-5 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base">
                      Experiencia Profesional
                    </h3>
                    <p className="text-gray-600 text-xs md:text-sm">
                      Equipo especializado con años de experiencia en el sector
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-2 md:pt-4">
                <a
                  href="#"
                  className="inline-flex items-center justify-center w-full md:w-auto bg-primary text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold hover:bg-primary/80 transition-colors duration-300 shadow-lg hover:shadow-xl text-sm md:text-base"
                >
                  <span>{previewData.epigrafe || "Solicitar Servicio"}</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 md:h-5 md:w-5 ml-2"
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
                </a>
              </div>
            </div>
            <div className="relative order-1 md:order-2 mb-6 md:mb-0">
              <div className="absolute inset-0 bg-primary rounded-2xl transform rotate-3"></div>
              <img
                src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
                alt="Servicios"
                className="relative rounded-2xl shadow-xl object-cover w-full h-[300px] md:h-[500px]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero10Preview;