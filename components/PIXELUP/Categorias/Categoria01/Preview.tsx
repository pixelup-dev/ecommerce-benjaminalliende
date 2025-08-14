"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";
import { slugify } from "@/app/utils/slugify";

const Categoria01Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 4);
  
  return (
    <section
      id="banner"
      className="w-full z-10"
    >
      <div>
        <div className="py-6 sm:py-8 lg:py-12">
          <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
            <h2 className="mb-8 text-center text-2xl font-bold text-primary md:mb-12 lg:text-3xl">
              {previewData.titulo || "Categorías Destacadas"}
            </h2>

            <div className="flex flex-wrap gap-6 items-center align-middle justify-center">
              {/* product - start */}
              {previewCategories.map((banner, index) => (
                <div
                  className="flex-1 max-w-[200px] min-w-[200px]"
                  key={index}
                >
                  <Link
                    href={`/tienda?categoria=${slugify(banner.title)}`}
                    className="group relative flex flex-wrap h-64 md:h-96 items-end overflow-hidden rounded-lg bg-gray-100 p-4 shadow-lg"
                  >
                    <img
                      src={banner.mainImage.url}
                      loading="lazy"
                      alt="Colección Diosa Madre"
                      className="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
                    />
                    <div className="relative w-full text-center bg-white rounded-xl p-2 font-bold" style={{ borderRadius: "var(--radius)" }}>
                      <h3 className="text-xl text-dark">{banner.title}</h3>
                      <p className="mt-1 text-sm text-black hidden">
                        {banner.landingText}
                      </p>
                    </div>
                  </Link>
                </div>
              ))}
              {/* product - end */}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default Categoria01Preview;