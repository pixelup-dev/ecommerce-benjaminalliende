"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
  contentText: string;
}

interface ContentData {
  epigrafe: string;
  titulo: string;
  descripcion: string;
  botonTexto: string;
  botonLink: string;
  porcentaje: string;
  textoPorcentaje: string;
  tiempoTitulo: string;
  tiempoTexto: string;
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const SinFoto06: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO06_CONTENTBLOCK || "";
  const [contentData, setContentData] = useState<ContentData | null>(null);

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
    <section className="py-12 sm:py-20 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12 items-start">
          <div className="relative col-span-1 lg:col-span-2">
            <div className="relative bg-white p-6 sm:p-8 shadow-lg" style={{ borderRadius: "var(--radius)" }}>
              <div className="space-y-4">
                <div className="border-b pb-4 sm:pb-6">
                  <img
                    src="/img/pixelup.png"
                    alt="Logo Mercado Público"
                    className="h-16 sm:h-20 object-contain"
                  />
                </div>
                <div className="space-y-2">
                  <span className="text-primary font-semibold text-sm sm:text-base block">
                    {contentData.epigrafe}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-primary">
                    {contentData.titulo}
                  </h2>
                </div>
                <span className="text-gray-600 leading-snug text-base sm:text-lg">
                  {contentData.descripcion}
                </span>
                <span className="flex">
                <Link
                  href={contentData.botonLink}  
                  className="inline-flex items-center space-x-2 bg-primary text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors text-sm sm:text-base"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <span>{contentData.botonTexto}</span>
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                </span>
              </div>
            </div>
          </div>
          <div className="relative col-span-1">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white shadow-lg p-4 sm:p-6" style={{ borderRadius: "var(--radius)" }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">
                  {contentData.tiempoTitulo}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {contentData.tiempoTexto}
                </p>
              </div>
              <div className="bg-white shadow-lg p-4 sm:p-6 " style={{ borderRadius: "var(--radius)" }}>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center mb-3 sm:mb-4">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5 sm:mb-2 text-sm sm:text-base">
                  {contentData.porcentaje}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  {contentData.textoPorcentaje}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinFoto06;
