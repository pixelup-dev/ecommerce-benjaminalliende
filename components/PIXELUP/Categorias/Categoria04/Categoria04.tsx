"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const Categoria04 = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const defaultImage = "/img/placeholder.webp";
  
  const getDefaultBanner = (banner: any) => {
    return banner || {
      mainImage: { url: defaultImage },
      title: "Titulo por defecto",
      description: "Descripción no disponible",
      buttonLink: "#",
    };
  };

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_CATEGORIA04_ID}`;

      const BannersCategory = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const bannerImages = BannersCategory.data.banner.images;
      const sortedBannerImages = bannerImages.sort(
        (a: any, b: any) => a.orderNumber - b.orderNumber
      );
      setBannerData(sortedBannerImages);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    fetchBannerCategoryHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial

  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <header className="text-center">
          <h2 className="text-xl font-bold text-primary sm:text-3xl">
             Nuestras Categorías
          </h2>
          <p className="mx-auto mt-4 max-w-md text-foreground">
            Descubre nuestra selección de productos
          </p>
        </header>

        <ul className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Primer item */}
          <li>
            <Link href={getDefaultBanner(bannerData?.[0]).buttonLink} className="group relative block">
              <img
                src={getDefaultBanner(bannerData?.[0]).mainImage.url}
                alt={getDefaultBanner(bannerData?.[0]).title}
                className="aspect-square w-full object-cover transition duration-500 group-hover:opacity-60"
                style={{ borderRadius: 'var(--radius)' }}
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 bg-black bg-opacity-30" style={{ borderRadius: "var(--radius)" }}>
                <h3 className="text-3xl font-bold text-white">
                  {getDefaultBanner(bannerData?.[0]).title}
                </h3>
                <span className="mt-1.5 inline-block bg-secondary hover:bg-primary px-5 py-3 text-xs font-medium uppercase tracking-wide text-foreground" 
                      style={{ borderRadius: 'var(--radius)' }}>
                  Ver más
                </span>
              </div>
            </Link>
          </li>

          {/* Segundo item */}
          <li>
            <Link href={getDefaultBanner(bannerData?.[1]).buttonLink} className="group relative block">
              <img
                src={getDefaultBanner(bannerData?.[1]).mainImage.url}
                alt={getDefaultBanner(bannerData?.[1]).title}
                className="aspect-square w-full object-cover transition duration-500 group-hover:opacity-90"
                style={{ borderRadius: 'var(--radius)' }}
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 bg-black bg-opacity-30" style={{ borderRadius: "var(--radius)" }}>
                <h3 className="text-3xl font-bold text-white">
                  {getDefaultBanner(bannerData?.[1]).title}
                </h3>
                <span className="mt-1.5 inline-block bg-secondary hover:bg-primary px-5 py-3 text-xs font-medium uppercase tracking-wide text-foreground"
                      style={{ borderRadius: 'var(--radius)' }}>
                  Ver más
                </span>
              </div>
            </Link>
          </li>

          {/* Tercer item (más grande) */}
          <li className="lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <Link href={getDefaultBanner(bannerData?.[2]).buttonLink} className="group relative block">
              <img
                src={getDefaultBanner(bannerData?.[2]).mainImage.url}
                alt={getDefaultBanner(bannerData?.[2]).title}
                className="aspect-square w-full object-cover transition duration-500 group-hover:opacity-90"
                style={{ borderRadius: 'var(--radius)' }}
              />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-6 bg-black bg-opacity-30" style={{ borderRadius: "var(--radius)" }}>
                <h3 className="text-3xl font-bold text-white">
                  {getDefaultBanner(bannerData?.[2]).title}
                </h3>
                <span className="mt-1.5 inline-block bg-secondary hover:bg-primary px-5 py-3 text-xs font-medium uppercase tracking-wide text-foreground"
                      style={{ borderRadius: 'var(--radius)' }}>
                  Ver más
                </span>
              </div>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Categoria04;

