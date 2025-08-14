/* eslint-disable @next/next/no-img-element */
// app/page.js
import axios from "axios";
import { Suspense } from "react";

import Categoria02 from "@/components/PIXELUP/Categorias/Categoria02/Categoria02";
import Frase01 from "@/components/PIXELUP/Frases/Frase01/Frase01";
import Frase02 from "@/components/PIXELUP/Frases/Frase02/Frase02";
import BannerPrincipal02 from "@/components/PIXELUP/BannerPrincipal/BannerPrincipal02/BannerPrincipal02";
import Destacados01 from "@/components/PIXELUP/Destacados/Destacado01";
import {
  DynamicNavbar,
  DynamicFooter,
} from "@/app/components/LayoutComponents";
import DiscountModal from "@/components/PIXELUP/Modal/DiscountModal";
import SinFoto01 from "@/components/PIXELUP/SinFoto/SinFoto01/SinFoto01";
import BannerPrincipal01 from "@/components/PIXELUP/BannerPrincipal/BannerPrincipal01/BannerPrincipal01";
import Banner from "@/components/PIXELUP/Skeleton/Banner";
import Destacados from "@/components/PIXELUP/Skeleton/Destacados";
import Parallax from "@/components/PIXELUP/Parallax/Parallax";
import Colecciones02 from "@/components/PIXELUP/Colecciones/Colecciones02/Colecciones02";
import WhatsAppButton from "@/components/Core/WhatsAppButton/WhatsAppButton";
import FeedInstagram from "@/components/PIXELUP/FeedInstagram/FeedInstagram";
import Ubicacion from "@/components/PIXELUP/Ubicacion/Ubicacion";
import Hero01 from "@/components/PIXELUP/Hero/Hero01/Hero01";
import Hero02 from "@/components/PIXELUP/Hero/Hero02/Hero02";
import Hero03 from "@/components/PIXELUP/Hero/Hero03/Hero03";
import Hero04 from "@/components/PIXELUP/Hero/Hero04/Hero04";
import MarqueeTOP from "@/components/conMantenedor/MarqueeTOP";

export default async function Page() {
  try {
    return (
      <>
        <MarqueeTOP />
        <DynamicNavbar />

        <Suspense fallback={<Banner />}>
          <Ubicacion />
        </Suspense>
        <Suspense fallback={<Banner />}>
          <FeedInstagram />
        </Suspense>

        {/* 
        <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
          <SinFoto01 />
        </Suspense>
        <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
          <Destacados01 text="Destacados" />
        </Suspense>
        <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
          <Categoria02 />
        </Suspense>
        <Suspense fallback={<div className="h-24 animate-pulse bg-gray-100" />}>
          <Frase01 />
        </Suspense>
        <Suspense fallback={<Destacados />}>
          <Destacados01 text="Destacados" />
        </Suspense>
        <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
          <Hero02 />
        </Suspense>
        <Suspense fallback={<div className="h-24 animate-pulse bg-gray-100" />}>
          <Frase02 />
        </Suspense> */}
        <DynamicFooter />

        {/* <DiscountModal /> */}
        <WhatsAppButton />
      </>
    );
  } catch (error) {
    console.error("Error en Page:", error);
    return <div>Ha ocurrido un error al cargar la página</div>;
  }
}
