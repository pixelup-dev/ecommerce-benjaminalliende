"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
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
  textoBoton: string;
  linkBoton: string;
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const SinFoto05: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO05_CONTENTBLOCK || "";
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
    <section className="py-12 bg-white">
      <div className="mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-primary mt-2 mb-4">
            {contentData.epigrafe}
          </h2>
          <p className="text-gray-600 mb-8">
            {contentData.contenido}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Líneas separadoras */}
            <div className="hidden md:block absolute top-1/2 left-1/3 w-px h-16 bg-gray-200 transform -translate-y-1/2"></div>
            <div className="hidden md:block absolute top-1/2 left-2/3 w-px h-16 bg-gray-200 transform -translate-y-1/2"></div>

            {[contentData.box1, contentData.box2, contentData.box3].map((box, index) => (
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
              href={contentData.linkBoton || '#'}
              className="inline-block bg-primary text-white px-6 py-2 text-sm hover:bg-primary/90 transition-colors duration-300"
              style={{ borderRadius: "var(--radius)" }}
            >
              {contentData.textoBoton || 'Conoce más sobre nosotros'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinFoto05;
