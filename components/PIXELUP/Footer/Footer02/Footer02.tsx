"use client";

import Footer from "./cdgfooter02";
import { useState, useEffect } from "react";

export default function footer() {
  const Footer02 = {
    titulo: "Adventure calls, conquer mountain trails.",
    subtitulo: "Adventure calls, conquer mountain trails.",
    parrafo: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    img: "/img/Logo/tavola.jpeg",
  };

  return <Footer FooterData={Footer02} />;
}
