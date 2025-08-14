"use client";
import React, { useState } from "react";
import { previewData } from "@/app/config/previewData";

const Ubicacion04Preview = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto px-4">
        <div className="text-center mb-10">
          <h4 className="font-montserrat text-md text-primary uppercase tracking-wider mb-1">
            {previewData.epigrafe || "NUESTRA UBICACIÓN"}
          </h4>
          <div className="flex items-center justify-center max-w-[90%] mx-auto px-4">
            <div className="flex-grow h-px bg-gray-200"></div>
            <h2 className="font-poiret text-2xl md:text-3xl text-gray-900 px-4">
              {previewData.titulo || "Título Principal"}
            </h2>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="flex flex-col justify-center">
            <h3 className="font-montserrat text-3xl text-primary uppercase tracking-wider mb-1">
              {previewData.texto || "Un ambiente limpio y acogedor para disfrutar"}
            </h3>
            <div className="text-gray-600 mb-6">
              {previewData.texto || "Descripción detallada de nuestros servicios y ubicación."}
            </div>

            <div className="bg-white p-6 rounded-sm mb-6 shadow-sm">
              <div className="flex items-start mb-4">
                <div className="bg-primary p-2 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-montserrat text-md text-dark tracking-wider mb-1">
                    Restaurante en local
                  </h4>
                  <p className="text-sm text-gray-600">
                    Calle Principal 123, Ciudad
                    <br />
                    Santiago, Chile
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-primary p-2 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-montserrat text-md text-dark tracking-wider mb-1">
                    Horario de atención
                  </h4>
                  <p className="text-sm text-gray-600">
                    Lunes a Viernes: 10:00 - 20:00
                    <br />
                    Sábados: 10:00 - 18:00
                    <br />
                    Domingos: Cerrado
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-block px-8 py-3 bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors w-fit"
              style={{ borderRadius: "var(--radius)" }}
            >
              VER NUESTRO MENÚ
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 aspect-video overflow-hidden">
              <img
                src="/lynch/local/2.webp"
                alt="Restaurante Casa Lynch"
                className="w-full h-full object-cover hover:scale-105 transition-transform"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img
                src="/lynch/local/3.webp"
                alt="Imagen 3"
                className="w-full h-full object-cover hover:scale-105 transition-transform"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            <div className="aspect-square overflow-hidden">
              <img
                src="/lynch/local/4.webp"
                alt="Imagen 4"
                className="w-full h-full object-cover hover:scale-105 transition-transform"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal personalizado */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="relative max-w-[1200px] mx-2 p-4 pt-8 bg-white rounded-lg shadow-lg animate-fade-in-up overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-1 right-1 z-50 text-gray-500 hover:text-gray-800"
              aria-label="Cerrar modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="relative w-full max-w-4xl mx-auto">
              <img
                src="/lynch/menu.jpg"
                alt="Menú Casa Lynch"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Ubicacion04Preview;