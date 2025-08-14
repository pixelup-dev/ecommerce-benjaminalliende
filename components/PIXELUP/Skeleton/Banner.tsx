"use client";

import React from "react";

const BannerLoader: React.FC = () => {
  return (
    <section className="relative h-[80vh] md:h-[80vh] overflow-hidden">
      <div className="absolute inset-0 bg-gray-200 animate-pulse">
        {/* Overlay gradient simulado */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 via-gray-200 to-transparent" />
      </div>

      {/* Contenido del skeleton */}
      <div className="relative h-full z-10">
        <div className="h-full max-w-7xl mx-auto px-4">
          <div className="flex flex-col justify-center h-full max-w-2xl items-start text-left space-y-6">
            {/* Skeleton para el epígrafe */}
            <div className="h-4 w-32 bg-gray-300 rounded animate-pulse" />

            {/* Skeleton para el título */}
            <div className="space-y-3">
              <div className="h-10 w-full bg-gray-300 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-gray-300 rounded animate-pulse" />
            </div>

            {/* Skeleton para el texto descriptivo */}
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-5/6 bg-gray-300 rounded animate-pulse" />
              <div className="h-4 w-4/6 bg-gray-300 rounded animate-pulse" />
            </div>

            {/* Skeleton para los botones */}
            <div className="flex gap-4 pt-4">
              <div className="h-12 w-32 bg-gray-300 rounded animate-pulse" />
              <div className="h-12 w-32 bg-gray-300 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton para los botones de navegación */}
      <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between items-center px-4">
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full animate-pulse" />
        <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-300 rounded-full animate-pulse" />
      </div>
    </section>
  );
};

export default BannerLoader; 