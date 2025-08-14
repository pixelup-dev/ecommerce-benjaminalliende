/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

interface ContentData {
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  mainImage: {
    name: string;
    type: string;
    size: number | null;
    data: string;
  };
}

interface AdditionalData {
  subtitle: string;
  phoneNumber: string;
  stats: {
    stat1: {
      value: string;
      label: string;
    };
    stat2: {
      value: string;
      label: string;
    };
  };
  email: string;
}

export default function PropuestaValor() {
  const [content, setContent] = useState<ContentData>({
    title: "",
    landingText: "",
    buttonText: "",
    buttonLink: "",
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const [additionalData, setAdditionalData] = useState<AdditionalData>({
    subtitle: "",
    phoneNumber: "",
    stats: {
      stat1: {
        value: "",
        label: "profesionales",
      },
      stat2: {
        value: "",
        label: "satisfacción",
      },
    },
    email: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_HERO08_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (response.data?.banner) {
          const mainImage = response.data.banner.images?.[0]?.mainImage;

          setContent({
            title:
              response.data.banner.title ||
              "Tu espacio de trabajo",
            landingText: response.data.banner.landingText || "",
            buttonLink: response.data.banner.buttonLink || "",
            buttonText: response.data.banner.buttonText || "",
            mainImage: {
              name: mainImage?.name || "",
              type: mainImage?.type || "",
              size: mainImage?.size || null,
              data: mainImage?.url || "",
            },
          });

          try {
            const additionalInfo = JSON.parse(response.data.banner.buttonText);
            setAdditionalData({
              subtitle:
                additionalInfo.subtitle || "Bienvenidos",
              phoneNumber: additionalInfo.phoneNumber || "+569 1234 5678",
              stats: {
                stat1: {
                  value: additionalInfo.stats?.stat1?.value || "15+",
                  label: additionalInfo.stats?.stat1?.label || "profesionales",
                },
                stat2: {
                  value: additionalInfo.stats?.stat2?.value || "100%",
                  label: additionalInfo.stats?.stat2?.label || "satisfacción",
                },
              },
              email: additionalInfo.email || "contacto@pixelup.cl",
            });
          } catch (e) {
            console.error("Error parsing additional data:", e);
            setAdditionalData({
              subtitle: "Bienvenidos",
              phoneNumber: "+569 1234 5678",
              stats: {
                stat1: {
                  value: "15+",
                  label: "profesionales",
                },
                stat2: {
                  value: "100%",
                  label: "satisfacción",
                },
              },
              email: "contacto@lafuentedebelleza.cl",
            });
          }
        }
      } catch (error) {
        console.error("Error al obtener el contenido:", error);
        setContent({
          title: "Tu espacio de trabajo",
          landingText: "",
          buttonLink: "",
          buttonText: "",
          mainImage: {
            name: "",
            type: "",
            size: null,
            data: "",
          },
        });
        setAdditionalData({
          subtitle: "Bienvenidos",
          phoneNumber: "+569 1234 5678",
          stats: {
            stat1: {
              value: "15+",
              label: "profesionales",
            },
            stat2: {
              value: "100%",
              label: "satisfacción",
            },
          },
          email: "contacto@pixelup.cl",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <section className="pt-16 pb-24 bg-white flex justify-center items-center">
      <div className="mx-8 px-4 max-w-[1200px]">
        <div className="grid xl:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-primary font-sans text-xs uppercase tracking-widest block">
              {additionalData.subtitle}
            </span>
            <h1 className="text-4xl font-serif text-[#2C2C2C]">
              {content.title}
            </h1>
            <div
              className="text-lg text-gray-600 leading-snug"
              dangerouslySetInnerHTML={{ __html: content.landingText }}
            />
            <div
              className="text-base text-gray-600 leading-snug"
              dangerouslySetInnerHTML={{ __html: content.buttonLink }}
            />
            <div className="flex flex-col md:flex-row gap-4">
              <Link
                href="https://lafuentedebelleza.site.agendapro.com/cl/sucursal/105579"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-white px-8 py-4 rounded-md hover:bg-primary/90 transition-colors text-center"
                style={{ borderRadius: "var(--radius)" }}
              >
                Agenda tu hora
              </Link>
              <a
                href={`tel:${additionalData.phoneNumber}`}
                className="border-2 border-primary text-primary px-8 py-4 rounded-md hover:bg-primary hover:text-white transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              >
                {additionalData.phoneNumber}
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-8">
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-primary font-serif text-xl">
                  {additionalData.stats.stat1.value}
                </p>
                <p className="text-gray-600">
                  {additionalData.stats.stat1.label}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg">
                <p className="text-primary font-serif text-xl">
                  {additionalData.stats.stat2.value}
                </p>
                <p className="text-gray-600">
                  {additionalData.stats.stat2.label}
                </p>
              </div>
            </div>
          </div>
          <div className="relative flex justify-center items-center">
            <img
              src={content.mainImage?.data || "/fuente/3.jpeg"}
              alt="La Fuente de Belleza"
              className="rounded-lg shadow-xl max-h-[500px] object-cover w-full"
              onError={(e) => {
                console.log("Error al cargar la imagen:", e);
                e.currentTarget.src = "/fuente/3.jpeg";
              }}
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-lg shadow-lg">
              <p className="text-primary font-serif">Contacto</p>
              <a
                href={`mailto:${additionalData.email}`}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                {additionalData.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
