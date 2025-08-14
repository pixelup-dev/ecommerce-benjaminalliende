"use client";
import React from "react";
import * as LucideIcons from "lucide-react";
import { previewData } from "@/app/config/previewData";

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
  contentText: string;
  icon?: string;
}

interface ContentData {
  epigrafe: string;
  titulo: string;
  contenido: string;
  box1: BoxContent;
  box2: BoxContent;
  box3: BoxContent;
}

const SinFoto09Preview = () => {
  // Función para renderizar iconos dinámicamente
  const renderIcon = (iconName: string, className: string = "w-6 h-6") => {
    if (!iconName) return null;
    
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return null;
  };

  // Datos de ejemplo para el preview
  const contentData: ContentData = {
    epigrafe: previewData.epigrafe || "NUESTROS SERVICIOS",
    titulo: previewData.titulo || "Título Principal",
    contenido: previewData.texto || "Descripción detallada de nuestros servicios y cómo podemos ayudarte a alcanzar tus objetivos.",
    box1: {
      title: "Servicio 1",
      contentText: "Descripción del primer servicio que ofrecemos con detalles importantes.",
      icon: "Circle"
    },
    box2: {
      title: "Servicio 2", 
      contentText: "Descripción del segundo servicio con características destacadas.",
      icon: "Star"
    },
    box3: {
      title: "Servicio 3",
      contentText: "Descripción del tercer servicio y sus beneficios principales.",
      icon: "Heart"
    }
  };

  return (
    <section className="px-4 text-center mx-4 py-20">
      <p className="text-lg text-gray-600 font-kalam mb-2">
        {contentData.epigrafe}
      </p>
      <h2 className="text-4xl font-bold text-gray-800 mb-4 font-kalam">
        {contentData.titulo}
      </h2>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
        {contentData.contenido}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {[contentData.box1, contentData.box2, contentData.box3].map((box, index) => (
          <div key={index} className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-2 shadow-md text-primary">
                {renderIcon(box.icon || "Circle", "w-6 h-6")}
              </div>
            </div>
            <h3 className="text-[16px] font-semibold mb-2">
              {box.title}
            </h3>
            <p className="text-gray-600 text-[14px] leading-6">
              {box.contentText}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SinFoto09Preview;