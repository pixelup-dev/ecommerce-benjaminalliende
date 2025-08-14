"use client";
import React from "react";

const About01: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Sobre Nosotros
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-4">
            Somos una empresa comprometida con la excelencia y la innovación. 
            Nuestra misión es proporcionar soluciones de alta calidad que satisfagan 
            las necesidades de nuestros clientes.
          </p>
          <p className="text-gray-600 mb-4">
            Con años de experiencia en el sector, hemos desarrollado una reputación 
            sólida basada en la confianza, la transparencia y los resultados excepcionales.
          </p>
          <p className="text-gray-600">
            Nuestro equipo de profesionales altamente capacitados trabaja incansablemente 
            para ofrecer el mejor servicio y las soluciones más innovadoras del mercado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About01;
