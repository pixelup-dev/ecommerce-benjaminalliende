"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Servicios03Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 4);
  
  const servicios = [
    {
      nombre: "Peluquería Canina",
      servicios: [
        "Baño y secado profesional",
        "Corte de pelo a tijera",
        "Corte de uñas",
        "Limpieza de oídos",
        "Perfumado especial"
      ],
      imagen: previewCategories[0]?.mainImage.url || "https://picsum.photos/seed/servicio1/800/600"
    },
    {
      nombre: "Baño de Mantención",
      servicios: [
        "Baño con shampoo especial",
        "Secado con secador profesional",
        "Cepillado completo",
        "Limpieza de ojos",
        "Hidratación del pelaje"
      ],
      imagen: previewCategories[1]?.mainImage.url || "https://picsum.photos/seed/servicio2/800/600"
    },
    {
      nombre: "Deslanado Completo",
      servicios: [
        "Deslanado manual",
        "Perfilado de zonas",
        "Cepillado profundo",
        "Limpieza de almohadillas",
        "Tratamiento hidratante"
      ],
      imagen: previewCategories[2]?.mainImage.url || "https://picsum.photos/seed/servicio3/800/600"
    },
    {
      nombre: "Baño Pelo Corto",
      servicios: [
        "Baño especializado",
        "Cepillado para pelo muerto",
        "Limpieza de pliegues",
        "Corte de uñas",
        "Perfumado suave"
      ],
      imagen: previewCategories[3]?.mainImage.url || "https://picsum.photos/seed/servicio4/800/600"
    }
  ];

  const handleAgendarClick = (serviceName: string) => {
    // Simular la acción de agendar
    console.log(`Agendando servicio: ${serviceName}`);
  };

  return (
    <section className="py-24 bg-gray-100">
      <div className="mx-6 px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-sans text-xs uppercase tracking-widest mb-3 block">
            {previewData.epigrafe || "Descubre nuestros servicios"}
          </span>
          <h2 className="text-5xl font-serif mb-4 text-[#2C2C2C]">
            {previewData.titulo || "Nuestras Especialidades"}
          </h2>
          <p className="text-gray-600 font-sans text-base">
            {previewData.texto || "Experimenta la excelencia en cada tratamiento, con técnicas innovadoras y productos de primera calidad"}
          </p>
        </div>
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px]">
            {servicios.map((servicio, index) => (
              <div
                key={index}
                className="group relative overflow-hidden aspect-[3/4] cursor-pointer"
                style={{ borderRadius: "var(--radius)" }}
              >
                <img
                  src={servicio.imagen}
                  alt={servicio.nombre}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  style={{ borderRadius: "var(--radius)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white text-xl md:text-2xl font-serif mb-3">
                      {servicio.nombre}
                    </h3>
                    <div className="h-auto">
                      <ul className="text-white/80 text-sm space-y-1">
                        {servicio.servicios.map((servicio, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2"
                          >
                            <span className="text-primary">•</span>
                            {servicio}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={() => handleAgendarClick(servicio.nombre)}
                        className="mt-4 text-primary hover:text-white transition-colors"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        Agendar &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Servicios03Preview;