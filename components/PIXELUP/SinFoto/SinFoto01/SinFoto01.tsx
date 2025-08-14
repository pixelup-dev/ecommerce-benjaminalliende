/* eslint-disable @next/next/no-img-element */
"use client"
import React, { useState, useEffect, useRef } from "react";
import { FaWhatsapp, FaInstagram } from "react-icons/fa";
import Link from "next/link";
import axios from "axios";

interface Recetario {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  imagen: string;
}
// Agregamos los datos de los recetarios
const recetarios: Recetario[] = [
  {
    id: "basico",
    titulo: "Recetario Básico",
    descripcion:
      "Recetas saludables y fáciles para comenzar tu viaje hacia una alimentación consciente.",
    precio: 19990,
    imagen: "https://picsum.photos/seed/receta1/800/600",
  },
  {
    id: "intermedio",
    titulo: "Recetario Intermedio",
    descripcion:
      "Recetas más elaboradas para quienes ya tienen experiencia en la cocina saludable.",
    precio: 24990,
    imagen: "https://picsum.photos/seed/receta2/800/600",
  },
  {
    id: "vegetariano",
    titulo: "Recetario Vegetariano",
    descripcion:
      "Deliciosas recetas basadas en plantas, llenas de sabor y nutrientes.",
    precio: 22990,
    imagen: "https://picsum.photos/seed/receta3/800/600",
  },
  {
    id: "singluten",
    titulo: "Sin Gluten",
    descripcion:
      "Alternativas deliciosas y seguras para personas con sensibilidad al gluten.",
    precio: 21990,
    imagen: "https://picsum.photos/seed/receta4/800/600",
  },
  {
    id: "desayunos",
    titulo: "Desayunos Saludables",
    descripcion:
      "Comienza el día con energía usando estas nutritivas opciones de desayuno.",
    precio: 18990,
    imagen: "https://picsum.photos/seed/receta5/800/600",
  },
  {
    id: "postres",
    titulo: "Postres Saludables",
    descripcion:
      "Dulces placeres sin culpa, endulzados naturalmente y llenos de nutrientes.",
    precio: 20990,
    imagen: "https://picsum.photos/seed/receta6/800/600",
  },
  {
    id: "snacks",
    titulo: "Snacks Nutritivos",
    descripcion:
      "Opciones saludables para picar entre comidas y mantener la energía.",
    precio: 17990,
    imagen: "https://picsum.photos/seed/receta7/800/600",
  },
  {
    id: "batch",
    titulo: "Batch Cooking",
    descripcion:
      "Prepara comidas para toda la semana de manera eficiente y saludable.",
    precio: 23990,
    imagen: "https://picsum.photos/seed/receta8/800/600",
  },
  {
    id: "proteico",
    titulo: "Alto en Proteínas",
    descripcion:
      "Recetas enfocadas en aumentar tu ingesta de proteínas de forma saludable.",
    precio: 22990,
    imagen: "https://picsum.photos/seed/receta9/800/600",
  },
  {
    id: "mediterraneo",
    titulo: "Dieta Mediterránea",
    descripcion:
      "Descubre los beneficios de una de las dietas más saludables del mundo.",
    precio: 25990,
    imagen: "https://picsum.photos/seed/receta10/800/600",
  },
];

export default function NavbarBanner() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mostrarRecetarios, setMostrarRecetarios] = useState(false);
  const recetariosRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Agregar este useEffect para manejar el scroll
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setIsScrolled(window.scrollY > 50);
      }
    };

    // Verificar si estamos en el cliente antes de agregar el event listener
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll);
      // Llamar handleScroll inicialmente para establecer el estado correcto
      handleScroll();
    }

    // Cleanup function
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  // Agregar la función para obtener el banner
  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_SINFOTO01_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      setBannerData(response.data.banner);
      console.log("BannerData:", response.data.banner);
    } catch (error) {
      console.error("Error al obtener el banner:", error);
    } finally {
      setLoading(false);
    }
  };

  // Agregar useEffect para cargar el banner
  useEffect(() => {
    fetchBannerHome();
  }, []);

  const handleWhatsAppClick = (type: string, recetarioId?: string) => {
    const phoneNumber = "15819947712";
    let message = "";

    switch (type) {
      case "consulta":
        message = "Hola! Me gustaría agendar una consulta gratuita contigo";
        break;
      case "sesion":
        message = "Hola! Me interesa agendar una sesión de Health Coaching";
        break;
      case "recetario":
        const recetario = recetarios.find((r) => r.id === recetarioId);
        message = `Hola! Me gustaría obtener información sobre el recetario "${recetario?.titulo}"`;
        break;
      case "recetarioPlus":
        message = "Hola! Me interesa agendar una clase de Recetario Plus";
        break;
      case "general":
      default:
        message =
          "Hola! Me gustaría obtener más información sobre tus servicios";
        break;
      case "evaluacion":
        message = "Hola! Me gustaría agendar una evaluación gratuita  ";
        break;
    }

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  return (
    <div>
      <section
        id="inicio"
        className="py-20 bg-white"
      >
        {loading ? (
          // Skeleton loader
          <div className="w-full h-full bg-gray-200 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/10">
              <div className="container mx-auto px-6 h-full flex items-center">
                <div className="max-w-2xl pl-6 xl:pl-0">
                  <div className="h-8 bg-gray-300 rounded w-3/4 mb-6"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-300 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-kalam text-primary mb-8 text-center">
                <span className="text-sm uppercase tracking-[0.3em] block mb-3 text-primary font-montserrat">
                  {bannerData?.images[0]?.buttonLink}
                </span>
                {bannerData?.images[0]?.title}
              </h2>
              <div className="text-center mb-12 max-w-3xl mx-auto">
                <div
                  className="text-black text-lg leading-relaxed editortexto mb-12"
                  dangerouslySetInnerHTML={{
                    __html: bannerData?.images[0]?.landingText,
                  }}
                />
                <button
                  onClick={() => handleWhatsAppClick("consulta")}
                  className="bg-primary text-white px-8 py-3 rounded-full hover:bg-primary/90 transition duration-300 shadow-md hover:shadow-lg font-montserrat text-sm tracking-wider uppercase"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {bannerData?.images[0]?.buttonText}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}