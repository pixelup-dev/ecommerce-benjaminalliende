"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Option {
  id: string;
  text: string;
  price: string;
  icon: string;
}

interface ContentData {
  title1: string;
  title2: string;
  options1: Option[];
  options2: Option[];
  note: string;
}

interface ApiResponse {
  code: number;
  message: string;
  contentBlock: {
    title: string;
    contentText: string;
  };
}

const SinFoto14: React.FC = () => {
  const ContentBlockId = process.env.NEXT_PUBLIC_SINFOTO14_CONTENTBLOCK || "";
  const [contentData, setContentData] = useState<ContentData | null>(null);

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return IconComponent ? <IconComponent size={20} /> : null;
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
    <section className="py-20 bg-gray-50">
      <div className="mx-auto px-4 max-w-7xl">
        <div className="bg-white p-8 rounded shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Primera sección */}
            <div className="bg-gray-50 p-6 rounded">
              <h4 className="text-xl font-semibold mb-4 text-primary">
                {contentData.title1}
              </h4>
              <ul className="space-y-2">
                {contentData.options1.map((option) => (
                  <li key={option.id} className="flex justify-between items-center p-3 bg-white rounded shadow-sm">
                    <div className="flex items-center space-x-3">
                      {renderIcon(option.icon)}
                      <span>{option.text}</span>
                    </div>
                    <span className="font-bold text-primary">{option.price}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Segunda sección */}
            <div className="bg-gray-50 p-6 rounded">
              <h4 className="text-xl font-semibold mb-4 text-primary">
                {contentData.title2}
              </h4>
              <ul className="space-y-2">
                {contentData.options2.map((option) => (
                  <li key={option.id} className="flex justify-between items-center p-3 bg-white rounded shadow-sm">
                    <div className="flex items-center space-x-3">
                      {renderIcon(option.icon)}
                      <span>{option.text}</span>
                    </div>
                    <span className="font-bold text-primary">{option.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Nota */}
        {contentData.note && (
          <div className="mt-12 text-center">
            <div className="inline-block bg-blue-50 p-4 rounded">
              <p className="text-gray-700">
                <span className="font-semibold text-primary">Nota:</span>{" "}
                {contentData.note}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default SinFoto14;
