"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const Ubicacion03Preview = () => {
  return (
    <section className="py-16 bg-white flex justify-center items-center">
      <div className="mx-4 max-w-[1200px] px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-sans text-xs uppercase tracking-widest mb-3 block">
            {previewData.epigrafe || "NUESTRA UBICACIÓN"}
          </span>
          <h2 className="text-5xl font-serif mb-4 text-[#2C2C2C]">
            {previewData.titulo || "PixelUp"}
          </h2>
          <div className="text-gray-600 font-sans text-base">
            {previewData.texto || "Descripción de nuestra ubicación y servicios."}
          </div>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-2xl md:text-3xl font-serif text-[#2C2C2C] text-center md:text-left">
                Visítanos
              </h3>
              <div className="text-gray-600 text-base md:text-lg text-center md:text-left">
                Encuéntranos en el corazón de la ciudad para brindarte la mejor atención.
              </div>
            </div>

            <div className="grid gap-3 md:gap-6 px-2 md:px-0">
              <div className="flex items-start gap-3 md:gap-4 bg-primary/10 p-3 md:p-4" style={{ borderRadius: "var(--radius)" }}>
                <div className="text-xl md:text-2xl">📍</div>
                <div className="min-w-0">
                  <h4 className="font-serif text-base md:text-lg mb-0.5 md:mb-1">
                    Dirección
                  </h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    Calle Principal 123, Comuna
                    <br />
                    Santiago, Chile
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:gap-4 bg-primary/10 p-3 md:p-4" style={{ borderRadius: "var(--radius)" }}>
                <div className="text-xl md:text-2xl">⏰</div>
                <div className="min-w-0">
                  <h4 className="font-serif text-base md:text-lg mb-0.5 md:mb-1">
                    Horario
                  </h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    Lunes a Viernes: 10:00 - 20:00
                    <br />
                    Sábados: 10:00 - 18:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4 bg-primary/10 p-3 md:p-4" style={{ borderRadius: "var(--radius)" }}>
                <div className="text-xl md:text-2xl">📞</div>
                <div className="min-w-0">
                  <h4 className="font-serif text-base md:text-lg mb-0.5 md:mb-1">
                    Contacto
                  </h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    +56 9 6769 1191
                    <br />
                    contacto@pixelup.cl
                  </p>
                </div>
              </div>
            </div>

            <a
              href="#"
              className="inline-block bg-primary text-white px-6 md:px-8 py-3 md:py-4 hover:bg-primary/80 transition-colors w-full mt-2 md:mt-4 text-center text-sm md:text-base"
              style={{ borderRadius: "var(--radius)" }}
            >
              Agenda tu Hora
            </a>
          </div>

          <div className="h-full flex items-stretch">
            <div className="relative group overflow-hidden w-full" style={{ borderRadius: "var(--radius)" }}>
              <div className="w-full h-64 bg-gray-300 flex items-center justify-center">
                <img src={previewData.imagen} alt="Ubicación" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ubicacion03Preview;