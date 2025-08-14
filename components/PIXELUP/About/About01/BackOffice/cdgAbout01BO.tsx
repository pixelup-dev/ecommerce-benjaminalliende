"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Cargar react-quill dinámicamente para evitar problemas de SSR (Server-Side Rendering)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });


function About() {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImageHero, setMainImageHero] = useState<string | null>(null);
  const [formDataHero, setFormDataHero] = useState<any>({
    title: "Sobre Mi",
    landingText: "",
    buttonLink: "Sobre Mi",
    buttonText: "Sobre Mi",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [updatedBannerData, setUpdatedBannerData] = useState({
    title: "Sobre Mi",
    landingText: "",
    buttonLink: "Sobre Mi",
    buttonText: "Sobre Mi",
    mainImageLink: "",
    orderNumber: 1, // Modifica este valor según tu lógica
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const MAX_CHARACTERS = 1800;
  const ALERT_CHARACTERS = 1799;

  const [aboutData, setAboutData] = useState({
    title: "hola",
    contentText: "",
  });

  const handleChangeAbout = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setAboutData({
      ...aboutData,
      [name]: value,
    });
  };


  const handleSubmitAbout = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_ABOUTMECONTENT_ID}`;
      // Enviar los datos al endpoint
      const token = getCookie("AdminTokenAuth");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "pixelup",
          contentText: aboutData.contentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Limpiar el formulario después de enviar los datos
      setAboutData({
        title: "",
        contentText: "",
      });

      // Manejar cualquier otra lógica necesaria después del envío exitoso

      fetchAbout();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  const fetchAbout = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_ABOUTMECONTENT_ID}`;
      const Token = getCookie("AdminTokenAuth");
      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const bannerImage = productTypeResponse.data.contentBlock;
      setAboutData(bannerImage);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };



  useEffect(() => {
    fetchAbout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial


  const handleEditorChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      setAboutData({ ...aboutData, contentText: value });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Prevenir comportamiento predeterminado del Tab
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <section id="banner" className="w-full">
      <div>
          <div className="container mx-auto max-w-7xl relative my-12 md:my-24 ">
              <div className=" w-full mt-6 md:mt-0 md:pl-8">
                <div
                  className="mb-2 md:mb-4 editortexto"
                  dangerouslySetInnerHTML={{ __html: aboutData?.contentText }}
                />
              </div>
          </div>
      </div>

      <form onSubmit={handleSubmitAbout} className="px-4 mx-auto mt-8">
        <h3 className="font-normal text-primary">
          Contenido <span className="text-primary">*</span>
        </h3>
        <ReactQuill
          value={aboutData.contentText}
          onChange={handleEditorChange}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          style={{ borderRadius: "var(--radius)" }}
          placeholder="Contenido"
          onKeyDown={handleKeyDown}
        />
        <div className="text-right text-sm text-gray-600">
        {aboutData.contentText.length}/{MAX_CHARACTERS}
        </div>
        {aboutData.contentText.length > ALERT_CHARACTERS && (
          <div
            className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
            role="alert"
          >
            <svg
              className="flex-shrink-0 inline w-4 h-4 me-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
            </svg>
            <span className="sr-only">Info</span>
            <div>
              <span className="font-medium">Limite Alcanzado!</span> Los
              caracteres extras no seran mostrados.
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary  font-bold py-2 px-4 rounded flex-wrap mt-6"
          style={{ borderRadius: "var(--radius)" }}
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
          {loading ? "Loading..." : "Actualizar Banner"}
        </button>
      </form>
    </section>
  );
};

export default About;
