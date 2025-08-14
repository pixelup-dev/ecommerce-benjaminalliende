"use client";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import ContentBienvenida from "@/components/conMantenedor/ContentBienvenida";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Marquee from "react-fast-marquee";
import { getCookie } from "cookies-next";
import BannerTiendaBO from "@/components/conMantenedor/Mantenedores/BannerTiendaBO";
import { Content } from "next/font/google";
function FrasesBO() {
  const [loading, setLoading] = useState(false);
  const [bannerDataMarquee, setBannerDataMarquee] = useState<any | null>(null);
  const [marqueeData, setMarqueeData] = useState({
    title: "hola",
    contentText: "",
  });

  const handleChangeMarquee = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setMarqueeData({
      ...marqueeData,
      [name]: value,
    });
  };

  const handleSubmitMarquee = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_FRASE01_CONTENTBLOCK}`;
      // Enviar los datos al endpoint
      const token = getCookie("AdminTokenAuth");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: marqueeData.title,
          contentText: marqueeData.contentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Limpiar el formulario después de enviar los datos
      setMarqueeData({
        title: "",
        contentText: "",
      });

      // Manejar cualquier otra lógica necesaria después del envío exitoso

      console.log("Datos enviados con éxito:", marqueeData);
      fetchMarquee();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  const fetchMarquee = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_FRASE01_CONTENTBLOCK}`; 

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const bannerImage = productTypeResponse.data.contentBlock;
      console.log(productTypeResponse.data.contentBlock, "bannerImage");
      setMarqueeData(bannerImage);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    fetchMarquee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className=" rounded-lg p-4 bg-white">
          {/*           <div className="border border-dashed border-primary rounded-lg p-4 ">
            <section>
              <div className="flex items-center max-md:flex-col bg-primary text-secondary px-6 py-2 rounded">
                 <div className="max-md:mt-4">
          <h3 className="bg-white text-blue-500 font-semibold py-2 px-4 rounded text-sm hover:bg-slate-100 mx-6">
            {marqueeData?.title}
          </h3>
        </div>
                <p className="text-base flex-1">
                  <Marquee>{marqueeData?.contentText}</Marquee>
                </p>
              </div>
            </section>
          </div> */}
          <section>
            <div className=" flex text-center items-center max-md:flex-col font-medium text-primary px-6 font-sans">
              {/*  <div className="max-md:mt-4">
    <h3 className="bg-white text-blue-500 font-semibold py-2 px-4 rounded text-sm hover:bg-slate-100 mx-6">
      {bannerData?.title}
    </h3>
  </div>*/}
              <p className="m-4 text-2xl font-semibold flex-1 italic">
                « {marqueeData?.contentText} »
              </p>
            </div>
          </section>

          <form
            onSubmit={handleSubmitMarquee}
            className="px-4 mx-auto"
          >
            <input
              type="text"
              name="title"
              onChange={handleChangeMarquee}
              className=" hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Título"
            />

            <input
              type="text"
              name="contentText"
              onChange={handleChangeMarquee}
              className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Contenido frase número 1..."
            />
            <section>
              <div className=" flex text-center items-center max-md:flex-col font-medium text-muted px-6 font-sans">
                {/*  <div className="max-md:mt-4">
    <h3 className="bg-white text-blue-500 font-semibold py-2 px-4 rounded text-sm hover:bg-slate-100 mx-6">
      {bannerData?.title}
    </h3>
  </div>*/}
 {/*                <p className="m-4 text-2xl font-semibold flex-1 italic">
                  « {marqueeData?.title} »
                </p> */}
              </div>
            </section>
{/*             <input
              type="text"
              name="title"
              onChange={handleChangeMarquee}
              className=" w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Contenido frase número 2..."
            /> */}

            <button
              type="submit"
              disabled={loading}
              className="text-secondary bg-primary hover:bg-secondary hover:text-primary focus:ring-4   font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2  dark:hover:bg-dark  inline-flex items-center"
            >
              <svg
                aria-hidden="true"
                role="status"
                className={`inline w-4 h-4 me-3 text-white animate-spin ${
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
      </div>
    </>
  );
}

export default FrasesBO;
