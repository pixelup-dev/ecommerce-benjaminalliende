"use client";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import ContentBienvenida from "@/components/conMantenedor/ContentBienvenida";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Marquee from "react-fast-marquee";
import { getCookie } from "cookies-next";
import BannerTiendaBO from "@/components/conMantenedor/Mantenedores/BannerTiendaBO";
import { Content } from "next/font/google";
import toast, { Toaster } from 'react-hot-toast';

function SinFoto07BO() {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [marqueeData, setMarqueeData] = useState({
    title: "",
    contentText: {
      epigrafe: "Impulsando emprendimientos",
      titulo: "Expertos en proyectos Sercotec",
      descripcion: "Nuestros vendedores, con más de 8 años de experiencia, son especialistas en proyectos Sercotec. Ellos te guiarán paso a paso, ofreciendo asesoría personalizada, productos de calidad y soluciones a medida para que cumplas con los requisitos de tu proyecto. Confía en nuestros expertos para equipar tu cocina profesional y hacer crecer tu negocio.",
      botonTexto: "Contáctanos",
      botonLink: "/contacto",
      porcentaje: "100%",
      textoPorcentaje: "Proyectos exitosos",
      tiempoTitulo: "8+",
      tiempoTexto: "Años de experiencia"
    }
  });

  const handleChangeMarquee = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (name === 'title') {
      setMarqueeData({
        ...marqueeData,
        [name]: value,
      });
    } else {
      setMarqueeData({
        ...marqueeData,
        contentText: {
          ...marqueeData.contentText,
          [name]: value,
        }
      });
    }
  };

  const handleSubmitMarquee = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_SINFOTO07_CONTENTBLOCK}`;
      const token = getCookie("AdminTokenAuth");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "pixelup",
          contentText: JSON.stringify(marqueeData.contentText),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMarqueeData({
        title: "",
        contentText: {
          epigrafe: "Impulsando emprendimientos",
          titulo: "Expertos en proyectos Sercotec",
          descripcion: "Nuestros vendedores, con más de 8 años de experiencia, son especialistas en proyectos Sercotec. Ellos te guiarán paso a paso, ofreciendo asesoría personalizada, productos de calidad y soluciones a medida para que cumplas con los requisitos de tu proyecto. Confía en nuestros expertos para equipar tu cocina profesional y hacer crecer tu negocio.",
          botonTexto: "Contáctanos",
          botonLink: "/contacto",
          porcentaje: "100%",
          textoPorcentaje: "Proyectos exitosos",
          tiempoTitulo: "8+",
          tiempoTexto: "Años de experiencia"
        }
      });

      fetchMarquee();
      toast.success("Sección actualizada exitosamente");
    } catch (error) {
      console.error("Error al enviar los datos:", error);
      toast.error("Error al actualizar la sección");
    } finally {
      setLoading(false);
    }
  };

  const fetchMarquee = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_EXPERTOS_CONTENTBLOCK}`;
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
      if (bannerImage.contentText) {
        bannerImage.contentText = JSON.parse(bannerImage.contentText);
      }
      setMarqueeData(bannerImage);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarquee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial
  return (
    <>
      <div className="flex flex-col gap-4">
        <Toaster position="top-center" />
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-bold mb-2 sm:mb-0">Sección Expertos Sercotec</h2>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
            >
              {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa"}
            </button>
          </div>

          {/* Vista previa */}
          {showPreview && (
            <div className="mb-8 overflow-x-auto">
              <h3 className="font-medium text-gray-700 mb-4">Vista Previa:</h3>
                          {/* Mensaje de alerta informativa */}
            <div className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50 dark:bg-gray-800 dark:text-blue-400" role="alert">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>Este es un preview referencial, por lo cual algunos elementos pueden no quedar correctamente organizados.</span>
              </div>
            </div>
              <section className="py-24 bg-white relative overflow-hidden">
                {/* Elementos decorativos de fondo */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#EB4F5D]/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#2F3C69]/5 rounded-full blur-3xl"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Columna de estadísticas */}
                    <div className="lg:col-span-4 space-y-4">
                      <div className="bg-white p-6 rounded shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#EB4F5D]/10 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-[#EB4F5D]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-[#EB4F5D]">{marqueeData.contentText.tiempoTitulo}</h3>
                            <p className="text-gray-600 text-sm">{marqueeData.contentText.tiempoTexto}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded shadow-md hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-[#2F3C69]/10 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-[#2F3C69]"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold text-[#2F3C69]">{marqueeData.contentText.porcentaje}</h3>
                            <p className="text-gray-600 text-sm">{marqueeData.contentText.textoPorcentaje}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Columna de contenido principal */}
                    <div className="lg:col-span-8">
                      <div className="relative">
                        {/* Línea decorativa */}
                        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-[#EB4F5D] to-[#2F3C69] rounded-full"></div>

                        <div className="space-y-8">
                          <span className="inline-block px-4 py-2 bg-gray-100 text-[#EB4F5D] rounded-full text-sm font-medium mb-4">
                            {marqueeData.contentText.epigrafe}
                          </span>
                          <h2 className="text-xl font-bold text-[#2F3C69]">
                            {marqueeData.contentText.titulo}
                          </h2>

                          <p className="text-gray-600 leading-snug text-lg">
                            {marqueeData.contentText.descripcion}
                          </p>

                          <a
                            href={marqueeData.contentText.botonLink}
                            className="inline-flex items-center space-x-2 bg-[#EB4F5D] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#EB4F5D]/90 transition-colors"
                          >
                            <span>{marqueeData.contentText.botonTexto}</span>
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 8l4 4m0 0l-4 4m4-4H3"
                              />
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {/* Formulario */}
          <form
            onSubmit={handleSubmitMarquee}
            className="mx-auto mt-2 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Epígrafe
                </label>
                <input
                  type="text"
                  name="epigrafe"
                  value={marqueeData.contentText.epigrafe}
                  onChange={handleChangeMarquee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  name="titulo"
                  value={marqueeData.contentText.titulo}
                  onChange={handleChangeMarquee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={marqueeData.contentText.descripcion}
                  onChange={handleChangeMarquee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto del Botón
                </label>
                <input
                  type="text"
                  name="botonTexto"
                  value={marqueeData.contentText.botonTexto}
                  onChange={handleChangeMarquee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link del Botón
                </label>
                <input
                  type="text"
                  name="botonLink"
                  value={marqueeData.contentText.botonLink}
                  onChange={handleChangeMarquee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje
                </label>
                <input
                  type="text"
                  name="porcentaje"
                  value={marqueeData.contentText.porcentaje}
                  onChange={handleChangeMarquee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto del Porcentaje
                </label>
                <input
                  type="text"
                  name="textoPorcentaje"
                  value={marqueeData.contentText.textoPorcentaje}
                  onChange={handleChangeMarquee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título del Tiempo
                </label>
                <input
                  type="text"
                  name="tiempoTitulo"
                  value={marqueeData.contentText.tiempoTitulo}
                  onChange={handleChangeMarquee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto del Tiempo
                </label>
                <input
                  type="text"
                  name="tiempoTexto"
                  value={marqueeData.contentText.tiempoTexto}
                  onChange={handleChangeMarquee}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="text-secondary bg-primary hover:bg-secondary hover:text-primary focus:ring-4 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 dark:hover:bg-dark inline-flex items-center"
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

export default SinFoto07BO;
