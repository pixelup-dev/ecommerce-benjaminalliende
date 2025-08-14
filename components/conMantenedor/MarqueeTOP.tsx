"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Marquee from "react-fast-marquee";
import { socialConfig } from "@/app/config/menulinks";

function MarqueeTOP() {
  const [loading, setLoading] = useState(false);
  const [bannerData, setBannerData] = useState<any | null>(null);

  // Filtrar los enlaces de redes sociales que son visibles
  const socialItems = socialConfig.showInNavbar
    ? socialConfig.links.filter((link) => link.isVisible)
    : [];

  const fetchBannerHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = process.env.NEXT_PUBLIC_MARQUEE_TOP_CONTENTBLOCK;
      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      const bannerImage = productTypeResponse.data.contentBlock;
      setBannerData(bannerImage);
    } catch (error) {
      console.error("Error al obtener marquetop:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    fetchBannerHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial
  return (
    <section className="w-full">
      <div className="bg-primary font-medium text-white px-8 py-2 font-sans flex items-center justify-between">
        {/* Marquee - centro */}
        <div className="flex-1 text-sm">
          <Marquee
            speed={40}
            gradient={false}
          >
            {bannerData?.contentText}
          </Marquee>
        </div>

        {/* Redes sociales - lado derecho */}
        {socialConfig.showInNavbar && socialItems.length > 0 && (
          <div className="flex items-center space-x-3 ml-4">
            {socialItems.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-secondary transition-colors"
              >
                <div className="size-4">{social.icon}</div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default MarqueeTOP;
