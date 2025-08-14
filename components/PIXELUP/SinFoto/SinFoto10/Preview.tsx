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
  box4: BoxContent;
}

const SinFoto10Preview = () => {
  // Función para renderizar iconos dinámicamente
  const renderIcon = (iconName: string, className: string = "text-2xl text-primary") => {
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
    contenido: previewData.texto || "Descripción detallada de nuestros servicios y cómo podemos ayudarte.",
    box1: {
      title: "Servicio 1",
      contentText: "Descripción del primer servicio importante",
      icon: "Star"
    },
    box2: {
      title: "Servicio 2", 
      contentText: "Descripción del segundo servicio importante",
      icon: "Heart"
    },
    box3: {
      title: "Servicio 3",
      contentText: "Descripción del tercer servicio importante", 
      icon: "CheckCircle"
    },
    box4: {
      title: "Servicio 4",
      contentText: "Descripción del cuarto servicio importante",
      icon: "Shield"
    }
  };

  return (
    <div className="py-16 px-4 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <p className="text-[16px] font-medium text-primary mb-1">
          {contentData.epigrafe}
        </p>
        <h2 className="text-5xl font-oswald text-stone-900 mb-2">
          {contentData.titulo}
        </h2>
        <p className="text-stone-600 text-sm max-w-2xl mx-auto">
          {contentData.contenido}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[contentData.box1, contentData.box2, contentData.box3, contentData.box4].map((box, index) => (
          <div key={index} className="flex flex-col items-center text-center p-4 bg-gray-50">
            <div className="mb-2 bg-primary p-3 rounded-full">
              {renderIcon(box.icon || "Circle", "w-6 h-6 text-white")}
            </div>
            <h3 className="text-xl font-oswald text-stone-900 mb-1">
              {box.title}
            </h3>
            <p className="text-stone-600 text-xs">
              {box.contentText}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SinFoto10Preview;