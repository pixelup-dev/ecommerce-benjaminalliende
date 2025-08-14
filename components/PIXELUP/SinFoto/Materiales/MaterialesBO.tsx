"use client";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import ContentBienvenida from "@/components/conMantenedor/ContentBienvenida";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Marquee from "react-fast-marquee";
import { getCookie } from "cookies-next";
import BannerTiendaBO from "@/components/conMantenedor/Mantenedores/BannerTiendaBO";
import { Content } from "next/font/google";
function MaterialesBO() {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewShowAll, setPreviewShowAll] = useState(false);
  const [marqueeData, setMarqueeData] = useState({
    title: "",
    contentText: "",
    materialsList: [] as string[]
  });

  const handleChangeMarquee = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    if (name === "contentText") {
      // Dividir el texto por saltos de línea y filtrar líneas vacías
      const lines = value.split('\n').filter(line => line.trim() !== '');
      setMarqueeData({
        ...marqueeData,
        [name]: value,
        materialsList: lines
      });
    } else {
      setMarqueeData({
        ...marqueeData,
        [name]: value,
      });
    }
  };

  const handleSubmitMarquee = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_MATERIALES_CONTENTBLOCK}`;
      const token = getCookie("AdminTokenAuth");
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: marqueeData.title,
          contentText: marqueeData.contentText,
          materialsList: marqueeData.materialsList
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
        contentText: "",
        materialsList: []
      });
      fetchMarquee();
    } catch (error) {
      console.error("Error al enviar los datos:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarquee = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_MATERIALES_CONTENTBLOCK}`;
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
      console.log(productTypeResponse.data.contentBlock, "marqueeeeeeeee");
      
      // Procesar el contentText para crear el listado de materiales
      let materialsList = [];
      if (bannerImage?.contentText) {
        materialsList = bannerImage.contentText
          .split('\n')
          .filter((line: string) => line.trim() !== '')
          .map((line: string) => line.trim());
      }
      
      // Asegurarse de que materialsList siempre esté definido
      setMarqueeData({
        title: bannerImage.title || "",
        contentText: bannerImage.contentText || "",
        materialsList: materialsList
      });
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

  // Determinar si hay más de 8 materiales para la vista previa
  const hasMoreThanEight = marqueeData.materialsList.length > 8;
  
  // Obtener los materiales a mostrar en la vista previa (todos o solo los primeros 8)
  const displayedMaterials = previewShowAll ? marqueeData.materialsList : marqueeData.materialsList.slice(0, 8);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-xl font-bold mb-2 sm:mb-0">Listado de Materiales</h2>
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
              <section className="w-full bg-foreground/5 p-6 rounded-lg">
                <div className="container mx-auto px-4 py-8">
                  <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-16 text-gray-800">
                    {marqueeData.title || "LISTADO MATERIALES CERTIFICADOS"}
                  </h1>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                    {displayedMaterials.map((material, index) => (
                      <div 
                        key={index}
                        className="bg-gray-50 p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300"
                      >
                        <p className="text-center text-gray-700 font-medium">
                          {material}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {hasMoreThanEight && (
                    <div className="flex justify-center mt-8">
                      <button 
                        onClick={() => setPreviewShowAll(!previewShowAll)}
                        className="bg-primary text-white px-6 py-3 rounded-full shadow-md hover:bg-primary/90 transition-all duration-300 flex items-center gap-2"
                      >
                        {previewShowAll ? (
                          <>
                            <span>Mostrar menos</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Ver todos los materiales</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
          
          <form
            onSubmit={handleSubmitMarquee}
            className="mx-auto mt-2">
            <input
              type="text"
              name="title"
              value={marqueeData.title}
              onChange={handleChangeMarquee}
              className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Título del listado"
            />
            <textarea
              name="contentText"
              value={marqueeData.contentText}
              onChange={handleChangeMarquee}
              className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md h-64"
              placeholder="Ingrese el listado de materiales (cada línea será un material separado)..."
            />

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

export default MaterialesBO;
