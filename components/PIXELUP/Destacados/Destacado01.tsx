"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAPI } from "@/app/Context/ProductTypeContext";
import Link from "next/link";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { getActiveComponents } from "@/app/config/GlobalConfig";

interface Product {
  id: string;
  skuId: string;
  stock?: any;
  // Otros campos que puedan estar en el producto
} 

const Destacados01: React.FC<any> = ({
  text,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { addToCartHandler } = useAPI();
  const [products, setProducts] = useState<Product[]>([]);
  const [autoplay, setAutoplay] = useState(true);
  const { ProductCard } = getActiveComponents();

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
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error as Error);
      }
    };
    fetchProductosConStock();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoplay(!autoplay);
    }, 10000);
    return () => clearInterval(interval);
  }, [autoplay]);

  if (loading) {
    return (
      <section className="bg-white dark:bg-gray-900 w-full ">
        <div className=" px-6 py-10 mx-auto animate-pulse">
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

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 4,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  const CustomButtonGroupAsArrows = ({
    next,
    previous,
  }: {
    next?: () => void;
    previous?: () => void;
  }) => {
    return (
      <div className="hidden absolute inset-y-0 -left-12 -right-12 lg:flex items-center justify-between px-4 pointer-events-none">
        <button
          className="text-gray-900 rounded-full h-10 w-10 flex items-center justify-center pointer-events-auto hover:transform hover:scale-125"
          onClick={previous}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <button
          className="text-gray-900 rounded-full h-10 w-10 flex items-center justify-center pointer-events-auto hover:transform hover:scale-125"
          onClick={next}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      </div>
    );
  };

  const showArrows = products.length > 4;
  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-6xl relative">
        <div className="text-center mb-4">
  {/*         <span className="text-sm uppercase tracking-wider text-gray-500">
            Descubre
          </span> */}
          <h2 className="text-3xl md:text-4xl text-gray-500 font-bold mt-2 uppercase">
            Descubre
          </h2>
        </div>
        <div className="relative">
          <Carousel
            swipeable={true}
            draggable={true}
            ssr={true}
            showDots={true}
            responsive={responsive}
            infinite={true}
            autoPlay={autoplay}
            arrows={false}
            autoPlaySpeed={10000}
            keyBoardControl={true}
            customTransition="all .5s"
            transitionDuration={500}
            containerClass="carousel-container relative"
            removeArrowOnDeviceType={["tablet", "mobile"]}
            dotListClass="custom-dot-list-style mt-12"
            itemClass="px-2 mb-12"
            customButtonGroup={
              showArrows ? <CustomButtonGroupAsArrows /> : undefined
            }
            renderButtonGroupOutside={true}
          >
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCartHandler={addToCartHandler}
                isOnSale={product.offers && product.offers.length > 0}
                stock={product.stock}
              />
            ))}
          </Carousel>
        </div>
        <div className="mt-6 flex items-center justify-center">
          <Link 
            className="px-4 cursor-pointer py-2 mt-2 tracking-wide text-secondary capitalize transition-colors duration-300 transform bg-primary hover:scale-105" style={{ borderRadius: "var(--radius)" }}
            href="/tienda/"
          >
            Ir a Tienda
          </Link>
        </div>
      </div>
    </div>
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
