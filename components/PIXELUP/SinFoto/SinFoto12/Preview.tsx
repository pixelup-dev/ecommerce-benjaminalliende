"use client";
import React from "react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { previewData } from "@/app/config/previewData";

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
  contentText: string;
  icon: string;
}

interface ContentData {
  epigrafe: string;
  titulo: string;
  contenido: string;
  box1: BoxContent;
  box2: BoxContent;
  box3: BoxContent;
  box4: BoxContent;
  box5: BoxContent;
  textoBoton: string;
  linkBoton: string;
}

const SinFoto12Preview = () => {
  // Función para renderizar el icono dinámicamente
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="text-[96px] text-primary" />;
  };

  // Datos de ejemplo para el preview
  const contentData: ContentData = {
    epigrafe: previewData.epigrafe || "NUESTROS SERVICIOS",
    titulo: previewData.titulo || "Título Principal",
    contenido: previewData.texto || "Descripción detallada de nuestros servicios y cómo podemos ayudarte a alcanzar tus objetivos.",
    box1: {
      title: "Servicio 1",
      contentText: "Descripción del primer servicio importante",
      icon: "Heart"
    },
    box2: {
      title: "Servicio 2", 
      contentText: "Descripción del segundo servicio importante",
      icon: "Star"
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
    },
    box5: {
      title: "Servicio 5",
      contentText: "Descripción del quinto servicio importante",
      icon: "Award"
    },
    textoBoton: "Conoce más sobre nosotros",
    linkBoton: "#"
  };

  return (
    <section className="relative py-20 bg-primary text-white overflow-hidden">
      {/* Imagen de fondo con efecto parallax */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed z-0 opacity-20"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
          backgroundAttachment: "fixed",
        }}
      ></div>

      {/* Overlay con gradiente para mejorar la legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 z-0"></div>

      <div className="relative z-10 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1 bg-primary text-white text-sm uppercase tracking-wider rounded mb-4">
            {contentData.epigrafe}
          </span>
          <h2 className="text-5xl font-bold mb-6 font-lilita-one">
            {contentData.titulo}
          </h2>
          <div className="h-1 w-32 bg-secondary mx-auto mb-8"></div>
          <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
            {contentData.contenido}
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row justify-between items-center md:items-start space-y-12 md:space-y-0 md:space-x-4">
          {/* Línea conectora */}
          <div
            className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-primary/50 transform -translate-y-1/2 z-0"
            style={{ width: "calc(100% - 10rem)", left: "4rem" }}
          ></div>

          {[contentData.box1, contentData.box2, contentData.box3, contentData.box4, contentData.box5].map((box, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center relative z-10 w-full md:w-1/5 px-4 group"
            >
              <div className="w-24 h-24 bg-gray-50 rounded flex items-center justify-center text-4xl mb-6 shadow-xl">
                {renderIcon(box.icon)}
              </div>

              <h3 className="text-xl mb-3 font-lilita-one group-hover:text-primary transition-colors">
                {box.title}
              </h3>
              <p className="text-white/90 text-sm md:text-xs leading-tight">
                {box.contentText}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href={contentData.linkBoton || '#'}
            className="inline-block px-8 py-4 bg-primary hover:bg-primary/80 text-white rounded transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {contentData.textoBoton || 'Texto del botón'}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SinFoto12Preview;