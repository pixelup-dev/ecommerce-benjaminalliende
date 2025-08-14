/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import "react-quill/dist/quill.snow.css"; // Importar los estilos de Quill
import "./tienda.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Tipos para las categorías y los exchanges (canjes)
interface Category {
  id: string;
  name: string;
  description: string;
  statusCode: string;
}

interface ImageFile {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 encoded data
}

interface Exchange {
  id: string;
  exchangeCategory: {
    id: string;
    name: string;
    description: string;
    statusCode: string;
  };
  companyName: string;
  companyImageUrl: string;
  name: string;
  description: string;
  extendedDescription: string;
  mainImageUrl: string;
  stock: number;
  creditAmount: number;
  statusCode: string;
}

const ExchangesGrid = () => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [filteredExchanges, setFilteredExchanges] = useState<Exchange[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Obtener la página actual de los parámetros de URL o usar 1 como valor predeterminado
  const [pageNumber, setPageNumber] = useState(() => {
    const pageParam = searchParams.get('page');
    return pageParam ? parseInt(pageParam, 10) : 1;
  });
  
  const [pageSize, setPageSize] = useState(6); // Tamaño de la página
  const [totalPages, setTotalPages] = useState(1); // Estado para el número total de páginas
  const [isLoading, setIsLoading] = useState(false);

  const token = getCookie("AdminTokenAuth") as string;

  useEffect(() => {
    fetchCategories();
    fetchAllExchanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Efecto para cargar los filtros desde la URL cuando se carga la página
  useEffect(() => {
    // Cargar categoría desde la URL
    const categoriaParam = searchParams.get('categoria');
    if (categoriaParam) {
      const category = categories.find(cat => cat.name === categoriaParam);
      if (category) {
        setSelectedCategories([category.id]);
      }
    }

    // Cargar búsqueda desde la URL
    const buscarParam = searchParams.get('buscar');
    if (buscarParam) {
      setSearchQuery(buscarParam);
    }

    // Cargar empresa desde la URL
    const empresaParam = searchParams.get('empresa');
    if (empresaParam) {
      setSelectedCompany(empresaParam);
    }
  }, [searchParams, categories]);

  // Efecto para actualizar la URL cuando cambia la página
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', pageNumber.toString());
    
    // Actualizar la URL sin recargar la página
    router.push(`/dashboard/tienda-pixelup?${params.toString()}`, { scroll: false });
  }, [pageNumber, router, searchParams]);

  useEffect(() => {
    filterAndPaginateExchanges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategories,
    searchQuery,
    pageNumber,
    pageSize,
    exchanges,
    selectedCompany,
  ]);

  // Fetch de todos los exchanges paginados
  const fetchAllExchanges = async () => {
    let allExchanges: Exchange[] = [];
    let currentPage = 1;
    let totalItems = 0;

    try {
      do {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/exchanges?pageNumber=${currentPage}&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            next: {
              revalidate: 3600, // Revalidar cada 60 segundos
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        const fetchedExchanges = data.exchanges;
        totalItems = data.totalItems || fetchedExchanges.length * currentPage;

        allExchanges = [...allExchanges, ...fetchedExchanges];
        currentPage++;
      } while (allExchanges.length < totalItems);

      setExchanges(allExchanges);
    } catch (error) {
      console.error("Error al obtener los canjes:", error);
    }
  };

  // Fetch de categorías
  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/exchange-categories?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&pageSize=50&pageNumber=1`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          next: {
            revalidate: 3600,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.exchangeCategories) {
        setCategories(data.exchangeCategories);
      } else {
        console.error("No se encontraron categorías en la respuesta");
      }
    } catch (error) {
      console.error("Error al obtener las categorías:", error);
    }
  };

  // Filtrado y paginación local
  const filterAndPaginateExchanges = async () => {
    setIsLoading(true);

    // Simular un pequeño delay para mostrar el skeleton
    await new Promise((resolve) => setTimeout(resolve, 200));

    let filtered = [...exchanges];

    // Ordenar los exchanges para que Pixel Up aparezca primero y luego por precio de menor a mayor
    filtered.sort((a, b) => {
      // Primero ordenar por Pixel Up
      if (a.companyName === "Pixel Up" && b.companyName !== "Pixel Up") return -1;
      if (a.companyName !== "Pixel Up" && b.companyName === "Pixel Up") return 1;
      
      // Si ambos son de Pixel Up o ambos no son de Pixel Up, ordenar por precio
      return a.creditAmount - b.creditAmount;
    });

    console.log("Filtering with:", {
      selectedCompany,
      totalExchanges: exchanges.length,
      selectedCategories,
    });

    // Filtrar por categorías seleccionadas
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((exchange) =>
        selectedCategories.includes(exchange.exchangeCategory.id)
      );
    }

    // Filtrar por compañía seleccionada
    if (selectedCompany) {
      filtered = filtered.filter(
        (exchange) => exchange.companyName === selectedCompany
      );
    }

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (exchange) =>
          exchange.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          exchange.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Actualizar el total de páginas
    const totalFilteredItems = filtered.length;
    setTotalPages(Math.ceil(totalFilteredItems / pageSize));

    // Paginar los resultados
    const startIndex = (pageNumber - 1) * pageSize;
    const paginated = filtered.slice(startIndex, startIndex + pageSize);
    setFilteredExchanges(paginated);

    console.log("Filtered results:", {
      filteredCount: filtered.length,
      paginatedCount: paginated.length,
    });

    setIsLoading(false);
  };

  // Manejo del filtro de categoría
  const handleCategoryClick = (categoryId: string) => {
    setPageNumber(1); // Reiniciar la paginación al aplicar un filtro
    setSelectedCategories(
      (prevCategories) =>
        prevCategories.includes(categoryId)
          ? prevCategories.filter((id) => id !== categoryId) // Si ya está, lo quitamos
          : [...prevCategories, categoryId] // Si no está, lo agregamos
    );
    
    // Actualizar la URL con los filtros
    updateUrlWithFilters(1, categoryId);
  };

  // Mostrar todas las categorías
  const handleShowAll = () => {
    setPageNumber(1); // Reiniciar la paginación
    setSelectedCategories([]);
    
    // Actualizar la URL sin filtros
    updateUrlWithFilters(1);
  };

  // Limpiar todos los filtros y volver a la página 1
  const clearAllFilters = () => {
    setPageNumber(1);
    setSelectedCategories([]);
    setSearchQuery('');
    setSelectedCompany('');
    
    // Actualizar la URL sin filtros
    const params = new URLSearchParams();
    params.set('page', '1');
    router.push(`/dashboard/tienda-pixelup?${params.toString()}`, { scroll: false });
  };

  // Función para actualizar la URL con los filtros actuales
  const updateUrlWithFilters = (page: number, categoryId?: string) => {
    // Crear un nuevo objeto URLSearchParams para evitar modificar el original
    const params = new URLSearchParams();
    
    // Actualizar página
    params.set('page', page.toString());
    
    // Actualizar categorías
    if (categoryId) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        params.set('categoria', category.name);
      }
    } else if (selectedCategories.length > 0) {
      // Si no se proporciona categoryId pero hay categorías seleccionadas
      const category = categories.find(cat => cat.id === selectedCategories[0]);
      if (category) {
        params.set('categoria', category.name);
      }
    }
    
    // Actualizar búsqueda
    if (searchQuery) {
      params.set('buscar', searchQuery);
    }
    
    // Actualizar compañía - SIEMPRE incluir si existe, independientemente de otros filtros
    if (selectedCompany) {
      params.set('empresa', selectedCompany);
    }
    
    // Actualizar la URL sin recargar la página
    router.push(`/dashboard/tienda-pixelup?${params.toString()}`, { scroll: false });
  };

  // Obtener lista única de compañías
  const uniqueCompanies = Array.from(
    new Set(exchanges.map((exchange) => exchange.companyName))
  ).sort();

  return (
    <>
      <title>Tienda - PixelUp</title>
      {/* Hero Section con altura mínima */}
      <div className="relative hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white py-8">
        {" "}
        {/* Reducido de py-16 a py-8 */}
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:16px_16px]"></div>
        <div className="relative mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100 animate-fade-in">
              {" "}
              {/* Reducido a text-4xl y mb-2 */}
              Tienda Pixel Up
            </h1>
            <p className="text-base text-gray-100 max-w-2xl mx-auto leading-relaxed opacity-90 animate-fade-in-up">
              {" "}
              {/* Reducido a text-base */}
              Descubre servicios profesionales premium para impulsar tu negocio.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-14 bg-gradient-to-b from-gray-50 to-white">
        {/* Barra de búsqueda y filtros mejorados */}
        <div className="mb-12 space-y-4 max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar por nombre o empresa..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPageNumber(1); // Reiniciar la paginación al buscar
                }}
                onBlur={() => {
                  // Actualizar la URL cuando se pierde el foco
                  updateUrlWithFilters(pageNumber);
                }}
                className="w-full text-[13px] px-6 py-4 border-2 border-gray-200 rounded-xl
                         focus:outline-none focus:border-rosa transition-all duration-300
                         shadow-sm text-gray-700 bg-white/80 backdrop-blur-sm
                         hover:border-rosa/50"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-rosa "
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
            </div>

            <select
              className="px-6 py-4 border-2 border-gray-200 rounded-xl
                      focus:outline-none focus:border-rosa transition-all duration-300
                      shadow-sm text-gray-700 bg-white/80 backdrop-blur-sm
                      hover:border-rosa/50 cursor-pointer min-w-[200px]"
              value={
                selectedCategories.length === 1 ? selectedCategories[0] : ""
              }
              onChange={(e) => {
                const categoryId = e.target.value;
                setPageNumber(1);
                const newSelectedCategories = categoryId === "" ? [] : [categoryId];
                setSelectedCategories(newSelectedCategories);
                
                // Crear params con todos los filtros actuales
                const params = new URLSearchParams();
                params.set('page', '1');
                
                // Añadir categoría si existe
                if (categoryId !== "") {
                  const category = categories.find(cat => cat.id === categoryId);
                  if (category) {
                    params.set('categoria', category.name);
                  }
                }
                
                // Mantener empresa si existe
                if (selectedCompany) {
                  params.set('empresa', selectedCompany);
                }
                
                // Mantener búsqueda si existe
                if (searchQuery) {
                  params.set('buscar', searchQuery);
                }
                
                router.push(`/dashboard/tienda-pixelup?${params.toString()}`, { scroll: false });
              }}
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <select
              className="px-6 py-4 border-2 border-gray-200 rounded-xl
                      focus:outline-none focus:border-rosa transition-all duration-300
                      shadow-sm text-gray-700 bg-white/80 backdrop-blur-sm
                      hover:border-rosa/50 cursor-pointer min-w-[200px]"
              value={selectedCompany}
              onChange={(e) => {
                const company = e.target.value;
                setSelectedCompany(company);
                setPageNumber(1);
                
                // Crear params con todos los filtros actuales
                const params = new URLSearchParams();
                params.set('page', '1');
                
                // Mantener categoría si existe
                if (selectedCategories.length > 0) {
                  const category = categories.find(cat => cat.id === selectedCategories[0]);
                  if (category) {
                    params.set('categoria', category.name);
                  }
                }
                
                // Añadir empresa si existe
                if (company) {
                  params.set('empresa', company);
                }
                
                // Mantener búsqueda si existe
                if (searchQuery) {
                  params.set('buscar', searchQuery);
                }
                
                router.push(`/dashboard/tienda-pixelup?${params.toString()}`, { scroll: false });
              }}
            >
              <option value="">Todas las empresas</option>
              {uniqueCompanies.map((company) => (
                <option
                  key={company}
                  value={company}
                >
                  {company}
                </option>
              ))}
            </select>
            
            {/* Botón para limpiar filtros */}
            {(selectedCategories.length > 0 || searchQuery || selectedCompany) && (
              <button
                onClick={clearAllFilters}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl
                          transition-all duration-300 flex items-center justify-center gap-2
                          border-2 border-gray-200 hover:border-gray-300"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Grid de Cards mejorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {isLoading
            ? // Skeleton loader cards
              Array(pageSize)
                .fill(0)
                .map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse"
                  >
                    <div className="relative">
                      <div className="w-full h-56 bg-gray-200"></div>
                      <div
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                    w-36 h-36 rounded-xl border-4 border-white bg-gray-200"
                      ></div>
                    </div>
                    <div className="p-6 pt-12">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                      </div>
                      <div className="mt-6 h-12 bg-gray-200 rounded-xl"></div>
                    </div>
                  </div>
                ))
            : // Contenido real
              filteredExchanges.map((exchange) => (
                <div
                  key={exchange.id}
                  className="group bg-white rounded shadow-lg hover:shadow-xl transition-all duration-500
                  overflow-hidden transform hover:-translate-y-1"
                >
                  {/* Imagen principal con contenedor relativo */}
                  <div className="relative h-40">
                    <img
                      src={exchange.mainImageUrl}
                      alt={exchange.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Contenedor para logo */}
                    <div className="absolute left-1/2 top-6 -translate-x-1/2">
                      <div className="bg-white rounded p-4 shadow-lg">
                        <div className="w-16 h-16 flex items-center justify-center">
                          <img
                            src={exchange.companyImageUrl}
                            alt={exchange.companyName}
                            className="w-16 h-16 object-contain"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Contenedor de precios */}
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                      <div className="bg-white rounded p-2 px-3 shadow-lg">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-rosa">{exchange.creditAmount.toLocaleString()}</span>
                          <span className="text-[12px] text-gray-500">PixelCoins</span>
                          <div className="w-px h-8 bg-gray-200"></div>
                          <span className="text-sm text-rosa">${exchange.creditAmount.toLocaleString()}</span>
                          <span className="text-[12px] text-gray-500">CLP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contenido de la tarjeta con padding superior adicional */}
                  <div className="p-6 pt-12">
                    {/* Título y descripción */}
                    <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-1">
                      {exchange.name}
                    </h3>
                    
                    <div className="text-gray-600 text-sm mb-6 line-clamp-3 min-h-[90px]">
                      <ReactQuill
                        value={exchange.description}
                        readOnly={true}
                        theme="bubble"
                        modules={{ toolbar: false }}
                      />
                    </div>

                    {/* Botón de acción */}
                    <Link
                      href={`/dashboard/tienda-pixelup/${exchange.id}?${searchParams.toString()}`}
                      className="block w-full"
                    >
                      <button className="w-full bg-gray-800 hover:bg-gray-900
                                     text-white font-medium py-4 px-6 rounded-xl
                                     transition-all duration-300 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                        Ver detalle
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
        </div>

        {/* Paginación mejorada */}
        <div className="flex justify-center items-center gap-4 mt-16">
          <button
            onClick={() => {
              const newPage = Math.max(pageNumber - 1, 1);
              setPageNumber(newPage);
              updateUrlWithFilters(newPage);
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300
                       ${
                         pageNumber === 1
                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                           : "bg-white text-rosa hover:bg-rosa hover:text-white border-2 border-rosa"
                       }`}
            disabled={pageNumber === 1}
          >
            Anterior
          </button>

          <span className="text-gray-700 font-semibold px-4">
            Página {pageNumber} de {totalPages}
          </span>

          <button
            onClick={() => {
              const newPage = Math.min(pageNumber + 1, totalPages);
              setPageNumber(newPage);
              updateUrlWithFilters(newPage);
            }}
            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300
                       ${
                         pageNumber === totalPages
                           ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                           : "bg-white text-rosa hover:bg-rosa hover:text-white border-2 border-rosa"
                       }`}
            disabled={pageNumber === totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
    </>
  );
};

export default ExchangesGrid;
