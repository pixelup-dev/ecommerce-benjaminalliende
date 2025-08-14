"use client";
import React, { useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Testimonios05Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 3);
  
  const testimonios = [
    {
      nombre: "María García",
      texto: "Excelente servicio y productos de calidad. Muy recomendado.",
      imagen: previewCategories[0]?.mainImage.url || "/img/avatardefault.jpg"
    },
    {
      nombre: "Carlos López",
      texto: "La mejor experiencia de compra que he tenido. Volveré seguro.",
      imagen: previewCategories[1]?.mainImage.url || "/img/avatardefault.jpg"
    },
    {
      nombre: "Ana Martínez",
      texto: "Productos increíbles y atención al cliente excepcional.",
      imagen: previewCategories[2]?.mainImage.url || "/img/avatardefault.jpg"
    }
  ];

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

  return (
    <section className="pt-4 pb-20 bg-white overflow-hidden">
      <div className="mx-6 px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl text-center font-serif mb-12 text-[#2C2C2C]">
          {previewData.titulo || "Lo que dicen nuestros clientes"}
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
};

export default Testimonios05Preview;