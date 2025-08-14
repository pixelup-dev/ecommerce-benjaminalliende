"use client";

import Footer03 from "./cdgfooter03";
import { useState, useEffect } from "react";

export default function footer() {
  const FooterData = {
    titulo: "Adventure calls, conquer mountain trails.",
    subtitulo: "Adventure calls, conquer mountain trails.",
    parrafo: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    img: "/img/pixelup.png",
  };

  return <Footer03 Footer03Data={FooterData} />;
}
