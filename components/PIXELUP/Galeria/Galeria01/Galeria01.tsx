"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";



const Galeria: React.FC = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchBannerCategoryHome = async () => {
    try {
      setLoading(true);
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const bannerId = `${process.env.NEXT_PUBLIC_GALERIA01_ID}`;
      const BannersCategory = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${siteId}`
      );
      const bannerImages = BannersCategory.data.banner.images;
      const sortedBannerImages = bannerImages.sort(
        (a: any, b: any) => a.orderNumber - b.orderNumber
      );
      setBannerData(sortedBannerImages);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerCategoryHome();
  }, []);

  const defaultImage = "/img/placeholder.webp";
  const getDefaultBanner = (index: number) => {
    return bannerData && bannerData[index]
      ? bannerData[index]
      : { mainImage: { url: defaultImage }, title: "Titulo por defecto", buttonLink: "#" };
  };

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      {bannerData && (
        <ul className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3 mb-28">
          <li>
              <img
                src={getDefaultBanner(0).mainImage.url}
                alt={getDefaultBanner(0).title}
                className="aspect-square w-full object-cover"
                style={{ borderRadius: 'var(--radius)' }}
              />
          </li>

          <li>
              <img
                src={getDefaultBanner(1).mainImage.url}
                alt={getDefaultBanner(1).title}
                className="aspect-square w-full object-cover"
                style={{ borderRadius: 'var(--radius)' }}
              />
          </li>

          <li className="lg:col-span-2 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <img
                src={getDefaultBanner(2).mainImage.url}
                alt={getDefaultBanner(2).title}
                className="aspect-square w-full object-cover"
                style={{ borderRadius: 'var(--radius)', objectPosition: 'center top' }}
              />
          </li>
        </ul>
      )}
    </div>
  );
};

export default Galeria;
