/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/app/utils/slugify";

// Definir interfaz para Producto
interface Producto {
  id: string;
  name: string;
  mainImageUrl: string;
  productTypes: any[];
  hasVariations: boolean;
  offers: any[];
  pricingRanges: any[];
  pricings: any[];
  stock: number;
}

export interface BuscadorClientProps {
  productosIniciales: Producto[];
}

const BuscadorClient: React.FC<BuscadorClientProps> = ({
  productosIniciales = [] as Producto[],
}) => {
  const [query, setQuery] = useState("");
  const [productos, setProductos] = useState<Producto[]>(productosIniciales);
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Agregar debounce para la búsqueda
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Función para normalizar texto
  const normalizeText = (text: string) =>
    text
      .toLowerCase() // Convertir a minúsculas
      .normalize("NFD") // Descomponer caracteres acentuados
      .replace(/[\u0300-\u036f]/g, ""); // Eliminar diacríticos

  // Implementar carga progresiva
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Modificar la función de búsqueda para ser más flexible
  useEffect(() => {
    if (debouncedQuery.trim().length >= 3) {
      console.log("Buscando:", debouncedQuery);
      const normalizedQuery = normalizeText(debouncedQuery);
      console.log("Query normalizada:", normalizedQuery);

      const filteredResultados = productos.filter((producto) => {
        const normalizedName = normalizeText(producto.name);
        console.log("Comparando:", normalizedName, "incluye", normalizedQuery);
        return normalizedName.includes(normalizedQuery);
      });

      console.log("Resultados encontrados:", filteredResultados);
      setResultados(filteredResultados.slice(0, 8));
      setNoResults(filteredResultados.length === 0);
    } else {
      setResultados([]);
      setNoResults(false);
    }
  }, [debouncedQuery, productos]);

  // Modificar fetchProductos para actualizar correctamente el estado
  const fetchProductos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/productos?page=${page}`);
      const data = await response.json();
      console.log("Datos recibidos de la API:", data);

      if (!data || !Array.isArray(data.products)) {
        throw new Error("Formato de respuesta inválido");
      }

      // Actualizar productos asegurándonos de no duplicar
      setProductos((prevProductos) => {
        const newProducts = data.products || [];
        const existingIds = new Set(prevProductos.map((p) => p.id));
        const uniqueNewProducts = newProducts.filter(
          (p: any) => !existingIds.has(p.id)
        );
        return [...prevProductos, ...uniqueNewProducts];
      });

      setHasMore(data.products.length === 50);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error fetching productos:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isModalOpen && (!productos || productos.length === 0)) {
      fetchProductos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isModalOpen]);

  const handleResultClick = (producto: Producto) => {
    const slug = slugify(producto.name);
    router.push(`/tienda/productos/${slug}`);
    handleModalClose();
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    document.body.style.overflow = "hidden"; // Bloquear el scroll del fondo
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setQuery("");
    setResultados([]);
    setNoResults(false);
    document.body.style.overflow = ""; // Restaura el scroll del fondo
  };

  // Agregar manejo de teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleModalClose();
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <button
          onClick={handleModalOpen}
          aria-label="Abrir buscador"
          className="pt-[5px]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="hsl(var(--primary))"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
        </button>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-start justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleModalClose();
          }}
        >
          <div
            className="bg-white p-4 rounded-lg shadow-lg max-w-md w-full mt-6"
            ref={modalRef}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-modal-title"
          >
            <h2
              id="search-modal-title "
              className="text-lg font-semibold text-[14px]"
            >
              Buscar productos
            </h2>

            <input
              type="text"
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar productos"
              className="w-full p-2 mt-4 border border-gray-300 rounded mb-4 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />

            {loading && (
              <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {error && (
              <div className="text-red-500">Error: {error.message}</div>
            )}
            {noResults && !loading && (
              <div className="text-center py-4">
                <p className="text-gray-500">
                  No se encontraron resultados para {query}
                </p>
                <p className="text-sm text-gray-400">
                  Intenta con otros términos de búsqueda
                </p>
              </div>
            )}

            {resultados.length > 0 && (
              <div className="divide-y divide-gray-200">
                {resultados.map((producto) => (
                  <div
                    key={producto.id}
                    onClick={() => handleResultClick(producto)}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={producto.mainImageUrl}
                        alt={producto.name}
                        className="object-cover rounded w-[40px] h-[40px]"
                      />
                      <span>{producto.name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BuscadorClient;
