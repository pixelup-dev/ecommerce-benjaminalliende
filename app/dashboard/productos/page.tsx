/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAPI } from "@/app/Context/ProductTypeContext";
import { getCookie } from "cookies-next";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader-t";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  ColumnOrderState,
  Row,
} from "@tanstack/react-table";
import { slugify } from "@/app/utils/slugify";

// Interfaces para Tipos de Producto y Respuesta de la API
interface Product {
  id: string;
  skuId: string;
  name: string;
  previewImageUrl: string;
  mainImageUrl: string;
  productTypes: { id: string; name: string }[];
  price: number;
  statusCode: string;
  hasVariations: boolean;
  enabledForDelivery: boolean;
  enabledForWithdrawal: boolean;
  description: string;
  isFeatured: boolean;
  hasFeaturedBaseSku: boolean;
  stockQuantity?: number;
  hasUnlimitedStock: boolean;
}

import { useRevalidation } from "@/app/Context/RevalidationContext";

// Agregar estas interfaces
interface SkuInventory {
  quantity: number;
  minimumQuantity: number;
}

interface VariationStock {
  skuId: string;
  name: string;
  quantity: number;
  attributes: {
    label: string;
    value: string;
  }[];
  variationNumber: number;
  hasUnlimitedStock: boolean;
}

// Definir el tipo de columna
interface TableColumn {
  id: string;
  header: string | React.ReactNode;
  accessorKey: string;
  cell?: (info: any) => React.ReactNode;
  enableDragging?: boolean;
}

