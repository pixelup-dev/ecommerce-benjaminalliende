/* eslint-disable @next/next/no-img-element */

"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import axios from "axios";

const Hero18: React.FC = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [structuredContent, setStructuredContent] = useState<any>({
    epigrafe: "",
    titulo: "",
    parrafo: "",
    linkBoton: "",
    textoBoton: "",
    cards: [
      { titulo: "", texto: "" },
      { titulo: "", texto: "" },
      { titulo: "", texto: "" },
      { titulo: "", texto: "" }
    ]
  });

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_HERO18_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO18_IMGID}`;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const bannerImage = productTypeResponse.data.banner;
      setBannerData(bannerImage.images);

      // Parsear el contenido estructurado del landingText
      if (bannerImage.images && bannerImage.images[0] && bannerImage.images[0].landingText) {
        try {
          const parsed = JSON.parse(bannerImage.images[0].landingText);
          if (parsed.epigrafe || parsed.titulo || parsed.parrafo || parsed.cards) {
            setStructuredContent(parsed);
          }
        } catch (e) {
          // Si no es JSON válido, usar como texto plano en el párrafo
          setStructuredContent({
            ...structuredContent,
            parrafo: bannerImage.images[0].landingText
          });
        }
      }
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <section
      className="py-20 bg-gray-100"
      id="metodologia"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="mb-10 text-center">
          <span className="inline-block mb-2 text-primary font-semibold text-xl uppercase">
            {structuredContent.epigrafe || "Conoce mi enfoque"}
          </span>
          <h2 className="text-4xl max-w-3xl mx-auto md:text-5xl uppercase font-ubuntu font-bold text-dark mb-4 leading-tight">
            {structuredContent.titulo || "Conoce mi enfoque"}
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
            {structuredContent.parrafo || "Te escucho con atención, evalúo tu historia, tus hábitos, tus emociones para ayudarte a identificar el origen de tus síntomas, no solo a silenciarlos."}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-12 mb-10">
          {/* Listado de características */}
          <div className="flex-1 space-y-6">
            {structuredContent.cards.map((card: any, index: number) => (
              <div key={index} className="bg-white p-6 mb-4 shadow flex items-center min-h-[100px]" style={{ borderRadius: "var(--radius)" }}>
                <div>
                  <h4 className="text-xl font-bold text-dark mb-1">
                    {card.titulo || `Card ${index + 1}`}
                  </h4>
                  <p className="text-gray-600 text-[15px] leading-tight">
                    {card.texto || `Texto de la card ${index + 1}`}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Imagen al lado */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-h-[600px] overflow-hidden shadow-xl" style={{ borderRadius: "var(--radius)" }}>
              <img
                src={bannerData?.[0]?.mainImage?.url || "/pixelup.webp"}
                alt="Imagen Hero 18"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            href={structuredContent.linkBoton || "#"}
            target="_blank"
            className="bg-primary hover:scale-105 text-white font-bold px-8 py-4  shadow-lg transition inline-block"
            style={{ borderRadius: "var(--radius)" }}
          >
            {structuredContent.textoBoton || "Agenda tu consulta personalizada"}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero18;
