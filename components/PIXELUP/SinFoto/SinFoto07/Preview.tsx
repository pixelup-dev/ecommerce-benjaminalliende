"use client";
import React from "react";
import Link from "next/link";
import { previewData } from "@/app/config/previewData";

const SinFoto07Preview = () => {
  return (
    <section className="py-12 sm:py-24 bg-white relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-2xl sm:blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-primary/5 rounded-full blur-2xl sm:blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          {/* Columna de estadísticas */}
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
            <div className="bg-white p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-primary">
                    {previewData.epigrafe || "Tiempo de Respuesta"}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {previewData.texto || "Respuesta rápida y eficiente"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-6 shadow-md hover:shadow-lg transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-primary">
                    {previewData.titulo || "95% Satisfacción"}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Clientes satisfechos con nuestros servicios
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna de contenido principal */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="relative">
              {/* Línea decorativa */}
              <div className="absolute -left-4 sm:-left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary rounded-full"></div>

              <div className="space-y-4 sm:space-y-8">
                <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-100 text-primary text-xs sm:text-sm font-medium" style={{ borderRadius: "var(--radius)" }}>
                  {previewData.epigrafe || "NUESTROS SERVICIOS"}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-primary">
                  {previewData.titulo || "Título Principal del Servicio"}
                </h2>

                <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
                  {previewData.texto || "Descripción detallada de nuestros servicios y cómo podemos ayudarte a alcanzar tus objetivos. Ofrecemos soluciones personalizadas y atención de calidad."}
                </p>

                <Link
                  href="#"
                  className="inline-flex items-center space-x-2 bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-semibold hover:bg-primary/90 transition-colors"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinFoto07Preview;