"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

const BannersCategorias = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = "cb50bccd-aff7-4ac7-8e13-8d784ad125ac";

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
    <section
      id="banner"
      className="w-full z-10"
    >
      {bannerData && (
        <div>
          <div className=" py-6 sm:py-8 lg:py-12">
            <div className="mx-auto max-w-screen-2xl px-4 md:px-8">
              <h2 className="mb-8 text-center text-2xl font-bold text-gray-800 md:mb-12 lg:text-3xl ">
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
                      href={banner.buttonLink}
                      className="group relative flex flex-wrap h-96 items-end overflow-hidden rounded-lg bg-gray-100 p-4 shadow-lg"
                    >
                      <img
                        src={banner.mainImage.url}
                        loading="lazy"
                        alt="Colección Diosa Madre"
                        className="absolute inset-0 h-full w-full object-cover object-center transition duration-200 group-hover:scale-110"
                      />
                      <div className="relative w-full text-center bg-white rounded-xl p-2 font-bold ">
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
    </section>
  );
};

export default BannersCategorias;
