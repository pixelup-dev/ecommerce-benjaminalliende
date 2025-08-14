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

const SinFoto13Preview = () => {
  // Función para renderizar iconos dinámicamente
  const renderIcon = (iconName: string, className: string = "text-2xl text-white") => {
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
      contentText: "Descripción del primer servicio que ofrecemos con calidad y profesionalismo.",
      icon: "Sprout"
    },
    box2: {
      title: "Servicio 2", 
      contentText: "Descripción del segundo servicio que ofrecemos con calidad y profesionalismo.",
      icon: "Star"
    },
    box3: {
      title: "Servicio 3",
      contentText: "Descripción del tercer servicio que ofrecemos con calidad y profesionalismo.",
      icon: "ShieldCheck"
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-oldStandard text-3xl md:text-4xl text-gray-800">
            {contentData.epigrafe}
          </h2>
          <p className="font-poppins text-gray-600 text-lg">
            {contentData.contenido}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Box 1 */}
          <div className="text-center relative">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-primary rounded-full shadow-md flex items-center justify-center">
                {renderIcon(contentData.box1.icon || "Sprout", "text-2xl text-white")}
              </div>
            </div>
            <h3 className="font-oldStandard text-xl mb-2">
              {contentData.box1.title}
            </h3>
            <p className="text-sm font-poppins text-gray-600">
              {contentData.box1.contentText}
            </p>
            {/* Línea separadora vertical */}
            <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 h-20 w-px bg-gray-300"></div>
          </div>

          {/* Box 2 */}
          <div className="text-center relative">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-primary rounded-full shadow-md flex items-center justify-center">
                {renderIcon(contentData.box2.icon || "Star", "text-2xl text-white")}
              </div>
            </div>
            <h3 className="font-oldStandard text-xl mb-2">
              {contentData.box2.title}
            </h3>
            <p className="text-sm font-poppins text-gray-600">
              {contentData.box2.contentText}
            </p>
            {/* Línea separadora vertical */}
            <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 h-20 w-px bg-gray-300"></div>
            {/* Línea separadora horizontal (móvil) */}
            <div className="block md:hidden w-2/3 h-px bg-gray-300 mx-auto mt-6 mb-6"></div>
          </div>

          {/* Box 3 */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 bg-primary rounded-full shadow-md flex items-center justify-center">
                {renderIcon(contentData.box3.icon || "ShieldCheck", "text-2xl text-white")}
              </div>
            </div>
            <h3 className="font-oldStandard text-xl mb-2">
              {contentData.box3.title}
            </h3>
            <p className="text-sm font-poppins text-gray-600">
              {contentData.box3.contentText}
            </p>
            {/* Línea separadora horizontal (móvil) */}
            <div className="block md:hidden w-2/3 h-px bg-gray-300 mx-auto mt-6 mb-6"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinFoto13Preview;