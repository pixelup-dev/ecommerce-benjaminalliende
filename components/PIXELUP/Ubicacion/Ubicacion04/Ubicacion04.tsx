/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { BannerImage } from "./types";

export default function Ubicacion() {
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState<{ url: string } | null>(null);
  const [content, setContent] = useState({
    title: "SABORES DE COREA",
    subtitle: "EXPERIENCIA CULINARIA",
    description: "",
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
      principalTitle: "Un ambiente limpio y acogedor para disfrutar",
    },
  });

  const [images, setImages] = useState<BannerImage[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch content block data
        const contentResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_UBICACION04_CONTENTBLOCK}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (contentResponse.data?.contentBlock) {
          const contentData = contentResponse.data.contentBlock;
          try {
            const parsedData = JSON.parse(contentData.contentText);
            setContent({
              title: parsedData.title || "SABORES DE COREA",
              subtitle: parsedData.subtitle || "EXPERIENCIA CULINARIA",
              description: parsedData.description || "",
              additionalData: parsedData.additionalData || content.additionalData,
            });
          } catch (e) {
            console.error("Error parsing content data:", e);
          }
        }

        // Fetch banner images
        const imagesResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION04_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (imagesResponse.data?.banner?.images) {
          const sortedImages = imagesResponse.data.banner.images.sort(
            (a: any, b: any) => a.orderNumber - b.orderNumber
          );
          setImages(sortedImages);
        }

        // Fetch modal image
        const modalResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_MODALUBICACION04_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (modalResponse.data?.banner?.images && modalResponse.data.banner.images.length > 0) {
          const modalImageData = modalResponse.data.banner.images[0];
          setModalImage({
            url: modalImageData.mainImage?.url || ''
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Agregar manejador de tecla ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
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
                  <div key={i} className="h-24 bg-gray-200 rounded" />
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
    <section className="bg-gray-50 py-20">
      <div className="mx-auto px-4">
        <div className="text-center mb-10">
          <h4 className="font-montserrat text-md text-primary uppercase tracking-wider mb-1">
            {content.subtitle}
          </h4>
          <div className="flex items-center justify-center max-w-[90%] mx-auto px-4">
            <div className="flex-grow h-px bg-gray-200"></div>
            <h2 className="font-poiret text-2xl md:text-3xl text-gray-900 px-4">
              {content.title}
            </h2>
            <div className="flex-grow h-px bg-gray-200"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="flex flex-col justify-center">
            <h3 className="font-montserrat text-3xl text-primary uppercase tracking-wider mb-1">
              {content.additionalData.principalTitle}
            </h3>
            <div 
              className="text-gray-600 mb-6"
              dangerouslySetInnerHTML={{ __html: content.description }}
            />

            <div className="bg-white p-6 rounded-sm mb-6 shadow-sm">
              <div className="flex items-start mb-4">
                <div className="bg-primary p-2 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-montserrat text-md text-dark tracking-wider mb-1">
                    Restaurante en local
                  </h4>
                  <p className="text-sm text-gray-600">
                    {content.additionalData.address.street}
                    <br />
                    {content.additionalData.address.city}
                  </p>
                </div>
              </div>

              {/*   <div className="flex items-start mb-4">
                <div className="bg-[#ffc4c7] p-2 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                  </svg>
                </div>
              <div>
                  <h4 className="font-montserrat text-md text-dark tracking-wider mb-1">
                    Productos para llevar
                  </h4>
                  <p className="text-sm text-gray-600">
                    Encuentra ingredientes auténticos para cocinar en tu hogar
                  </p>
                </div> 
              </div>*/}

              <div className="flex items-start">
                <div className="bg-primary p-2 rounded-full mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 text-white"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="font-montserrat text-md text-dark tracking-wider mb-1">
                    Horario de atención
                  </h4>
                  <p className="text-sm text-gray-600">
                    {content.additionalData.schedule.weekdays}
                    <br />
                    {content.additionalData.schedule.saturday}
                    <br />
                    {content.additionalData.schedule.sunday}
                  </p>
                </div>
              </div>
            </div>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setIsModalOpen(true);
              }}
              className="inline-block px-8 py-3 bg-primary text-white text-sm font-medium hover:bg-primary/80 transition-colors w-fit"
              style={{ borderRadius: "var(--radius)" }}
            >
              VER NUESTRO MENÚ
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 aspect-video overflow-hidden">
              <img
                src={images[0]?.mainImage?.url || "/lynch/local/2.webp"}
                alt="Restaurante Casa Lynch"
                className="w-full h-full object-cover hover:scale-105 transition-transform"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            {images
              .slice(1, 3)
              .map((image) => (
                <div key={image.id} className="aspect-square overflow-hidden">
                  <img
                    src={image.mainImage?.url}
                    alt={`Imagen ${image.orderNumber}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                    style={{ borderRadius: "var(--radius)" }}
                  />
                </div>
              ))}
            {Array.from({ length: 2 - images.slice(1).length }).map((_, index) => {
              const defaultIndex = images.slice(1).length + index + 2;
              return (
                <div key={`default-${defaultIndex}`} className="aspect-square overflow-hidden">
                  <img
                    src={`/lynch/local/${defaultIndex}.webp`}
                    alt={`Imagen ${defaultIndex}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal personalizado */}
      {isModalOpen && modalImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
          onClick={(e) => {
            // Solo cerrar si se hace clic en el fondo oscuro
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="relative max-w-[1200px] mx-2 p-4 pt-8 bg-white rounded-lg shadow-lg animate-fade-in-up overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-1 right-1 z-50 text-gray-500 hover:text-gray-800"
              aria-label="Cerrar modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="relative w-full max-w-4xl mx-auto">
              <img
                src={modalImage.url}
                alt="Menú Casa Lynch"
                className="w-full h-auto rounded-lg"
                onError={(e) => {
                  console.error('Error loading image:', e);
                  console.log('Image URL:', modalImage.url);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
