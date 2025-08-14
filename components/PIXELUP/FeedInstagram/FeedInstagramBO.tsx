"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import "./quill-custom.css";

interface Post {
  id: string;
  nombre: string; // URL de Instagram
}

interface InstagramThumbnail {
  url: string;
  className?: string;
}

const InstagramEmbed = ({ url }: { url: string }) => (
  <iframe
    src={`${url}embed`}
    className="instagram-media"
    width="100%"
    height="650"
    frameBorder="0"
    scrolling="no"
  ></iframe>
);

const InstagramThumbnail = ({ url, className = "" }: InstagramThumbnail) => {
  return (
    <div className={`relative w-full aspect-square ${className}`}>
      <iframe
        src={`${url}embed`}
        className="w-full h-full"
        frameBorder="0"
        scrolling="no"
      ></iframe>
    </div>
  );
};

const FeedInstagramBO: React.FC = () => {
  const [testimonios, setTestimonios] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showPreview, setShowPreview] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);
  const [nuevoTestimonio, setNuevoTestimonio] = useState({
    nombre: "",
    texto: "",
  });
  const [isClient, setIsClient] = useState(false);
  const [windowWidth, setWindowWidth] = useState(328);
  const [isMobile, setIsMobile] = useState(true);
  const [visiblePosts, setVisiblePosts] = useState(1);

  useEffect(() => {
    fetchTestimonios();
    setIsLoaded(true);
    const updateVisibleCount = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setVisibleCount(3); // desktop
      } else if (window.matchMedia("(min-width: 640px)").matches) {
        setVisibleCount(2); // tablet
      } else {
        setVisibleCount(1); // mobile
      }
    };

    updateVisibleCount();
    window.addEventListener("resize", updateVisibleCount);
    return () => window.removeEventListener("resize", updateVisibleCount);
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + visibleCount;
      return nextIndex < testimonios.length ? nextIndex : prevIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - visibleCount;
      return nextIndex < 0
        ? Math.max(testimonios.length - visibleCount, 0)
        : nextIndex;
    });
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index * visibleCount);
  };

  const getTestimoniosToShow = () => {
    const testimoniosToShow = [];
    for (
      let i = 0;
      i < visibleCount && currentIndex + i < testimonios.length;
      i++
    ) {
      testimoniosToShow.push(testimonios[currentIndex + i]);
    }
    return testimoniosToShow;
  };

  const totalSlides = Math.ceil(testimonios.length / visibleCount);

  const fetchTestimonios = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = `${process.env.NEXT_PUBLIC_FEEDINSTAGRAM_CONTENTBLOCK}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const postsData = JSON.parse(
        response.data.contentBlock.contentText || "[]"
      );
      setTestimonios(postsData);
    } catch (error) {
      console.error("Error al obtener los posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setWindowWidth(window.innerWidth);
      setVisiblePosts(window.innerWidth < 768 ? 1 : 3);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const limpiarURLInstagram = (url: string): string => {
    try {
      // Crear un objeto URL para manipular la URL fácilmente
      const urlObj = new URL(url);

      // Dividir el pathname en partes
      const partes = urlObj.pathname.split("/").filter((part) => part);

      // Si tenemos suficientes partes y encontramos 'p' o 'reel'
      if (partes.length >= 2) {
        const tipoContenido = partes.find(
          (part) => part === "p" || part === "reel"
        );
        const idContenido = partes[partes.length - 1];

        if (tipoContenido && idContenido) {
          return `https://www.instagram.com/${tipoContenido}/${idContenido}/`;
        }
      }

      return url; // Devolver la URL original si no se puede procesar
    } catch (error) {
      console.error("Error al procesar la URL:", error);
      return url; // Devolver la URL original si hay un error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = `${process.env.NEXT_PUBLIC_FEEDINSTAGRAM_CONTENTBLOCK}`;

      // Limpiar la URL antes de guardarla
      const urlLimpia = limpiarURLInstagram(nuevoTestimonio.nombre);

      // Crear el nuevo testimonio con la URL limpia
      const nuevoTestimonioData = {
        id: Date.now().toString(),
        nombre: urlLimpia,
        texto: nuevoTestimonio.texto,
      };

      // Combinar el nuevo testimonio con los existentes
      const testimoniosActualizados = [...testimonios, nuevoTestimonioData];

      // Enviar la actualización con todos los testimonios
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "Testimonios",
          contentText: JSON.stringify(testimoniosActualizados), // Enviamos el array actualizado
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/api/v1/content-blocks/${contentBlockId}`,
        }),
      });

      fetchTestimonios();
      setNuevoTestimonio({ nombre: "", texto: "" });
    } catch (error) {
      console.error("Error al agregar el testimonio:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTestimonio = async (testimonioId: string) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = `${process.env.NEXT_PUBLIC_FEEDINSTAGRAM_CONTENTBLOCK}`;

      // Primero obtenemos los testimonios actuales
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Parseamos los testimonios actuales
      const currentTestimonios = JSON.parse(
        response.data.contentBlock.contentText || "[]"
      );

      // Filtramos el testimonio a eliminar
      const updatedTestimonios = currentTestimonios.filter(
        (t: Post) => t.id !== testimonioId
      );

      // Actualizamos con los testimonios restantes
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "Testimonios",
          contentText: JSON.stringify(updatedTestimonios),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchTestimonios();
    } catch (error) {
      console.error("Error al eliminar el testimonio:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPreview) {
      console.log("Testimonios en vista previa:", testimonios);
    }
  }, [showPreview, testimonios]);

  if (loading) {
    return <Loader />;
  }

  return (
    <section className="w-full mx-auto">
      <div className="bg-white p-4 mb-8">
        {/*         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
          >
            {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa"}
          </button>
        </div> */}

        {showPreview && (
          <section className="py-20 bg-[#F5F7F2]">
            <div className="mx-auto px-6">
              <h2 className="text-4xl font-kalam text-[#4A6741] mb-12 text-center">
                <span className="text-sm uppercase tracking-[0.3em] block mb-3 text-[#8BA888] font-montserrat">
                  Social
                </span>
                Sígueme en Redes Sociales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {testimonios.slice(0, visiblePosts).map((post) => (
                  <div
                    key={post.id}
                    className="flex justify-center"
                  >
                    {isClient && <InstagramEmbed url={post.nombre} />}
                  </div>
                ))}
              </div>

              {/* Botón Cargar Más */}
              {visiblePosts < testimonios.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() =>
                      setVisiblePosts((prev) =>
                        Math.min(prev + (isMobile ? 1 : 3), testimonios.length)
                      )
                    }
                    className="inline-flex items-center px-8 py-3 bg-[#6B8E4E]/10 text-[#4A6741] rounded-full hover:bg-[#6B8E4E]/20 transition duration-300 group"
                  >
                    <span className="font-montserrat text-sm tracking-wider">
                      {isMobile ? "Ver más" : "Cargar más posts"}
                    </span>
                    <span className="ml-2 transform group-hover:translate-y-1 transition-transform">
                      ↓
                    </span>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Formulario simplificado */}
        <form
          onSubmit={handleSubmit}
          className="mb-8"
        >
          <div className="space-y-4 mt-3">
            <div>
              <h3 className="font-normal text-primary">
                Link Publicación <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                value={nuevoTestimonio.nombre}
                onChange={(e) =>
                  setNuevoTestimonio({
                    ...nuevoTestimonio,
                    nombre: limpiarURLInstagram(e.target.value),
                  })
                }
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 rounded-md"
                placeholder="https://www.instagram.com/p/..."
                required
              />
            </div>
            <button
              type="submit"
              className="text-white shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded flex-wrap mt-6"
            >
              Agregar Publicación
            </button>
          </div>
        </form>

        {/* Lista de posts existentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testimonios.map((post) => (
            <div
              key={post.id}
              className="relative group bg-gray-50 rounded-lg overflow-hidden"
            >
              <InstagramThumbnail
                url={post.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                <button
                  onClick={() => handleDeleteTestimonio(post.id)}
                  className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500 truncate">{post.nombre}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeedInstagramBO;
