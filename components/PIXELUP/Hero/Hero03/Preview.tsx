"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

interface ServiciosContentProps {
  servicioUno: any;
  servicioDos: any;
}

const Hero03Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 2);

  return (
    <section className="-mt-12">
      {/* Versión Mobile */}
      <div className="lg:hidden mx-auto bg-[#EAE4D8] pb-12 md:pb-52 xl:pb-32">
        <div className="text-center pb-12 pt-6 md:pt-24">
          <h1 className="text-[50px] md:text-[70px] font-oswald mt-24 leading-[1] font-bold text-white uppercase tracking-tight z-0">
            Nuestros Servicios{" "}
          </h1>
          <h2 className="text-[45px] md:text-[72px] font-brush text-dark z-10">
            ¿Que ofrecemos?
          </h2>
          <p className="text-gray-600 max-w-2xl mt-6 mx-4">
            Conoce los servicios que ofrecemos para ti y tu negocio.
          </p>
        </div>

        <ServiciosContent
          servicioUno={previewCategories[0]}
          servicioDos={previewCategories[1]}
        />
      </div>

      {/* Versión Desktop */}
      <div className="hidden lg:block mx-auto bg-gray-200 pb-40 xl:pb-32 my-10">
        <div className="flex justify-center items-center py-14">
          <div className="w-full mx-auto md:flex-1 flex flex-col items-center text-center mt-4 md:mt-8 lg:mt-0">
            <h4 className="text-primary text-lg md:text-xl">
              Nuestros Servicios
            </h4>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight text-foreground">
              ¿Qué ofrecemos?
            </h1>
            <p className="text-base md:text-lg text-foreground py-3 mx-2 md:mx-8 lg:mx-0">
              Conoce los servicios que ofrecemos para ti y tu negocio
            </p>
          </div>
        </div>

        <ServiciosContent
          servicioUno={previewCategories[0]}
          servicioDos={previewCategories[1]}
        />
      </div>
    </section>
  );
};

// Componente auxiliar para el contenido común
const ServiciosContent: React.FC<ServiciosContentProps> = ({
  servicioUno,
  servicioDos,
}) => (
  <div className="mx-4 space-y-16">
    {/* Card 1: Servicio Mujer */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch max-w-7xl mx-auto overflow-hidden">
      <div className="order-2 lg:order-1 lg:col-span-7 p-4 md:p-12 flex items-center">
        <div className="max-w-2xl">
          <h4 className="text-5xl text-dark font-brush leading-none mb-2">
            Consultoría Personal
          </h4>
          <h3 className="text-xl text-primary mb-4">
            {servicioUno?.title || "Transforma tu imagen personal"}
          </h3>
          <div className="text-gray-600 mb-8 text-lg leading-relaxed">
            {servicioUno?.landingText || "Descubre tu estilo único con nuestra consultoría personalizada. Te ayudamos a definir tu imagen, crear un guardarropa versátil y desarrollar la confianza que necesitas para brillar en cualquier ocasión."}
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/servicios/uno">
              <button className="rounded-none text-lg bg-primary px-8 py-3 text-white duration-300 ease-in-out hover:bg-primary/90" style={{ borderRadius: "var(--radius)" }}>
                Saber más
              </button>
            </Link>
            <span className="text-gray-400">→</span>
          </div>
        </div>
      </div>
      <div className="relative w-full h-[450px] lg:h-auto lg:col-span-5 lg:order-2 rounded-lg overflow-hidden">
        <img
          src={servicioUno?.mainImage.url || "/img/placeholder.webp"}
          alt="Consultoría Personal"
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    {/* Card 2: Servicio Empresa */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch max-w-7xl mx-auto overflow-hidden">
      <div className="relative w-full h-[450px] lg:h-auto lg:col-span-5 overflow-hidden">
        <img
          src={servicioDos?.mainImage.url || "/img/placeholder.webp"}
          alt="Consultoría Empresarial"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="lg:col-span-7 p-4 md:p-12 flex items-center">
        <div className="max-w-2xl">
          <h4 className="text-5xl text-dark font-brush leading-none mb-2">
            Consultoría Empresarial
          </h4>
          <h3 className="text-xl text-primary mb-4">
            {servicioDos?.title || "Potencia tu marca empresarial"}
          </h3>
          <div className="text-gray-600 mb-8 text-lg leading-relaxed">
            {servicioDos?.landingText || "Eleva la imagen de tu empresa con estrategias de branding personalizadas. Desde la identidad visual hasta la comunicación corporativa, te acompañamos en el proceso de posicionar tu marca en el mercado."}
          </div>
          <div className="flex gap-4 items-center">
            <Link href="/servicios/dos">
              <button className="rounded-none text-lg bg-primary px-8 py-3 text-white duration-300 ease-in-out hover:bg-primary/90" style={{ borderRadius: "var(--radius)" }}>
                Saber más
              </button>
            </Link>
            <span className="text-gray-400">→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Hero03Preview;