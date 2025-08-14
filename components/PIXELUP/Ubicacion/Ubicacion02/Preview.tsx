"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const Ubicacion02Preview = () => {
  return (
    <section className="py-12 md:pb-24 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-primary text-sm uppercase tracking-widest inline-block mb-3">
            {previewData.epigrafe || "NUESTRA UBICACIÓN"}
          </span>
          <h2 className="text-2xl lg:text-3xl font-light text-primary mb-4">
            {previewData.titulo || "Encuéntranos"}
          </h2>
          <div className="text-gray-600 text-sm lg:text-base max-w-2xl mx-auto">
            {previewData.texto || "Visítanos en nuestra ubicación estratégica para recibir la mejor atención."}
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-16 items-start">
          <div className="lg:col-span-3 relative">
            <div className="relative h-[420px] overflow-hidden shadow-xl" style={{ borderRadius: "var(--radius)" }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.0467969066423!2d-70.6483321!3d-33.4378305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI2JzE2LjIiUyA3MMKwMzgnNTQuMCJX!5e0!3m2!1ses!2scl!4v1629308000000!5m2!1ses!2scl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
              <div className="absolute inset-0 pointer-events-none shadow-inner" style={{ borderRadius: "var(--radius)" }} />
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid gap-4 lg:gap-6">
              <div className="bg-white/80 backdrop-blur-sm p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
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
                    <h3 className="font-medium text-primary mb-1 text-sm lg:text-base">
                      Dirección
                    </h3>
                    <p className="text-gray-600 text-sm lg:text-base">
                      Calle Principal 123, Comuna
                    </p>
                    <p className="text-gray-600 text-sm lg:text-base">
                      Santiago, Chile
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
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
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1 text-sm lg:text-base">
                      Horario de Atención
                    </h3>
                    <p className="text-gray-600 text-sm lg:text-base">
                      Lunes a Viernes: 10:00 - 20:00
                    </p>
                    <p className="text-gray-600 text-sm lg:text-base">
                      Sábados: 10:00 - 18:00
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-4 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1 text-sm lg:text-base">
                      Contacto
                    </h3>
                    <p className="text-gray-600 text-sm lg:text-base">
                      +56 9 6236 5458
                    </p>
                    <p className="text-gray-600 text-sm lg:text-base">
                      hola@pixelup.cl
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ubicacion02Preview;