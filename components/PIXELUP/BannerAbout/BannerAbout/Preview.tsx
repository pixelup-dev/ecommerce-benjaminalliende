"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const BannerAboutPreview = () => {
  return (
    <section className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          {previewData.titulo || "Banner Principal"}
        </h2>
        <p className="text-lg md:text-xl mb-8 opacity-90">
          {previewData.texto || "Banner principal con llamada a la acción y diseño atractivo."}
        </p>
        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
          {previewData.epigrafe || "Ver Más"}
        </button>
      </div>
    </section>
  );
};

export default BannerAboutPreview;