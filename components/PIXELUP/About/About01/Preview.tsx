"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const AboutUsPreview = () => {
  return (
    <section className="w-full bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {previewData.titulo || "Sobre Nosotros"}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {previewData.texto || "Conoce más sobre nuestra empresa y nuestra misión."}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Nuestra Historia</h3>
            <p className="text-gray-700 mb-4">
              Fundada con la visión de proporcionar productos de calidad, nuestra empresa 
              ha crecido hasta convertirse en un referente en el mercado.
            </p>
            <p className="text-gray-700">
              Nos dedicamos a ofrecer la mejor experiencia a nuestros clientes, 
              con productos innovadores y un servicio excepcional.
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Nuestros Valores</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Calidad en todo lo que hacemos
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Atención al cliente
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Innovación constante
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                Responsabilidad social
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsPreview;