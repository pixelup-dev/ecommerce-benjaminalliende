"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Categoria06Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 4);
  
  const defaultImage = "/img/placeholder.webp";
  
  const getDefaultBanner = (banner: any) => {
    return banner || {
      mainImage: { url: defaultImage },
      title: "Titulo por defecto",
      description: "Descripción no disponible",
      buttonLink: "#",
    };
  };

  return (
    <div className="flex justify-center items-center">
      <div className="2xl:mx-auto 2xl:container py-12 px-4 sm:px-6 xl:px-20 2xl:px-0 w-full">
        <div className="flex flex-col jusitfy-center items-center space-y-10">
          <div className="flex flex-col justify-center items-center">
            <h1 className="text-3xl xl:text-4xl font-semibold leading-7 xl:leading-9 text-primary dark:text-white">
              Nuestras Categorías
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:gap-x-8 w-full">
            {/* Primer item */}
            <div className="relative group flex justify-center items-center h-full w-full">
              <img 
                className="object-center object-cover h-full w-full" 
                style={{ borderRadius: 'var(--radius)' }} 
                src={getDefaultBanner(previewCategories[0]).mainImage.url}
                alt={getDefaultBanner(previewCategories[0]).title}
              />
              <Link 
                href={getDefaultBanner(previewCategories[0]).buttonLink}
                style={{ borderRadius: 'var(--radius)' }} 
                className="text-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 bottom-4 z-10 absolute text-base font-medium leading-none py-3 w-36 bg-secondary hover:bg-primary text-center"
              >
                {getDefaultBanner(previewCategories[0]).title}
              </Link>
              <div className="absolute opacity-0 group-hover:opacity-100 transition duration-500 bottom-3 py-6 z-0 px-20 w-36 bg-white bg-opacity-50" style={{ borderRadius: "var(--radius)" }} />
            </div>

            {/* Columna central con dos imágenes */}
            <div className="flex flex-col space-y-4 md:space-y-8 mt-4 md:mt-0">
              {[1, 2].map((index) => (
                <div key={index} className="relative group flex justify-center items-center h-full w-full">
                  <img 
                    className="object-center object-cover h-full w-full"
                    style={{ borderRadius: 'var(--radius)' }}
                    src={getDefaultBanner(previewCategories[index]).mainImage.url}
                    alt={getDefaultBanner(previewCategories[index]).title}
                  />
                  <Link 
                    href={getDefaultBanner(previewCategories[index]).buttonLink}
                    style={{ borderRadius: 'var(--radius)' }}
                    className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 bottom-4 z-10 absolute text-base font-medium leading-none text-foreground py-3 w-36 bg-secondary hover:bg-primary text-center"
                  >
                    {getDefaultBanner(previewCategories[index]).title}
                  </Link>
                  <div className="absolute opacity-0 group-hover:opacity-100 transition duration-500 bottom-3 py-6 z-0 px-20 w-36 bg-white bg-opacity-50" style={{ borderRadius: "var(--radius)" }} />
                </div>
              ))}
            </div>

            {/* Cuarta imagen (visible solo en desktop) */}
            <div className="relative group justify-center items-center h-full w-full hidden lg:flex">
              <img 
                className="object-center object-cover h-full w-full"
                style={{ borderRadius: 'var(--radius)' }}
                src={getDefaultBanner(previewCategories[3]).mainImage.url}
                alt={getDefaultBanner(previewCategories[3]).title}
              />
              <Link 
                href={getDefaultBanner(previewCategories[3]).buttonLink}
                style={{ borderRadius: 'var(--radius)' }}
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 bottom-4 z-10 absolute text-base font-medium leading-none text-foreground py-3 w-36 bg-secondary hover:bg-primary text-center"
              >
                {getDefaultBanner(previewCategories[3]).title}
              </Link>
              <div className="absolute opacity-0 group-hover:opacity-100 transition duration-500 bottom-3 py-6 z-0 px-20 w-36 bg-white bg-opacity-50" style={{ borderRadius: "var(--radius)" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categoria06Preview;