/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  servicios: string[];
  tiempo: string;
  precio: string;
  destacada: boolean;
  mainImage?: {
    name: string;
    type: string;
    size: number;
    data: string;
    url?: string;
  };
}

interface TituloServicio {
  epigrafe: string;
  titulo: string;
  parrafo: string;
}

// Agregar nueva interfaz para la imagen
interface ImagenGaleria {
  name: string;
  type: string;
  size: number;
  data: string;
}

const Servicios01 = () => {
  const [servicios, setServicios] = React.useState<Servicio[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tituloServicio, setTituloServicio] = useState<TituloServicio>({
    epigrafe: "Servicios personalizados",
    titulo: "Cuidado excepcional a la medida",
    parrafo:
      "Entendemos que cada mascota es única y adaptamos nuestros servicios a sus necesidades específicas.",
  });
  const [imagenesGaleria, setImagenesGaleria] = useState<string[]>([]);

  const fetchServicios = async () => {
    try {
      const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS01_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (response.data?.banner?.images?.length > 0) {
        const serviciosData = response.data.banner.images
          .map((image: any) => {
            try {
              const rawData = image.landingText;
              const serviciosData = JSON.parse(rawData);

              const processedData = {
                id: image.id,
                nombre: image.title,
                descripcion: serviciosData[0] || "SERVICIO PERSONALIZADO",
                servicios: serviciosData.slice(1, -3),
                tiempo: serviciosData[serviciosData.length - 3] || "TIEMPO APROXIMADO DE ATENCIÓN DE 1:30 Hrs a 2:00 Hrs",
                precio: serviciosData[serviciosData.length - 2] || "Desde $25.000",
                destacada: serviciosData[serviciosData.length - 1] || false,
                mainImage: image.mainImage
              };

              return processedData;
            } catch (error) {
              console.error("🔴 Error al parsear servicio:", error);
              console.error("🔴 Data que causó el error:", image.landingText);
              return null;
            }
          })
          .filter(Boolean)
          .filter((servicio: Servicio | null) => servicio?.destacada);

        setServicios(serviciosData);
      }
    } catch (error) {
      console.error("❌ Error fetching servicios:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTituloServicio = async () => {
    try {
      const bannerId = `${process.env.NEXT_PUBLIC_TITULO_SERVICIOS_ID}`;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      if (response.data) {
        const titulo = response.data.banner;
        setTituloServicio({
          epigrafe: titulo.title,
          titulo: titulo.buttonText,
          parrafo: titulo.landingText,
        });
      }

      // Fetch imágenes
      const imagenesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_TITULO_SERVICIOS_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (imagenesResponse.data?.banner?.images) {
        setImagenesGaleria(
          imagenesResponse.data.banner.images.map(
            (img: any) => img.mainImage?.url || ""
          )
        );
      }
    } catch (error) {
      console.error("Error fetching titulo servicios:", error);
    }
  };

  const subirImagenGaleria = async (imagen: File) => {
    try {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const base64Data = e.target?.result as string;

        const nuevaImagen = {
          title: "Imagen Galería",
          landingText: "Imagen de servicios",
          buttonText: "Ver más",
          buttonLink: "#",
          orderNumber: imagenesGaleria.length + 1,
          mainImageLink: "",
          mainImage: {
            name: imagen.name,
            type: imagen.type,
            size: imagen.size,
            data: base64Data,
          },
        };

        const bannerId = `${process.env.NEXT_PUBLIC_TITULO_SERVICIOS_IMGID}`;

        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          nuevaImagen
        );

        // Recargar las imágenes después de subir una nueva
        await fetchTituloServicio();
      };

      reader.readAsDataURL(imagen);
    } catch (error) {
      console.error("Error al subir imagen:", error);
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = "56991079268";
    const message = "Hola! Me gustaría reservar una hora para mi mascota";
    
    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  useEffect(() => {
    fetchServicios();
    fetchTituloServicio();
  }, []);

  if (loading) {
    return (
      <section className="py-24 bg-[#81C4BA]/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            {/* Skeleton loading UI */}
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg p-6"
                >
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="h-4 bg-gray-200 rounded"
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="servicios" className="py-24 bg-gray-100">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-primary uppercase tracking-wider font-bold text-sm mb-4 block">
            Servicios
          </span>
          <h2 className="text-4xl font-bold text-primary/80 mb-4">
          Nuestros Servicios
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
          Soluciones integrales de salud para ti y tu familia
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {servicios.map((servicio, index) => (
            <div
              key={servicio.id}
              className="bg-white overflow-hidden group hover:shadow-xl transition-all duration-300 hover:scale-105" style={{ borderRadius: "var(--radius)" }}
            >
              <div className="relative h-64">
                <img
                  src={servicio.mainImage?.url}
                  alt={servicio.nombre}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent flex items-end">
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {servicio.nombre}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-gray-600 mb-6">{servicio.descripcion}</p>
                <div className="space-y-3">
                  {servicio.servicios.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center text-primary"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                      <span className="font-medium">{item}</span>
                    </div>
                  ))}
                </div>
{/*                 <p className="text-gray-500 text-sm italic mt-4">
                  {servicio.tiempo}
                </p> */}
                <div className="mt-6">
                  <Link
                    href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || ""}
                    className="mt-8 w-full bg-primary text-white px-4 py-3 hover:bg-primary/80 transition duration-300 flex items-center justify-center font-medium" style={{ borderRadius: "var(--radius)" }}
                  >
                    <FaWhatsapp className="mr-2" />
                    Consultar
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Servicios01;  
