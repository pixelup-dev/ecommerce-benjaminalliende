"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero15Preview = () => {
  return (
    <section id="planes" className="py-12 bg-gray-50">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 mt-10">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {previewData.titulo || "Nuestros Planes"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {previewData.texto || "Todos nuestros planes ofrecen un horario flexible y un servicio personalizado para cada necesidad."}
          </p>
        </div>

        {/* Planes de Arriendo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Plan Básico */}
          <div className="bg-white p-8 rounded shadow-xl border-2 border-blue-100 transform hover:scale-105 transition-transform duration-300">
            <div className="text-center mb-8">
              <span className="bg-primary text-white text-sm font-semibold px-4 py-1 rounded">
                Plan Básico
              </span>
              <h3 className="text-3xl font-bold mt-4">
                Pabellón Básico
              </h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-primary">
                  $120.000
                </span>
                <span className="text-gray-500">
                  /2.5 horas
                </span>
              </div>
            </div>
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-3 text-primary">
                Incluye:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Pabellón completamente equipado</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Equipos de iluminación básicos</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Asistencia técnica básica</span>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-3 text-red-600">
                No Incluye:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-red-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Equipos de audio profesionales</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-red-500 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Iluminación especializada</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded mb-8">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold text-primary">
                    Horarios Disponibles
                  </h4>
                  <p className="text-sm text-gray-600">
                    Lunes a Viernes 09:30-19:00
                  </p>
                  <p className="text-sm text-gray-600">
                    Sábado 09:00-16:00
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link
                href="#"
                className="bg-primary text-white px-8 py-3 font-semibold hover:scale-105 transition-all duration-300 w-full inline-block"
                style={{ borderRadius: "var(--radius)" }}
              >
                Reservar Ahora
              </Link>
            </div>
          </div>

          {/* Plan Premium */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 rounded shadow-xl transform hover:scale-105 transition-transform duration-300 text-white">
            <div className="text-center mb-8">
              <span className="bg-white text-primary text-sm font-semibold px-4 py-1 rounded">
                Plan Premium
              </span>
              <h3 className="text-3xl font-bold mt-4">
                Pabellón Full
              </h3>
              <div className="mt-4">
                <span className="text-5xl font-bold">
                  $280.000
                </span>
                <span className="text-blue-200">
                  /2.5 horas
                </span>
              </div>
            </div>
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-3 text-blue-200">
                Incluye Todo:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Pabellón completamente equipado</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Equipos de audio profesionales</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Iluminación especializada completa</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-green-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>Asistencia técnica completa</span>
                </div>
              </div>
            </div>
            <div className="mb-8">
              <h4 className="font-semibold text-lg mb-3 text-blue-200">
                No Incluye:
              </h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-red-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Servicios de catering</span>
                </div>
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-red-300 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span>Personal de servicio</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded mb-8">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-6 h-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold text-primary">
                    Horarios Disponibles
                  </h4>
                  <p className="text-sm text-primary">
                    Lunes a Viernes 09:30-19:00
                  </p>
                  <p className="text-sm text-primary">
                    Sábado 09:00-16:00
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link
                href="#"
                className="bg-white text-primary px-8 py-3 font-semibold hover:scale-105 transition-all duration-300 w-full inline-block"
                style={{ borderRadius: "var(--radius)" }}
              >
                Reservar Ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero15Preview;