"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero08Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  return (
    <section className="pt-16 pb-24 bg-white flex justify-center items-center">
      <div className="mx-8 px-4 max-w-[1200px]">
        <div className="grid xl:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-primary font-sans text-xs uppercase tracking-widest block">
              {previewData.epigrafe || "Bienvenidos"}
            </span>
            <h1 className="text-4xl font-serif text-[#2C2C2C]">
              {previewData.titulo || "Tu espacio de trabajo"}
            </h1>
            <div className="text-lg text-gray-600 leading-snug">
              {previewData.texto || "Este es un texto descriptivo para el hero principal que explica el contenido de la sección."}
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <Link
                href="#"
                className="bg-primary text-white px-8 py-4 rounded-md hover:bg-primary/90 transition-colors text-center"
                style={{ borderRadius: "var(--radius)" }}
              >
                Agenda tu hora
              </Link>
              <a
                href="tel:+56912345678"
                className="border-2 border-primary text-primary px-8 py-4 rounded-md hover:bg-primary hover:text-white transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              >
                +569 1234 5678
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-primary font-serif text-xl">
                  15+
                </p>
                <p className="text-gray-600">
                  profesionales
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-primary font-serif text-xl">
                  100%
                </p>
                <p className="text-gray-600">
                  satisfacción
                </p>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            <img
              src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
              alt="Hero Image"
              className="rounded-lg shadow-xl max-h-[500px] object-cover w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-lg shadow-lg">
              <p className="text-primary font-serif">Contacto</p>
              <a
                href="mailto:contacto@pixelup.cl"
                className="text-gray-600 hover:text-primary transition-colors"
              >
                contacto@pixelup.cl
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero08Preview;