"use client";
import React from "react";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Servicios01Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 4);
  
  const servicios = [
    {
      id: "1",
      nombre: "Servicio Personalizado 1",
      descripcion: "Descripción detallada del primer servicio ofrecido con enfoque personalizado y atención especializada.",
      servicios: [
        "Evaluación inicial completa",
        "Plan de tratamiento personalizado",
        "Seguimiento continuo"
      ],
      mainImage: {
        url: previewCategories[0]?.mainImage.url || "/img/placeholder.webp"
      }
    },
    {
      id: "2", 
      nombre: "Servicio Personalizado 2",
      descripcion: "Descripción del segundo servicio con metodología avanzada y resultados garantizados.",
      servicios: [
        "Análisis especializado",
        "Técnicas innovadoras",
        "Resultados medibles"
      ],
      mainImage: {
        url: previewCategories[1]?.mainImage.url || "/img/placeholder.webp"
      }
    },
    {
      id: "3",
      nombre: "Servicio Personalizado 3", 
      descripcion: "Tercer servicio con enfoque integral y atención de calidad superior.",
      servicios: [
        "Atención integral",
        "Tecnología avanzada",
        "Cuidado especializado"
      ],
      mainImage: {
        url: previewCategories[2]?.mainImage.url || "/img/placeholder.webp"
      }
    },
    {
      id: "4",
      nombre: "Servicio Personalizado 4",
      descripcion: "Cuarto servicio con metodología probada y excelencia en cada detalle.",
      servicios: [
        "Metodología probada",
        "Excelencia garantizada",
        "Atención premium"
      ],
      mainImage: {
        url: previewCategories[3]?.mainImage.url || "/img/placeholder.webp"
      }
    }
  ];

  return (
    <section id="servicios" className="py-24 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary uppercase tracking-wider font-bold text-sm mb-4 block">
            {previewData.epigrafe || "Servicios"}
          </span>
          <h2 className="text-4xl font-bold text-primary/80 mb-4">
            {previewData.titulo || "Nuestros Servicios"}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {previewData.texto || "Soluciones integrales de salud para ti y tu familia"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {servicios.map((servicio, index) => (
            <div
              key={servicio.id}
              className="bg-white overflow-hidden group hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="relative h-64">
                <img
                  src={servicio.mainImage?.url}
                  alt={servicio.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent flex items-end">
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {servicio.nombre}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-6">{servicio.descripcion}</p>
                <div className="space-y-3">
                  {servicio.servicios.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center text-primary"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Link
                    href="#"
                    className="mt-8 w-full bg-primary text-white px-4 py-3 hover:bg-primary/80 transition duration-300 flex items-center justify-center font-medium"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <FaWhatsapp className="mr-2" />
                    Consultar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Servicios01Preview;