"use client";
import React, { useState } from "react";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import { previewData } from "@/app/config/previewData";

interface Material {
  icon: string;
  text: string;
}

const Materiales02Preview = () => {
  const [showAll, setShowAll] = useState(false);
  
  const materiales: Material[] = [
    { icon: "Package", text: "Procedimiento 1" },
    { icon: "Shield", text: "Procedimiento 2" },
    { icon: "CheckCircle", text: "Procedimiento 3" },
    { icon: "Star", text: "Procedimiento 4" },
    { icon: "Heart", text: "Procedimiento 5" },
    { icon: "Zap", text: "Procedimiento 6" },
    { icon: "Award", text: "Procedimiento 7" },
    { icon: "Target", text: "Procedimiento 8" },
    { icon: "TrendingUp", text: "Procedimiento 9" },
    { icon: "Lightbulb", text: "Procedimiento 10" },
    { icon: "Users", text: "Procedimiento 11" },
    { icon: "Settings", text: "Procedimiento 12" }
  ];

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return IconComponent ? <IconComponent className="w-4 h-4 text-primary" /> : <Icons.Package className="w-4 h-4 text-[#d97706]" />;
  };

  // Determinar si hay más de 8 materiales
  const hasMoreThanEight = materiales.length > 8;
  
  // Obtener los materiales a mostrar (todos o solo los primeros 8)
  const displayedMaterials = showAll ? materiales : materiales.slice(0, 8);

  return (
    <section className="w-full bg-gray-50 pb-4">
      <div className="mx-auto px-4">
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center text-primary">
            {previewData.titulo || "Procedimientos Disponibles"}
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {displayedMaterials.map((material, index) => (
              <div key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100" style={{ borderRadius: "var(--radius)" }}>
                <div className="bg-blue-50 p-1.5" style={{ borderRadius: "var(--radius)" }}>
                  {renderIcon(material.icon)}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {material.text}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Botón para mostrar más/menos */}
        {hasMoreThanEight && (
          <div className="flex justify-center mt-8">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="bg-primary text-white px-6 py-3 shadow-md hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
              style={{ borderRadius: "var(--radius)" }}
            >
              {showAll ? (
                <>
                  <span>Mostrar menos</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                </>
              ) : (
                <>
                  <span>Ver todos los materiales</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Materiales02Preview;