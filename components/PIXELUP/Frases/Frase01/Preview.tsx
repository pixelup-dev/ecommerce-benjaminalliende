"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const Frase01Preview = () => {
  return (
    <section>
      <div className="m-16 flex text-center items-center max-md:flex-col font-medium text-primary px-6 font-sans">
        <p className="text-2xl font-semibold flex-1 italic">
          « {previewData.texto || "Adventure calls, conquer mountain trails."} »
        </p>
      </div>
    </section>
  );
};

export default Frase01Preview;