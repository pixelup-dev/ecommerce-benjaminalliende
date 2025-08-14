/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BannerImage } from "./types";
import { useLogo } from "@/context/LogoContext";

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
        sunday: "Domingos: Cerrado",
      },
      contact: {
        phone: "+56 9 6236 5458",
        email: "hola@pixelup.cl",
      },
    },
  });

  const [images, setImages] = useState<BannerImage[]>([]);
  const { logo } = useLogo();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch content block data
        const contentResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_UBICACION05_CONTENTBLOCK}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (contentResponse.data?.contentBlock) {
          const contentData = contentResponse.data.contentBlock;
          try {
            const parsedData = JSON.parse(contentData.contentText);
            setContent({
              title: contentData.title || "Pixel Up",
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
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION05_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
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
        <div className="mx-4 max-w-[1400px] px-4">
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
    <section className="py-12 bg-gray-50">
      <div className="mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center max-w-[90%] mx-auto px-4">
            <div className="flex-grow h-px bg-gray-200"></div>
            <h2 className="font-oldStandard text-2xl md:text-3xl text-gray-900 px-4">
              {content.title}
            </h2>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
          <h4 className="font-poppins text-md text-primary uppercase tracking-wider -mt-2">
            {content.additionalData.subtitle}
          </h4>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
            <div className="lg:col-span-4 flex flex-col justify-center order-2 lg:order-1">
              <div className="flex justify-center w-full">
                <img
                  src={
                    logo?.mainImage?.url ||
                    process.env.NEXT_PUBLIC_LOGO ||
                    "Logo Principal"
                  }
                  alt="Vivero Principal"
                  className="w-72 h-auto px-4 py-2 object-cover hover:scale-105 transition-all duration-700"
                />
              </div>
              <div 
                className="text-gray-600 mb-6 mt-2 leading-tight text-center"
                dangerouslySetInnerHTML={{ __html: content.contentText }}
              />

              <div className="flex justify-center w-full">
                <a
                  href={process.env.NEXT_PUBLIC_WHATSAPP_LINK || ""}
                  className="inline-block px-6 py-2 bg-primary text-white text-sm font-poppins hover:bg-primary transition-colors rounded-md w-fit"
                >
                  {content.additionalData.secondaryTitle}
                </a>
              </div>
            </div>

            <div className="lg:col-span-8 order-1 lg:order-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-[360px]">
                <div className="col-span-2 row-span-2 overflow-hidden rounded-lg shadow-md">
                  <img
                    src={images.find(img => img.orderNumber === 1)?.mainImage?.url || "/exclusiveplants/1.webp"}
                    alt="Imagen Principal"
                    className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                  />
                </div>
                
                {images
                  .filter(img => img.orderNumber > 1)
                  .sort((a, b) => a.orderNumber - b.orderNumber)
                  .map((image) => (
                    <div key={image.id} className="overflow-hidden rounded-lg shadow-md">
                      <img
                        src={image.mainImage?.url}
                        alt={`Imagen ${image.orderNumber}`}
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                      />
                    </div>
                  ))}
                
                {Array.from({ length: 4 - images.filter(img => img.orderNumber > 1).length }).map((_, index) => {
                  const defaultIndex = images.filter(img => img.orderNumber > 1).length + index + 2;
                  return (
                    <div key={`default-${defaultIndex}`} className="overflow-hidden rounded-lg shadow-md">
                      <img
                        src={`/exclusiveplants/${defaultIndex}.webp`}
                        alt={`Imagen ${defaultIndex}`}
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-700"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
              <div className="md:col-span-2 p-8 bg-white">
                <h3 className="font-oldStandard text-2xl text-primary mb-8 relative inline-flex items-center">
                  <span className="relative">
                    Visítanos en nuestro Vivero
                    <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-primary"></span>
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 left-0 h-0.5 w-full bg-primary transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></div>
                    <div className="p-3">
                      <div className="mb-2 flex justify-between items-center">
                        <h4 className="font-oldStandard text-xl text-gray-800 items-center flex gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-white bg-primary rounded-full p-1"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          Horarios
                        </h4>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Lun-Vie:</span>
                          <span className="text-primary font-medium">
                            {content.additionalData.schedule.weekdays}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Sáb:</span>
                          <span className="text-primary font-medium">
                            {content.additionalData.schedule.saturday}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Dom:</span>
                          <span className="text-primary font-medium">
                            {content.additionalData.schedule.sunday}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md">
                    <div className="absolute top-0 left-0 h-0.5 w-full bg-primary transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></div>
                    <div className="p-3">
                      <div className="mb-2 flex justify-between items-center">
                        <h4 className="font-oldStandard text-xl text-gray-800 items-center flex gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-white bg-primary rounded-full p-1"
                          >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          Ubicación
                        </h4>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {content.additionalData.address.street}
                        <br />
                        {content.additionalData.address.city}
                      </div>
                      <a
                        href="https://maps.app.goo.gl/dfEtpsKAbXvYuXto9"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline inline-flex items-center"
                      >
                        Cómo llegar
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="ml-1"
                        >
                          <path d="M5 12h14" />
                          <path d="m12 5 7 7-7 7" />
                        </svg>
                      </a>
                    </div>
                  </div>

                  <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md md:col-span-2">
                    <div className="absolute top-0 left-0 h-0.5 w-full bg-primary transform origin-left scale-x-0 transition-transform group-hover:scale-x-100"></div>
                    <div className="p-3">
                      <div className="mb-2 flex justify-between items-center">
                        <h4 className="font-oldStandard text-xl text-gray-800 items-center flex gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-6 w-6 text-white bg-primary rounded-full p-1"
                          >
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          Contáctanos
                        </h4>
                      </div>
                      <div className="flex flex-col text-sm space-y-2">
                        <span className="text-gray-600">
                          Teléfono:{" "}
                          <a
                            href={`tel:${content.additionalData.contact.phone}`}
                            className="text-primary hover:underline"
                          >
                            {content.additionalData.contact.phone}
                          </a>
                        </span>
                        <span className="text-gray-600">
                          Email:{" "}
                          <a
                            href={`mailto:${content.additionalData.contact.email}`}
                            className="text-primary hover:underline"
                          >
                            {content.additionalData.contact.email}
                          </a>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-1 h-[300px] md:h-auto relative overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3353.532159947116!2d-71.22277952816947!3d-32.80466206889163!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9689cd39887f08c5%3A0xb862f85d98f305c2!2sExclusive%20Plants%20spa!5e0!3m2!1ses!2scl!4v1747750601919!5m2!1ses!2scl"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
