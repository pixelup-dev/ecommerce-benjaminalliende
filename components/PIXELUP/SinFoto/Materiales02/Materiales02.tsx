"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Material {
  icon: string;
  text: string;
}

function Materiales02() {
  const [loading, setLoading] = useState(false);
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [showAll, setShowAll] = useState(false);

  const renderIcon = (iconName: string) => {
    const IconComponent = Icons[iconName as keyof typeof Icons] as LucideIcon;
    return IconComponent ? <IconComponent className="w-4 h-4 text-primary" /> : <Icons.Package className="w-4 h-4 text-[#d97706]" />;
  };

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = process.env.NEXT_PUBLIC_MATERIALES02_CONTENTBLOCK;
      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      const bannerImage = productTypeResponse.data.contentBlock;
      setBannerData(bannerImage);
      
      // Procesar el contentText para crear el listado de materiales
      if (bannerImage?.contentText) {
        const materials = bannerImage.contentText
          .split('\n')
          .filter((line: string) => line.trim() !== '')
          .map((line: string) => {
            const [icon, text] = line.split('|');
            return {
              icon: icon || "Package",
              text: text.trim()
            };
          });
        setMaterialsList(materials);
      }
    } catch (error) {
      console.error("Error al obtener materiales:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
  }, []);

  // Determinar si hay más de 8 materiales
  const hasMoreThanEight = materialsList.length > 8;
  
  // Obtener los materiales a mostrar (todos o solo los primeros 8)
  const displayedMaterials = showAll ? materialsList : materialsList.slice(0, 8);

  return (
    <section className="w-full bg-gray-50 pb-4">
      <div className="mx-auto px-4 ">
        <div className="mb-16">
          <h3 className="text-2xl font-bold mb-8 text-center text-primary">
          Procedimientos Disponibles

          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {displayedMaterials.map((material, index) => (
              <div key={index} className="inline-flex items-center gap-2 px-4 py-2 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100" style={{ borderRadius: "var(--radius)" }}>
                <div className="bg-blue-50 p-1.5 "
                style={{ borderRadius: "var(--radius)" }}

                >
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
}

export default Materiales02;
