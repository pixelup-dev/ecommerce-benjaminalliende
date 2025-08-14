"use client";
import React from "react";
import Link from "next/link";
import { previewData } from "@/app/config/previewData";

const SinFoto06Preview = () => {
  return (
    <section className="py-12 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 items-start">
          <div className="relative col-span-1 lg:col-span-2">
            <div className="relative bg-white p-6 sm:p-8 shadow-lg" style={{ borderRadius: "var(--radius)" }}>
              <div className="space-y-4">
                <div className="border-b pb-4 sm:pb-6">
                  <img
                    src="/img/pixelup.png"
                    alt="Logo Mercado Público"
                    className="h-16 sm:h-20 object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-primary font-semibold text-sm sm:text-base block">
                    {previewData.epigrafe || "CONSULTA GRATUITA"}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-primary">
                    {previewData.titulo || "Título Principal del Contenido"}
                  </h2>
                </div>
                <span className="text-gray-600 leading-snug text-base sm:text-lg">
                  {previewData.texto || "Este es un texto descriptivo que explica el contenido principal de la sección. Puede incluir información importante sobre los servicios o productos ofrecidos."}
                </span>
                <span className="flex">
                  <Link
                    href="#"
                    className="inline-flex items-center space-x-2 bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm sm:text-base"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <span>Conoce más sobre nosotros</span>
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </span>
              </div>
            </div>
          </div>
          <div className="relative col-span-1">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white shadow-lg p-4 sm:p-6" style={{ borderRadius: "var(--radius)" }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">
                  Tiempo de Respuesta
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Respuesta en menos de 24 horas
                </p>
              </div>
              <div className="bg-white shadow-lg p-4 sm:p-6" style={{ borderRadius: "var(--radius)" }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">
                  95% de Satisfacción
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Clientes satisfechos con nuestros servicios
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinFoto06Preview;