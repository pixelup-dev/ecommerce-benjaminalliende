/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "@/components/common/Loader";

interface BannerImage {
  id: string;
  title: string;
  landingText: string;
  mainImage: {
    url: string;
  };
}

interface BannerResponse {
  code: number;
  message: string;
  banner: {
    id: string;
    title: string;
    landingText: string;
    images: BannerImage[];
  };
}

export default function Hero13() {
  const [content, setContent] = useState<BannerImage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const bannerId = process.env.NEXT_PUBLIC_HERO13_ID;
        const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;

        if (!bannerId || !siteId) {
          throw new Error("Faltan variables de entorno necesarias");
        }

        const response = await axios.get<BannerResponse>(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${siteId}`
        );

        if (response.data?.banner?.images?.[0]) {
          setContent(response.data.banner.images[0]);
        } else {
          throw new Error("No hay contenido disponible");
        }
      } catch (error) {
        console.error("Error al cargar el contenido:", error);
        setContent({
          id: "default",
          title: "Título de la página",
          landingText:
            "<p>Descripción de la página.</p>",
          mainImage: {
            url: "/2.png",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!content) {
    return (
      <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">Contenido no disponible</p>
      </div>
    );
  }

  return (
    <div className="">
      <div className="bg-white min-h-[350px] text-[#333] font-[sans-serif]">
        <div className="grid md:grid-cols-2 justify-center items-center max-md:text-center gap-8">
          <div className="max-w-2xl mx-auto p-4 px-6">
            <h2 className="text-3xl md:text-3xl font-extrabold font-kalam my-6 uppercase">
              {content.title}
            </h2>
            <div
              className="text-base"
              dangerouslySetInnerHTML={{ __html: content.landingText }}
            />
          </div>
          <div className="md:text-right max-md:mt-12 h-full">
            <img
              src={content.mainImage.url}
              alt={content.title}
              className="w-full h-[600px] object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
