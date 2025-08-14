/**
 * Configuración global para los componentes principales de la aplicación
 * Este archivo maneja la carga dinámica de componentes y la configuración activa
 */

"use client";
import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Configuración global por defecto de la aplicación
 */
export const globalConfig: GlobalConfig = {
  activeFooter: "Footer01",
  activeNavbar: "Navbar01",
  activeProductCard: "ProductCard03",
  activeProductDetail: "ProductDetail04",
  whatsappButton: {
    isActive: true,
    link: process.env.NEXT_PUBLIC_WHATSAPP_LINK || "",
  },
  bannerPrincipalAspects: {
    desktop: "16/5",
    tablet: "16/6",
    mobile: "3/2",
  },
  bannerAspects: {
    desktop: "16/4",
    mobile: "3/2",
  },
  bannerAboutAspects: {
    desktop: "16/5",
    mobile: "9/5",
  },
  bannerTiendaAspects: {
    desktop: "16/3",
    mobile: "3/2",
  },
};

// **************************************************
// ************** Tipos de Componentes **************
// **************************************************

type FooterType = "Footer01" | "Footer02" | "Footer03";
type NavbarType = "Navbar01" | "Navbar02";
type ProductCardType =
  | "ProductCard01"
  | "ProductCard02"
  | "ProductCard03"
  | "ProductCard04"
  | "ProductCard05";
type ProductDetailType =
  | "ProductDetail01"
  | "ProductDetail02"
  | "ProductDetail03"
  | "ProductDetail04";

// **************************************************
// ************** Componentes de Carga **************
// **************************************************
//Componente de carga general para secciones grandes

const LoadingComponent = () => (
  <div className="animate-pulse bg-gray-100 h-96" />
);

const NavLoadingComponent = () => (
  <div className="animate-pulse bg-gray-100 h-20" />
);

// **************************************************
// ********** Configuración de Componentes **********
// **************************************************
//Configuración de los diferentes tipos de Footer disponibles

const footerComponents = {
  Footer01: dynamic(
    () => import("@/components/PIXELUP/Footer/Footer01/Footer01"),
    { loading: LoadingComponent, ssr: true }
  ),
  Footer02: dynamic(
    () => import("@/components/PIXELUP/Footer/Footer02/Footer02"),
    { loading: LoadingComponent, ssr: true }
  ),
  Footer03: dynamic(
    () => import("@/components/PIXELUP/Footer/Footer03/Footer03"),
    { loading: LoadingComponent, ssr: true }
  ),
} as const;

/**
 * Configuración de los diferentes tipos de Navbar disponibles
 */

const navbarComponents = {
  Navbar01: dynamic(
    () => import("@/components/PIXELUP/Navbar/Navbar01/Navbar01"),
    { loading: NavLoadingComponent, ssr: true }
  ),
  Navbar02: dynamic(
    () => import("@/components/PIXELUP/Navbar/Navbar02/Navbar02"),
    { loading: NavLoadingComponent, ssr: true }
  ),
} as const;

/**
 * Configuración de los diferentes tipos de ProductCard disponibles
 */

const productCardComponents = {
  ProductCard01: dynamic(
    () =>
      import("@/components/PIXELUP/ProductCards/ProductCards01/ProductCard01"),
    { loading: LoadingComponent, ssr: true }
  ),
  ProductCard02: dynamic(
    () =>
      import("@/components/PIXELUP/ProductCards/ProductCards02/ProductCard02"),
    { loading: LoadingComponent, ssr: true }
  ),
  ProductCard03: dynamic(
    () =>
      import("@/components/PIXELUP/ProductCards/ProductCards03/ProductCard03"),
    { loading: LoadingComponent, ssr: true }
  ),
  ProductCard04: dynamic(
    () =>
      import("@/components/PIXELUP/ProductCards/ProductCards04/ProductCards04"),
    { loading: LoadingComponent, ssr: true }
  ),
  ProductCard05: dynamic(
    () =>
      import("@/components/PIXELUP/ProductCards/ProductCards05/ProductCards05"),
    { loading: LoadingComponent, ssr: true }
  ),
} as const;

/**
 * Configuración de los diferentes tipos de ProductDetail disponibles
 */

const productDetailComponents = {
  ProductDetail01: dynamic(
    () =>
      import(
        "@/components/PIXELUP/ProductDetail/ProductDetail01/ProductDetail01"
      ),
    { loading: LoadingComponent, ssr: true }
  ),
  ProductDetail02: dynamic(
    () =>
      import(
        "@/components/PIXELUP/ProductDetail/ProductDetail02/ProductDetail02"
      ),
    { loading: LoadingComponent, ssr: true }
  ),
  ProductDetail03: dynamic(
    () =>
      import(
        "@/components/PIXELUP/ProductDetail/ProductDetail03/ProductDetail03"
      ),
    { loading: LoadingComponent, ssr: true }
  ),
  ProductDetail04: dynamic(
    () =>
      import(
        "@/components/PIXELUP/ProductDetail/ProductDetail04/ProductDetail04"
      ),
    { loading: LoadingComponent, ssr: true }
  ),
} as const;
// **************************************************
// ******* Interfaces y Configuración Global ********
// **************************************************
//Interface que define la estructura de la configuración global

export interface GlobalConfig {
  activeFooter: FooterType;
  activeNavbar: NavbarType;
  activeProductCard: ProductCardType;
  activeProductDetail: ProductDetailType;
  whatsappButton: {
    isActive: boolean;
    link: string;
  };
  bannerPrincipalAspects: {
    desktop: string;
    tablet: string;
    mobile: string;
  };
  bannerAspects: {
    desktop: string;
    mobile: string;
  };
  bannerAboutAspects: {
    desktop: string;
    mobile: string;
  };
  bannerTiendaAspects: {
    desktop: string;
    mobile: string;
  };
}

/**
 * Obtiene los componentes activos según la configuración global
 * @returns Objeto con los componentes Footer, Navbar y ProductCard activos
 */
export function getActiveComponents() {
  const Footer = footerComponents[globalConfig.activeFooter];
  const Navbar = navbarComponents[globalConfig.activeNavbar];
  const ProductCard = productCardComponents[globalConfig.activeProductCard];
  const ProductDetail =
    productDetailComponents[globalConfig.activeProductDetail];
  return { Footer, Navbar, ProductCard, ProductDetail };
}