export default function ProductPageBO() {
  // Estados
  const [loading, setLoading] = useState(false);
  const [filterDropdownVisible, setFilterDropdownVisible] = useState(false);
  const [actionsDropdownVisible, setActionsDropdownVisible] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [paginatedProducts, setPaginatedProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const { triggerRevalidation } = useRevalidation();

  // Agregar estos estados
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [selectedProductStock, setSelectedProductStock] = useState<
    VariationStock[]
  >([]);
  const [loadingStock, setLoadingStock] = useState(false);

  // Agregar estos estados
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([
    "image",
    "name",
    "price",
    "stock",
    "type",
    "published",
    "featured",
    "actions",
  ]);

  // Agregar estos estados
  const [filters, setFilters] = useState({
    published: "all", // 'all', 'active', 'inactive'
    type: "all", // 'all', 'simple', 'variable'
    featured: "all", // 'all', 'featured', 'notFeatured'
    categories: new Set<string>(),
  });

  // Agregar estos estados
  const [priceModalVisible, setPriceModalVisible] = useState(false);
  const [selectedProductPrices, setSelectedProductPrices] = useState<any[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  // Agregar estos estados para el memo
  const [stockCache, setStockCache] = useState<{
    [key: string]: VariationStock[];
  }>({});
  const [priceCache, setPriceCache] = useState<{ [key: string]: any[] }>({});

  // Reemplazar fetchStockSimple
  const fetchStockSimple = async (
    productId: string,
    skuId: string,
    forceUpdate = false
  ) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const warehouseId = await getWarehouseId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/inventories?warehouseId=${warehouseId}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.skuInventories.length > 0) {
        return data.skuInventories[0].quantity;
      }
      return 0;
    } catch (error) {
      console.error("Error fetching stock:", error);
      return 0;
    }
  };

  // Reemplazar fetchPriceForProduct
  const fetchPriceForProduct = async (
    productId: string,
    skuId: string,
    forceUpdate = false
  ) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (data.skuPricings.length > 0) {
        return data.skuPricings[0].unitPrice;
      }
      return "0";
    } catch (error) {
      console.error("Error fetching price:", error);
      return "0";
    }
  };

  // Modificar el useEffect inicial para separar la carga
  useEffect(() => {
    const loadInitialProducts = async () => {
      try {
        setLoading(true);
        const token = getCookie("AdminTokenAuth");
        const allData: Product[] = [];
        let pageNumber = 1;
        let hasMoreData = true;

        // Limpiar el caché de sessionStorage al cargar
        sessionStorage.clear();

        while (hasMoreData) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products?pageNumber=${pageNumber}&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.products.length === 0) {
            hasMoreData = false;
            break;
          }

          // Agregar productos sin stock/precio inicialmente
          const productsWithoutData = response.data.products.map(
            (product: Product) => ({
              ...product,
              stockQuantity: null,
              price: null,
              hasUnlimitedStock: false,
            })
          );

          allData.push(...productsWithoutData);
          pageNumber++;
        }

        setProducts(allData);
        setFilteredProducts(allData);
        initializeCategories(allData);
        setLoading(false);
      } catch (error) {
        console.error("Ocurrió un error:", error);
        toast.error("Error al cargar los productos");
        setLoading(false);
      }
    };

    loadInitialProducts();
  }, []);

  // Agregar esta nueva función para cargar stock y precios
  const loadStockAndPrices = async (products: Product[]) => {
    const batchSize = 5;
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (product) => {
          if (!product.hasVariations) {
            try {
              const [stock, price, skuData] = await Promise.all([
                fetchStockSimple(product.id, product.skuId, true),
                fetchPriceForProduct(product.id, product.skuId, true),
                fetchSkuData(product.id, product.skuId),
              ]);

              // Actualizar el producto individual con los nuevos datos
              setProducts((prevProducts) =>
                prevProducts.map((p) =>
                  p.id === product.id
                    ? {
                        ...p,
                        stockQuantity: stock,
                        price: price,
                        hasUnlimitedStock: skuData?.hasUnlimitedStock || false,
                      }
                    : p
                )
              );
            } catch (error) {
              console.error(
                `Error loading data for product ${product.id}:`,
                error
              );
            }
          }
        })
      );
    }
  };

  // Efecto para filtrar productos según la búsqueda y las categorías seleccionadas
  useEffect(() => {
    const filtered = products
      .filter((product) => {
        // Filtro por búsqueda
        const matchesSearch = product.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

        // Filtro por estado de publicación
        const matchesPublished =
          filters.published === "all"
            ? true
            : filters.published === "active"
            ? product.statusCode === "ACTIVE"
            : product.statusCode !== "ACTIVE";

        // Filtro por tipo de producto
        const matchesType =
          filters.type === "all"
            ? true
            : filters.type === "simple"
            ? !product.hasVariations
            : product.hasVariations;

        // Filtro por destacados
        const matchesFeatured =
          filters.featured === "all"
            ? true
            : filters.featured === "featured"
            ? product.isFeatured
            : !product.isFeatured;

        // Filtro por categorías
        const matchesCategories =
          filters.categories.size === 0 ||
          Array.from(filters.categories).every((category) =>
            product.productTypes.some((type) => type.name === category)
          );

        return (
          matchesSearch &&
          matchesPublished &&
          matchesType &&
          matchesFeatured &&
          matchesCategories
        );
      })
      .map((product) => ({
        ...product,
        stockQuantity: product.stockQuantity, // Preservar el stockQuantity
      }));

    setFilteredProducts(filtered);
    setTotalPages(Math.ceil(filtered.length / pageSize));

    // Solo resetear a página 1 si cambian los términos de búsqueda o filtros, no cuando se actualiza un producto
    if (
      searchTerm !== "" ||
      filters.published !== "all" ||
      filters.type !== "all" ||
      filters.featured !== "all" ||
      filters.categories.size > 0
    ) {
      setCurrentPage(1);
    }
  }, [products, searchTerm, filters, pageSize]);

  // Efecto para manejar la paginación de los productos filtrados
  useEffect(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPageProducts = filteredProducts.slice(startIndex, endIndex);
    setPaginatedProducts(currentPageProducts);

    // Cargar stock y precios solo para los productos de la página actual
    const loadCurrentPageData = async () => {
      const productsToUpdate = currentPageProducts.filter(
        (p) =>
          !p.hasVariations && (p.stockQuantity === null || p.price === null)
      );

      if (productsToUpdate.length === 0) return;

      await Promise.all(
        productsToUpdate.map(async (product) => {
          try {
            const [stock, price, skuData] = await Promise.all([
              fetchStockSimple(product.id, product.skuId, true),
              fetchPriceForProduct(product.id, product.skuId, true),
              fetchSkuData(product.id, product.skuId),
            ]);

            setProducts((prevProducts) =>
              prevProducts.map((p) =>
                p.id === product.id
                  ? {
                      ...p,
                      stockQuantity: stock,
                      price: price,
                      hasUnlimitedStock: skuData?.hasUnlimitedStock || false,
                    }
                  : p
              )
            );
          } catch (error) {
            console.error(
              `Error loading data for product ${product.id}:`,
              error
            );
          }
        })
      );
    };

    loadCurrentPageData();
  }, [filteredProducts, currentPage, pageSize]);

  // Manejo de Cambio de Página
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Mostrar y Ocultar Modales
  const showDeleteModal = (product: Product) => {
    setProductToDelete(product);
    setIsModalVisible(true);
  };

  const hideDeleteModal = () => {
    setIsModalVisible(false);
    setProductToDelete(null);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      await deleteProduct(productToDelete.id);
      hideDeleteModal();
    }
  };

  // Manejo de Categorías
  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(category)) {
        newSelected.delete(category);
      } else {
        newSelected.add(category);
      }
      return newSelected;
    });
  };

  // Manejo de Eventos de Clic Fuera de los Dropdowns
  const filterDropdownRef = useRef<HTMLDivElement>(null);
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      filterDropdownRef.current &&
      !filterDropdownRef.current.contains(event.target as Node) &&
      !(event.target as Element).closest("#filterDropdownButton")
    ) {
      setFilterDropdownVisible(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [handleClickOutside]);

  const toggleFilterDropdown = () => {
    setFilterDropdownVisible(!filterDropdownVisible);
  };

  const toggleActionsDropdown = () => {
    setActionsDropdownVisible(!actionsDropdownVisible);
  };

  const fetchProductos = async () => {
    try {
      setLoading(true); // Inicia el loading
      const token = getCookie("AdminTokenAuth");
      const allData: Product[] = [];
      let pageNumber = 1;
      let data;

      do {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products?pageNumber=${pageNumber}&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        data = response.data;
        allData.push(...data.products);
        pageNumber += 1;
      } while (data.products.length > 0);

      setProducts(allData);
      setFilteredProducts(allData);
      initializeCategories(allData);
    } catch (error) {
      console.error("Ocurrió un error:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setLoading(false); // Termina el loading
    }
  };

  const initializeCategories = (products: Product[]) => {
    const uniqueCategories = new Set<string>();
    products.forEach((product) => {
      product.productTypes.forEach((type) => {
        uniqueCategories.add(type.name);
      });
    });
    setCategories(Array.from(uniqueCategories));
  };

  const filterProducts = () => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategories.size === 0 ||
          Array.from(selectedCategories).every((category) =>
            product.productTypes.some((type) => type.name === category)
          ))
    );
    setFilteredProducts(filtered);
  };

  const paginateProducts = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    setPaginatedProducts(filteredProducts.slice(startIndex, endIndex));
  };

  const updateProduct = async (product: Product, updates: Partial<Product>) => {
    try {
      const token = getCookie("AdminTokenAuth");

      // Primero actualizamos el producto
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${product.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...product,
            ...updates,
            hasFeaturedBaseSku: updates.isFeatured ?? product.isFeatured,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar el producto");
      }

      // Limpiar caché para este producto
      setStockCache((prev) => {
        const newCache = { ...prev };
        delete newCache[product.id];
        return newCache;
      });

      setPriceCache((prev) => {
        const newCache = { ...prev };
        delete newCache[product.id];
        return newCache;
      });

      // Actualizar el producto en el estado local manteniendo el orden actual
      setProducts((prevProducts) => {
        const productIndex = prevProducts.findIndex((p) => p.id === product.id);
        if (productIndex === -1) return prevProducts;

        const newProducts = [...prevProducts];
        newProducts[productIndex] = {
          ...newProducts[productIndex],
          ...updates,
          stockQuantity: product.stockQuantity, // Mantener el stock actual
          price: product.price, // Mantener el precio actual
        };
        return newProducts;
      });

      // Actualizar productos filtrados manteniendo el orden actual
      setFilteredProducts((prevFiltered) => {
        const productIndex = prevFiltered.findIndex((p) => p.id === product.id);
        if (productIndex === -1) return prevFiltered;

        const newFiltered = [...prevFiltered];
        newFiltered[productIndex] = {
          ...newFiltered[productIndex],
          ...updates,
          stockQuantity: product.stockQuantity,
          price: product.price,
        };
        return newFiltered;
      });

      // Revalidar
      await fetch("/api/revalidate?tag=products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      await triggerRevalidation();

      toast.success("Producto actualizado");
    } catch (error) {
      console.error(
        "Error updating product:",
        error instanceof Error ? error.message : error
      );
      toast.error("Error al actualizar el producto");
    }
  };

  const toggleFeatured = (product: Product) => {
    updateProduct(product, { isFeatured: !product.isFeatured });
  };

  const toggleStatus = (product: Product) => {
    const newStatus = product.statusCode === "ACTIVE" ? "DRAFT" : "ACTIVE";
    updateProduct(product, { statusCode: newStatus });
  };

  const deleteProduct = async (id: string) => {
    try {
      const token = getCookie("AdminTokenAuth");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar el producto");
      }

      // Limpiar caché para este producto
      setStockCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });

      setPriceCache((prev) => {
        const newCache = { ...prev };
        delete newCache[id];
        return newCache;
      });

      // Actualizar el estado local eliminando solo el producto específico
      setProducts((prevProducts) =>
        prevProducts.filter((product) => product.id !== id)
      );
      setFilteredProducts((prevFiltered) =>
        prevFiltered.filter((product) => product.id !== id)
      );

      // Revalidar
      await fetch("/api/revalidate?tag=products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      await triggerRevalidation();

      toast.success("Producto eliminado");
    } catch (error) {
      console.error(
        "Error deleting product:",
        error instanceof Error ? error.message : error
      );
      toast.error("Error al eliminar el producto");
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Modificar fetchStockVariable para usar cache
  const fetchStockVariable = async (productId: string) => {
    // Verificar si existe en cache
    if (stockCache[productId]) {
      setSelectedProductStock(stockCache[productId]);
      return;
    }

    try {
      setLoadingStock(true);
      const token = getCookie("AdminTokenAuth");
      const warehouseId = await getWarehouseId();

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&statusCode=ACTIVE`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      const variations = data.skus.filter((sku: any) => !sku.isBaseSku);

      const stockData = await Promise.all(
        variations.map(async (variation: any) => {
          const [attributesResponse, stockResponse] = await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${variation.id}/attributes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${variation.id}/inventories?warehouseId=${warehouseId}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            ),
          ]);

          const [attributesData, stockData] = await Promise.all([
            attributesResponse.json(),
            stockResponse.json(),
          ]);

          const attributes = attributesData.skuAttributes
            .filter((attr: any) => attr.attribute.statusCode === "ACTIVE")
            .map((attr: any) => ({
              label: attr.attribute.name,
              value: attr.value,
            }));

          const quantity =
            stockData.skuInventories.length > 0
              ? stockData.skuInventories[0].quantity
              : 0;

          return {
            skuId: variation.id,
            name: variation.name,
            attributes,
            quantity,
            hasUnlimitedStock: variation.hasUnlimitedStock,
            variationNumber: variations.indexOf(variation) + 1,
          };
        })
      );

      const validStockData = stockData.filter(
        (data) => data.attributes.length > 0
      );

      // Guardar en cache
      setStockCache((prev) => ({
        ...prev,
        [productId]: validStockData,
      }));

      setSelectedProductStock(validStockData);
    } catch (error) {
      console.error("Error fetching stock:", error);
      toast.error("Error al cargar el stock de las variaciones");
    } finally {
      setLoadingStock(false);
    }
  };

  const getWarehouseId = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/warehouses?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.warehouses?.length > 0) {
        return response.data.warehouses[0].id;
      }
      console.error("No se encontraron almacenes.");
      return null;
    } catch (error) {
      console.error("Error obteniendo almacén:", error);
      return null;
    }
  };

  // Modificar fetchPriceVariable para usar cache
  const fetchPriceVariable = async (productId: string) => {
    // Verificar si existe en cache
    if (priceCache[productId]) {
      setSelectedProductPrices(priceCache[productId]);
      return;
    }

    setLoadingPrices(true);
    try {
      const token = getCookie("AdminTokenAuth");

      const variationsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&statusCode=ACTIVE`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const variationsData = await variationsResponse.json();
      const variations = variationsData.skus.filter(
        (sku: any) => !sku.isBaseSku
      );

      const pricesWithAttributes = await Promise.all(
        variations.map(async (variation: any, index: number) => {
          const [priceResponse, attributesResponse] = await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${variation.id}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${variation.id}/attributes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            ),
          ]);

          const [priceData, attributesData] = await Promise.all([
            priceResponse.json(),
            attributesResponse.json(),
          ]);

          const attributes = attributesData.skuAttributes
            .filter((attr: any) => attr.attribute.statusCode === "ACTIVE")
            .map((attr: any) => ({
              label: attr.attribute.name,
              value: attr.value,
            }));

          return {
            skuId: variation.id,
            name: variation.name,
            price: priceData.skuPricings[0]?.unitPrice || 0,
            attributes: attributes,
            variationNumber: index + 1,
          };
        })
      );

      const validPrices = pricesWithAttributes.filter(
        (result) => result.attributes.length > 0
      );

      // Guardar en cache
      setPriceCache((prev) => ({
        ...prev,
        [productId]: validPrices,
      }));

      setSelectedProductPrices(validPrices);
    } catch (error) {
      console.error("Error al obtener los precios de las variaciones:", error);
      toast.error("Error al obtener los precios de las variaciones");
    } finally {
      setLoadingPrices(false);
    }
  };

  // Agregar estas funciones para manejar el drag and drop
  const handleDragStart = (
    e: React.DragEvent<HTMLTableCellElement>,
    columnId: string
  ) => {
    if (columnId === "image" || columnId === "name" || columnId === "actions")
      return;
    e.dataTransfer.setData("text/plain", columnId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLTableCellElement>,
    targetColumnId: string
  ) => {
    e.preventDefault();

    // No permitir soltar en columnas fijas
    if (
      targetColumnId === "image" ||
      targetColumnId === "name" ||
      targetColumnId === "actions"
    )
      return;

    const draggedColumnId = e.dataTransfer.getData("text/plain");

    // No hacer nada si se intenta soltar una columna fija
    if (
      draggedColumnId === "image" ||
      draggedColumnId === "name" ||
      draggedColumnId === "actions"
    )
      return;

    if (draggedColumnId && draggedColumnId !== targetColumnId) {
      const newColumnOrder = [...columnOrder];
      const draggedIndex = newColumnOrder.indexOf(draggedColumnId);
      const targetIndex = newColumnOrder.indexOf(targetColumnId);

      newColumnOrder.splice(draggedIndex, 1);
      newColumnOrder.splice(targetIndex, 0, draggedColumnId);

      setColumnOrder(newColumnOrder);
    }
  };

  // Definir las columnas
  const columns = [
    {
      id: "image",
      header: "",
      accessorKey: "mainImageUrl",
      enableDragging: false,
      cell: ({ row }: { row: Row<Product> }) => (
        <div className="w-10 min-w-[40px] flex items-center justify-center">
          {row.original.statusCode === "ACTIVE" ? (
            <Link
              target="_blank"
              href={`/tienda/productos/${slugify(row.original.name)}`}
              className="hover:opacity-75 transition-opacity"
            >
              <img
                src={row.original.mainImageUrl}
                alt={row.original.name}
                className="rounded-full h-8 w-8 object-cover"
              />
            </Link>
          ) : (
            <img
              src={row.original.mainImageUrl}
              alt={row.original.name}
              className="rounded-full h-8 w-8 object-cover opacity-50"
            />
          )}
        </div>
      ),
    },
    {
      id: "name",
      header: "Nombre",
      accessorKey: "name",
      enableDragging: false,
      cell: ({ row }: { row: Row<Product> }) => {
        const displayName =
          row.original.name.length > 20
            ? `${row.original.name.substring(0, 20)}...`
            : row.original.name;

        return row.original.statusCode === "ACTIVE" ? (
          <Link
            href={`/tienda/productos/${slugify(row.original.name)}`}
            target="_blank"
            className="w-full min-w-[150px] max-w-[300px] truncate hover:text-primary transition-colors hover:underline"
            title={row.original.name}
          >
            {displayName}
          </Link>
        ) : (
          <span
            className="w-full min-w-[150px] max-w-[300px] truncate text-gray-500"
            title={`${row.original.name} (No publicado)`}
          >
            {displayName}
          </span>
        );
      },
    },
    {
      id: "price",
      header: "Precio",
      accessorKey: "price",
      cell: ({ row }: { row: Row<Product> }) => (
        <div className="min-w-[100px]">
          {row.original.hasVariations ? (
            <button
              onClick={() => {
                fetchPriceVariable(row.original.id);
                setPriceModalVisible(true);
              }}
              className="hover:bg-black hover:text-white text-primary bg-transparent border border-primary px-2 py-1 rounded-md transition-colors"
            >
              Ver precios
            </button>
          ) : row.original.price === null ? (
            <div className="animate-pulse h-4 w-16 bg-gray-200 rounded"></div>
          ) : (
            <span className="text-sm">
              $
              {typeof row.original.price === "number"
                ? row.original.price.toLocaleString("es-CL")
                : "0"}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "stock",
      header: "Stock",
      accessorKey: "stockQuantity",
      cell: ({ row }: { row: Row<Product> }) => (
        <div className="min-w-[100px]">
          {row.original.hasVariations ? (
            <button
              onClick={() => {
                fetchStockVariable(row.original.id);
                setStockModalVisible(true);
              }}
              className="hover:bg-black hover:text-white text-primary bg-transparent border border-primary px-2 py-1 rounded-md transition-colors"
            >
              Ver stock
            </button>
          ) : row.original.stockQuantity === null ? (
            <div className="animate-pulse h-4 w-16 bg-gray-200 rounded"></div>
          ) : (
            <span className="text-sm">
              {row.original.hasUnlimitedStock
                ? "Ilimitado"
                : row.original.stockQuantity || "0"}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "type",
      header: "Tipo",
      accessorKey: "hasVariations",
      cell: ({ row }: { row: Row<Product> }) => (
        <div className="relative group w-14 flex justify-center">
          {row.original.hasVariations ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                />
              </svg>
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                Producto Variable
              </span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                />
              </svg>

              <span className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                Producto Simple
              </span>
            </>
          )}
        </div>
      ),
    },
    {
      id: "published",
      header: "Publicado",
      accessorKey: "statusCode",
      cell: ({ row }: { row: Row<Product> }) => (
        <div className="min-w-[100px] flex justify-start">
          <label className="inline-flex relative items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={row.original.statusCode === "ACTIVE"}
              onChange={() => toggleStatus(row.original)}
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
          </label>
        </div>
      ),
    },
    {
      id: "featured",
      header: "Destacado",
      accessorKey: "isFeatured",
      cell: ({ row }: { row: Row<Product> }) => (
        <div className="min-w-[100px] flex justify-start">
          <button onClick={() => toggleFeatured(row.original)}>
            {row.original.isFeatured ? (
              <svg
                className="w-6 h-6 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927C9.403 2.061 10.597 2.061 10.951 2.927L12.263 6.182L15.905 6.682C16.838 6.822 17.175 7.981 16.461 8.541L13.732 10.579L14.474 14.131C14.658 15.047 13.692 15.725 12.917 15.29L10 13.528L7.083 15.29C6.308 15.725 5.342 15.047 5.526 14.131L6.268 10.579L3.539 8.541C2.825 7.981 3.162 6.822 4.095 6.682L7.737 6.182L9.049 2.927Z" />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927C9.403 2.061 10.597 2.061 10.951 2.927L12.263 6.182L15.905 6.682C16.838 6.822 17.175 7.981 16.461 8.541L13.732 10.579L14.474 14.131C14.658 15.047 13.692 15.725 12.917 15.29L10 13.528L7.083 15.29C6.308 15.725 5.342 15.047 5.526 14.131L6.268 10.579L3.539 8.541C2.825 7.981 3.162 6.822 4.095 6.682L7.737 6.182L9.049 2.927Z" />
              </svg>
            )}
          </button>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Editar / Borrar",
      accessorKey: "actions",
      enableDragging: false,
      cell: ({ row }: { row: Row<Product> }) => (
        <div className="min-w-[100px] flex items-center space-x-2">
          <Link
            href={
              row.original.hasVariations
                ? `/dashboard/productos/crear/producto-variable?productVariableId=${row.original.id}`
                : `/dashboard/productos/crear/producto-simple?productId=${row.original.id}`
            }
            className="p-2 rounded bg-primary text-white hover:bg-primary/80 transition-colors"
            title="Editar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </Link>
          <button
            onClick={() => showDeleteModal(row.original)}
            className="p-2 rounded bg-red-600 text-white hover:bg-red-800 transition-colors"
            title="Eliminar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  // Configurar la tabla
  const table = useReactTable({
    data: paginatedProducts,
    columns: columns as ColumnDef<Product, any>[],
    state: {
      columnOrder,
    },
    onColumnOrderChange: (updater) => {
      const newOrder =
        typeof updater === "function" ? updater(columnOrder) : updater;
      // Asegurarse de que las columnas fijas permanezcan en su lugar
      const fixedStart = newOrder.filter(
        (id) => id === "image" || id === "name"
      );
      const middle = newOrder.filter(
        (id) => !["image", "name", "actions"].includes(id)
      );
      const fixedEnd = newOrder.filter((id) => id === "actions");
      setColumnOrder([...fixedStart, ...middle, ...fixedEnd]);
    },
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: false,
    columnResizeMode: "onChange",
  });

  // Agregar esta nueva función para obtener los datos del SKU
  const fetchSkuData = async (productId: string, skuId: string) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.code === 0) {
        return data.sku;
      }
      return null;
    } catch (error) {
      console.error("Error al obtener datos del SKU:", error);
      return null;
    }
  };

  return (
    <section className="w-full py-10 mx-auto h-[85vh]">
      <title>Lista de Productos</title>
      <div className="dark:bg-gray-900 p-3 sm:p-5 relative">
        <div className="mx-auto w-full px-2">
          <div className="bg-white  dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
              <div className="w-full md:w-1/2">
                <form className="flex items-center">
                  <label
                    htmlFor="simple-search"
                    className="sr-only"
                  >
                    Buscador...
                  </label>
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        aria-hidden="true"
                        className="w-5 h-5 text-gray-500 dark:text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="simple-search"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="Buscador..."
                      required
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                </form>
              </div>
              <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                <div className="flex items-center space-x-3 w-full md:w-auto">
                  <button
                    id="actionsDropdownButton"
                    onClick={toggleActionsDropdown}
                    className="w-full hidden md:w-auto items-center justify-center py-2 px-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    type="button"
                  >
                    <svg
                      className="-ml-1 mr-1.5 w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
                      />
                    </svg>
                    Actions
                  </button>
                  <div
                    id="actionsDropdown"
                    className={`z-10 ${
                      actionsDropdownVisible ? "block" : "hidden"
                    } w-44 bg-white rounded absolute top-16 right-20 divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600`}
                  >
                    <ul
                      className="py-1 text-sm text-gray-700 dark:text-gray-200"
                      aria-labelledby="actionsDropdownButton"
                    >
                      <li>
                        <a
                          href="#"
                          className="block py-2 px-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Mass Edit
                        </a>
                      </li>
                    </ul>
                    <div className="py-1">
                      <a
                        href="#"
                        className="block py-2 px-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Delete all
                      </a>
                    </div>
                  </div>
                  <button
                    id="filterDropdownButton"
                    onClick={toggleFilterDropdown}
                    className="w-full md:w-auto flex items-center gap-2 justify-center py-2 px-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                      />
                    </svg>
                    Filtro
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z"
                      />
                    </svg>
                  </button>
                  <div
                    id="filterDropdown"
                    ref={filterDropdownRef}
                    className={`fixed top-0 right-0 inset-y-0  z-40 w-80 bg-white dark:bg-gray-800 p-4 transition-transform duration-300 ease-in-out transform ${
                      filterDropdownVisible
                        ? "translate-x-0"
                        : "translate-x-full"
                    } shadow-lg`}
                  >
                    {/* Agregar header del sidebar */}
                    <div className="flex items-center justify-between mb-6">
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Filtros
                      </h5>
                      <button
                        onClick={() => setFilterDropdownVisible(false)}
                        className="p-1 hover:bg-gray-100 rounded-full dark:hover:bg-gray-700"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Contenido existente del filtro */}
                    <div className="space-y-4">
                      {/* Estado de Publicación */}
                      <div>
                        <h6 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Estado
                        </h6>
                        <select
                          value={filters.published}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              published: e.target.value,
                            }))
                          }
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                        >
                          <option value="all">Todos</option>
                          <option value="active">Publicados</option>
                          <option value="inactive">No Publicados</option>
                        </select>
                      </div>

                      {/* Tipo de Producto */}
                      <div>
                        <h6 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Tipo de Producto
                        </h6>
                        <select
                          value={filters.type}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                        >
                          <option value="all">Todos</option>
                          <option value="simple">Simple</option>
                          <option value="variable">Variable</option>
                        </select>
                      </div>

                      {/* Productos Destacados */}
                      <div>
                        <h6 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Destacados
                        </h6>
                        <select
                          value={filters.featured}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              featured: e.target.value,
                            }))
                          }
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2"
                        >
                          <option value="all">Todos</option>
                          <option value="featured">Destacados</option>
                          <option value="notFeatured">No Destacados</option>
                        </select>
                      </div>

                      {/* Categorías */}
                      <div>
                        <h6 className="mb-2 text-sm font-medium text-gray-900 dark:text-white">
                          Categorías
                        </h6>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {categories.map((category, index) => (
                            <label
                              key={index}
                              className="flex items-center"
                            >
                              <input
                                type="checkbox"
                                checked={filters.categories.has(category)}
                                onChange={() => {
                                  const newCategories = new Set(
                                    filters.categories
                                  );
                                  if (newCategories.has(category)) {
                                    newCategories.delete(category);
                                  } else {
                                    newCategories.add(category);
                                  }
                                  setFilters((prev) => ({
                                    ...prev,
                                    categories: newCategories,
                                  }));
                                }}
                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                              />
                              <span className="ml-2 text-sm text-gray-900 dark:text-gray-100">
                                {category}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Botones de acción al final del sidebar */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white dark:bg-gray-800">
                        <div className="flex justify-between gap-2">
                          <button
                            onClick={() =>
                              setFilters({
                                published: "all",
                                type: "all",
                                featured: "all",
                                categories: new Set(),
                              })
                            }
                            className="w-1/2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border rounded"
                          >
                            Limpiar
                          </button>
                          <button
                            onClick={() => setFilterDropdownVisible(false)}
                            className="w-1/2 px-3 py-2 text-sm bg-primary text-white rounded hover:bg-primary/80"
                          >
                            Aplicar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Agregar overlay */}
                  {filterDropdownVisible && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-50 z-30"
                      onClick={() => setFilterDropdownVisible(false)}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    {table.getHeaderGroups()[0].headers.map((header) => (
                      <th
                        key={header.id}
                        className={`px-2 py-3 whitespace-nowrap ${
                          header.id === "image"
                            ? "w-10 min-w-[40px]"
                            : header.id === "name"
                            ? "min-w-[150px] max-w-[300px]"
                            : "min-w-[100px]"
                        } ${
                          header.id === "image" ||
                          header.id === "name" ||
                          header.id === "actions"
                            ? "cursor-not-allowed"
                            : "cursor-move"
                        }`}
                        draggable={
                          !(
                            header.id === "image" ||
                            header.id === "name" ||
                            header.id === "actions"
                          )
                        }
                        onDragStart={(e) => handleDragStart(e, header.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, header.id)}
                      >
                        <div className="flex items-center gap-2">
                          {!(
                            header.id === "image" ||
                            header.id === "name" ||
                            header.id === "actions"
                          ) && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth="1.5"
                              stroke="currentColor"
                              className="size-4 text-gray-400"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3.75 9h16.5m-16.5 6.75h16.5"
                              />
                            </svg>
                          )}
                          <span>
                            {typeof header.column.columnDef.header === "string"
                              ? header.column.columnDef.header
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="w-full h-32 "
                      >
                        <div className="flex items-center justify-center h-full mt-20 py-20">
                          <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b dark:border-gray-700"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-2 py-3"
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div
              aria-label="Page navigation example"
              className="my-6 flex justify-center pt-8"
            >
              <ul className="flex items-center -space-x-px h-10 text-base">
                {/* Botón de página anterior */}
                <li>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 ${
                      currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <span className="sr-only">Anterior</span>
                    <svg
                      className="w-3 h-3 rtl:rotate-180"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 1 1 5l4 4"
                      />
                    </svg>
                  </button>
                </li>

                {/* Botones de número de página con puntos suspensivos */}
                {(() => {
                  const delta = 1; // Número de páginas a mostrar antes y después de la página actual
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

                  return rangeWithDots.map((pageNum, index) => (
                    <li key={index}>
                      <button
                        onClick={() =>
                          typeof pageNum === "number"
                            ? handlePageChange(pageNum)
                            : undefined
                        }
                        disabled={pageNum === "..."}
                        className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300 ${
                          pageNum === currentPage
                            ? "text-white bg-primary border-primary z-10"
                            : pageNum === "..."
                            ? "text-gray-500 bg-white cursor-default"
                            : "text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    </li>
                  ));
                })()}

                {/* Botón de página siguiente */}
                <li>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center px-4 h-10 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 ${
                      currentPage === totalPages
                        ? "cursor-not-allowed opacity-50"
                        : ""
                    }`}
                  >
                    <span className="sr-only">Siguiente</span>
                    <svg
                      className="w-3 h-3 rtl:rotate-180"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 6 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 9 4-4-4-4"
                      />
                    </svg>
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* MODAL */}
      {isModalVisible && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white  rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Eliminar producto
                  </h3>
                  <div className="mt-2">
                    <p>¿Estás seguro de que deseas eliminar este producto?</p>
                    <p className="text-sm text-red-500 uppercase mt-2">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse justify-between">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={hideDeleteModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDeleteProduct}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {stockModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Stock por Variación</h3>
              <button
                onClick={() => setStockModalVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loadingStock ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atributos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProductStock.map((stock) => (
                      <tr key={stock.skuId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary text-xs uppercase text-white px-2 py-1 rounded">
                              N° {stock.variationNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex flex-wrap gap-2">
                            {stock.attributes.map((attr, index) => (
                              <span
                                key={index}
                                className="bg-primary text-white px-2 py-1 rounded text-xs"
                              >
                                {attr.label}: {attr.value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {stock.hasUnlimitedStock
                            ? "Ilimitado"
                            : stock.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      {priceModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Precios por Variación</h3>
              <button
                onClick={() => setPriceModalVisible(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {loadingPrices ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="mt-4">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Variación
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Atributos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedProductPrices.map((price) => (
                      <tr key={price.skuId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            <span className="bg-primary text-xs uppercase text-white px-2 py-1 rounded">
                              N° {price.variationNumber}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="flex flex-wrap gap-2">
                            {price.attributes.map(
                              (attr: any, index: number) => (
                                <span
                                  key={index}
                                  className="bg-primary text-white px-2 py-1 rounded text-xs"
                                >
                                  {attr.label}: {attr.value}
                                </span>
                              )
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${price.price?.toLocaleString("es-CL") || "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
