/* eslint-disable @next/next/no-img-element */
// app/page.js

import axios from "axios";
import { Suspense } from "react";
import {
  DynamicNavbar,
  DynamicFooter,
} from "@/app/components/LayoutComponents";
import WhatsAppButton from "@/components/Core/WhatsAppButton/WhatsAppButton";
import Categoria01 from "@/components/PIXELUP/Categorias/Categoria01/Categoria01";
import Categoria02 from "@/components/PIXELUP/Categorias/Categoria02/Categoria02";
import Categoria03 from "@/components/PIXELUP/Categorias/Categoria03/Categoria03";
import Categoria07 from "@/components/PIXELUP/Categorias/Categoria07/Categoria07";
import Categoria06 from "@/components/PIXELUP/Categorias/Categoria06/Categoria06";
import Categoria05 from "@/components/PIXELUP/Categorias/Categoria05/Categoria05";
import Categoria04 from "@/components/PIXELUP/Categorias/Categoria04/Categoria04";
import Colecciones01 from "@/components/PIXELUP/Colecciones/Colecciones01/Colecciones01";
import Colecciones02 from "@/components/PIXELUP/Colecciones/Colecciones02/Colecciones02";
import Destacados01 from "@/components/PIXELUP/Destacados/Destacado01";
import Destacados02 from "@/components/PIXELUP/Destacados/Destacados02/Destacado02";
import Destacados03 from "@/components/PIXELUP/Destacados/Destacados03/Destacado03";
import DestacadosCat from "@/components/PIXELUP/Destacados/DestacadosCat/DestacadosCat";
import FeedInstagram from "@/components/PIXELUP/FeedInstagram/FeedInstagram";
import FeedRRSS from "@/components/PIXELUP/FeedRRSS/FeedRRSS";
import Frase01 from "@/components/PIXELUP/Frases/Frase01/Frase01";
import Galeria01 from "@/components/PIXELUP/Galeria/Galeria01/Galeria01";
import Galeria02 from "@/components/PIXELUP/Galeria/Galeria02/Galeria02";
import Hero01 from "@/components/PIXELUP/Hero/Hero01/Hero01";
import Hero02 from "@/components/PIXELUP/Hero/Hero02/Hero02";
import Hero03 from "@/components/PIXELUP/Hero/Hero03/Hero03";
import Hero04 from "@/components/PIXELUP/Hero/Hero04/Hero04";
import Hero05 from "@/components/PIXELUP/Hero/Hero05/Hero05";
import Hero06 from "@/components/PIXELUP/Hero/Hero06/Hero06";
import Hero07 from "@/components/PIXELUP/Hero/Hero07/Hero07";
import Hero08 from "@/components/PIXELUP/Hero/Hero08/Hero08";
import Hero09 from "@/components/PIXELUP/Hero/Hero09/Hero09";
import LogosCarrusel from "@/components/PIXELUP/Marcas/LogosCarrusel/LogosCarrusel";
import LogosDinamicos from "@/components/PIXELUP/Marcas/LogosDinamicos/LogosDinamicos";
import LogosFijos from "@/components/PIXELUP/Marcas/LogosFijos/LogosFijos";
import Marquee from "@/components/PIXELUP/Marquee/MarqueeTop/Marquee";
import Nosotros01 from "@/components/PIXELUP/Nosotros/Nosotros01/Nosotros01";
import Parallax from "@/components/PIXELUP/Parallax/Parallax";
import Parallax01 from "@/components/PIXELUP/Parallax01/Parallax01";
import Servicios01 from "@/components/PIXELUP/Servicios/Servicios01/Servicios01";
import Servicios02 from "@/components/PIXELUP/Servicios/Servicios02/Servicios02";
import Servicios03 from "@/components/PIXELUP/Servicios/Servicios03/Servicios03";
import Servicios04 from "@/components/PIXELUP/Servicios/Servicios04/Servicios04";
import Materiales from "@/components/PIXELUP/SinFoto/Materiales/Materiales";
import SinFoto01 from "@/components/PIXELUP/SinFoto/SinFoto01/SinFoto01";
import SinFoto02 from "@/components/PIXELUP/SinFoto/SinFoto02/SinFoto02";
import SinFoto03 from "@/components/PIXELUP/SinFoto/SinFoto03/SinFoto03";
import SinFoto04 from "@/components/PIXELUP/SinFoto/SinFoto04/SinFoto04";
import SinFoto05 from "@/components/PIXELUP/SinFoto/SinFoto05/SinFoto05";
import SinFoto06 from "@/components/PIXELUP/SinFoto/SinFoto06/SinFoto06";
import SinFoto07 from "@/components/PIXELUP/SinFoto/SinFoto07/SinFoto07";
import Testimonios01 from "@/components/PIXELUP/Testimonios/Testimonios01/Testimonios01";
import Testimonios02 from "@/components/PIXELUP/Testimonios/Testimonios02/Testimonios02";
import Testimonios03 from "@/components/PIXELUP/Testimonios/Testimonios03/Testimonios03";
import Testimonios04 from "@/components/PIXELUP/Testimonios/Testimonios04/Testimonios04";
import Ubicacion01 from "@/components/PIXELUP/Ubicacion/Ubicacion";
import Ubicacion02 from "@/components/PIXELUP/Ubicacion/Ubicacion02/Ubicacion02";
import SinFoto08 from "@/components/PIXELUP/SinFoto/SinFoto08/SinFoto08";
import Categoria08 from "@/components/PIXELUP/Categorias/Categoria08/Categoria08";
import Testimonios05 from "@/components/PIXELUP/Testimonios/Testimonios05/Testimonios05";
import Ubicacion03 from "@/components/PIXELUP/Ubicacion/Ubicacion03/Ubicacion03";
import Categoria09 from "@/components/PIXELUP/Categorias/Categoria09/Categoria09";
import SinFoto09 from "@/components/PIXELUP/SinFoto/SinFoto09/SinFoto09";
import SinFoto10 from "@/components/PIXELUP/SinFoto/SinFoto10/SinFoto10";
import Hero10 from "@/components/PIXELUP/Hero/Hero10/Hero10";
import SinFoto11 from "@/components/PIXELUP/SinFoto/SinFoto11/SinFoto11";
import Hero11 from "@/components/PIXELUP/Hero/Hero11/Hero11";
import Hero12 from "@/components/PIXELUP/Hero/Hero12/Hero12";
import SinFoto12 from "@/components/PIXELUP/SinFoto/SinFoto12/SinFoto12";
import Hero13 from "@/components/PIXELUP/Hero/Hero13/Hero13";
import Categoria10 from "@/components/PIXELUP/Categorias/Categoria10/Categoria10";
import Ubicacion04 from "@/components/PIXELUP/Ubicacion/Ubicacion04/Ubicacion04";
import SinFoto13 from "@/components/PIXELUP/SinFoto/SinFoto13/SinFoto13";
import Hero14 from "@/components/PIXELUP/Hero/Hero14/Hero14";
import Ubicacion05 from "@/components/PIXELUP/Ubicacion/Ubicacion05/Ubicacion05";
import Hero15 from "@/components/PIXELUP/Hero/Hero15/Hero15";
import Materiales02 from "@/components/PIXELUP/SinFoto/Materiales02/Materiales02";
import SinFoto14 from "@/components/PIXELUP/SinFoto/SinFoto14/SinFoto14";
import Hero16 from "@/components/PIXELUP/Hero/Hero16/Hero16";
import Hero17 from "@/components/PIXELUP/Hero/Hero17/Hero17";
import Hero18 from "@/components/PIXELUP/Hero/Hero18/Hero18";
import Hero19 from "@/components/PIXELUP/Hero/Hero19/Hero19";
import BannerPrincipal03 from "@/components/PIXELUP/BannerPrincipal/BannerPrincipal03/BannerPrincipal03";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL;
const canonicalUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const revalidate = 60; // Revalida cada 60 segundos

