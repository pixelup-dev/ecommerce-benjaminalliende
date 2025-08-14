"use client";
import React from "react";
import Script from "next/script";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero14Preview = () => {
  return (
    <>
      <Script
        src="https://www.youtube.com/iframe_api"
        strategy="beforeInteractive"
      />
      <section className="py-12 bg-white">
        <div className="mx-auto px-4">
          {/* Encabezado con estilo consistente */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center max-w-[90%] mx-auto px-4">
              <div className="flex-grow h-px bg-gray-200"></div>
              <h2 className="font-oldStandard text-2xl md:text-3xl text-gray-900 px-4">
                {previewData.titulo || "Nuestros Videos"}
              </h2>
              <div className="flex-grow h-px bg-gray-200"></div>
            </div>
            <h4 className="font-poppins text-md text-primary uppercase tracking-wider -mt-2">
              {previewData.epigrafe || "Descubre nuestro contenido"}
            </h4>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Columna video 1 */}
              <div className="aspect-video overflow-hidden shadow-lg" style={{ borderRadius: "var(--radius)" }}>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Video Preview 1</span>
                </div>
                <div className="p-4 bg-gray-50">
                  <h3 className="font-oldStandard text-lg text-gray-800">
                    {previewData.texto || "Video destacado"}
                  </h3>
                </div>
              </div>

              {/* Columna video 2 */}
              <div className="aspect-video overflow-hidden shadow-lg" style={{ borderRadius: "var(--radius)" }}>
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">Video Preview 2</span>
                </div>
                <div className="p-4 bg-gray-50">
                  <h3 className="font-oldStandard text-lg text-gray-800">
                    Contenido adicional
                  </h3>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <a
                href="#"
                className="bg-primary hover:bg-primary text-white px-4 py-2"
                style={{ borderRadius: "var(--radius)" }}
              >
                {previewData.epigrafe || "Ver más contenido"}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Hero14Preview;