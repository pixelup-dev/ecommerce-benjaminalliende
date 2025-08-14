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
  box4: BoxContent; // Agregar box4
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const SinFoto10: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO10_CONTENTBLOCK || "";
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

export default SinFoto10;
