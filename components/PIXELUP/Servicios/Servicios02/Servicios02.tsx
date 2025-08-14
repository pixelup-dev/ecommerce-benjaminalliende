'use client';
/* eslint-disable @next/next/no-img-element */
import Footer01 from "@/components/PIXELUP/Footer/Footer01/Footer01";
import Navbar02 from "@/components/PIXELUP/Navbar/Navbar02/Navbar02";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import axios from "axios";
import MarqueeTOP from "@/components/PIXELUP/Marquee/MarqueeTop/Marquee";

const servicios = [
  {
    id: 1,
    titulo: "PELUQUERÍA COMPLETA",
    descripcion: [
      "SERVICIO DE PELUQUERÍA COMPLETA PARA RAZAS QUE REQUIEREN CORTE DE PELO CON MAQUINA Y TIJERAS",
      "Baño",
      "Secado",
      "Corte de pelo",
      "Limpieza de oídos",
      "Corte y limado de uñas",
      "Despeje zonas higiénicas",
      "Despeje de almohadillas",
      "Hidratación del manto",
      "Perfume",
    ],
    tiempo: "1:30 Hrs a 2:00 Hrs",
    imagen: "https://picsum.photos/seed/servicio1/800/600",
  },
  {
    id: 2,
    titulo: "BAÑO DE MANTENCIÓN",
    descripcion: [
      "SERVICIO PARA MANTENER EL PELO SIN NUDOS PARA RAZAS QUE REQUIEREN CORTE DE PELO CON MAQUINA",
      "Baño",
      "Secado",
      "Cepillado de mantención para mantener sin nudos el pelaje",
      "Limpieza de oídos",
      "Corte y limado de uñas",
      "Despeje zonas higiénicas",
      "Despeje de almohadillas",
      "Despeje de ojos y oídos",
      "Hidratación del manto",
      "Perfume",
    ],
    tiempo: "1:30 Hrs a 2:00 Hrs",
    imagen: "https://picsum.photos/seed/servicio2/800/600",
  },
  {
    id: 3,
    titulo: "DESLANADO Y/O PERFILADO",
    descripcion: [
      "SERVICIO PARA RAZAS DE DOBLE MANTO Y NO REQUIEREN CORTE DE PELO",
      "Baño",
      "Secado",
      "Deslanado",
      "Perfilado de algunas zonas a tijera",
      "Limpieza de oídos",
      "Corte y limado de uñas",
      "Despeje zonas higiénicas",
      "Despeje de almohadillas",
      "Hidratación del manto",
      "Perfume",
    ],
    tiempo: "1:30 Hrs a 2:00 Hrs",
    imagen: "https://picsum.photos/seed/servicio3/800/600",
  },
  {
    id: 4,
    titulo: "BAÑO PERROS PELO CORTO",
    descripcion: [
      "SERVICIO DE BAÑO PARA RAZAS DE PELO CORTO INCLUYE CEPILLADO PARA PELO MUERTO",
      "Baño",
      "Secado",
      "cepillado especial para botar el pelo",
      "Limpieza de arrugas y pliegues si es necesario",
      "Limpieza de oídos",
      "Corte y limado de uñas",
      "Perfume",
    ],
    tiempo: "1:30 Hrs a 2:00 Hrs",
    imagen: "https://picsum.photos/seed/servicio4/800/600",
  },
];

const Servicios02 = () => {
      const [serviciosData, setServiciosData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        const bannerId = `${process.env.NEXT_PUBLIC_LISTA_SERVICIOS02_ID}`;

        // Obtener el banner completo
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (response.data?.banner?.images?.length > 0) {
          const servicios = response.data.banner.images
            .map((image: any) => {
              try {
                const rawData = image.landingText;
                const serviciosData = JSON.parse(rawData);

                return {
                  id: image.id,
                  titulo: image.title,
                  descripcion: [
                    serviciosData[0] || "SERVICIO PERSONALIZADO",
                    ...serviciosData.slice(1, -3)
                  ],
                  tiempo: serviciosData[serviciosData.length - 3] || "TIEMPO APROXIMADO DE ATENCIÓN DE 1:30 Hrs a 2:00 Hrs",
                  precio: serviciosData[serviciosData.length - 2] || "Desde $25.000",
                  imagen: image.mainImage?.url || "https://picsum.photos/seed/servicio1/800/600"
                };
              } catch (error) {
                console.error("🔴 Error al parsear servicio:", error);
                console.error("🔴 Data que causó el error:", image.landingText);
                return null;
              }
            })
            .filter(Boolean);

          setServiciosData(servicios);
        }
      } catch (error) {
        console.error("❌ Error fetching servicios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();
  }, []);

  return (
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-[600px] rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {serviciosData.map((servicio) => (
                <div
                  key={servicio.id}
                  className="bg-primary/10 overflow-hidden border border-primary/10 hover:shadow-xl transition-all duration-300" style={{ borderRadius: "var(--radius)" }}
                >
                
                  <div className="relative h-64">
                    <Image
                      src={servicio.imagen}
                      alt={servicio.titulo}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h2 className="text-2xl font-light text-white">
                        {servicio.titulo}
                      </h2>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="mb-6">
                      <p className="text-primary font-medium text-sm mb-4">
                        {servicio.descripcion[0]}
                      </p>
{/*                       <div className="text-gray-600">
                        <span className="text-[#81C4BA] font-medium block text-sm">
                          Valor
                        </span>
                        <div className="text-sm mb-4">{servicio.precio}</div>
                      </div> */}
                      <ul className="space-y-2">
                        {servicio.descripcion.slice(1).map((item: string, index: number) => (
                          <li
                            key={index}
                            className="flex items-start gap-3"
                          >
                            <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg
                                className="w-3 h-3 text-primary"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                            <span className="text-gray-600 text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="text-gray-500 text-sm italic mt-4">
                  {servicio.tiempo}
                </p>
                    <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                      <div className="text-gray-600">
                        <span className="text-primary font-medium block text-sm">
                          Valor
                        </span>
                        <span className="text-sm">{servicio.precio}</span>
                      </div>

                      <Link
                        href="https://www.pixelup.cl"
                        className="bg-primary text-white px-6 py-2 hover:bg-primary/80 transition-colors" style={{ borderRadius: "var(--radius)" }}
                      >
                        Reservar
                      </Link>
                    </div>
                    
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
  );
}

export default Servicios02;  
