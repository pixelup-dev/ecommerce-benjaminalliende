"use client";
import React, { useState } from "react";
import { previewData } from "@/app/config/previewData";

const MaterialesPreview = () => {
  const [showAll, setShowAll] = useState(false);
  
  const materiales = [
    "Material Certificado 1",
    "Material Certificado 2", 
    "Material Certificado 3",
    "Material Certificado 4",
    "Material Certificado 5",
    "Material Certificado 6",
    "Material Certificado 7",
    "Material Certificado 8",
    "Material Certificado 9",
    "Material Certificado 10",
    "Material Certificado 11",
    "Material Certificado 12"
  ];

  // Determinar si hay más de 8 materiales
  const hasMoreThanEight = materiales.length > 8;
  
  // Obtener los materiales a mostrar (todos o solo los primeros 8)
  const displayedMaterials = showAll ? materiales : materiales.slice(0, 8);

  return (
    <section className="w-full bg-white">
      {/* Listado de Materiales */}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-16 text-gray-800">
          {previewData.titulo || "LISTADO MATERIALES CERTIFICADOS"}
        </h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {displayedMaterials.map((material, index) => (
            <div 
              key={index}
              className="bg-gray-50 p-6 shadow-md hover:shadow-xl transition-all duration-300"
              style={{ borderRadius: "var(--radius)" }}
            >
              <p className="text-center text-gray-700 font-medium">
                {material}
              </p>
            </div>
          ))}
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

export default MaterialesPreview;