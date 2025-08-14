"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { obtenerProductos } from "@/app/utils/obtenerProductos";
import { useAPI } from "@/app/Context/ProductTypeContext";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { getCookie } from "cookies-next";
interface Product {
  id: string;
  skuId: string;
  stock?: any;
  // Otros campos que puedan estar en el producto
}
const ProductList: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { addToCartHandler } = useAPI();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProductosConStock = async () => {
      try {
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const PageNumber = 1;
        const PageSize = 20;

        const productosData = await obtenerProductos(
          SiteId,
          PageNumber,
          PageSize
        );
        const productsWithStock = await Promise.all(
          productosData.products.map(async (product: Product) => {
            const inventoryQ = await getInventoryId(product.id, product.skuId);
            product.stock = inventoryQ;
            return product;
          })
        );

        setProducts(productsWithStock);
        setLoading(false); // set loading to false after successful data fetch
      } catch (error) {
        setLoading(false); // set loading to false in case of error
        setError(error as Error); // set error state if an error occurs
      }
    };
    fetchProductosConStock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <section className="bg-white dark:bg-gray-900 w-full">
        <div className="container px-6 py-10 mx-auto animate-pulse">
          <h1 className="w-48 h-2 mx-auto bg-gray-200 rounded-lg dark:bg-gray-700" />
          <p className="w-64 h-2 mx-auto mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
          <p className="w-64 h-2 mx-auto mt-4 bg-gray-200 rounded-lg sm:w-80 dark:bg-gray-700" />
          <div className="grid grid-cols-1 gap-8 mt-8 xl:mt-12 xl:gap-12 sm:grid-cols-2 xl:grid-cols-4 lg:grid-cols-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="w-full"
              >
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
    <section className="w-full mx-auto ">
      <div className="flex flex-col p-4 mx-auto lg:max-w-7xl sm:max-w-full py-16 justify-center items-center">
        <h2 className="text-4xl font-extrabold text-primary mb-12 text-center">
          Nueva temporada
        </h2>
        <div className="flex w-full flex-wrap max-w-[1000px] justify-center items-center gap-8 px-4 ">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              addToCartHandler={addToCartHandler}
            />
          ))}
        </div>
      </div>
      <div className="flex font-extrabold justify-center mt-2 item-center ">
        <Link
          href="/tienda"
          className={`shadow bg-primary hover:bg-secondary text-secondary hover:text-primary font-bold py-3 px-12`}
          style={{ borderRadius: "var(--radius)" }}
        >
          Ir a Tienda
        </Link>
      </div>
    </section>
  );
};

export default ProductList;

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
