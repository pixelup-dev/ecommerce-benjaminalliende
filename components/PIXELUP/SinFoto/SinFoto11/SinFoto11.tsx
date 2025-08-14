"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import * as LucideIcons from "lucide-react";

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
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
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const SinFoto11: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO11_CONTENTBLOCK || "";
  const [contentData, setContentData] = useState<ContentData | null>(null);

  // Función para renderizar el icono dinámicamente
  const renderIcon = (iconName: string) => {
    const IconComponent = (LucideIcons as any)[iconName];
    if (!IconComponent) return null;
    return <IconComponent className="h-10 w-10 text-primary" />;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get<ApiResponse>( 
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${ContentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (response.data.code === 0 && response.data.contentBlock) {
          try {
            const parsedData = JSON.parse(response.data.contentBlock.contentText);
            setContentData(parsedData);
          } catch (error) {
            console.error("Error al parsear JSON:", error);
          }
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  }, [ContentBlockId]);

  if (!contentData) {
    return null;
  }

  return (
    <section className="pt-20 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto relative">
      {/* Hoja decorativa */}


      {/* Título Principal de la Sección - CENTRADO CON EPÍGRAFE Y BAJADA */}
      <div className="text-center mb-6 relative">
        <p className="text-base font-semibold text-primary uppercase tracking-wider mb-2">
          {contentData.epigrafe}
        </p>
        <h2 className="text-4xl text-primary/70 mb-4 font-lilita-one">
          {contentData.titulo}
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
          {contentData.contenido}
        </p>
        <div className="h-1 w-24 bg-primary mx-auto"></div>
      </div>

      {/* Fila de Iconos/Puntos Clave */}
      <div className="flex flex-col md:flex-row justify-around items-center text-center mb-6 space-y-4 md:space-y-0 z-30">
        {[contentData.box1, contentData.box2, contentData.box3, contentData.box4].map((box, index) => (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center p-4">
              <div className="text-3xl text-primary mb-2">
                {renderIcon(box.icon)}
              </div>
              <h4 className="text-gray-600 text-sm text-center">
                {box.title}
              </h4>
            </div>
            {index < 3 && (
              <>
                <div className="hidden md:block h-12 w-px bg-gray-300"></div>
                <div className="block md:hidden w-24 h-px bg-gray-300"></div>
              </>
            )}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default SinFoto11;
