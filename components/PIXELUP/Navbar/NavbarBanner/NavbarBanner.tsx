/* eslint-disable @next/next/no-img-element */
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
      const bannerId = `${process.env.NEXT_PUBLIC_NAVBARBANNER_ID}`;

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

  // Agregar esta función de scroll suave
  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const offset = 80; // Ajustar según la altura de tu navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      // Cerrar el menú móvil si está abierto
      setIsMenuOpen(false);
    }
  };

  return (
    <div>
      <nav
        className={`absolute w-full z-[1000] transition-all duration-300 font-montserrat bg-transparent`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`text-white`}
              >
                <span className="text-lg font-light tracking-wider font-poppins uppercase">
                  Health Coach
                </span>
                <div
                  className={`text-lg uppercase tracking-[0.3em] text-white/80 mt-[-2px]`}
                >
                  Pepa
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
              {/* Menú desktop */}
              <div className="hidden md:flex space-x-6 text-xs tracking-wider uppercase font-bold">
                <Link
                  href="#inicio"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("inicio");
                  }}
                  className={`text-white hover:opacity-80`}
                >
                  Inicio
                </Link>
                <Link
                  href="#que-es"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("que-es");
                  }}
                  className={`text-white hover:opacity-80`}
                >
                  ¿Qué es?
                </Link>
                <Link
                  href="#planes"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("planes");
                  }}
                  className={`text-white hover:opacity-80`}
                >
                  Servicios
                </Link>
                <Link
                  href="#redes"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("redes");
                  }}
                  className={`text-white hover:opacity-80`}
                >
                  Recetas
                </Link>
                <Link
                  href="#conoceme"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection("conoceme");
                  }}
                  className={`text-white hover:opacity-80`}
                >
                  Conóceme
                </Link>
                <button
                  onClick={() => handleWhatsAppClick("general")}
                  className={`text-white hover:opacity-80`}
                >
                  CONTACTO
                </button>
              </div>

              {/* Iconos sociales */}
              <div className="hidden md:flex items-center gap-4">
                <Link
                  href="https://www.instagram.com/healthcoach_pepa/"
                  target="_blank"
                  className={`text-white hover:opacity-80 transition-opacity`}
                >
                  <FaInstagram size={20} />
                </Link>
                <button
                  onClick={() => handleWhatsAppClick("general")}
                  className={`text-white hover:opacity-80 transition-opacity`}
                >
                  <FaWhatsapp size={20} />
                </button>
              </div>

              {/* Botón de menú móvil */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-2xl"
              >
                <div className="text-white">
                  {isMenuOpen ? "✕" : "☰"}
                </div>
              </button>
            </div>
          </div>

          {/* Menú móvil desplegable */}
          <div
            className={`md:hidden transition-all duration-300 overflow-hidden absolute left-0 right-0 mt-3 z-[999] ${
              isMenuOpen ? "max-h-[300px]" : "max-h-0"
            }`}
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              boxShadow: isMenuOpen
                ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                : "none",
            }}
          >
            <div className="container mx-auto px-6">
              <div className="flex flex-col space-y-4 py-6">
                {/* Links del menú */}
                <div className="flex flex-col space-y-4 text-sm tracking-wider uppercase font-bold text-white">
                  <Link
                    href="#inicio"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("inicio");
                      setIsMenuOpen(false);
                    }}
                    className="hover:text-white/80 transition-colors duration-200"
                  >
                    Inicio
                  </Link>
                  <Link
                    href="#que-es"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("que-es");
                      setIsMenuOpen(false);
                    }}
                    className="hover:text-white/80 transition-colors duration-200"
                  >
                    ¿Qué es?
                  </Link>
                  <Link
                    href="#planes"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("planes");
                      setIsMenuOpen(false);
                    }}
                    className="hover:text-white/80 transition-colors duration-200"
                  >
                    Servicios
                  </Link>
                  <Link
                    href="#redes"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("redes");
                      setIsMenuOpen(false);
                    }}
                    className="hover:text-white/80 transition-colors duration-200"
                  >
                    Recetas
                  </Link>
                  <Link
                    href="#conoceme"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("conoceme");
                      setIsMenuOpen(false);
                    }}
                    className="hover:text-white/80 transition-colors duration-200"
                  >
                    Conóceme
                  </Link>
                  <Link
                    href="#contacto"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("contacto");
                      setIsMenuOpen(false);
                    }}
                    className="hover:text-white/80 transition-colors duration-200"
                  >
                    Contacto
                  </Link>
                </div>

                {/* Separador */}
                <div className="h-px w-full bg-white/20"></div>

                {/* Iconos sociales */}
                <div className="flex items-center gap-6 justify-center pt-2">
                  <Link
                    href="https://www.instagram.com/healthcoach_pepa/"
                    target="_blank"
                    onClick={() => setIsMenuOpen(false)}
                    className="text-white hover:text-white/80 transition-colors"
                  >
                    <FaInstagram size={24} />
                  </Link>
                  <button
                    onClick={() => {
                      handleWhatsAppClick("general");
                      setIsMenuOpen(false);
                    }}
                    className="text-white hover:text-white/80 transition-colors"
                  >
                    <FaWhatsapp size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <section
        id="inicio"
        className="h-screen relative"
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
          <>
            <div className="absolute inset-0">
              <img
                src={bannerData?.images[0]?.mainImage?.url || "/pepa/home.webp"}
                alt="Health Coach Banner"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/10">
              <div className="container mx-auto px-6 h-full flex items-center">
                <div className="max-w-2xl pl-6 xl:pl-0">
                  {/* <span className="text-white/90 text-lg mb-4 block font-light">
                    Encuentra el equilibrio que necesitas
                  </span> */}
                  <h1 className="text-4xl md:text-6xl font-light text-white mb-6 font-poppins ">
                    {bannerData?.images[0]?.title}
                  </h1>
                  {/* Comienza tu camino hacia una vida saludable */}
                  <p className="text-xl text-white/80 mb-8">
                    {/* Encuentra tu equilibrio y bienestar a través de un
                    acompañamiento personalizado */}
                    {bannerData?.images[0]?.landingText}
                  </p>
                  <button
                    onClick={() => handleWhatsAppClick("evaluacion")}
                    className="bg-white text-[#4A6741] px-8 py-3 rounded-full hover:bg-white/90 transition duration-300 shadow-md hover:shadow-lg font-montserrat text-sm tracking-wider uppercase"
                  >
                    {/* Evaluación gratuita */}
                    {bannerData?.images[0]?.buttonText}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
