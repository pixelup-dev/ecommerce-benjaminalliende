"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";

const Categoria01 = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga

      const BannersCategory = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_CATEGORIA01_ID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
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
    <section
      id="banner"
      className="w-full z-10"
    >
      {bannerData && (
        <div>
          <div className=" py-6 sm:py-8 lg:py-12">
            <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
              <h2 className="mb-8 text-center text-2xl font-bold text-primary md:mb-12 lg:text-3xl ">
                Categorías Destacadas
              </h2>

              <div className="flex flex-wrap gap-6 items-center align-middle justify-center">
                {/* product - start */}
                {bannerData.map((banner: any) => (
                  <div
                    className="flex-1 max-w-[200px] min-w-[200px] "
                    key={banner.id}
                  >
                    <Link
                      href={`/tienda?categoria=${slugify(banner.title)}`}
                      className="group relative flex flex-wrap h-64 md:h-96 items-end overflow-hidden rounded-lg bg-gray-100 p-4 shadow-lg"
                    >
                      <img
                        src={banner.mainImage.url}
                        loading="lazy"
                        alt="Colección Diosa Madre"
                        className="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
                      />
                      <div className="relative w-full text-center bg-white rounded-xl p-2 font-bold " style={{ borderRadius: "var(--radius)" }}>
                        <h3 className="text-xl text-dark">{banner.title}</h3>
                        <p className="mt-1 text-sm text-black hidden">
                          {banner.landingText}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}

                {/* product - end */}
              </div>
            </div>
          </div>
        </div>
      )}
      <div className=" justify-center hidden">
        <Link
          href="#"
          className="mr-3 inline-flex items-center justify-center rounded-lg bg-[#004BAB] px-5 py-3 text-center text-base font-medium text-white transition duration-300 hover:scale-110"
        >
          Quiero más información
          <svg
            className="-mr-1 ml-2 h-5 w-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            ></path>
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default Categoria01;