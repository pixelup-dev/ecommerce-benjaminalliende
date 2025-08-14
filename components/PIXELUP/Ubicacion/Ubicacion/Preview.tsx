"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const UbicacionPreview = () => {
  return (
    <section className="py-12 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-6 lg:space-y-8">
            <span className="text-primary/70 text-sm uppercase tracking-widest">
              {previewData.epigrafe || "NUESTRA UBICACIÓN"}
            </span>
            <h2 className="text-3xl lg:text-4xl font-light text-primary">
              {previewData.titulo || "Pixel Up"}
            </h2>
            <div className="text-gray-600 text-sm lg:text-base">
              {previewData.texto || "Encuéntranos en el corazón de la ciudad para brindarte la mejor atención."}
            </div>

            <div className="grid gap-4 lg:gap-6">
              <div className="bg-white p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: "var(--radius)" }}>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
                    <svg    
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1 text-sm lg:text-base">Dirección</h3>
                    <p className="text-gray-600 text-sm lg:text-base">Calle Principal 123, Comuna</p>
                    <p className="text-gray-600 text-sm lg:text-base">Santiago, Chile</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: "var(--radius)" }}>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
                    <svg
                      className="w-6 h-6 text-gray-600"
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
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1 text-sm lg:text-base">Horario de Atención</h3>
                    <p className="text-gray-600 text-sm lg:text-base">Lunes a Viernes: 10:00 - 20:00</p>
                    <p className="text-gray-600 text-sm lg:text-base">Sábados: 10:00 - 18:00</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: "var(--radius)" }}>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1 text-sm lg:text-base">Contacto</h3>
                    <p className="text-gray-600 text-sm lg:text-base">+56 9 6236 5458</p>
                    <p className="text-gray-600 text-sm lg:text-base">hola@pixelup.cl</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div className="bg-gray-300 rounded shadow-xl w-full h-[300px] lg:h-[400px] flex items-center justify-center" style={{ borderRadius: "var(--radius)" }}>
              <img src={previewData.imagen} alt="Ubicación" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-4 right-4 lg:-bottom-8 lg:-right-8 bg-white p-4 lg:p-6 shadow-lg" style={{ borderRadius: "var(--radius)" }}>
              <div className="flex items-center gap-2 lg:gap-3">    
                <svg
                  className="w-6 h-6 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                <div>
                  <p className="text-xs lg:text-sm text-gray-500">Calificación</p>
                  <p className="text-primary text-sm lg:text-base font-medium">4.9 de 5 estrellas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UbicacionPreview;