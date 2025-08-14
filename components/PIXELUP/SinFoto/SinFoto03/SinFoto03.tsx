"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/common/Loader";

const SinFoto03: React.FC<{}> = ({}) => {
  const [loading, setLoading] = useState(false);
  const [bannerData, setBannerData] = useState<any[]>([]);

  const bannerIds = [
    process.env.NEXT_PUBLIC_CARD01_CONTENTBLOCK ?? "",
    process.env.NEXT_PUBLIC_CARD02_CONTENTBLOCK ?? "",
    process.env.NEXT_PUBLIC_CARD03_CONTENTBLOCK ?? "",
    process.env.NEXT_PUBLIC_CARD04_CONTENTBLOCK ?? "",
  ];

  const fetchMarqueeHome = async (id: string) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      return response.data.contentBlock;
    } catch (error) {
      console.error("Error al obtener marquee block:", error);
      return null;
    }
  };

  const fetchAllMarqueeData = async () => {
    setLoading(true);
    try {
      const bannerPromises = bannerIds.map((id) => fetchMarqueeHome(id));
      const banners = await Promise.all(bannerPromises);
      setBannerData(banners.filter(Boolean));
    } catch (error) {
      console.error("Error al obtener datos de los bloques:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMarqueeData();
  }, []);

  return (
    <section className="bg-white py-12">
      <div className=" mt-20 mb-10 px-4 sm:px-10 md:px-20 lg:px-52">
        <div className="w-full mx-auto">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-left">
              ¿En qué consiste nuestro servicio?
            </h1>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-12 text-black">
            {loading ? (
              <p>
                <Loader />
              </p>
            ) : (
              bannerData.map((banner, index) => (
                <div
                  key={index}
                  className="mb-4 w-full h-full"
                >
                  <div className="flex flex-col p-4 bg-primary/10 duration-100 lg:hover:scale-105 h-full" style={{ borderRadius: "var(--radius)" }}>
                    <h3 className="text-base font-sans font-semibold py-4  text-left">
                      {banner?.title}
                    </h3>
                    <p className="text-gray-500 md:text-base text-left">
                      {banner?.contentText}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SinFoto03;