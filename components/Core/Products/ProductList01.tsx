"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { obtenerProductos } from "@/app/utils/obtenerProductos";
import { useAPI } from "@/app/Context/ProductTypeContext";
import Link from "next/link";
 
const ProductList = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { addToCartHandler } = useAPI();
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const PageNumber = 1;
        const PageSize = 8;

        const data = await obtenerProductos(SiteId, PageNumber, PageSize);
        setProducts(data.products);
        console.log(data.products, "products");
        setLoading(false); // set loading to false after successful data fetch
      } catch (error) {
        setLoading(false); // set loading to false in case of error
        setError(error as Error); // set error state if an error occurs
      }
    };
    fetchProductos();
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
            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>

            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>

            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>

            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>

            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>

            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>

            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>

            <div className="w-full ">
              <div className="w-full h-64 bg-gray-300 rounded-lg dark:bg-gray-600" />

              <h1 className="w-56 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
              <p className="w-24 h-2 mt-4 bg-gray-200 rounded-lg dark:bg-gray-700" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <section className="w-full mx-auto bg-white">
      <div className="font-[sans-serif] py-6 w-[70%] mx-auto max-w-[1000px]">
        <div className="p-4 mx-auto ">
          <h2 className="mb-8 text-center text-2xl font-bold text-dark md:mb-12 lg:text-3xl uppercase">
            Productos Destacados
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <ProductCard
                key={product.id}
                product={product}
                addToCartHandler={addToCartHandler}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({
  product,
  addToCartHandler,
}: {
  product: any;
  addToCartHandler: (skuId: string, quantity: number) => void;
}) => {
  const renderPrice = () => {
    if (product.hasVariations && product.pricingRanges) {
      const { minimumAmount, maximumAmount } = product.pricingRanges[0];
      return (
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          $ {maximumAmount} - $ {minimumAmount}
        </span>
      );
    }
    if (product.pricings) {
      return (
        <span className="text-lg font-bold text-gray-900 dark:text-white">
          $ {product.pricings[0].amount}
        </span>
      );
    }
    return null;
  };

  const handleButtonClick = () => {
    if (product.hasVariations) {
      window.location.href = `/tienda/productos/${product.id}`;
    } else {
      addToCartHandler(product.skuId, 1);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white border rounded-xl border-gray-200 shadow dark:bg-dark dark:border-dark">
      <Link href={`/tienda/productos/${product.id}`}>
        <div
          className="p-8 rounded-t-lg bg-cover bg-center"
          style={{
            backgroundImage: `url(${product.previewImageUrl})`,
            height: "250px",
          }}
        />
      </Link>
      <div className="px-5 pb-5">
        <Link href={`/tienda/productos/${product.id}`}>
          <h5 className="text-sm pt-3 text-center font-semibold tracking-tight text-gray-900 dark:text-white">
            {product.name}
          </h5>
          <h4 className="text-xs my-2 py-1 text-center bg-dark rounded-lg text-white">
            {product.productTypes[0].name}
          </h4>
        </Link>
        <div className="flex items-center justify-between mt-2">
          {renderPrice()}
          <button
            onClick={handleButtonClick}
            className="text-dark bg-primary hover:bg-dark hover:text-white font-medium rounded-lg text-sm mt-1 px-2.5 py-2.5 text-center "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductList;
