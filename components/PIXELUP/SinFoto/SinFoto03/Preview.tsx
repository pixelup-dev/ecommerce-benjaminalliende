"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const SinFoto03Preview = () => {
  const cards = [
    {
      title: "Servicio 1",
      contentText: "Descripción detallada del primer servicio ofrecido con enfoque en la calidad y atención personalizada."
    },
    {
      title: "Servicio 2",
      contentText: "Descripción del segundo servicio con metodología avanzada y resultados garantizados."
    },
    {
      title: "Servicio 3",
      contentText: "Tercer servicio con enfoque integral y atención de calidad superior."
    },
    {
      title: "Servicio 4",
      contentText: "Cuarto servicio con metodología probada y excelencia en cada detalle."
    }
  ];

  return (
    <section className="bg-white py-12">
      <div className="mt-20 mb-10 px-4 sm:px-10 md:px-20 lg:px-52">
        <div className="w-full mx-auto">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-left">
              {previewData.titulo || "¿En qué consiste nuestro servicio?"}
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-12 text-black">
            {cards.map((card, index) => (
              <div
                key={index}
                className="mb-4 w-full h-full"
              >
                <div className="flex flex-col p-4 bg-primary/10 duration-100 lg:hover:scale-105 h-full" style={{ borderRadius: "var(--radius)" }}>
                  <h3 className="text-base font-sans font-semibold py-4 text-left">
                    {card.title}
                  </h3>
                  <p className="text-gray-500 md:text-base text-left">
                    {card.contentText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinFoto03Preview;