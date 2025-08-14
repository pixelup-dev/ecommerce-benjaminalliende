"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

// Definir interfaces para el tipado
interface BoxContent {
  title: string;
  contentText: string;
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

const SinFoto: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO02_CONTENTBLOCK || "";
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
    <section className="py-16 bg-white">
      <div className="mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {/* Separadores verticales */}
            <div className="hidden lg:block absolute left-1/4 top-4 bottom-4 w-px bg-primary"></div>
          <div className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px bg-primary"></div>
          <div className="hidden lg:block absolute left-3/4 top-4 bottom-4 w-px bg-primary"></div>

          {[contentData.box1, contentData.box2, contentData.box3, contentData.box4].map((box, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors" style={{ borderRadius: "var(--radius)" }}>
              <div className="bg-primary/10 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-7 w-7 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {index === 0 && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  )}
                  {index === 1 && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                  {index === 2 && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                    />
                  )}
                  {index === 3 && (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  )}
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-1">{box.title}</h3>
              <p className="text-gray-600 text-sm">{box.contentText}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SinFoto;
