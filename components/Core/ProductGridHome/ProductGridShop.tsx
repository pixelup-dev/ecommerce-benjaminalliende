/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FiFilter,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiGrid,
  FiList,
  FiPackage,
} from "react-icons/fi";
import Link from "next/link";

import { useAPI } from "@/app/Context/ProductTypeContext";
import { useRevalidation } from "@/app/Context/RevalidationContext";
import { slugify } from "@/app/utils/slugify";
import Loader from "@/components/common/Loader-t";
import { getActiveComponents } from "@/app/config/GlobalConfig";

// Función para obtener el precio de un producto
const getProductPrice = (product: any) => {
  if (product.offers && product.offers.length > 0) {
    return product.offers[0].amount;
  } else if (
    product.hasVariations &&
    product.variations &&
    product.variations.length > 0
  ) {
    const prices = product.variations.map((variation: any) => {
      if (variation.offers && variation.offers.length > 0) {
        return variation.offers[0].amount;
      }
      return variation.pricings?.[0]?.amount || Infinity;
    });
    return Math.min(...prices);
  } else if (product.pricings && product.pricings.length > 0) {
    return product.pricings[0].amount;
  } else if (product.pricingRanges && product.pricingRanges.length > 0) {
    return product.pricingRanges[0].minimumAmount;
  }
  return 0;
};

interface ProductGridShopProps {
  initialProducts: any[];
  initialProductTypes: any[];
  selectedCategory: string | null;
  currentPage: number;
}

interface FilterState {
  categories: string[];
  priceRange: { min: number | null; max: number | null };
  hasOffers: boolean | null;
  deliveryType: string[];
  sortBy: string;
  columns: number;
  productsPerPage: number;
}

