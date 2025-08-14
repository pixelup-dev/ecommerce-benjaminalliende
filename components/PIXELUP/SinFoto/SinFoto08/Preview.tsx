"use client";
import React from "react";
import { previewData } from "@/app/config/previewData";

const SinFoto08Preview = () => {
  return (
    <div>
      <section>
        <div className="relative bg-primary/60 min-h-[14rem] bg-cover bg-center md:bg-fixed flex items-center justify-center">
          <div className="w-full px-4 text-center text-white flex flex-col items-center justify-center py-10">
            <div 
              className="italic max-w-[90%] md:max-w-[1200px] px-4 md:px-16 text-lg md:text-xl font-normal text-white"
              dangerouslySetInnerHTML={{ 
                __html: previewData.texto || "Este es un texto de ejemplo que se muestra en la sección con fondo de color. Puede incluir contenido HTML y se renderizará correctamente." 
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default SinFoto08Preview;