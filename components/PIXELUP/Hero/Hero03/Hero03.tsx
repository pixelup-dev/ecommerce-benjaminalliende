/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import axios from "axios";

interface ServiciosContentProps {
  servicioUno: any /* mujer */;
  servicioDos: any /* empresa */;
}

const Hero03: React.FC = () => {
  const [servicioUno, setServicioUno] = useState<any>(null);
  const [servicioDos, setServicioDos] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

        // Fetch Servicio Mujer
        const responseUno = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_SERVICIO_UNO_ID}?siteId=${siteId}`
        );

        // Fetch Servicio Empresa
        const responseDos = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_SERVICIO_DOS_ID}?siteId=${siteId}`
        );
        setServicioUno(responseUno.data.banner.images[0]);
        setServicioDos(responseDos.data.banner.images[0]);
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
      <div className="flex justify-center items-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

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
          servicioUno={servicioUno}
          servicioDos={servicioDos}
        />
      </div>

      {/* Versión Desktop */}
      <div className="hidden lg:block mx-auto bg-gray-200 pb-40 xl:pb-32 my-10">
        <div className="flex justify-center items-center py-14">
          <div className="w-full mx-auto md:flex-1 flex flex-col items-center text-center mt-4 md:mt-8 lg:mt-0">
            <h4 className="text-primary text-lg md:text-xl">
              Nuestros Servicios
            </h4>
            <h1 className=" text-3xl md:text-5xl font-bold leading-tight text-foreground">
              ¿Qué ofrecemos?
            </h1>
            <p className="text-base md:text-lg text-foreground py-3 mx-2 md:mx-8 lg:mx-0">
              Conoce los servicios que ofrecemos para ti y tu negocio
            </p>
          </div>
        </div>

        <ServiciosContent
          servicioUno={servicioUno}
          servicioDos={servicioDos}
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
          <h3 className="text-xl  text-primary mb-4">
            {servicioUno?.title || "Transforma tu imagen personal"}
          </h3>
          <div
            className="text-gray-600 mb-8 text-lg leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                servicioUno?.landingText ||
                "Descubre tu estilo único con nuestra consultoría personalizada. Te ayudamos a definir tu imagen, crear un guardarropa versátil y desarrollar la confianza que necesitas para brillar en cualquier ocasión.",
            }}
          />
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
          src={servicioUno?.mainImage.url || "/fran/Workshop.jpg"}
          alt="Consultoría Personal"
          className="w-full h-full object-cover"
        />
      </div>
    </div>

    {/* Card 2: Servicio Empresa */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch max-w-7xl mx-auto overflow-hidden">
      <div className="relative w-full h-[450px] lg:h-auto lg:col-span-5 overflow-hidden">
        <img
          src={servicioDos?.mainImage.url || "/fran/empresas.png"}
          alt="Consultoría Empresarial"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
      <div className="lg:col-span-7 p-4 md:p-12 flex items-center">
        <div className="max-w-2xl">
          <h4 className="text-5xl text-dark font-brush leading-none mb-2">
            Consultoría Empresarial
          </h4>
          <h3 className="text-xl  text-primary mb-4">
            {servicioDos?.title || "Potencia tu marca empresarial"}
          </h3>
          <div
            className="text-gray-600 mb-8 text-lg leading-relaxed"
            dangerouslySetInnerHTML={{
              __html:
                servicioDos?.landingText ||
                "Eleva la imagen de tu empresa con estrategias de branding personalizadas. Desde la identidad visual hasta la comunicación corporativa, te acompañamos en el proceso de posicionar tu marca en el mercado.",
            }}
          />
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

export default Hero03;
