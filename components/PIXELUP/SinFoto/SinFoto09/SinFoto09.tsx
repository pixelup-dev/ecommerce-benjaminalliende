"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as LucideIcons from "lucide-react";

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
  contentText: string;
  icon?: string; // Agregar campo para el icono
}

interface ContentData {
  epigrafe: string;
  titulo: string;
  contenido: string;
  box1: BoxContent;
  box2: BoxContent;
  box3: BoxContent;
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const SinFoto09: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO09_CONTENTBLOCK || "";
  const [contentData, setContentData] = useState<ContentData | null>(null);

  // Función para renderizar iconos dinámicamente
  const renderIcon = (iconName: string, className: string = "text-2xl text-primary") => {
    if (!iconName) return null;
    
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent className={className} />;
    }
    return null;
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
            <h3 className="text-[16px] font-semibold  mb-2">
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

export default SinFoto09;
