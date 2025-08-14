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

function Hero04() {
  const [bannerImages, setBannerImages] = useState<BannerImage[]>([]);
  const [content, setContent] = useState<ContentData>({
    title: "Sobre Nosotros",
    landingText: "",
    buttonLink: "",
    buttonText: "",
  });
  const [loading, setLoading] = useState(true);

  const processContent = (text: string) => {
    return text.replace(/\n/g, "<br />");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch imágenes
      const imagesResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO04_IMGID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (imagesResponse.data?.banner?.images) {
        setBannerImages(imagesResponse.data.banner.images);
      }

      // Fetch contenido
      const contentResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO04_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      if (contentResponse.data?.banner) {
        setContent({
          title: contentResponse.data.banner.title || "Hola, soy María José",
          landingText:
            processContent(contentResponse.data.banner.landingText) || "",
          buttonLink: contentResponse.data.banner.buttonLink || "",
          buttonText: contentResponse.data.banner.buttonText || "",
        });
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

  const handleWhatsAppClick = (type: string) => {
    const phoneNumber = "15819947712";
    let message = "";

    switch (type) {
      case "consulta":
        message = "Hola! Me gustaría agendar una consulta gratuita contigo";
        break;
      case "sesion":
        message = "Hola! Me interesa agendar una sesión de Health Coaching";
        break;
      case "recetarioPlus":
        message = "Hola! Me interesa agendar una clase de Recetario Plus";
        break;
      case "evaluacion":
        message = "Hola! Me gustaría agendar una evaluación gratuita";
        break;
      case "general":
      default:
        message =
          "Hola! Me gustaría obtener más información sobre tus servicios";
        break;
    }

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="md:col-span-5 grid grid-cols-2 gap-4 h-fit">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={`w-full h-[300px] bg-gray-200 animate-pulse rounded-lg ${
              index % 2 === 1 ? "mt-8" : ""
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="py-20 bg-gray-100">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl  mb-12 text-center"> {/* font-kalam text-[#4A6741] */}
          <span className="text-sm uppercase tracking-[0.3em] block mb-3 "> {/* text-[#8BA888] font-montserrat */}
            Conóceme
          </span>
          Conoce Pixel Up
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Galería de imágenes */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4 h-fit">
            {bannerImages.map((image, index) => (
              <img
                key={image.id}
                src={image.mainImage.url}
                alt={` ${index + 1}`}
                className={`w-full h-[300px] object-cover rounded-lg ${
                  index % 2 === 1 ? "mt-8" : ""
                }`}
              />
            ))}

            {/* Imágenes de respaldo si no hay suficientes imágenes */}
            {bannerImages.length < 4 &&
              Array.from({ length: 4 - bannerImages.length }).map(
                (_, index) => (
                  <img
                    key={`default-${index}`}
                    src={`/pepa/pepa${index + 1}.jpg`}
                    alt="img"
                    className={`w-full h-[300px] object-cover rounded-lg ${
                      (bannerImages.length + index) % 2 === 1 ? "mt-8" : ""
                    }`}
                  />
                )
              )}
          </div>

          {/* Contenido */}
          <div className="md:col-span-7 space-y-8">
            <div>
              <h3 className="text-3xl font-light mb-6  "> {/* font-cormorant text-[#4A6741] */}
                {content.title}
              </h3>
              <div
                className="text-black leading-relaxed mb-6"
                dangerouslySetInnerHTML={{ __html: content.landingText }}
              />
            </div>

            <div className="border-l-4 border-secondary pl-6 py-2">
              <h4 className="text-xl  mb-4 "> {/* font-cormorant text-[#4A6741] */}
                Mi Misión
              </h4>
              <div
                className="text-black leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content.buttonLink }}
              />
            </div>

            <div className="flex flex-col md:flex-row md:gap-8 gap-4">
              <div className="flex items-center">
                <span className="text-3xl mr-3">🌍</span>
                <div>
                  <h5 className="">Alcance Global</h5> {/* text-[#4A6741] */}
                  <p className=" text-sm"> {/* text-[#718878] */}
                    Tu sitio web en todo el mundo
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <span className="text-3xl mr-3">🎓</span>
                <div>
                  <h5 className="">Sin complicaciones</h5> {/* text-[#4A6741] */}
                  <p className=" text-sm"> {/* text-[#718878] */}
                    donde tu solo tienes que relajarte
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleWhatsAppClick("general")}
              className="w-full bg-primary px-8 py-4 text-white hover:bg-primary/90 transition duration-300 flex items-center justify-center mt-8"
              style={{ borderRadius: "var(--radius)" }}
            >
              <span className="mr-2">Comienza tu viaje conmigo</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero04;