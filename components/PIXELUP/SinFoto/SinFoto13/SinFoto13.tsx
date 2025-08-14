"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { FaStore, FaHandshake, FaShieldAlt } from "react-icons/fa";
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

const SinFoto13: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO13_CONTENTBLOCK || "";
  const [contentData, setContentData] = useState<ContentData | null>(null);

  // Función para renderizar iconos dinámicamente
  const renderIcon = (iconName: string, className: string = "text-2xl text-white") => {
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

export default SinFoto13;
