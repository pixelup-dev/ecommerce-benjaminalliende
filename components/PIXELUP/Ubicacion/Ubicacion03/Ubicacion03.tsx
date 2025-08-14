/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { UbicacionContent, BannerImage } from "./types";

export default function Ubicacion03() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<UbicacionContent>({
    title: "PixelUp",
    contentText: "",
    additionalData: {
      subtitle: "Nuestra ubicación",
      description: "",
      secondaryTitle: "Visítanos",
      buttonText: "Agenda tu Hora",
      buttonLink: "https://www.pixelup.cl",
      address: {
        street: "Dirección, Comuna",
        city: "Santiago, Chile",
      },
      schedule: {
        weekdays: "Lunes a Viernes: 10:00 - 20:00",
        saturday: "Sábados: 10:00 - 18:00",
      },
      contact: {
        phone: "+56 9 6769 1191",
        email: "contacto@pixelup.cl",
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
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_UBICACION03_CONTENTBLOCK}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (contentResponse.data?.contentBlock) {
          const contentData = contentResponse.data.contentBlock;
          try {
            const parsedData = JSON.parse(contentData.contentText);
            setContent({
              title: contentData.title || "PixelUp",
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
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION03_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
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
    <section className="py-16 bg-white flex justify-center items-center">
      <div className="mx-4 max-w-[1200px] px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-sans text-xs uppercase tracking-widest mb-3 block">
            {content.additionalData.subtitle}
          </span>
          <h2 className="text-5xl font-serif mb-4 text-[#2C2C2C]">
            {content.title}
          </h2>
          <div
            className="text-gray-600 font-sans text-base"
            dangerouslySetInnerHTML={{ __html: content.contentText }}
          />
        </div>
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="flex flex-col space-y-6 md:space-y-8">
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-2xl md:text-3xl font-serif text-[#2C2C2C] text-center md:text-left">
                {content.additionalData.secondaryTitle}
              </h3>
              <div
                className="text-gray-600 text-base md:text-lg text-center md:text-left"
                dangerouslySetInnerHTML={{
                  __html: content.additionalData.description,
                }}
              />
            </div>

            <div className="grid gap-3 md:gap-6 px-2 md:px-0">
              <div className="flex items-start gap-3 md:gap-4 bg-primary/10 p-3 md:p-4 " style={{ borderRadius: "var(--radius)" }}>
                <div className=" text-xl md:text-2xl">📍</div>
                <div className="min-w-0">
                  <h4 className="font-serif text-base md:text-lg mb-0.5 md:mb-1">
                    Dirección
                  </h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    {content.additionalData.address.street}
                    <br />
                    {content.additionalData.address.city}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:gap-4 bg-primary/10 p-3 md:p-4 " style={{ borderRadius: "var(--radius)" }}>
                <div className=" text-xl md:text-2xl">⏰</div>
                <div className="min-w-0">
                  <h4 className="font-serif text-base md:text-lg mb-0.5 md:mb-1">
                    Horario
                  </h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    {content.additionalData.schedule.weekdays}
                    <br />
                    {content.additionalData.schedule.saturday}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4 bg-primary/10 p-3 md:p-4 " style={{ borderRadius: "var(--radius)" }}>
                <div className=" text-xl md:text-2xl">📞</div>
                <div className="min-w-0">
                  <h4 className="font-serif text-base md:text-lg mb-0.5 md:mb-1">
                    Contacto
                  </h4>
                  <p className="text-gray-600 text-sm md:text-base">
                    {content.additionalData.contact.phone}
                    <br />
                    {content.additionalData.contact.email}
                  </p>
                </div>
              </div>
            </div>

            <a
              href={`${content.additionalData.buttonLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-primary text-white px-6 md:px-8 py-3 md:py-4  hover:bg-primary/80 transition-colors w-full mt-2 md:mt-4 text-center text-sm md:text-base"
              style={{ borderRadius: "var(--radius)" }}
            >
              {content.additionalData.buttonText}
            </a>
          </div>

          <div className="h-full flex items-stretch">
            {images.length > 0 && (
              <div className="relative group overflow-hidden     w-full" style={{ borderRadius: "var(--radius)" }}>
                <img
                  src={images[0].mainImage.url}
                  alt={images[0].title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
