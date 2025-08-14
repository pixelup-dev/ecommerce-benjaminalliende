"use client";
import React, { useState } from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Servicios04Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 4);
  const [servicioExpandido, setServicioExpandido] = useState<number | null>(null);
  
  const servicios = [
    {
      id: 1,
      titulo: "PELUQUERÍA COMPLETA",
      descripcion: [
        "SERVICIO DE PELUQUERÍA COMPLETA PARA RAZAS QUE REQUIEREN CORTE DE PELO CON MAQUINA Y TIJERAS",
        "Baño",
        "Secado",
        "Corte de pelo",
        "Limpieza de oídos",
        "Corte y limado de uñas",
        "Despeje zonas higiénicas",
        "Despeje de almohadillas",
        "Hidratación del manto",
        "Perfume",
      ],
      imagen: previewCategories[0]?.mainImage.url || "https://picsum.photos/seed/servicio1/800/600",
      destacado: true
    },
    {
      id: 2,
      titulo: "BAÑO DE MANTENCIÓN",
      descripcion: [
        "SERVICIO PARA MANTENER EL PELO SIN NUDOS PARA RAZAS QUE REQUIEREN CORTE DE PELO CON MAQUINA",
        "Baño",
        "Secado",
        "Cepillado de mantención para mantener sin nudos el pelaje",
        "Limpieza de oídos",
        "Corte y limado de uñas",
        "Despeje zonas higiénicas",
        "Despeje de almohadillas",
        "Despeje de ojos y oídos",
        "Hidratación del manto",
        "Perfume",
      ],
      imagen: previewCategories[1]?.mainImage.url || "https://picsum.photos/seed/servicio2/800/600",
      destacado: true
    },
    {
      id: 3,
      titulo: "DESLANADO Y/O PERFILADO",
      descripcion: [
        "SERVICIO PARA RAZAS DE DOBLE MANTO Y NO REQUIEREN CORTE DE PELO",
        "Baño",
        "Secado",
        "Deslanado",
        "Perfilado de algunas zonas a tijera",
        "Limpieza de oídos",
        "Corte y limado de uñas",
        "Despeje zonas higiénicas",
        "Despeje de almohadillas",
        "Hidratación del manto",
        "Perfume",
      ],
      imagen: previewCategories[2]?.mainImage.url || "https://picsum.photos/seed/servicio3/800/600",
      destacado: true
    },
    {
      id: 4,
      titulo: "BAÑO PERROS PELO CORTO",
      descripcion: [
        "SERVICIO DE BAÑO PARA RAZAS DE PELO CORTO INCLUYE CEPILLADO PARA PELO MUERTO",
        "Baño",
        "Secado",
        "cepillado especial para botar el pelo",
        "Limpieza de arrugas y pliegues si es necesario",
        "Limpieza de oídos",
        "Corte y limado de uñas",
        "Perfume",
      ],
      imagen: previewCategories[3]?.mainImage.url || "https://picsum.photos/seed/servicio4/800/600",
      destacado: true
    }
  ];

  const toggleServicio = (id: number) => {
    if (servicioExpandido === id) {
      setServicioExpandido(null);
    } else {
      setServicioExpandido(id);
      
      // Desplazamos la pantalla al panel de información después de que se renderice
      setTimeout(() => {
        const panelElement = document.getElementById(`panel-servicio-${id}`);
        if (panelElement) {
          panelElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  // Función para determinar si un servicio está en la fila superior o inferior
  const isServicioFilaSuperior = (id: number) => {
    const servicio = servicios.find(s => s.id === id);
    if (!servicio) return false;
    const index = servicios.findIndex(s => s.id === id);
    return index < 2;
  };

  return (
    <div id="serviciosDestacados" className="py-10 pb-20 overflow-x-hidden">
      <div className="max-w-full mx-auto">
        {/* Dividimos explícitamente en dos filas */}
        <div className="flex flex-col">
          {/* Primera fila de imágenes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
            {servicios
              .filter((s) => s.destacado)
              .slice(0, 2)
              .map((servicio, index) => (
                <div
                  key={servicio.id}
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                    servicioExpandido === servicio.id
                      ? "ring-4 ring-primary z-10"
                      : "hover:brightness-110"
                  }`}
                  style={{ height: "calc((100vh - 140px) / 2)" }}
                >
                  <div
                    className="h-full w-full"
                    onClick={() => toggleServicio(servicio.id)}
                  >
                    {/* Indicador de clic */}
                    <div className="absolute top-4 right-4 flex items-center bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/90 text-sm z-20 transition-all duration-300 hover:bg-black/70 gap-2">
                      {servicioExpandido === servicio.id
                        ? "Cerrar"
                        : "Saber más"}
                      {servicioExpandido === servicio.id ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-x"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-move-right-icon lucide-move-right"
                        >
                          <path d="M18 8L22 12L18 16" />
                          <path d="M2 12H22" />
                        </svg>
                      )}
                    </div>
                    <img
                      src={servicio.imagen}
                      alt={servicio.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2 font-lilita-one">
                        {servicio.titulo}
                      </h3>
                      <p className="text-white/90 line-clamp-2 text-sm">
                        {servicio.descripcion[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Panel de información para las primeras dos imágenes */}
          {servicioExpandido !== null && isServicioFilaSuperior(servicioExpandido) && (
            <div
              id={`panel-servicio-${servicioExpandido}`}
              className="w-full p-8 overflow-hidden transition-all duration-500 transform origin-top border-t-4 shadow-lg"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-3xl font-bold text-primary font-lilita-one">
                      {servicios.find((s) => s.id === servicioExpandido)?.titulo || ""}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setServicioExpandido(null);
                    }}
                    className="text-gray-700 hover:bg-primary hover:text-white transition-all duration-300 bg-gray-100 p-2 rounded-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-700 mb-6 max-w-4xl text-lg">
                  {servicios.find((s) => s.id === servicioExpandido)?.descripcion[0] || ""}
                </p>

                <div className="mt-6">
                  <h4 className="text-xl font-semibold text-primary/80 mb-4">
                    Servicios incluidos:
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicios
                      .find((s) => s.id === servicioExpandido)
                      ?.descripcion.slice(1)
                      .map((item: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start bg-gray-50 p-3 rounded-lg hover:bg-lime-50 transition-colors"
                        >
                          <span className="text-primary mr-2 text-xl">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="mt-8 flex justify-end">
                  <Link
                    href="#"
                    className="px-8 py-4 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-lg"
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Segunda fila de imágenes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
            {servicios
              .filter((s) => s.destacado)
              .slice(2, 4)
              .map((servicio, index) => (
                <div
                  key={servicio.id}
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
                    servicioExpandido === servicio.id
                      ? "ring-4 ring-primary z-10"
                      : "hover:brightness-110"
                  }`}
                  style={{ height: "calc((100vh - 80px) / 2)" }}
                >
                  <div
                    className="h-full w-full"
                    onClick={() => toggleServicio(servicio.id)}
                  >
                    {/* Indicador de clic */}
                    <div className="absolute top-4 right-4 flex items-center bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full text-white/90 text-sm z-20 transition-all duration-300 hover:bg-black/70 gap-2">
                      {servicioExpandido === servicio.id
                        ? "Cerrar"
                        : "Saber más"}
                      {servicioExpandido === servicio.id ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-x"
                        >
                          <path d="M18 6 6 18" />
                          <path d="m6 6 12 12" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-move-right-icon lucide-move-right"
                        >
                          <path d="M18 8L22 12L18 16" />
                          <path d="M2 12H22" />
                        </svg>
                      )}
                    </div>
                    <img
                      src={servicio.imagen}
                      alt={servicio.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                      <h3 className="text-2xl font-bold mb-2 font-lilita-one">
                        {servicio.titulo}
                      </h3>
                      <p className="text-white/90 line-clamp-2 text-sm">
                        {servicio.descripcion[0]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Panel de información para las imágenes de la fila inferior */}
          {servicioExpandido !== null && !isServicioFilaSuperior(servicioExpandido) && (
            <div
              id={`panel-servicio-${servicioExpandido}`}
              className="w-full p-8 overflow-hidden transition-all duration-500 transform origin-top border-t-4 shadow-lg"
            >
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h3 className="text-3xl font-bold text-primary font-lilita-one">
                      {servicios.find((s) => s.id === servicioExpandido)?.titulo || ""}
                    </h3>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setServicioExpandido(null);
                    }}
                    className="text-gray-700 hover:bg-primary hover:text-white transition-all duration-300 bg-gray-100 p-2 rounded-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-700 mb-6 max-w-4xl text-lg">
                  {servicios.find((s) => s.id === servicioExpandido)?.descripcion[0] || ""}
                </p>

                <div className="mt-6">
                  <h4 className="text-xl font-semibold text-primary/80 mb-4">
                    Servicios incluidos:
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {servicios
                      .find((s) => s.id === servicioExpandido)
                      ?.descripcion.slice(1)
                      .map((item: string, idx: number) => (
                        <li
                          key={idx}
                          className="flex items-start bg-gray-50 p-3 rounded-lg hover:bg-lime-50 transition-colors"
                        >
                          <span className="text-primary mr-2 text-xl">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="mt-8 flex justify-end">
                  <Link
                    href="#"
                    className="px-8 py-4 bg-primary hover:bg-primary/80 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-lg"
                  >
                    Contáctanos
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Botón para mostrar todos los servicios */}
        <div className="text-center mt-16 px-4">
          <button className="inline-block px-8 py-3 bg-primary hover:bg-primary/80 text-white rounded font-semibold transition-all shadow-md hover:shadow-lg">
            Descubre Todos los Servicios
          </button>
        </div>
      </div>
    </div>
  );
};

export default Servicios04Preview;