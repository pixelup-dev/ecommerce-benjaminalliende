/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

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
    price: string;
    time: string;
    planLabel: string;
    notIncluded: string;
    weekdaysSchedule: string;
    saturdaySchedule: string;
    plan2Label: string;
    plan2Title1: string;
    plan2Price: string;
    plan2Time: string;
    plan2Description1: string;
    plan2NotIncluded: string;
    plan2WeekdaysSchedule: string;
    plan2SaturdaySchedule: string;
  };
  buttonText: string;
  buttonLink: string;
}

function Hero15() {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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
      price: "",
      time: "",
      planLabel: "",
      notIncluded: "",
      weekdaysSchedule: "",
      saturdaySchedule: "",
      plan2Label: "",
      plan2Title1: "",
      plan2Price: "",
      plan2Time: "",
      plan2Description1: "",
      plan2NotIncluded: "",
      plan2WeekdaysSchedule: "",
      plan2SaturdaySchedule: "",
    },
    buttonText: "",
    buttonLink: "",
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const imagesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO15_IMGID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (imagesResponse.data?.banner?.images) {
        setBannerImages(imagesResponse.data.banner.images);
      }

      const contentResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO15_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (contentResponse.data?.banner) {
        setContent(contentResponse.data.banner);
        try {
          const parsed = JSON.parse(
            contentResponse.data.banner.landingText || "{}"
          );
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

  useEffect(() => {
    if (bannerImages.length > 0 && !isModalOpen) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [bannerImages, isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % bannerImages.length);
  };

  const prevImage = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + bannerImages.length) % bannerImages.length
    );
  };

  if (loading) {
    return (
      <section className="md:py-20 bg-gray-50">
        <div className="mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="h-[400px] bg-gray-200 animate-pulse rounded-lg"></div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="space-y-4">
                  {[1, 2].map((index) => (
                    <div
                      key={index}
                      className="h-20 bg-gray-200 rounded animate-pulse"
                    ></div>
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
    <section
      id="planes"
      className="py-12 bg-gray-50"
    >
      <div className="mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16 mt-10">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {parsedContent.mainTitle || "Nuestros Planes"}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {parsedContent.mainDescription ||
              "Todos nuestros planes ofrecen un horario flexible y un servicio personalizado para cada necesidad."}
          </p>
        </div>

        {/* Planes de Arriendo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Plan Básico */}
          <div className="bg-white p-8 rounded shadow-xl border-2 border-blue-100 transform hover:scale-105 transition-transform duration-300">
            <div className="text-center mb-8">
              <span className="bg-primary text-white text-sm font-semibold px-4 py-1 rounded">
                {parsedContent.features.planLabel || "Plan Básico"}
              </span>
              <h3 className="text-3xl font-bold mt-4">
                {parsedContent.features.title1 || "Pabellón Básico"}
              </h3>
              <div className="mt-4">
                <span className="text-5xl font-bold text-primary">
                  {parsedContent.features.price || "$120.000"}
                </span>
                <span className="text-gray-500">
                  /{parsedContent.features.time || "2.5 horas"}
                </span>
              </div>
            </div>
            <div className="mb-8">
              {parsedContent.features.description1 &&
                parsedContent.features.description1.trim() !== "" && (
                  <>
                    <h4 className="font-semibold text-lg mb-3 text-primary">
                      Incluye:
                    </h4>
                    <div className="space-y-2">
                      {parsedContent.features.description1
                        .split("\n")
                        .filter((line) => line.trim() !== "")
                        .map((line, index) => (
                          <div
                            key={index}
                            className="flex items-center"
                          >
                            <svg
                              className="w-5 h-5 mr-2 text-green-500 flex-shrink-0"
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
                            <span>{line.trim().replace(/^•\s*/, "")}</span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
            </div>
            <div className="mb-8">
              {parsedContent.features.notIncluded &&
                parsedContent.features.notIncluded.trim() !== "" && (
                  <>
                    <h4 className="font-semibold text-lg mb-3 text-red-600">
                      No Incluye:
                    </h4>
                    <div className="space-y-2">
                      {parsedContent.features.notIncluded
                        .split("\n")
                        .filter((line) => line.trim() !== "")
                        .map((line, index) => (
                          <div
                            key={index}
                            className="flex items-center"
                          >
                            <svg
                              className="w-5 h-5 mr-2 text-red-500 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span>{line.trim().replace(/^•\s*/, "")}</span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
            </div>

            <div className="bg-blue-50 p-4 rounded mb-8">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-6 h-6 text-primary"
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
                <div>
                  <h4 className="font-semibold text-primary">
                    Horarios Disponibles
                  </h4>
                  <p className="text-sm text-gray-600">
                    {parsedContent.features.weekdaysSchedule ||
                      "Lunes a Viernes 09:30-19:00"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {parsedContent.features.saturdaySchedule ||
                      "Sábado 09:00-16:00"}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link
                href={`${
                  process.env.NEXT_PUBLIC_WHATSAPP_LINK || ""
                }?text=${encodeURIComponent(
                  `Me gustaría reservar hora para ${
                    parsedContent.features.title1 || "Pabellón Básico"
                  }`
                )}`}
                className="bg-primary text-white px-8 py-3 font-semibold hover:scale-105 transition-all duration-300 w-full inline-block"
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderRadius: "var(--radius)" }}

              >
                Reservar Ahora
              </Link>
            </div>
          </div>

          {/* Plan Premium */}
          <div className="bg-gradient-to-br from-primary to-primary/80 p-8 rounded shadow-xl transform hover:scale-105 transition-transform duration-300 text-white">
            <div className="text-center mb-8">
              <span className="bg-white text-primary text-sm font-semibold px-4 py-1 rounded">
                {parsedContent.features.plan2Label || "Plan Premium"}
              </span>
              <h3 className="text-3xl font-bold mt-4">
                {parsedContent.features.plan2Title1 || "Pabellón Full"}
              </h3>
              <div className="mt-4">
                <span className="text-5xl font-bold">
                  {parsedContent.features.plan2Price || "$280.000"}
                </span>
                <span className="text-blue-200">
                  /{parsedContent.features.plan2Time || "2.5 horas"}
                </span>
              </div>
            </div>
            <div className="mb-8">
              {parsedContent.features.plan2Description1 &&
                parsedContent.features.plan2Description1.trim() !== "" && (
                  <>
                    <h4 className="font-semibold text-lg mb-3 text-blue-200">
                      Incluye Todo:
                    </h4>
                    <div className="space-y-2">
                      {parsedContent.features.plan2Description1
                        .split("\n")
                        .filter((line) => line.trim() !== "")
                        .map((line, index) => (
                          <div
                            key={index}
                            className="flex items-center"
                          >
                            <svg
                              className="w-5 h-5 mr-2 text-green-300 flex-shrink-0"
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
                            <span>{line.trim().replace(/^•\s*/, "")}</span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
            </div>
            <div className="mb-8">
              {parsedContent.features.plan2NotIncluded &&
                parsedContent.features.plan2NotIncluded.trim() !== "" && (
                  <>
                    <h4 className="font-semibold text-lg mb-3 text-blue-200">
                      No Incluye:
                    </h4>
                    <div className="space-y-2">
                      {parsedContent.features.plan2NotIncluded
                        .split("\n")
                        .filter((line) => line.trim() !== "")
                        .map((line, index) => (
                          <div
                            key={index}
                            className="flex items-center"
                          >
                            <svg
                              className="w-5 h-5 mr-2 text-red-300 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            <span>{line.trim().replace(/^•\s*/, "")}</span>
                          </div>
                        ))}
                    </div>
                  </>
                )}
            </div>

            <div className="bg-white p-4 rounded mb-8">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-6 h-6 text-primary"
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
                <div>
                  <h4 className="font-semibold text-primary">
                    Horarios Disponibles
                  </h4>
                  <p className="text-sm text-primary">
                    {parsedContent.features.plan2WeekdaysSchedule ||
                      "Lunes a Viernes 09:30-19:00"}
                  </p>
                  <p className="text-sm text-primary">
                    {parsedContent.features.plan2SaturdaySchedule ||
                      "Sábado 09:00-16:00"}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Link
                href={`${
                  process.env.NEXT_PUBLIC_WHATSAPP_LINK || ""
                }?text=${encodeURIComponent(
                  `Me gustaría reservar hora para ${
                    parsedContent.features.plan2Title1 || "Plan Custom"
                  }`
                )}`}
                className="bg-white text-primary px-8 py-3 font-semibold hover:scale-105 transition-all duration-300 w-full inline-block"
                target="_blank"
                rel="noopener noreferrer"
                style={{ borderRadius: "var(--radius)" }}

              >
                Reservar Ahora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

  export default Hero15;
