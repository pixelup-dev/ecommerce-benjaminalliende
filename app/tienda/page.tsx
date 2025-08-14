/* eslint-disable @next/next/no-img-element */
import React from "react";
import ProductGridShop from "@/components/Core/ProductGridHome/ProductGridShop";
import { RevalidationProvider } from "@/app/Context/RevalidationContext";
import BannerTienda01 from "@/components/PIXELUP/BannerTienda/BannerTienda01/BannerTienda01";
import MarqueeTOP from "@/components/conMantenedor/MarqueeTOP";

// Metadatos para SEO
export const metadata = {
  title: "Tienda - Productos y Ofertas",
  description:
    "Explora nuestra amplia selección de productos con las mejores ofertas. Envío a domicilio y retiro en tienda disponible.",
  keywords: "tienda, productos, ofertas, envío, retiro en tienda",
};

// Componente del servidor para la carga inicial
async function fetchInitialData(searchParams: {
  [key: string]: string | undefined;
}) {
  const [productsData, productTypesData] = await Promise.all([
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&pageNumber=1&pageSize=1000&=ACTIVE`,
      {
        next: {
          tags: ["products"],
          revalidate: 3600, // Cache por 1 hora por defecto
        },
      }
    ).then((res) => res.json()),
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/product-types?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&pageNumber=1&pageSize=1000`,
      {
        next: {
          tags: ["categories"],
          revalidate: 0, // Cache por 1 hora por defecto
        },
      }
    ).then((res) => res.json()),
  ]);

  return {
    products: productsData.products,
    productTypes: productTypesData.productTypes,
    selectedCategory: searchParams.categoria || null,
    currentPage: searchParams.page ? parseInt(searchParams.page) : 1,
  };
}

export default async function Tienda({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const initialData = await fetchInitialData(searchParams);

  return (
    <RevalidationProvider>
      {/*   <MarqueeTOP /> */}
      <div className="w-full min-h-screen bg-gray-50">
        <BannerTienda01 />
        <ProductGridShop
          initialProducts={initialData.products}
          initialProductTypes={initialData.productTypes}
          selectedCategory={initialData.selectedCategory}
          currentPage={initialData.currentPage}
        />
      </div>
    </RevalidationProvider>
  );
}
