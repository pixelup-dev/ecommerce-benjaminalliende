/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Servicio {
  nombre: string;
  servicios: string[];
  imagen: string;
}

const createWhatsAppLink = (serviceName: string) => {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace("+", "");
  const message = encodeURIComponent(
    `¡Hola! Me gustaría agendar una hora para ${serviceName}`
  );
  return `https://wa.me/${phoneNumber}?text=${message}`;
};

const handleAgendarClick = (serviceName: string) => {
  // Abrir WhatsApp en una nueva pestaña
  // Abrir AgendaPro en otra pestaña
  window.open("https://pixelup.cl", "_blank");
};

export default function Servicios03() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_LISTA_SERVICIOS03_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (response.data?.banner?.images) {
          const serviciosData = response.data.banner.images.map(
            (image: any) => ({
              nombre: image.title,
              servicios: JSON.parse(image.landingText),
              imagen: image.mainImage.url,
            })
          );
          setServicios(serviciosData);
        }
      } catch (error) {
        console.error("Error al obtener los servicios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  return (
    <section className="py-24 bg-gray-100">
      <div className="mx-6 px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-sans text-xs uppercase tracking-widest mb-3 block">
            Descubre nuestros servicios
          </span>
          <h2 className="text-5xl font-serif mb-4 text-[#2C2C2C]">
            Nuestras Especialidades
          </h2>
          <p className="text-gray-600 font-sans text-base">
            Experimenta la excelencia en cada tratamiento, con técnicas
            innovadoras y productos de primera calidad
          </p>
        </div>
        <div className="flex justify-center items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-[1200px]">
            {servicios.map((servicio, index) => (
              <div
                key={index}
                className="group relative overflow-hidden aspect-[3/4] cursor-pointer" style={{ borderRadius: "var(--radius)" }}
              >
                <img
                  src={servicio.imagen}
                  alt={servicio.nombre}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" style={{ borderRadius: "var(--radius)" }}
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
                        className="mt-4 text-primary hover:text-white transition-colors" style={{ borderRadius: "var(--radius)" }}
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
}
