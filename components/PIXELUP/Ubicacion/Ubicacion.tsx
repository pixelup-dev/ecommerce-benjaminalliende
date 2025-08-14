/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BannerImage } from "./types";

export default function Ubicacion() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({
    title: "Pixel Up",
    contentText: "",
    additionalData: {
      subtitle: "Nuestra ubicación",
      description: "",
      secondaryTitle: "Visítanos",
      address: {
        street: "Calle, Comuna",
        city: "Santiago, Chile",
      },
      schedule: {
        weekdays: "Lunes a Viernes: 10:00 - 20:00",
        saturday: "Sábados: 10:00 - 18:00",
      },
      contact: {
        phone: "+56 9 6236 5458",
        email: "hola@pixelup.cl",
      },
    },
  });

  const [images, setImages] = useState<BannerImage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch content block data
        const contentResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_UBICACION_CONTENTBLOCK}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (contentResponse.data?.contentBlock) {
          const contentData = contentResponse.data.contentBlock;
          try {
            const parsedData = JSON.parse(contentData.contentText);
            setContent({
              title: contentData.title || "La Fuente de Belleza",
              contentText: parsedData.contentText || "",
              additionalData:
                parsedData.additionalData || content.additionalData,
            });
          } catch (e) {
            console.error("Error parsing content data:", e);
          }
        }

        // Fetch banner images
        const imagesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (imagesResponse.data?.banner?.images) {
          const sortedImages = imagesResponse.data.banner.images.sort(
            (a: any, b: any) => a.orderNumber - b.orderNumber
          );
          setImages(sortedImages);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white flex justify-center items-center">
        <div className="mx-4 max-w-[1200px] px-4">
          <div className="animate-pulse">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-4" />
              <div className="h-12 bg-gray-200 rounded w-64 mx-auto mb-4" />
              <div className="h-20 bg-gray-200 rounded max-w-lg mx-auto" />
            </div>
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 rounded"
                  />
                ))}
              </div>
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-40 bg-gray-200 rounded" />
                  <div className="h-40 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-6 lg:space-y-8">
            <span className="text-primary/70 text-sm uppercase tracking-widest">
              {content.additionalData.subtitle}
            </span>
            <h2 className="text-3xl lg:text-4xl font-light text-primary">
              {content.title}
            </h2>
            <div 
              className="text-gray-600 text-sm lg:text-base"
              dangerouslySetInnerHTML={{ __html: content.contentText }}
            />

            <div className="grid gap-4 lg:gap-6">
              <div className="bg-white p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: "var(--radius)" }}>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
                    <svg    
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1 text-sm lg:text-base">Dirección</h3>
                    <p className="text-gray-600 text-sm lg:text-base">{content.additionalData.address.street}</p>
                    <p className="text-gray-600 text-sm lg:text-base">{content.additionalData.address.city}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: "var(--radius)" }}>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1 text-sm lg:text-base">Horario de Atención</h3>
                    <p className="text-gray-600 text-sm lg:text-base">{content.additionalData.schedule.weekdays}</p>
                    <p className="text-gray-600 text-sm lg:text-base">{content.additionalData.schedule.saturday}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: "var(--radius)" }}>
                <div className="flex items-start gap-3 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-primary/10 rounded-xl">
                    <svg
                      className="w-6 h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-medium text-primary mb-1 text-sm lg:text-base">Contacto</h3>
                    <p className="text-gray-600 text-sm lg:text-base">{content.additionalData.contact.phone}</p>
                    <p className="text-gray-600 text-sm lg:text-base">{content.additionalData.contact.email}</p>
                  </div>
                </div>
              </div>
            </div>
{/* 
            <a
              href={`https://www.conectasitios.cl/pagina_sucursal/peluqueriacanina&petshop/MzA= `}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#5B488E] text-white px-6 lg:px-8 py-3 lg:py-4 rounded hover:bg-[#1B9C84] transition-all text-center text-sm lg:text-base"
            >
              Agenda tu Hora
            </a> */}
          </div>

          <div className="relative mt-8 lg:mt-0">
            {images.length > 0 && (
              <>
                <img
                  src={images[0].mainImage.url}
                  alt={images[0].title}
                    className="rounded shadow-xl w-full h-[300px] lg:h-full object-cover" style={{ borderRadius: "var(--radius)" }}
                />
                <div className="absolute -bottom-4 right-4 lg:-bottom-8 lg:-right-8 bg-white p-4 lg:p-6 shadow-lg" style={{ borderRadius: "var(--radius)" }}>
                  <div className="flex items-center gap-2 lg:gap-3">    
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                        />
                      </svg>
                    <div>
                      <p className="text-xs lg:text-sm text-gray-500">Calificación</p>
                      <p className="text-primary text-sm lg:text-base font-medium">4.9 de 5 estrellas</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
