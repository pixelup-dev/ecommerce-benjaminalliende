"use client";
import React from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { previewData } from "@/app/config/previewData";

interface BoxContent {
  title: string;
  contentText: string;
  icon?: string;
}

const SinFoto05Preview = () => {
  const boxes: BoxContent[] = [
    {
      title: "Característica 1",
      contentText: "Descripción de la primera característica importante del servicio.",
      icon: "Circle"
    },
    {
      title: "Característica 2", 
      contentText: "Descripción de la segunda característica importante del servicio.",
      icon: "CheckCircle"
    },
    {
      title: "Característica 3",
      contentText: "Descripción de la tercera característica importante del servicio.",
      icon: "Star"
    }
  ];

  // Función para renderizar iconos dinámicamente
  const renderIcon = (iconName: string, className: string = "text-2xl text-primary") => {
    if (!iconName) return null;
    
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return null;
  };

  return (
    <section className="py-12 bg-white">
      <div className="mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-primary mt-2 mb-4">
            {previewData.epigrafe || "NUESTROS SERVICIOS"}
          </h2>
          <p className="text-gray-600 mb-8">
            {previewData.texto || "Descripción general de los servicios ofrecidos y las características principales que nos distinguen en el mercado."}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Líneas separadoras */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-px h-16 bg-gray-200 transform -translate-y-1/2"></div>
            <div className="hidden md:block absolute top-1/2 left-2/3 w-px h-16 bg-gray-200 transform -translate-y-1/2"></div>

            {boxes.map((box, index) => (
              <div key={index} className="flex flex-col items-center text-center p-4">
                <div className="bg-primary/10 rounded-full p-3 mb-4">
                  {renderIcon(box.icon || "Circle", "text-2xl text-primary")}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {box.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {box.contentText}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="#"
              className="inline-block bg-primary text-white px-6 py-2 text-sm hover:bg-primary/90 transition-colors duration-300"
              style={{ borderRadius: "var(--radius)" }}
            >
              Conoce más sobre nosotros
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinFoto05Preview;