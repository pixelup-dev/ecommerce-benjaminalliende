"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAPI } from "@/app/Context/ProductTypeContext";
import Link from "next/link";
import ProductCard02 from "@/components/PIXELUP/ProductCards/ProductCards02/ProductCard02";
import ProductCard01 from "@/components/PIXELUP/ProductCards/ProductCards01/ProductCard01";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ProductCard03 from "@/components/PIXELUP/ProductCards/ProductCards03/ProductCard03";

interface Product {
  id: string;
  skuId: string;
  stock?: any;
  // Otros campos que puedan estar en el producto
}

const Destacados02: React.FC<any> = ({ text }) => {
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<Error | null>(null);
  const { addToCartHandler } = useAPI();
  const [products, setProducts] = useState<Product[]>([]);
  const [autoplay, setAutoplay] = useState(true);
  const [bannerData, setBannerData] = useState<any | null>(null);

  const fetchMarqueeHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const bannerId = `${process.env.NEXT_PUBLIC_DESTACADOTEXT_CONTENTBLOCK}`;
      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      const bannerImage = productTypeResponse.data.contentBlock;
      setBannerData(bannerImage);
    } catch (error) {
      console.error("Error al obtener destacados:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    fetchMarqueeHome();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial



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
      <section className="bg-white w-full">
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

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 3,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 3,
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
      <div className="hidden absolute inset-y-0 lg:-left-5 lg:-right-5 lg:flex items-center justify-between px-4 pointer-events-none">
        <button
          className="text-white rounded-full h-10 w-10 flex items-center justify-center pointer-events-auto hover:transform hover:scale-125"
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
          className="text-white rounded-full h-10 w-10 flex items-center justify-center pointer-events-auto hover:transform hover:scale-125"
          onClick={next}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 text-white"
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
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 464;
  const showArrows = products.length > 3;
  return (
    <div className="container mx-auto m-8 mt-16 max-w-7xl relative">
      <h1 className="text-left text-3xl font-semibold text-black sm:text-4xl">
      {bannerData?.contentText}
      </h1>
      <hr className="border-black mt-4"></hr>
      <Carousel
        swipeable={true}
        draggable={true}
        ssr={true}
        showDots={products.length > 3 || isMobile} 
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
        dotListClass="custom-dot-list-style mt-16 custom-dots-color "
        itemClass="px-2 py-12"
        customButtonGroup={
          showArrows ? <CustomButtonGroupAsArrows /> : undefined
        }
        renderButtonGroupOutside={true}
      >
        {products.map((product: any) => (
          <ProductCard03
            key={product.id}
            product={product}
            addToCartHandler={addToCartHandler}
            isOnSale={product.offers && product.offers.length > 0}
            stock={product.stock}
          />
        ))}
      </Carousel>
{/*       <div className="mt-6 flex items-center justify-center">
        <Link
          className="px-4 cursor-pointer py-2 mt-2 tracking-wide text-black capitalize transition-colors duration-300 transform bg-white hover:scale-105"
          href="/tienda/"
        >
          Ir a Tienda
        </Link>
      </div> */}
    </div>
  );
};

export default Destacados02;

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
