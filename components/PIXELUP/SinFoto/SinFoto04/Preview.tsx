"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const SinFoto04Preview = () => {
  const cards = [
    {
      title: "Servicio 1",
      contentText: "Descripción detallada del primer servicio ofrecido con enfoque en calidad y resultados.",
      icon: 0
    },
    {
      title: "Servicio 2",
      contentText: "Descripción del segundo servicio con metodología avanzada y atención personalizada.",
      icon: 1
    },
    {
      title: "Servicio 3",
      contentText: "Tercer servicio con enfoque integral y resultados garantizados.",
      icon: 2
    },
    {
      title: "Servicio 4",
      contentText: "Cuarto servicio con tecnología de vanguardia y seguimiento continuo.",
      icon: 3
    },
    {
      title: "Servicio 5",
      contentText: "Quinto servicio con experiencia comprobada y atención especializada.",
      icon: 4
    },
    {
      title: "Servicio 6",
      contentText: "Sexto servicio con enfoque innovador y resultados excepcionales.",
      icon: 5
    }
  ];

  return (
    <section className="mb-12 md:mb-24 bg-white">
      <div className="mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-16 text-gray-800">
            {previewData.titulo || "Nuestros Servicios"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {cards.map((card, index) => (
              <div key={index} className="bg-gray-50 p-6 md:p-8 rounded-xl md:rounded-2xl hover:shadow-xl transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
                <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 md:mb-6">
                  <svg
                    className="w-6 h-6 md:w-8 md:h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {card.icon === 0 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    )}
                    {card.icon === 1 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    )}
                    {card.icon === 2 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                    {card.icon === 3 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                    {card.icon === 4 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                      />
                    )}
                    {card.icon === 5 && (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    )}
                  </svg>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4">{card.title}</h3>
                <p className="text-sm md:text-base text-gray-600">{card.contentText}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinFoto04Preview;