const ProductGridShop = ({
  initialProducts,
  initialProductTypes,
  selectedCategory,
  currentPage: initialPage,
}: ProductGridShopProps) => {
  const { ProductCard } = getActiveComponents();
  const { shouldRevalidate, setShouldRevalidate } = useRevalidation();
  const [products, setProducts] = useState(initialProducts);
  const [productTypes] = useState(initialProductTypes);
  const [page, setPage] = useState(initialPage);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToCartHandler } = useAPI();

  // Estado de filtros
  const [filters, setFilters] = useState<FilterState>({
    categories:
      selectedCategory && selectedCategory !== "ALL" ? [selectedCategory] : [],
    priceRange: { min: null, max: null },
    hasOffers: null,
    deliveryType: [],
    sortBy: "nameAsc",
    columns: 3,
    productsPerPage: 6,
  });

  // Obtener rangos de precios para los filtros
  const priceRanges = useMemo(() => {
    const prices = products.flatMap((product: any) => {
      const productPrices: number[] = [];

      if (product.offers && product.offers.length > 0) {
        productPrices.push(product.offers[0].amount);
      } else if (
        product.hasVariations &&
        product.variations &&
        product.variations.length > 0
      ) {
        product.variations.forEach((variation: any) => {
          if (variation.offers && variation.offers.length > 0) {
            productPrices.push(variation.offers[0].amount);
          } else if (variation.pricings && variation.pricings.length > 0) {
            productPrices.push(variation.pricings[0].amount);
          }
        });
      } else if (product.pricings && product.pricings.length > 0) {
        productPrices.push(product.pricings[0].amount);
      } else if (product.pricingRanges && product.pricingRanges.length > 0) {
        productPrices.push(product.pricingRanges[0].minimumAmount);
        productPrices.push(product.pricingRanges[0].maximumAmount);
      }

      return productPrices;
    });

    return {
      min: Math.min(...prices.filter((p) => p > 0)),
      max: Math.max(...prices.filter((p) => p > 0)),
    };
  }, [products]);

  // Efecto para recargar datos cuando shouldRevalidate es true
  useEffect(() => {
    if (shouldRevalidate) {
      const url = new URL(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products`
      );
      url.searchParams.append(
        "siteId",
        process.env.NEXT_PUBLIC_API_URL_SITEID || ""
      );
      url.searchParams.append("pageNumber", "1");
      url.searchParams.append("pageSize", "1000");

      fetch(url.toString())
        .then((res) => res.json())
        .then((data) => {
          setProducts(data.products);
          setShouldRevalidate(false);
        })
        .catch((error) => {
          console.error("Error reloading products:", error);
        });
    }
  }, [shouldRevalidate, setShouldRevalidate]);

  // Efecto para desactivar el loader después de cualquier navegación
  useEffect(() => {
    setIsLoading(false);
  }, [page, selectedCategory]);

  // Efecto para sincronizar los filtros de categorías con la URL
  useEffect(() => {
    if (selectedCategory) {
      setFilters((prev) => ({
        ...prev,
        categories: [selectedCategory],
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        categories: [],
      }));
    }
  }, [selectedCategory]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    setPage(newPage);

    const productSection = document.querySelector(".product-grid-section");
    if (productSection) {
      productSection.scrollIntoView({ behavior: "smooth" });
    }

    router.push(`/tienda?${params.toString()}`, { scroll: false });
  };

  const handleCategoryChange = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (categoryId === "ALL") {
      params.delete("categoria");
      params.delete("page");
      router.push(`/tienda`);
    } else {
      const selectedCategoryData = productTypes.find(
        (category: any) => category.id === categoryId
      );
      if (selectedCategoryData) {
        params.set("categoria", slugify(selectedCategoryData.name));
        params.delete("page");
        router.push(`/tienda?${params.toString()}`);
      }
    }
    setPage(1);
  };

  // Función para verificar si un producto tiene ofertas
  const hasProductOffers = (product: any) => {
    if (product.offers && product.offers.length > 0) return true;
    if (product.hasVariations && product.variations) {
      return product.variations.some(
        (variation: any) => variation.offers && variation.offers.length > 0
      );
    }
    return false;
  };

  // Función para obtener el tipo de envío de un producto
  const getProductDeliveryType = (product: any) => {
    const types = [];
    if (product.enabledForDelivery) types.push("delivery");
    if (product.enabledForWithdrawal) types.push("withdrawal");
    return types;
  };

  // Filtrar productos según todos los filtros aplicados
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filtro por categorías
    if (filters.categories.length > 0) {
      filtered = filtered.filter((product: any) => {
        if (product.productTypes && Array.isArray(product.productTypes)) {
          return product.productTypes.some((type: any) =>
            filters.categories.includes(slugify(type.name))
          );
        }
        return false;
      });
    }

    // Filtro por rango de precio
    filtered = filtered.filter((product: any) => {
      const price = getProductPrice(product);
      const { min, max } = filters.priceRange;

      if (min !== null && price < min) {
        return false;
      }
      if (max !== null && price > max) {
        return false;
      }
      return true;
    });

    // Filtro por ofertas
    if (filters.hasOffers !== null) {
      filtered = filtered.filter(
        (product: any) => hasProductOffers(product) === filters.hasOffers
      );
    }

    // Filtro por tipo de envío
    if (filters.deliveryType.length > 0) {
      filtered = filtered.filter((product: any) => {
        const productDeliveryTypes = getProductDeliveryType(product);
        return filters.deliveryType.some((type) =>
          productDeliveryTypes.includes(type)
        );
      });
    }

    return filtered;
  }, [products, filters]);

  // Ordenar productos filtrados
  const sortedProducts = useMemo(() => {
    return filteredProducts.slice().sort((a, b) => {
      if (filters.sortBy === "featured") {
        if (a.isFeatured === true && b.isFeatured !== true) return -1;
        if (a.isFeatured !== true && b.isFeatured === true) return 1;
        return 0;
      } else if (filters.sortBy === "asc" || filters.sortBy === "desc") {
        const priceA = getProductPrice(a);
        const priceB = getProductPrice(b);
        return filters.sortBy === "asc" ? priceA - priceB : priceB - priceA;
      } else if (
        filters.sortBy === "nameAsc" ||
        filters.sortBy === "nameDesc"
      ) {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return filters.sortBy === "nameDesc"
          ? nameB.localeCompare(nameA)
          : nameA.localeCompare(nameB);
      } else if (filters.sortBy === "offerDesc") {
        const getOfferPercentage = (product: any) => {
          if (product.offers && product.offers.length > 0) {
            const originalPrice =
              product.pricings?.[0]?.amount ||
              product.pricingRanges?.[0]?.minimumAmount ||
              0;
            const offerPrice = product.offers[0].amount;
            if (originalPrice === 0) return 0;
            return ((originalPrice - offerPrice) / originalPrice) * 100;
          }
          return 0;
        };
        const offerA = getOfferPercentage(a);
        const offerB = getOfferPercentage(b);
        return offerB - offerA;
      }
      return 0;
    });
  }, [filteredProducts, filters.sortBy]);

  const paginatedProducts = useMemo(() => {
    const startIndex = (page - 1) * filters.productsPerPage;
    return sortedProducts.slice(
      startIndex,
      startIndex + filters.productsPerPage
    );
  }, [sortedProducts, page, filters.productsPerPage]);

  const totalPages = Math.ceil(sortedProducts.length / filters.productsPerPage);

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
    setPage(1);

    // Si se está cambiando las categorías, actualizar la URL
    if (filterType === "categories") {
      const params = new URLSearchParams(searchParams.toString());
      if (value.length > 0) {
        params.set("categoria", value[0]); // Tomar la primera categoría seleccionada
      } else {
        params.delete("categoria");
      }
      params.delete("page");
      router.push(`/tienda?${params.toString()}`);
    }
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      priceRange: { min: null, max: null },
      hasOffers: null,
      deliveryType: [],
      sortBy: "nameAsc",
      columns: 3,
      productsPerPage: 6,
    });
    setPage(1);

    // Limpiar la URL
    const params = new URLSearchParams(searchParams.toString());
    params.delete("categoria");
    params.delete("page");
    router.push(`/tienda?${params.toString()}`);
  };

  const getPageNumbers = (currentPage: number, totalPages: number) => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        i === currentPage ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  if (isLoading) {
    return (
      <section className="relative pb-32 z-0">
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader />
        </div>
      </section>
    );
  }

  return (
    <section className="relative pb-32 z-0 product-grid-section">
      {/* Header con controles */}
      <div className="w-full max-w-7xl mx-auto px-4 pt-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          {/* Botón para abrir sidebar en móvil */}
          <div className="lg:hidden order-2 lg:order-1 bg-primary">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="mobile-filter-button w-full flex items-center justify-center gap-2 px-4 py-2 text-white transition-all duration-200 "
              style={{ borderRadius: "var(--radius)" }}
            >
              <FiFilter />
              Filtros y Ordenamiento
            </button>
          </div>

          {/* Información de resultados */}
          <div className="flex-1 order-1 lg:order-2">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Nuestra Tienda
            </h1>
            <p
              className="product-counter text-sm text-gray-600 inline-block w-full max-w-sm"
              style={{ borderRadius: "var(--radius)" }}
            >
              <FiPackage className="product-counter-icon" />
              Mostrando {paginatedProducts.length} de {sortedProducts.length}{" "}
              productos
            </p>
          </div>

          {/* Controles de vista y ordenamiento */}
          <div className="hidden view-controls lg:flex flex-col sm:flex-row gap-4 lg:order-3">
            {/* Selector de columnas (solo visible en modo grid) */}
{/*             <div
              className="view-control-group"
              style={{ borderRadius: "var(--radius)" }}
            >
              <span className="view-control-label">Columnas:</span>
              <select
                value={filters.columns}
                onChange={(e) =>
                  handleFilterChange("columns", parseInt(e.target.value))
                }
                className="config-selector px-3 py-2 text-sm focus:outline-none"
                style={{ borderRadius: "var(--radius)" }}
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </div> */}

            {/* Selector de productos por página */}
{/*             <div
              className="view-control-group"
              style={{ borderRadius: "var(--radius)" }}
            >
              <span className="view-control-label">Por página:</span>
              <select
                value={filters.productsPerPage}
                onChange={(e) =>
                  handleFilterChange(
                    "productsPerPage",
                    parseInt(e.target.value)
                  )
                }
                className="config-selector px-3 py-2 text-sm focus:outline-none"
                style={{ borderRadius: "var(--radius)" }}
              >
                <option value={6}>6</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
              </select>
            </div> */}

            {/* Ordenamiento */}
            <div
              className="view-control-group"
              style={{ borderRadius: "var(--radius)" }}
            >
              <span className="view-control-label">Ordenar:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="config-selector px-4 py-2 text-sm focus:outline-none"
                style={{ borderRadius: "var(--radius)" }}
              >
                <option value="nameAsc">Nombre A - Z</option>
                <option value="nameDesc">Nombre Z - A</option>
                <option value="asc">Precio: Menor a Mayor</option>
                <option value="desc">Precio: Mayor a Menor</option>
                <option value="featured">Recomendados</option>
                <option value="offerDesc">Mayor Descuento</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4">
        <div className="flex gap-8">
          {/* Sidebar de filtros */}
          <div
            className={`fixed lg:relative inset-0 z-50 lg:z-auto ${
              isSidebarOpen ? "block" : "hidden lg:block"
            }`}
          >
            {/* Overlay para móvil */}
            {isSidebarOpen && (
              <div
                className="sidebar-overlay fixed inset-0 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}

            {/* Sidebar */}
            <div
              className="shop-filters-sidebar fixed lg:relative left-0 top-0 h-full lg:h-auto w-full sm:w-80 lg:w-64 bg-white border-r border-gray-200 lg:border-r-0 lg:border-b lg:border-gray-200 lg:pb-6 overflow-y-auto"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="p-6">
                {/* Header del sidebar */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Filtros
                  </h2>
                  <button
                    onClick={() => setIsSidebarOpen(false)}
                    className="lg:hidden p-2 hover:bg-gray-100  transition-colors bg-primary text-white"
                    style={{ borderRadius: "var(--radius)" }}
                  >
                    <FiX size={20} />
                  </button>
                </div>

                {/* Controles de vista en móvil */}
                <div className="lg:hidden border-b border-gray-200 pb-4 mb-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Opciones de Vista
                  </h3>
                  <div className="view-controls flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {/* Selector de columnas (solo visible en modo grid) */}
               {/*        <div className="flex flex-col items-start gap-1">
                        <span className="view-control-label">Columnas:</span>
                        <select
                          value={filters.columns}
                          onChange={(e) =>
                            handleFilterChange(
                              "columns",
                              parseInt(e.target.value)
                            )
                          }
                          className="config-selector w-full px-3 py-2 text-sm focus:outline-none"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={4}>4</option>
                        </select>
                      </div> */}

                      {/* Selector de productos por página */}
             {/*          <div className="flex flex-col items-start gap-1">
                        <span className="view-control-label">Por página:</span>
                        <select
                          value={filters.productsPerPage}
                          onChange={(e) =>
                            handleFilterChange(
                              "productsPerPage",
                              parseInt(e.target.value)
                            )
                          }
                          className="config-selector w-full px-3 py-2 text-sm focus:outline-none"
                          style={{ borderRadius: "var(--radius)" }}
                        >
                          <option value={6}>6</option>
                          <option value={8}>8</option>
                          <option value={12}>12</option>
                        </select>
                      </div> */}
                    </div>

                    {/* Ordenamiento */}
                    <div className="flex flex-col items-start gap-1 w-full">
                      <span className="view-control-label">Ordenar:</span>
                      <select
                        value={filters.sortBy}
                        onChange={(e) =>
                          handleFilterChange("sortBy", e.target.value)
                        }
                        className="config-selector w-full px-4 py-2 text-sm focus:outline-none"
                        style={{ borderRadius: "var(--radius)" }}
                      >
                        <option value="nameAsc">Nombre A - Z</option>
                        <option value="nameDesc">Nombre Z - A</option>
                        <option value="asc">Precio: Menor a Mayor</option>
                        <option value="desc">Precio: Mayor a Menor</option>
                        <option value="featured">Recomendados</option>
                        <option value="offerDesc">Mayor Descuento</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Botón limpiar filtros */}
                <button
                  onClick={clearAllFilters}
                  className="clear-filters-button w-full mb-6 px-4 py-2 text-sm text-gray-600 "
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Limpiar todos los filtros
                </button>

                {/* Filtro por categorías */}
                <FilterSection title="Categorías">
                  <div className="space-y-2">
                    {productTypes?.map((category: any) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-2 cursor-pointer filter-transition"
                      >
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(
                            slugify(category.name)
                          )}
                          onChange={(e) => {
                            const categorySlug = slugify(category.name);
                            if (e.target.checked) {
                              handleFilterChange("categories", [
                                ...filters.categories,
                                categorySlug,
                              ]);
                            } else {
                              handleFilterChange(
                                "categories",
                                filters.categories.filter(
                                  (c) => c !== categorySlug
                                )
                              );
                            }
                          }}
                          className="custom-checkbox w-4 h-4 text-primary border-gray-300  focus:ring-primary/20"
                          style={{ borderRadius: "var(--radius)" }}
                        />
                        <span className="text-sm text-gray-700">
                          {category.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </FilterSection>

                {/* Filtro por rango de precio */}
                <FilterSection title="Rango de Precio">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        placeholder="Mín"
                        value={filters.priceRange.min ?? ""}
                        onChange={(e) =>
                          handleFilterChange("priceRange", {
                            ...filters.priceRange,
                            min:
                              e.target.value === ""
                                ? null
                                : parseInt(e.target.value),
                          })
                        }
                        className="price-range-input w-full px-3 py-2 text-sm focus:outline-none"
                        style={{ borderRadius: "var(--radius)" }}
                      />
                      <input
                        type="number"
                        placeholder="Máx"
                        value={filters.priceRange.max ?? ""}
                        onChange={(e) =>
                          handleFilterChange("priceRange", {
                            ...filters.priceRange,
                            max:
                              e.target.value === ""
                                ? null
                                : parseInt(e.target.value),
                          })
                        }
                        className="price-range-input w-full px-3 py-2 text-sm focus:outline-none"
                        style={{ borderRadius: "var(--radius)" }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      Rango: ${priceRanges.min?.toLocaleString()} - $
                      {priceRanges.max?.toLocaleString()}
                    </div>
                  </div>
                </FilterSection>

                {/* Filtro por ofertas */}
                <FilterSection title="Ofertas">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer filter-transition">
                      <input
                        type="radio"
                        name="offers"
                        checked={filters.hasOffers === null}
                        onChange={() => handleFilterChange("hasOffers", null)}
                        className="custom-radio w-4 h-4 text-primary border-gray-300 focus:ring-primary/20"
                      />
                      <span className="text-sm text-gray-700">Todos</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer filter-transition">
                      <input
                        type="radio"
                        name="offers"
                        checked={filters.hasOffers === true}
                        onChange={() => handleFilterChange("hasOffers", true)}
                        className="custom-radio w-4 h-4 text-primary border-gray-300 focus:ring-primary/20"
                      />
                      <span className="text-sm text-gray-700">
                        Solo ofertas
                      </span>
                    </label>
                  </div>
                </FilterSection>

                {/* Filtro por tipo de envío */}
                <FilterSection title="Tipo de Envío">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer filter-transition">
                      <input
                        type="checkbox"
                        checked={filters.deliveryType.includes("delivery")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange("deliveryType", [
                              ...filters.deliveryType,
                              "delivery",
                            ]);
                          } else {
                            handleFilterChange(
                              "deliveryType",
                              filters.deliveryType.filter(
                                (t) => t !== "delivery"
                              )
                            );
                          }
                        }}
                        className="custom-checkbox w-4 h-4 text-primary border-gray-300  focus:ring-primary/20"
                        style={{ borderRadius: "var(--radius)" }}
                      />
                      <span className="text-sm text-gray-700">
                        Envío a domicilio
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer filter-transition">
                      <input
                        type="checkbox"
                        checked={filters.deliveryType.includes("withdrawal")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleFilterChange("deliveryType", [
                              ...filters.deliveryType,
                              "withdrawal",
                            ]);
                          } else {
                            handleFilterChange(
                              "deliveryType",
                              filters.deliveryType.filter(
                                (t) => t !== "withdrawal"
                              )
                            );
                          }
                        }}
                        className="custom-checkbox w-4 h-4 text-primary border-gray-300  focus:ring-primary/20"
                        style={{ borderRadius: "var(--radius)" }}
                      />
                      <span className="text-sm text-gray-700">
                        Retiro en tienda
                      </span>
                    </label>
                  </div>
                </FilterSection>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Grid de productos */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${filters.columns} xl:grid-cols-${filters.columns} gap-6`}
            >
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex justify-center"
                  >
                    <ProductCard
                      key={product.id}
                      product={product}
                      addToCartHandler={addToCartHandler}
                      isOnSale={hasProductOffers(product)}
                      stock={product.stock}
                    />
                  </div>
                ))
              ) : (
                <div className="empty-state col-span-full py-12 text-center">
                  <div className="max-w-md mx-auto">
                    <div
                      className="w-16 h-16 bg-gray-100  flex items-center justify-center mx-auto mb-4"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <FiX
                        size={24}
                        className="text-gray-400"
                      />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No se encontraron productos
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Intenta ajustar los filtros para encontrar lo que buscas
                    </p>
                    <button
                      onClick={clearAllFilters}
                      className="px-4 py-2 bg-primary text-white  hover:bg-primary/90 transition-colors"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="mt-12 flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {getPageNumbers(page, totalPages).map((pageNum, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        typeof pageNum === "number"
                          ? handlePageChange(pageNum)
                          : undefined
                      }
                      className={`pagination-button px-4 py-2 text-sm border  transition-all duration-200 ${
                        pageNum === page
                          ? "bg-primary text-white border-primary"
                          : pageNum === "..."
                          ? "bg-white border-gray-300 cursor-default"
                          : "bg-white hover:bg-gray-50 border-gray-300"
                      }`}
                      disabled={pageNum === "..."}
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

// Componente auxiliar para secciones de filtros
const FilterSection = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border-b border-gray-200 pb-4 mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="filter-section-header flex items-center justify-between w-full text-left mb-3 p-2 "
        style={{ borderRadius: "var(--radius)" }}
      >
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
        {isOpen ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
      </button>
      {isOpen && <div className="filter-transition">{children}</div>}
    </div>
  );
};

export default ProductGridShop;
