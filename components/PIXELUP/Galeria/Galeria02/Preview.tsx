"use client";
import React from "react";
import { previewData, previewDataExtended } from "@/app/config/previewData";

interface BannerImage {
  id: string;
  mainImage: {
    url: string;
    data?: string;
  };
}

const Galeria02Preview = () => {
  const previewCategories = previewDataExtended.categorias.slice(0, 4);
  
  // Simular bannerImages con las categorías de preview
  const bannerImages: BannerImage[] = previewCategories.map((category, index) => ({
    id: `preview-${index}`,
    mainImage: {
      url: category.mainImage.url
    }
  }));

  return (
    <div className="bg-white py-24">
      <div className="mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-video w-full overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Video Preview</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {bannerImages.map((image, index) => (
              <div
                key={image.id}
                className="relative rounded-xl overflow-hidden shadow-lg h-[250px] hover:shadow-2xl transition-all duration-300 group"
                style={{ borderRadius: "var(--radius)" }}
              >
                <img
                  src={image.mainImage.url}
                  alt={`Proyecto ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            ))}
            {bannerImages.length < 4 &&
              Array.from({ length: 4 - bannerImages.length }).map((_, index) => (
                <div
                  key={`default-${index}`}
                  className="relative rounded-xl overflow-hidden shadow-lg h-[250px] hover:shadow-2xl transition-all duration-300 group"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <img
                    src={`/cubico/${bannerImages.length + index + 1}.webp`}
                    alt={`Proyecto ${bannerImages.length + index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Galeria02Preview;