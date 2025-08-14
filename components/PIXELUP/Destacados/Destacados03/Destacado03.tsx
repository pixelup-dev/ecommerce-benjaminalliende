"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState } from "react";

import axios from "axios";

import { useAPI } from "@/app/Context/ProductTypeContext";

import Link from "next/link";


import ProductCard01 from "@/components/PIXELUP/ProductCards/ProductCards01/ProductCard01";

import Carousel from "react-multi-carousel";

import "react-multi-carousel/lib/styles.css";

import { Tooltip } from "react-tooltip";
import ProductCard04 from "../../ProductCards/ProductCards04/ProductCards04";

interface Product {
  id: string;
  skuId: string;
  stock?: any;
  name: string;
  price: number;
  slug: string;
  imageUrl?: string;
  offers?: Array<{
    discountPercentage: number;
    price: number;
  }>;
}

const Destacados01: React.FC<any> = ({
  text,
  ProductCardComponent = ProductCard04,
}) => {
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<Error | null>(null);

  const { addToCartHandler } = useAPI();

  const [products, setProducts] = useState<Product[]>([]);

  const [showAllProducts, setShowAllProducts] = useState(false);

  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  const fetchStockForVariation = async (productId: string, skuId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/inventories?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const data = await response.json();

      let stock = 0;

      if (data.code === 0 && data.skuInventories.length > 0) {
        stock = data.skuInventories.reduce(
          (acc: number, inventory: any) => acc + inventory.quantity,
          0
        );
      }

      return stock;
    } catch (error) {
      console.error("Error fetching stock:", error);
      return 0;
    }
  };

  useEffect(() => {
    const fetchProductosConStock = async () => {
      try {
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

        const productosData = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?pageNumber=1&pageSize=100&isFeatured=true&siteId=${SiteId}`
        );

        const productsWithStock = await Promise.all(
          productosData.data.products.map(async (producto: any) => {
            if (!producto.hasVariations && producto.skuId) {
              const stock = await fetchStockForVariation(
                producto.id,
                producto.skuId
              );
              return { ...producto, stock } as any;
            }
            return { ...producto, stock: null } as any;
          })
        );

        setProducts(productsWithStock);
        setDisplayedProducts(productsWithStock.slice(0, 8));
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error as Error);
      }
    };

    fetchProductosConStock();
  }, []);

  const handleShowMore = () => {
    if (products.length > 16) {
      window.location.href = "/tienda/";
    } else {
      setShowAllProducts(true);
      setDisplayedProducts(products.slice(0, 16));
    }
  };

  if (loading) {
    return (
      <section className="bg-white dark:bg-gray-900 w-full">
        <div className="px-6 py-10 mx-auto animate-pulse">
          <h1 className="w-48 h-2 mx-auto bg-gray-200 rounded-lg dark:bg-gray-700" />

          <p className="w-64 h-2 mx-auto mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />

          <p className="w-64 h-2 mx-auto mt-4 bg-gray-200 rounded-lg sm:w-80 dark:bg-gray-700" />

          <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-12 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="w-full">
                <div className="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600" />

                <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />

                <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <section className="mb-12 mt-10 ">
      <div className="text-center mb-8">
        <h4 className="font-montserrat text-md text-[#c6b3f1] uppercase tracking-wider mb-1">
          {text}
        </h4>
        <div className="flex items-center justify-center max-w-[90%] mx-auto px-4">
          <div className="flex-grow h-px bg-gray-200"></div>
          <h2 className="font-poiret text-2xl md:text-3xl text-gray-900 px-4">
            PRODUCTOS DESTACADOS
          </h2>
          <div className="flex-grow h-px bg-gray-200"></div>
        </div>
      </div>

      <div className=" mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProducts.map((product: any) => (
            <ProductCardComponent
              key={product.id}
              product={product}
              addToCartHandler={addToCartHandler}
              isOnSale={product.offers && product.offers.length > 0}
              stock={product.stock}
            />
          ))}
        </div>
      </div>

      {products.length > 8 && !showAllProducts && (
        <div className="flex justify-center mt-6">
          <button
            onClick={handleShowMore}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors" style={{ borderRadius: "var(--radius)" }}
          >
            Ver más
          </button>
        </div>
      )}

      {products.length > 16 && showAllProducts && (
        <div className="flex justify-center mt-6">
          <Link
            href="/tienda/"
            className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors" style={{ borderRadius: "var(--radius)" }}
          >
            Ver tienda
          </Link>
        </div>
      )}

      <Tooltip id="cart-tooltip" />
    </section>
  );
};

export default Destacados01;

const getInventoryId = async (
  id: string,

  skuId: string
): Promise<number | null> => {
  try {
    const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID;

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${id}/skus/${skuId}/inventories?siteId=${SiteId}`
    );

    if (response.data && response.data.skuInventories) {
      return response.data.skuInventories[0]?.quantity || null;
    } else {
      console.error(
        "No se encontraron inventarios para el SKU en el almacén especificado."
      );

      return null;
    }
  } catch (error) {
    console.error("Error obteniendo inventoryId:", error);

    return null;
  }
};
