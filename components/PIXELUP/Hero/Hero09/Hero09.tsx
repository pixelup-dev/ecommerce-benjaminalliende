/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface BannerImage {
  id: string;
  mainImage: {
    url: string;
    data?: string;
  };
}

interface ContentData {
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
}

interface LandingTextContent {
  mainTitle: string;
  mainDescription: string;
  features: {
    title1: string;
    description1: string;
    title2: string;
    description2: string;
  };
  buttonText: string;
}

function Hero09() {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [content, setContent] = useState<ContentData>({
    title: "",
    landingText: "",
    buttonLink: "",
    buttonText: "",
  });
  const [parsedContent, setParsedContent] = useState<LandingTextContent>({
    mainTitle: "",
    mainDescription: "",
    features: {
      title1: "",
      description1: "",
      title2: "",
      description2: "",
    },
    buttonText: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch imágenes
      const imagesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO09_IMGID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (imagesResponse.data?.banner?.images) {
        setBannerImages(imagesResponse.data.banner.images);
      }

      // Fetch contenido
      const contentResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO09_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (contentResponse.data?.banner) {
        setContent(contentResponse.data.banner);
        try {
          const parsed = JSON.parse(contentResponse.data.banner.landingText || "{}");
          setParsedContent(parsed);
        } catch (error) {
          console.error("Error al parsear el contenido:", error);
        }
      }
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className=" mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="grid grid-cols-2 gap-4 relative">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="relative z-10">
                    <div className="rounded-lg shadow-lg h-48 w-full bg-gray-200 animate-pulse" />
                  </div>
                ))}
                <div className="absolute inset-0 bg-[#F9AF2A]/10 -z-10 transform rotate-6 rounded-lg"></div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2].map((index) => (
                    <div key={index} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                  ))}
                </div>
                <div className="h-12 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className=" mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Columna de Imágenes */}
            <div className="grid grid-cols-2 gap-4 relative">
              {bannerImages.map((image, index) => (
                <div key={image.id} className="relative z-10" style={{ borderRadius: "var(--radius)" }}>
                  <img
                    src={image.mainImage.url}
                    alt={`Proyecto personalizado ${index + 1}`}
                    className="rounded-lg shadow-lg object-cover h-48 w-full"
                  />
                </div>
              ))}
              {/* Imágenes de respaldo si no hay suficientes */}
              {bannerImages.length < 4 &&
                Array.from({ length: 4 - bannerImages.length }).map((_, index) => (
                  <div key={`default-${index}`} className="relative z-10" style={{ borderRadius: "var(--radius)" }}>
                    <img
                      src={`/cubico/${index + 1}.webp`}
                      alt={`Proyecto personalizado ${bannerImages.length + index + 1}`}
                      className="rounded-lg shadow-lg object-cover h-48 w-full"
                    />
                  </div>
                ))}
              <div className="absolute inset-0 bg-primary/10 -z-10 transform rotate-6 rounded-lg"></div>
            </div>

            {/* Columna de Texto */}
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                {parsedContent.mainTitle || "Proyectos Personalizados a tu Medida"}
              </h2>
              <div
                className="text-lg text-gray-600"
                dangerouslySetInnerHTML={{ __html: parsedContent.mainDescription }}
              />
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {parsedContent.features.title1}
                    </h3>
                    <div
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ __html: parsedContent.features.description1 }}
                    />
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {parsedContent.features.title2}
                    </h3>
                    <div
                      className="text-gray-600"
                      dangerouslySetInnerHTML={{ __html: parsedContent.features.description2 }}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-6">
                <button
                  onClick={() => window.open(content.buttonLink, "_blank")}
                  className="bg-primary text-white px-8 py-4 rounded-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-3 font-semibold"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {parsedContent.buttonText || "Contacta con nosotros"}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero09;