"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Categoria04Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 3);
  
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
    <section>
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <h2 className="text-xl font-bold text-primary sm:text-3xl">
             Nuestras Categorías
          </h2>
          <p className="mx-auto mt-4 max-w-md text-foreground">
            Descubre nuestra selección de productos
          </p>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Primer item */}
          <li>
            <Link href={getDefaultBanner(previewCategories[0]).buttonLink} className="group relative block">
              <img
                src={getDefaultBanner(previewCategories[0]).mainImage.url}
                alt={getDefaultBanner(previewCategories[0]).title}
                className="aspect-square w-full object-cover transition duration-500 group-hover:opacity-60"
                style={{ borderRadius: 'var(--radius)' }}
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 bg-black bg-opacity-30" style={{ borderRadius: "var(--radius)" }}>
                <h3 className="text-3xl font-bold text-white">
                  {getDefaultBanner(previewCategories[0]).title}
                </h3>
                <span className="mt-1.5 inline-block bg-secondary hover:bg-primary px-5 py-3 text-xs font-medium uppercase tracking-wide text-foreground" 
                      style={{ borderRadius: 'var(--radius)' }}>
                  Ver más
                </span>
              </div>
            </Link>
          </li>

          {/* Segundo item */}
          <li>
            <Link href={getDefaultBanner(previewCategories[1]).buttonLink} className="group relative block">
              <img
                src={getDefaultBanner(previewCategories[1]).mainImage.url}
                alt={getDefaultBanner(previewCategories[1]).title}
                className="aspect-square w-full object-cover transition duration-500 group-hover:opacity-90"
                style={{ borderRadius: 'var(--radius)' }}
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 bg-black bg-opacity-30" style={{ borderRadius: "var(--radius)" }}>
                <h3 className="text-3xl font-bold text-white">
                  {getDefaultBanner(previewCategories[1]).title}
                </h3>
                <span className="mt-1.5 inline-block bg-secondary hover:bg-primary px-5 py-3 text-xs font-medium uppercase tracking-wide text-foreground"
                      style={{ borderRadius: 'var(--radius)' }}>
                  Ver más
                </span>
              </div>
            </Link>
          </li>

          {/* Tercer item (más grande) */}
          <li className="lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Link href={getDefaultBanner(previewCategories[2]).buttonLink} className="group relative block">
              <img
                src={getDefaultBanner(previewCategories[2]).mainImage.url}
                alt={getDefaultBanner(previewCategories[2]).title}
                className="aspect-square w-full object-cover transition duration-500 group-hover:opacity-90"
                style={{ borderRadius: 'var(--radius)' }}
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 bg-black bg-opacity-30" style={{ borderRadius: "var(--radius)" }}>
                <h3 className="text-3xl font-bold text-white">
                  {getDefaultBanner(previewCategories[2]).title}
                </h3>
                <span className="mt-1.5 inline-block bg-secondary hover:bg-primary px-5 py-3 text-xs font-medium uppercase tracking-wide text-foreground"
                      style={{ borderRadius: 'var(--radius)' }}>
                  Ver más
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Categoria04Preview;