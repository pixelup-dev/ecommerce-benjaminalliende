"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

const Categoria05Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 3);
  
  const defaultImage = "/img/placeholder.webp";
  const getDefaultBanner = (index: number) => {
    return previewCategories[index]
      ? previewCategories[index]
      : {
          mainImage: { url: defaultImage },
          title: "Titulo por defecto",
          buttonLink: "#",
        };
  };

  return (
    <div>
      <div className="flex items-center justify-center px-4 lg:px-0">
        <div className="max-w-7xl mx-auto rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* COLGANTES */}
            <div className="relative flex flex-col items-center w-full">
              <Link
                href={getDefaultBanner(0).buttonLink}
                rel="noopener noreferrer"
                className="w-full"
              >
                <div
                  className="w-[326px] h-[220px] md:w-[300px] md:h-[500px] lg:w-[600px] lg:h-[600px] bg-cover bg-center mx-auto"
                  style={{
                    backgroundImage: `url(${
                      getDefaultBanner(0).mainImage.url
                    })`,
                    borderRadius: "var(--radius)",
                    backgroundPosition: "center center",
                  }}
                >
                  <div
                    className="w-full h-full flex items-end justify-start p-4"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <h2 className="text-2xl md:text-4xl font-bold text-white">
                      {getDefaultBanner(0).title}
                    </h2>
                  </div>
                </div>
              </Link>
            </div>
            {/* ANILLOS */}
            <div className="relative flex flex-col items-center w-full">
              <Link
                href={getDefaultBanner(1).buttonLink}
                rel="noopener noreferrer"
                className="w-full"
              >
                <div
                  className="w-[326px] h-[250px] md:w-[300px] md:h-[380px] lg:w-[600px] lg:h-[480px] bg-cover bg-center mx-auto"
                  style={{
                    backgroundImage: `url(${
                      getDefaultBanner(1).mainImage.url
                    })`,
                    borderRadius: "var(--radius)",
                  }}
                >
                  <div
                    className="w-full h-full flex items-end justify-end p-4"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <h2 className="text-2xl md:text-4xl font-bold text-white">
                      {getDefaultBanner(1).title}
                    </h2>
                  </div>
                </div>
              </Link>
            </div>
            {/* PULSERAS */}
            <div className="relative flex flex-col items-center w-full">
              <Link
                href={getDefaultBanner(2).buttonLink}
                rel="noopener noreferrer"
                className="w-full"
              >
                <div
                  className="w-[326px] h-[150px] md:w-[300px] md:h-[260px] lg:w-[600px] lg:h-[360px] bg-cover bg-center mx-auto"
                  style={{
                    backgroundImage: `url(${
                      getDefaultBanner(2).mainImage.url
                    })`,
                    borderRadius: "var(--radius)",
                  }}
                >
                  <div
                    className="w-full h-full flex items-start justify-start p-4"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <h2 className="text-2xl md:text-4xl font-bold text-white">
                      {getDefaultBanner(2).title}
                    </h2>
                  </div>
                </div>
              </Link>
            </div>
            {/* AROS */}
            <div className="relative flex flex-col items-center w-full mt-0 md:mt-[-120px]">
              <Link
                href={getDefaultBanner(3).buttonLink}
                rel="noopener noreferrer"
                className="w-full"
              >
                <div
                  className="w-[326px] h-[250px] md:w-[300px] md:h-[380px] lg:w-[600px] lg:h-[480px] bg-cover bg-center mx-auto"
                  style={{
                    backgroundImage: `url(${
                      getDefaultBanner(3).mainImage.url
                    })`,
                    borderRadius: "var(--radius)",
                  }}
                >
                  <div
                    className="w-full h-full flex items-end justify-end p-4"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <h2 className="text-2xl md:text-4xl font-bold text-white">
                      {getDefaultBanner(3).title}
                    </h2>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categoria05Preview;