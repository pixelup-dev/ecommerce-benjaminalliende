"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const DestacadosCatPreview = () => {
  const destacados = previewDataExtended.categorias.slice(0, 4);

  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {previewData.titulo || "Productos Destacados"}
          </h2>
          <p className="text-lg text-gray-600">
            {previewData.texto || "Los productos más populares de nuestra tienda."}
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destacados.map((producto, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
              <img
                src={producto.mainImage.url}
                alt={producto.title}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />
              <h3 className="font-semibold mb-2">{producto.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{producto.landingText}</p>
              <button className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-primary/90 transition-colors">
                Ver Producto
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DestacadosCatPreview;