"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Galeria01Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 3);
  
  const defaultImage = "/img/placeholder.webp";
  const getDefaultBanner = (index: number) => {
    return previewCategories[index]
      ? previewCategories[index]
      : { mainImage: { url: defaultImage }, title: "Titulo por defecto", buttonLink: "#" };
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <ul className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3 mb-28">
        <li>
          <img
            src={getDefaultBanner(0).mainImage.url}
            alt={getDefaultBanner(0).title}
            className="aspect-square w-full object-cover"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </li>

        <li>
          <img
            src={getDefaultBanner(1).mainImage.url}
            alt={getDefaultBanner(1).title}
            className="aspect-square w-full object-cover"
            style={{ borderRadius: 'var(--radius)' }}
          />
        </li>

        <li className="lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <img
            src={getDefaultBanner(2).mainImage.url}
            alt={getDefaultBanner(2).title}
            className="aspect-square w-full object-cover"
            style={{ borderRadius: 'var(--radius)', objectPosition: 'center top' }}
          />
        </li>
      </ul>
    </div>
  );
};

export default Galeria01Preview;