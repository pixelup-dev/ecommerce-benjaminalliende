"use client";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import ContentBienvenida from "@/components/conMantenedor/ContentBienvenida";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Marquee from "react-fast-marquee";
import { getCookie } from "cookies-next";
import BannerTiendaBO from "@/components/conMantenedor/Mantenedores/BannerTiendaBO";
import { Content } from "next/font/google";

const SinFoto03BO: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [cardsData, setCardsData] = useState<{
    [key: string]: {
      title: string;
      contentText: string;
    };
  }>({});

  const bannerIds = [
    process.env.NEXT_PUBLIC_CARD01_CONTENTBLOCK ?? "",
    process.env.NEXT_PUBLIC_CARD02_CONTENTBLOCK ?? "",
    process.env.NEXT_PUBLIC_CARD03_CONTENTBLOCK ?? "",
    process.env.NEXT_PUBLIC_CARD04_CONTENTBLOCK ?? "",
  ];

  const handleChangeCards = (
    bannerId: string,
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setCardsData(prev => ({
      ...prev,
      [bannerId]: {
        ...prev[bannerId],
        [name]: value,
      },
    }));
  };

  const handleSubmitCards = async (bannerId: string, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: cardsData[bannerId]?.title,
          contentText: cardsData[bannerId]?.contentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchCards();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      setLoading(true);
      const Token = getCookie("AdminTokenAuth");
      
      const promises = bannerIds.map(bannerId =>
        axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
              "Content-Type": "application/json",
            },
          }
        )
      );

      const responses = await Promise.all(promises);
      const newCardsData = responses.reduce<{[key: string]: any}>((acc, response, index) => {
        acc[bannerIds[index]] = response.data.contentBlock;
        return acc;
      }, {});

      setCardsData(newCardsData);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []); // Se ejecuta solo en el montaje inicial

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12 text-black">
      {bannerIds.map((bannerId) => (
        <div key={bannerId} className="flex flex-col items-start p-4 bg-gray-100 rounded-xl duration-100 lg:hover:scale-105">
          <h3 className="text-base font-sans font-semibold py-4 text-[#22366D] text-left">
            {cardsData[bannerId]?.title}
          </h3>
          <p className="text-gray-500 md:text-base text-left">
            {cardsData[bannerId]?.contentText}
          </p>
          <form onSubmit={(e) => handleSubmitCards(bannerId, e)} className="mx-auto mt-2">
            <input
              type="text"
              name="title"
              onChange={(e) => handleChangeCards(bannerId, e)}
              value={cardsData[bannerId]?.title || ''}
              className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Title"
            />
            <textarea
              name="contentText"
              onChange={(e) => handleChangeCards(bannerId, e)}
              value={cardsData[bannerId]?.contentText || ''}
              className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Ingrese contenido..."
              rows={3}
              style={{ resize: "none", overflow: "hidden" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
            />
            <button
              type="submit"
              disabled={loading}
              className="text-secondary bg-primary hover:bg-secondary hover:text-primary focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                role="status"
                className={`inline w-4 h-4 mr-3 text-white animate-spin ${
                  loading ? "block" : "hidden"
                }`}
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
              {loading ? "Loading..." : "Actualizar"}
            </button>
          </form>
        </div>
      ))}
    </div>
  );
};

export default SinFoto03BO;