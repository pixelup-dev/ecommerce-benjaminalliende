"use client";
import React from "react";
import Link from "next/link";
import { previewData, previewDataExtended } from "@/app/config/previewData";

interface BannerImage {
  mainImage: any;
  url: string;
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
}

interface BannerData {
  images: BannerImage[];
}

const Categoria09Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 2);

  return (
    <div className="pt-8">
      <div className="flex flex-col md:flex-row">
        {previewCategories.map((image, index) => (
          <div
            key={index}
            className="relative h-[500px] md:w-1/2 overflow-hidden group cursor-pointer"
          >
            <img
              src={image.mainImage.url}
              alt={image.title}
              className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 hover:grayscale-0 hover:contrast-100 hover:brightness-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10 group-hover:opacity-20 transition-opacity"></div>
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-8">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {image.title}
              </h3>
              <p className="text-white text-lg max-w-md mb-8">
                {image.landingText}
              </p>
              <Link
                href={image.buttonLink || '#'}
                className={`px-8 py-3 rounded font-bold transition-colors ${
                  index === 0
                    ? "bg-[#ca763b] hover:bg-[#ca763b]/90 text-white"
                    : "bg-[#134b42] hover:bg-[#134b42]/90 text-white"
                }`}
              >
                {"Ver más"}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categoria09Preview;