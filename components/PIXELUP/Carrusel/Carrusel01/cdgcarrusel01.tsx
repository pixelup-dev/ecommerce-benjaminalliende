/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import Link from "next/link";
import Image from "next/image";
import ProductCard02 from "@/components/PIXELUP/ProductCards/ProductCards02/ProductCard02";

interface Productos {
  [x: string]: any;
  src: string;
  name: string;
  price: string;
}
interface CarruselProps {
  CarruselData: {
    titulo: string;
    parrafo: string;
    etiqueta: string;
    textoboton: string;
    Productos: Productos[];
  };
}

/*   const productos = [
    { src: "Images/Productos/01_CP_ColganteDiosaP.png", name: "Anillo Venus Bindi", price: "92,000" },
    { src: "Images/Productos/02_CP_ColganteDiosaG.png", name: "Anillo Vínculo Tribu", price: "69,000" },
    { src: "Images/Productos/03_CP_AnilloSerpiTribu.png", name: "Anillo Luna", price: "84,900" },
    { src: "Images/Productos/04_CP_VenusBindi.png", name: "Otro Anillo 1", price: "75,000" },
    { src: "Images/Productos/05_AnilloVenus.png", name: "Otro Anillo 2", price: "80,000" }
  ];
 */
const responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 4,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const Carrusel01: React.FC<CarruselProps> = ({ CarruselData }) => {
  const { titulo, parrafo, textoboton, Productos, etiqueta } = CarruselData;
  const [autoplay, setAutoplay] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoplay(!autoplay);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoplay]);

  return (
    <div className="container mx-auto m-8 mt-16 max-w-7xl">
      <h1 className="mb-8 text-center text-3xl font-semibold text-primary sm:text-4xl">
        {titulo}
      </h1>

      <Carousel
        swipeable={true}
        draggable={true}
        showDots={false} /* necesito ver como bajar los puntos */
        responsive={responsive}
        infinite={true}
        autoPlay={autoplay}
        autoPlaySpeed={10000}
        keyBoardControl={true}
        customTransition="all .5s"
        transitionDuration={500}
        containerClass="carousel-container"
        /* removeArrowOnDeviceType={["tablet", "mobile"]} */
        dotListClass="custom-dot-list-style mt-16"
        itemClass="px-2 py-12" // Reducido el padding horizontal
      >
        {Productos.map((detalle, index) => (
          <Link
            key={index}
            href={`/tienda/productos/${detalle.id}`}
          >
            <div className="relative flex flex-col items-center">
              <div className="absolute top-4 right-3 md:right-6 lg:right-0 bg-primary text-secondary px-2 py-1 rounded-bl-lg">
                {etiqueta}
              </div>
              <img
                src={detalle.src}
                alt={detalle.name}
                className="w-72 object-cover h-96"
                style={{ borderRadius: "var(--radius)" }}
              />
              <p className="text-primary text-center font-semibold mt-4">
                {detalle.name}
              </p>
              <p className="text-primary text-center font-bold mt-2">
                {detalle.price}
              </p>
            </div>
          </Link>
        ))}
      </Carousel>
      {/*         <div className="flex items-center justify-center"> 
        <button className="px-4 py-2 mt-12 tracking-wide text-secondary capitalize transition-colors duration-300 transform bg-primary hover:bg-secondary hover:text-primary" style={{ borderRadius: 'var(--radius)' }}>
          {textoboton}
        </button>
      </div> */}
    </div>
  );
};

export default Carrusel01;
