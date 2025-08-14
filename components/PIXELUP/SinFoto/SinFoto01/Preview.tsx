"use client";
import React from "react";
import { FaWhatsapp } from "react-icons/fa";
import { previewData } from "@/app/config/previewData";

const SinFoto01Preview = () => {
  const handleWhatsAppClick = () => {
    const phoneNumber = "15819947712";
    const message = "Hola! Me gustaría agendar una consulta gratuita contigo";
    
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div>
      <section id="inicio" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-kalam text-primary mb-8 text-center">
              <span className="text-sm uppercase tracking-[0.3em] block mb-3 text-primary font-montserrat">
                {previewData.epigrafe || "CONSULTA GRATUITA"}
              </span>
              {previewData.titulo || "Título Principal del Contenido"}
            </h2>
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <div className="text-black text-lg leading-relaxed editortexto mb-12">
                {previewData.texto || "Este es un texto descriptivo que explica el contenido principal de la sección. Puede incluir información importante sobre los servicios o productos ofrecidos."}
              </div>
              <div
              
                className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition duration-300 shadow-md hover:shadow-lg font-montserrat text-sm tracking-wider uppercase"
                style={{ borderRadius: "var(--radius)" }}
              >
                <FaWhatsapp className="inline mr-2" />
                { "Agendar Consulta"}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SinFoto01Preview;