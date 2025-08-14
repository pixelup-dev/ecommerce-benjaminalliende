"use client";
import React from "react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { previewData } from "@/app/config/previewData";

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

const SinFoto14Preview = () => {
  // Datos de ejemplo para el preview
  const contentData: ContentData = {
    title1: "Servicios Básicos",
    title2: "Servicios Premium",
    options1: [
      { id: "1", text: "Consulta inicial", price: "$50", icon: "UserCheck" },
      { id: "2", text: "Evaluación básica", price: "$75", icon: "ClipboardList" },
      { id: "3", text: "Seguimiento mensual", price: "$100", icon: "Calendar" }
    ],
    options2: [
      { id: "4", text: "Consulta especializada", price: "$120", icon: "Star" },
      { id: "5", text: "Evaluación completa", price: "$150", icon: "FileText" },
      { id: "6", text: "Seguimiento semanal", price: "$200", icon: "Clock" }
    ],
    note: "Los precios pueden variar según la complejidad del caso y la ubicación."
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return IconComponent ? <IconComponent size={20} /> : null;
  };

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

export default SinFoto14Preview;