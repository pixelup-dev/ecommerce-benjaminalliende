"use client";

import React from "react";

const DestacadosSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto m-8 max-w-6xl relative">
      {/* Título skeleton */}
      <div className="w-64 h-8 bg-gray-200 rounded-lg mx-auto mb-8 animate-pulse" />

      {/* Contenedor del carousel */}
      <div className="relative">
        {/* Grid de productos skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Repetir 4 veces el skeleton de producto */}
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow animate-pulse"
            >
              {/* Imagen del producto */}
              <div className="aspect-square w-full bg-gray-200 rounded-lg mb-4" />

              {/* Título del producto */}
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />

              {/* Precio */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 bg-gray-200 rounded w-24" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>

              {/* Botón de agregar al carrito */}
              <div className="h-10 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>

        {/* Flechas de navegación */}
        <div className="hidden lg:flex absolute inset-y-0 left-0 right-0 items-center justify-between pointer-events-none">
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse -ml-5" />
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse -mr-5" />
        </div>
      </div>

      {/* Dots de navegación */}
      <div className="flex justify-center gap-2 mt-12">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="w-2 h-2 rounded-full bg-gray-200 animate-pulse"
          />
        ))}
      </div>

      {/* Botón "Ir a Tienda" */}
      <div className="mt-6 flex items-center justify-center">
        <div className="w-32 h-10 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
};

export default DestacadosSkeleton;