export const dynamic = "force-dynamic"; // O 'force-static' si quieres comportamiento estático

export default async function Page() {
  try {
    

    return (
      <div className="w-full">        
        <DynamicNavbar />

        <h1 className="text-2xl font-bold text-center border">ABOUT 01 FALTANTE</h1>
        <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
        </Suspense>

        <h1 className="text-2xl font-bold text-center border">FALTA REVISAR DESDE BANNERABOUT HASTA BLOG</h1>
        <h1 className="text-2xl font-bold text-center border">CARRUSEL01 FALTANTE</h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
        </Suspense>

<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta BannerPrincipal</h1>
<h1 className="text-2xl font-bold text-center border">BannerPrincipal03 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <BannerPrincipal03/>
        </Suspense>
</div>
<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Categorias</h1>
<h1 className="text-2xl font-bold text-center border">Categoria01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria01/>
        </Suspense>

        <h1 className="text-2xl font-bold text-center border">Categoria02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria02/>
        </Suspense>

        <h1 className="text-2xl font-bold text-center border">Categoria03 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria03/>
        </Suspense>

        <h1 className="text-2xl font-bold text-center border">Categoria04 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria04/>
        </Suspense>

        <h1 className="text-2xl font-bold text-center border">Categoria05 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria05/>
        </Suspense>

        <h1 className="text-2xl font-bold text-center border">Categoria06 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria06/>
        </Suspense>

        <h1 className="text-2xl font-bold text-center border">Categoria07 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria07/>
        </Suspense>

        <h1 className="text-2xl font-bold text-center border">Categoria08 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria08/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Categoria09 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria09/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Categoria10 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Categoria10/>
        </Suspense>
</div>

<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Colecciones</h1>
<h1 className="text-2xl font-bold text-center border">Colecciones01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Colecciones01/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Colecciones02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Colecciones02/>
        </Suspense>
</div>


<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Destacados</h1>
<h1 className="text-2xl font-bold text-center border">Destacados01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Destacados01/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Destacados02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Destacados02/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Destacados03 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Destacados03/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">DestacadosCat </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <DestacadosCat/>
        </Suspense>
</div>


<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta FeedInstagram</h1>
<h1 className="text-2xl font-bold text-center border">FeedInstagram </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <FeedInstagram/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">FeedRRSS </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <FeedRRSS/>
        </Suspense>
</div>

<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Footer FALTA REVISAR</h1>
</div>

<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Frases</h1>
<h1 className="text-2xl font-bold text-center border">Frase01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Frase01/>
        </Suspense>
</div>

<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Galeria</h1>
<h1 className="text-2xl font-bold text-center border">Galeria01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Galeria01/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Galeria02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Galeria02/>
        </Suspense>
</div>


<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Hero</h1>
<h1 className="text-2xl font-bold text-center border">Hero01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero01/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Hero02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero02/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Hero03 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero03/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Hero04 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero04/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Hero05 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero05/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Hero06 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero06/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Hero07 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero07/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Hero08 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero08/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Hero09 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero09/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero10 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero10/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero11 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero11/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero12 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero12/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero13 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero13/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero14 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero14/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero15 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero15/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero16 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero16/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero17 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero17/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero18 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero18/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Hero19 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Hero19/>
        </Suspense>
</div>



<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Marcas</h1>
<h1 className="text-2xl font-bold text-center border">LogosCarrusel </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <LogosCarrusel/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">LogosDinamicos </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <LogosDinamicos/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">LogosFijos </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <LogosFijos/>
        </Suspense>
</div>


<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Marquee</h1>
<h1 className="text-2xl font-bold text-center border">Marquee </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Marquee/>
        </Suspense>
</div>


<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Navbar FALTA REVISAR</h1>
</div>


<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Nosotros</h1>
<h1 className="text-2xl font-bold text-center border">Nosotros01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Nosotros01/>
        </Suspense>
</div>


<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Parallax</h1>
<h1 className="text-2xl font-bold text-center border">Parallax </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Parallax/>
        </Suspense>
</div>

<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Parallax01, revisar porque no tiene BO</h1>
<h1 className="text-2xl font-bold text-center border">Parallax01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Parallax01/>
        </Suspense>
</div>


<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">No se reviso carpeta de ProductCards, ProductDetail y Productos03</h1>
</div>

<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Servicios</h1>
<h1 className="text-2xl font-bold text-center border">Servicios01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Servicios01/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Servicios02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Servicios02/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Servicios01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Servicios03/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Servicios04 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Servicios04/>
        </Suspense>
</div>


<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta SinFoto</h1>
<h1 className="text-2xl font-bold text-center border">Materiales </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Materiales/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Materiales02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Materiales02/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">SinFoto01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto01/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">SinFoto02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto02/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">SinFoto03 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto03/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">SinFoto04 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto04/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">SinFoto05 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto05/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">SinFoto06 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto06/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">SinFoto07 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto07/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">SinFoto08 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto08/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">SinFoto09 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto09/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">SinFoto10 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto10/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">SinFoto11 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto11/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">SinFoto12 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto12/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">SinFoto13 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto13/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">SinFoto14 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <SinFoto14/>
        </Suspense>
</div>

<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Testimonios</h1>
<h1 className="text-2xl font-bold text-center border">Testimonios01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Testimonios01/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Testimonios02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Testimonios02/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Testimonios03 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Testimonios03/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Testimonios04 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Testimonios04/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Testimonios05 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Testimonios05/>
        </Suspense>
</div>

<div className="flex flex-col gap-4">
    <h1 className="text-2xl font-bold text-center border border-primary py-8">Carpeta Ubicacion</h1>
<h1 className="text-2xl font-bold text-center border">Ubicacion01 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Ubicacion01/>
        </Suspense>
<h1 className="text-2xl font-bold text-center border">Ubicacion02 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Ubicacion02/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Ubicacion03 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Ubicacion03/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Ubicacion04 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Ubicacion04/>
        </Suspense>
        <h1 className="text-2xl font-bold text-center border">Ubicacion05 </h1>
         <Suspense fallback={<div className="h-48 animate-pulse bg-gray-100" />}>
         <Ubicacion05/>
        </Suspense>
</div>


        <DynamicFooter />

        {/* <DiscountModal /> */}
        <WhatsAppButton />
      </div>
    );
  } catch (error) {
    console.error("Error en Page:", error);
    return <div>Ha ocurrido un error al cargar la página</div>;
  }
}
