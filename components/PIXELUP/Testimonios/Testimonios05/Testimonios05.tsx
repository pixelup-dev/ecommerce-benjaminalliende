/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

interface Testimonio {
  nombre: string;
  texto: string;
  imagen: string;
}

export default function Testimonios05() {
  const [testimonios, setTestimonios] = useState<Testimonio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonios = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_TESTIMONIOS05_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );

        if (response.data?.banner?.images) {
          const testimoniosData = response.data.banner.images.map(
            (image: any) => ({
              nombre: image.title,
              texto: image.landingText,
              imagen: image.mainImage.url,
            })
          );
          setTestimonios(testimoniosData);
        }
      } catch (error) {
        console.error("Error al obtener los testimonios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonios();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          arrows: true,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
          dots: true,
        },
      },
    ],
  };

  if (loading) {
    return (
      <section className="py-12 md:py-24 bg-white">
        <div className=" mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="bg-gray-100 p-8 rounded-lg"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-4 pb-20 bg-white overflow-hidden">
      <div className=" mx-6 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl text-center font-serif mb-12 text-[#2C2C2C]">
          Lo que dicen nuestros clientes
        </h2>

        <div className="max-w-[1200px] mx-auto relative">
          <Slider {...settings}>
            {testimonios.map((testimonio, index) => (
              <div
                key={index}
                className="px-2 md:px-4"
              >
                <div className="bg-primary/10 p-6 md:p-8 rounded-lg shadow-lg h-full min-h-[250px] flex flex-col">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 flex-shrink-0 relative rounded-full overflow-hidden border-2 border-primary">
                      <img
                        src={testimonio.imagen}
                        alt={testimonio.nombre}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg mb-1">
                        {testimonio.nombre}
                      </h3>
                      <div className="flex text-primary">{"★".repeat(5)}</div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic text-sm md:text-base flex-grow">
                    &ldquo;{testimonio.texto}&rdquo;
                  </p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      <style
          jsx
          global
        >{`
          .slick-list {
            margin: 0 -8px;
          }
          .slick-slide > div {
            padding: 0 8px;
          }
          .slick-dots {
            bottom: -40px;
          }
          .slick-dots li button:before {
            color: hsl(var(--dynamic-primary, 210 100% 50%));
            opacity: 0.4;
            font-size: 8px;
          }
          .slick-dots li.slick-active button:before {
            color: hsl(var(--dynamic-primary, 210 100% 50%));
            opacity: 1;
          }
          .slick-prev,
          .slick-next {
            width: 40px;
            height: 40px;
            z-index: 10;
            background-color: white !important;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
            transform: translateY(-50%);
          }
          .slick-prev {
            left: -50px;
          }
          .slick-next {
            right: -50px;
          }
          .slick-prev:before,
          .slick-next:before {
            font-family: "slick";
            font-size: 20px;
            line-height: 1;
            opacity: 1;
            color: hsl(var(--dynamic-primary, 210 100% 50%)) !important;
            -webkit-font-smoothing: antialiased;
          }
          .slick-prev:hover,
          .slick-next:hover {
            background-color: hsl(var(--dynamic-primary, 210 100% 50%)) !important;
          }
          .slick-prev:hover:before,
          .slick-next:hover:before {
            color: white !important;
          }
          @media (max-width: 1280px) {
            .slick-prev {
              left: -30px;
            }
            .slick-next {
              right: -30px;
            }
          }
          @media (max-width: 768px) {
            .slick-prev,
            .slick-next {
              display: none !important;
            }
          }
        `}</style>
    </section>
  );
}
