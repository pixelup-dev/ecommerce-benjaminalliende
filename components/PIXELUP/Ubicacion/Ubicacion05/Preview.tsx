"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const Ubicacion05Preview = () => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center max-w-[90%] mx-auto px-4">
            <div className="flex-grow h-px bg-gray-200"></div>
            <h2 className="font-oldStandard text-2xl md:text-3xl text-gray-900 px-4">
              {previewData.titulo || "Nuestra Ubicación"}
            </h2>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          <h4 className="font-poppins text-md text-primary uppercase tracking-wider -mt-2">
            {previewData.epigrafe || "Visítanos"}
          </h4>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            <div className="lg:col-span-4 flex flex-col justify-center order-2 lg:order-1">
              <div className="flex justify-center w-full">
                <img
                  src="/img/pixelup.png"
                  alt="Logo Principal"
                  className="w-72 h-auto px-4 py-2 object-cover hover:scale-105 transition-all duration-700"
                />
              </div>
              <div 
                className="text-gray-600 mb-6 mt-2 leading-tight text-center"
                dangerouslySetInnerHTML={{ __html: previewData.texto || "Descripción de nuestra ubicación y servicios." }}
              />

              <div className="flex justify-center w-full">
                <a
                  href="#"
                  className="inline-block px-6 py-2 bg-primary text-white text-sm font-poppins hover:bg-primary transition-colors rounded-md w-fit"
                >
                  Visítanos
                </a>
              </div>
            </div>

            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-[360px]">
                <div className="col-span-2 row-span-2 overflow-hidden rounded-lg shadow-md">
                  <img
                    src="/img/placeholder-1.jpg"
                    alt="Imagen Principal"
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                  />
                </div>
                
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img
                    src="/img/placeholder-2.jpg"
                    alt="Imagen 2"
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                  />
                </div>
                
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img
                    src="/img/placeholder-3.jpg"
                    alt="Imagen 3"
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                  />
                </div>
                
                <div className="overflow-hidden rounded-lg shadow-md">
                  <img
                    src="/img/placeholder-4.jpg"
                    alt="Imagen 4"
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              <div className="md:col-span-2 p-8 bg-white">
                <h3 className="font-oldStandard text-2xl text-primary mb-8 relative inline-flex items-center">
                  <span className="relative">
                    Visítanos en nuestro Local
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary"></span>
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 left-0 h-0.5 w-full bg-primary transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></div>
                    <div className="p-3">
                      <div className="mb-2 flex justify-between items-center">
                        <h4 className="font-oldStandard text-xl text-gray-800 items-center flex gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-white bg-primary rounded-full p-1"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Horarios
                        </h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Lun-Vie:</span>
                          <span className="text-primary font-medium">
                            10:00 - 20:00
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Sáb:</span>
                          <span className="text-primary font-medium">
                            10:00 - 18:00
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Dom:</span>
                          <span className="text-primary font-medium">
                            Cerrado
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 left-0 h-0.5 w-full bg-primary transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></div>
                    <div className="p-3">
                      <div className="mb-2 flex justify-between items-center">
                        <h4 className="font-oldStandard text-xl text-gray-800 items-center flex gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-white bg-primary rounded-full p-1"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          Ubicación
                        </h4>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Calle Principal 123
                        <br />
                        Santiago, Chile
                      </div>
                      <a
                        href="#"
                        className="text-xs text-primary hover:underline inline-flex items-center"
                      >
                        Cómo llegar
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-1"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md md:col-span-2">
                    <div className="absolute top-0 left-0 h-0.5 w-full bg-primary transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></div>
                    <div className="p-3">
                      <div className="mb-2 flex justify-between items-center">
                        <h4 className="font-oldStandard text-xl text-gray-800 items-center flex gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-white bg-primary rounded-full p-1"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          Contáctanos
                        </h4>
                      </div>
                      <div className="flex flex-col text-sm space-y-2">
                        <span className="text-gray-600">
                          Teléfono:{" "}
                          <a
                            href="tel:+56912345678"
                            className="text-primary hover:underline"
                          >
                            +56 9 1234 5678
                          </a>
                        </span>
                        <span className="text-gray-600">
                          Email:{" "}
                          <a
                            href="mailto:info@empresa.com"
                            className="text-primary hover:underline"
                          >
                            info@empresa.com
                          </a>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 h-[300px] md:h-auto relative overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3329.0467969066423!2d-70.6483321!3d-33.4378305!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDI2JzE2LjIiUyA3MMKwMzgnNTQuMCJX!5e0!3m2!1ses!2scl!4v1629308000000!5m2!1ses!2scl"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Ubicacion05Preview;