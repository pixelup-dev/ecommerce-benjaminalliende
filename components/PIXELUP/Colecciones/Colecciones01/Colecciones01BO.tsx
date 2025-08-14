"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";
import { toast } from "react-hot-toast";
import Select from "react-select";

// Definir la interfaz para la configuración de visualización
interface CollectionConfig {
  id: string;
  desktop: {
    showTitle: boolean;
    showBannerText: boolean;
    showButton: boolean;
    textAlignment: string;
    bannerText: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
  mobile: {
    showTitle: boolean;
    showBannerText: boolean;
    showButton: boolean;
    textAlignment: string;
    bannerText: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
} 

const Colecciones01BO = () => {
  const [collections, setCollections] = useState<any[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [collectionConfigs, setCollectionConfigs] = useState<CollectionConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Excluir las colecciones que no queremos mostrar
  const excludedIds = `${process.env.NEXT_PUBLIC_BANNER_NAVBAR}`;

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const siteid = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${siteid}`
      );

      // Filtrar colecciones excluyendo IDs específicos
      const filteredCollections = response.data.collections
        .filter((collection: any) => !excludedIds.includes(collection.id))
        .sort((a: any, b: any) => a.title.localeCompare(b.title));

      setCollections(filteredCollections);

      // Cargar las colecciones seleccionadas guardadas
      const savedCollections = await fetchSavedCollections();
      setSelectedCollections(savedCollections);
      
      // Cargar las configuraciones de las colecciones
      const savedConfigs = await fetchCollectionConfigs();
      setCollectionConfigs(savedConfigs);
    } catch (error) {
      console.error("Error fetching collections:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCollections = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const contentBlockId = process.env.NEXT_PUBLIC_COLECCIONES01_CONTENTBLOCK;
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.contentBlock.contentText ? JSON.parse(response.data.contentBlock.contentText) : [];
    } catch (error) {
      console.error("Error fetching saved collections:", error);
      return [];
    }
  };

  const fetchCollectionConfigs = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const contentBlockId = process.env.NEXT_PUBLIC_COLECCIONES01_CONTENTBLOCK || "";
      
      if (!contentBlockId) return [];
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.contentBlock.contentText ? JSON.parse(response.data.contentBlock.contentText) : [];
    } catch (error) {
      console.error("Error fetching collection configs:", error);
      return [];
    }
  };

  const handleCollectionChange = (selectedOption: any) => {
    if (selectedOption) {
      if (selectedCollections.length >= 4) {
        toast.error("Solo puedes seleccionar hasta 4 colecciones");
        return;
      }
      handleCollectionToggle(selectedOption.value);
      setSelectedCollection(null);
    }
  };

  const handleCollectionToggle = (collectionId: string) => {
    let updatedCollections: string[];

    if (selectedCollections.includes(collectionId)) {
      // Remover la colección
      updatedCollections = selectedCollections.filter(id => id !== collectionId);
    } else {
      // Agregar la colección
      if (selectedCollections.length >= 4) {
        toast.error("Solo puedes seleccionar hasta 4 colecciones");
        return;
      }
      updatedCollections = [...selectedCollections, collectionId];
    }

    setSelectedCollections(updatedCollections);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const contentBlockId = process.env.NEXT_PUBLIC_COLECCIONES01_CONTENTBLOCK;

      // Actualizar el content block con las colecciones seleccionadas
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${siteId}`,
        {
          title: "colecciones02",
          contentText: JSON.stringify(selectedCollections),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setHasChanges(false);
      toast.success("Cambios guardados exitosamente");
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const formatOptionLabel = ({ value, label, previewImageUrl }: any) => (
    <div className="flex items-center">
      <img
        src={previewImageUrl}
        alt={label}
        className="w-8 h-8 object-cover rounded mr-2"
      />
      <div>
        <span>{label}</span>
      </div>
    </div>
  );

  const availableCollections = collections.filter(
    (collection) => !selectedCollections.includes(collection.id)
  );

  const handleMoveCollection = (currentIndex: number, direction: 'left' | 'right') => {
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= selectedCollections.length) {
      return; // No hacer nada si el nuevo índice está fuera de los límites
    }

    // Obtener las colecciones en el orden actual
    const orderedCollections = collections
      .filter(collection => selectedCollections.includes(collection.id))
      .sort((a, b) => {
        const indexA = selectedCollections.indexOf(a.id);
        const indexB = selectedCollections.indexOf(b.id);
        return indexA - indexB;
      });

    // Obtener los IDs de las colecciones que queremos intercambiar
    const collectionToMove = orderedCollections[currentIndex].id;
    const collectionToSwapWith = orderedCollections[newIndex].id;

    // Crear una nueva copia del array de IDs
    const newOrder = [...selectedCollections];
    
    // Encontrar los índices reales en el array de selectedCollections
    const actualCurrentIndex = selectedCollections.indexOf(collectionToMove);
    const actualNewIndex = selectedCollections.indexOf(collectionToSwapWith);

    // Intercambiar las posiciones usando los índices reales
    [newOrder[actualCurrentIndex], newOrder[actualNewIndex]] = [newOrder[actualNewIndex], newOrder[actualCurrentIndex]];

    // Actualizar el estado con el nuevo orden
    setSelectedCollections(newOrder);
    setHasChanges(true);
  };

  // Función para obtener la configuración de una colección
  const getCollectionConfig = (collectionId: string): CollectionConfig | undefined => {
    return collectionConfigs.find(config => config.id === collectionId);
  };

  if (loading) return <div>Cargando colecciones...</div>;
  if (error) return <div>Error al cargar las colecciones</div>;

  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Seleccionar Colecciones para Mostrar
        </h2>
        <p className="text-center mb-8 text-gray-600">
          Selecciona hasta 4 colecciones para mostrar en la página principal
        </p>

        <div className="mb-8">
          <Select
            value={selectedCollection}
            onChange={handleCollectionChange}
            options={availableCollections.map((collection) => ({
              value: collection.id,
              label: collection.title,
              previewImageUrl: collection.previewImageUrl || "/carr/default.jpg",
            }))}
            formatOptionLabel={formatOptionLabel}
            className="shadow block w-full"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "var(--radius)",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "var(--radius)",
              }),
              menuList: (base) => ({
                ...base,
                maxHeight: "200px", // Altura para mostrar ~5 elementos
                "::-webkit-scrollbar": {
                  width: "8px",
                  height: "0px",
                },
                "::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                  borderRadius: "4px",
                },
                "::-webkit-scrollbar-thumb": {
                  background: "#888",
                  borderRadius: "4px",
                },
                "::-webkit-scrollbar-thumb:hover": {
                  background: "#555",
                },
              }),
              option: (base) => ({
                ...base,
                padding: "8px 12px",
              }),
            }}
            placeholder="Buscar y seleccionar colección..."
            isClearable
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {collections
            .filter((collection) => selectedCollections.includes(collection.id))
            .sort((a, b) => {
              const indexA = selectedCollections.indexOf(a.id);
              const indexB = selectedCollections.indexOf(b.id);
              return indexA - indexB;
            })
            .map((collection, index) => {
              // Obtener la configuración de la colección
              const config = getCollectionConfig(collection.id);
              
              return (
                <div
                  key={collection.id}
                  className="border rounded-lg overflow-hidden shadow-sm transition-all duration-300 border-primary/20 shadow-primary/20"
                >
                  <div className="relative hidden md:block h-48">
                    <img
                      src={collection.previewImageUrl || "/carr/default.jpg"}
                      alt={collection.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                      Orden: {index + 1}
                    </div>
                    <button
                      onClick={() => handleCollectionToggle(collection.id)}
                      className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        strokeWidth={2} 
                        stroke="currentColor" 
                        className="w-5 h-5"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-2 md:hidden">
                      <div className="bg-green-500 text-white px-2 py-1 rounded text-sm">
                        Orden: {index + 1}
                      </div>
                      <button
                        onClick={() => handleCollectionToggle(collection.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={2} 
                          stroke="currentColor" 
                          className="w-5 h-5"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{collection.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {(() => {
                        let bannerText = "Sin Descripción";
                        
                        try {
                          // Intentar parsear el bannerText como JSON si es una cadena JSON
                          if (collection.bannerText && collection.bannerText.startsWith('{')) {
                            const config = JSON.parse(collection.bannerText);
                            if (config.desktop && config.desktop.showBannerText) {
                              bannerText = config.desktop.bannerText || "Sin descripción";
                            }
                          } else {
                            // Si no es JSON, mostrar el texto original
                            bannerText = collection.bannerText || "";
                          }
                        } catch (e) {
                          // Si hay error al parsear, mantener el texto original
                          console.error("Error al parsear el bannerText:", e);
                          bannerText = collection.bannerText || "Sin descripción";
                        }
                        
                        return bannerText;
                      })()}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveCollection(index, 'left')}
                        disabled={index === 0}
                        className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                          index === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-primary text-secondary hover:bg-secondary hover:text-primary"
                        }`}
                        title="Mover a la izquierda"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="w-6 h-6 mx-auto md:block hidden"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" 
                          />
                        </svg>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="w-6 h-6 mx-auto block md:hidden"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M4.5 15.75l7.5-7.5 7.5 7.5" 
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMoveCollection(index, 'right')}
                        disabled={index === selectedCollections.length - 1}
                        className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                          index === selectedCollections.length - 1
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-primary text-secondary hover:bg-secondary hover:text-primary"
                        }`}
                        title="Mover a la derecha"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="w-6 h-6 mx-auto md:block hidden"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" 
                          />
                        </svg>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24" 
                          strokeWidth={1.5} 
                          stroke="currentColor" 
                          className="w-6 h-6 mx-auto block md:hidden"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M19.5 8.25l-7.5 7.5-7.5-7.5" 
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            Colecciones seleccionadas: {selectedCollections.length}/4
          </p>
          <button
            onClick={handleSaveChanges}
            disabled={!hasChanges || isSaving}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              hasChanges
                ? "bg-primary text-secondary hover:bg-secondary hover:text-primary"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSaving ? "Guardando..." : "Actualizar Cambios"}
          </button>
          {hasChanges && (
            <p className="text-yellow-600 text-sm mt-2">
              * Hay cambios sin guardar
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Colecciones01BO;
