"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";

function Colecciones06() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const siteid = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const contentBlockId = process.env.NEXT_PUBLIC_COLECCIONES01_CONTENTBLOCK;

        // Primero, obtener las colecciones seleccionadas del content block
        const contentBlockResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${siteid}`
        );

        const selectedCollectionIds = contentBlockResponse.data.contentBlock.contentText 
          ? JSON.parse(contentBlockResponse.data.contentBlock.contentText)
          : [];

        // Obtener todas las colecciones
        const collectionsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${siteid}`
        );

        // Mapear las colecciones seleccionadas en el orden correcto
        const orderedCollections = selectedCollectionIds.map((collectionId: string) => {
          const collection = collectionsResponse.data.collections.find(
            (c: any) => c.id === collectionId
          );
          return {
            ...collection,
            buttonText: "Ver Colección"
          };
        }).filter(Boolean); // Eliminar cualquier colección undefined

        setCollections(orderedCollections);
      } catch (error) {
        console.error("Error fetching collections:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) return <div>Cargando colecciones...</div>;
  if (error) return <div>Error al cargar las colecciones</div>;
  if (collections.length === 0) return null;

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-sm uppercase tracking-wider text-gray-500">
            Descubre
          </span>
          <h2 className="text-3xl md:text-4xl text-gray-800 font-bold mt-2">
            Nuestras Colecciones
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {collections.map((coleccion) => (
            <div
              key={coleccion.id}
              className="group relative cursor-pointer overflow-hidden rounded bg-white shadow-sm hover:shadow-xl transition-all duration-300" style={{ borderRadius: "var(--radius)" }}
            >
              <div className="flex flex-col md:flex-row h-[400px] md:h-[250px]">
                <div className="w-full md:w-1/2 h-full relative overflow-hidden">
                  <img
                    src={coleccion.previewImageUrl || "/carr/default.jpg"}
                    alt={coleccion.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center text-center bg-white">
                  <h3 className="text-xl text-gray-800 font-bold mb-3">
                    {coleccion.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-6">
                    {(() => {
                      let bannerText = "";
                      
                      try {
                        // Intentar parsear el bannerText como JSON si es una cadena JSON
                        if (coleccion.bannerText && coleccion.bannerText.startsWith('{')) {
                          const config = JSON.parse(coleccion.bannerText);
                          if (config.desktop && config.desktop.showBannerText) {
                            bannerText = config.desktop.bannerText || "Sin descripción";
                          }
                        } else {
                          // Si no es JSON, mostrar el texto original
                          bannerText = coleccion.bannerText || "";
                        }
                      } catch (e) {
                        // Si hay error al parsear, mantener el texto original
                        console.error("Error al parsear el bannerText:", e);
                        bannerText = coleccion.bannerText || "Sin descripción";
                      }
                      
                      return bannerText;
                    })()}
                  </p>
                  <Link 
                    href={`/tienda/colecciones/${slugify(coleccion.title)}`}
                    className="bg-black text-white px-6 py-2 text-sm font-bold hover:bg-primary/80 transition-colors hover:text-white" style={{ borderRadius: "var(--radius)" }}
                  >
                    {coleccion.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {collections.length > 0 && (
          <div className="text-center mt-12">
            <Link 
              href="/tienda/colecciones"
              className="bg-primary font-light text-md text-white hover:scale-105 px-8 py-2 hover:bg-primary/80 transition-all inline-block" style={{ borderRadius: "var(--radius)" }}
            >
              Ver Todas las Colecciones
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Colecciones06;