"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Hero05Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 1);

  // Datos adicionales simulados para el preview
  const additionalData = {
    subtitle: "Peluquería canina de especialidad",
    newServiceTitle: "Spa Day Canino",
    newServiceSubtitle: "NUEVO",
    newServiceDescription: "Incluye baño relajante y masaje",
    primaryButtonText: "Reserva tu cita",
    secondaryButtonText: "Nuestros servicios",
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-4">
            <div>
              <span className="text-primary/70 text-sm uppercase tracking-widest mb-4 block">
                {additionalData.subtitle}
              </span>
              <h1 className="text-4xl font-light text-primary leading-12">
                {previewData.titulo || "Título Principal del Hero"}
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              {previewData.texto || "Este es un texto descriptivo para el hero principal que explica el contenido de la sección."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="pixelup.cl"
                className="bg-primary text-white px-8 py-4 rounded hover:bg-primary/90 transition-all"
                style={{ borderRadius: "var(--radius)" }}
              >
                {additionalData.primaryButtonText}
              </Link>
              <Link
                href="/servicios"
                className="border-2 border-primary text-primary px-8 py-4 rounded hover:bg-primary hover:text-white transition-all"
                style={{ borderRadius: "var(--radius)" }}
              >
                {additionalData.secondaryButtonText}
              </Link>
            </div>
          </div>

          <div className="relative">
            <img
              src={previewCategories[0]?.mainImage.url || "/img/placeholder.webp"}
              alt={previewData.titulo || "Hero Image"}
              className="shadow-xl w-full h-auto object-cover"
              style={{ borderRadius: "var(--radius)" }}
            />
            <div className="absolute -bottom-8 left-4 md:-left-8 bg-white p-4 md:p-6 shadow-lg max-w-[180px] md:max-w-[200px]" style={{ borderRadius: "var(--radius)" }}>
              <span className="text-primary/70 text-xs md:text-sm font-medium">
                {additionalData.newServiceSubtitle}
              </span>
              <h3 className="text-primary text-sm md:text-base font-medium mt-1 md:mt-2">
                {additionalData.newServiceTitle}
              </h3>
              <p className="text-gray-500 text-xs md:text-sm mt-1">
                {additionalData.newServiceDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero05Preview;