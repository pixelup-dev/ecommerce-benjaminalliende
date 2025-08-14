"use client";
import React from "react";
import Marquee from "react-fast-marquee";
import { previewData } from "@/app/config/previewData";

const MarqueeTOPPreview = () => {
  return (
    <section className="w-full">
      <div className="flex items-center max-md:flex-col bg-primary font-medium text-white px-8 py-2 font-sans uppercase">
        <p className="text-sm sm:text-base flex-1 text-center py-1">
          <Marquee
            speed={40}
            gradient={false}
          >
            {previewData.texto || "Este es un mensaje de marquee que se desplaza automáticamente"}
          </Marquee>
        </p>
      </div>
    </section>
  );
};

export default MarqueeTOPPreview;