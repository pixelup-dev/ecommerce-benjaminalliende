"use client"
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { slugify } from "@/app/utils/slugify";
import { useAPI } from "@/app/Context/ProductTypeContext";
import { getActiveComponents } from "@/app/config/GlobalConfig";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import ProductCard04 from "../../ProductCards/ProductCards04/ProductCards04";
import ProductCard05 from "../../ProductCards/ProductCards05/ProductCards05";

interface Product {
  id: string;
  skuId: string;
  stock?: any;
  pricingRanges?: any[];
  pricings?: any[];
  // Otros campos que puedan estar en el producto
}

interface CollectionWithProducts {
  id: string;
  title: string;
  products: Product[];
}

function Colecciones02() {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [collectionsWithProducts, setCollectionsWithProducts] = useState<CollectionWithProducts[]>([]);
  const [autoplay, setAutoplay] = useState(true);
  const { addToCartHandler } = useAPI();
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

  const fetchPriceForProduct = async (productId: string, skuId: string) => {
    try {
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${siteId}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching price:", error);
      return null;
    }
  };

  const getPriceForVariableProduct = async (product: any) => {
    try {
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${product.id}/skus?siteId=${siteId}`
      );
      const data = await response.json();

      if (data && data.skus && data.skus.length > 0) {
        const prices = await Promise.all(
          data.skus.map(async (sku: any) => {
            const priceData = await fetchPriceForProduct(product.id, sku.id);
            return priceData?.skuPricings?.[0]?.unitPrice || null;
          })
        );

        const validPrices = prices.filter(
          (price): price is number => price !== null
        );
        if (validPrices.length > 0) {
          return {
            minimumAmount: Math.min(...validPrices),
            maximumAmount: Math.max(...validPrices),
          };
        }
      }
      return { minimumAmount: null, maximumAmount: null };
    } catch (error) {
      console.error("Error getting price for variable product:", error);
      return { minimumAmount: null, maximumAmount: null };
    }
  };

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const siteid = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const contentBlockId = process.env.NEXT_PUBLIC_COLECCIONES02_CONTENTBLOCK;

        // Primero, obtener todas las colecciones disponibles
        const collectionsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${siteid}`
        );

        const allCollections = collectionsResponse.data.collections;

        // Luego, obtener las colecciones seleccionadas del content block
        const contentBlockResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${siteid}`
        );

        const selectedCollectionIds = contentBlockResponse.data.contentBlock.contentText 
          ? JSON.parse(contentBlockResponse.data.contentBlock.contentText)
          : [];

        // Filtrar y mapear solo las colecciones que existen
        const validCollections = selectedCollectionIds
          .map((collectionId: string) => {
            const collection = allCollections.find((c: any) => c.id === collectionId);
            if (collection) {
              return {
                ...collection,
                buttonText: "Ver Colección"
              };
            }
            return null;
          })
          .filter(Boolean); // Eliminar las colecciones que no existen (null)

        setCollections(validCollections);

        // Si hay colecciones válidas, obtener los productos de cada colección
        if (validCollections.length > 0) {
          const collectionsWithProductsData = await Promise.all(
            validCollections.map(async (collection: any) => {
              const collectionProductsResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections/${collection.id}?siteId=${siteid}`
              );
              
              const collectionProducts = collectionProductsResponse.data.collection.products || [];
              
              // Filtrar productos activos y obtener stock
              const activeProducts = collectionProducts.filter(
                (product: any) => product.statusCode === "ACTIVE"
              );
              
              const productsWithDetails = await Promise.all(
                activeProducts.map(async (product: any) => {
                  let stock = null;
                  if (!product.hasVariations && product.skuId) {
                    stock = await fetchStockForVariation(
                      product.id,
                      product.skuId
                    );
                  }

                  if (product.hasVariations) {
                    const pricingRanges = await getPriceForVariableProduct(product);
                    return {
                      ...product,
                      pricingRanges: [pricingRanges],
                      stock,
                    };
                  } else {
                    const priceData = await fetchPriceForProduct(
                      product.id,
                      product.skuId
                    );
                    const price = priceData?.skuPricings?.[0]?.unitPrice || null;
                    return {
                      ...product,
                      pricings: [{ amount: price }],
                      stock,
                    };
                  }
                })
              );
              
              return {
                id: collection.id,
                title: collection.title,
                products: productsWithDetails
              };
            })
          );
          
          setCollectionsWithProducts(collectionsWithProductsData);
        }
      } catch (error) {
        console.error("Error fetching collections:", error);
        setError(error as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAutoplay(!autoplay);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoplay]);

  if (loading) {
    return (
      <section className="bg-white dark:bg-gray-900 w-full">
        <div className=" px-6 py-10 mx-auto animate-pulse">
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

  if (error) return <div>Error al cargar las colecciones</div>;

  // Crear colecciones por defecto si no hay ninguna
  const defaultCollections = collections.length === 0 ? [
    {
      id: 'default-1',
      title: 'Próximamente',
      previewImageUrl: '/img/placeholder.webp',
      bannerText: 'Nuevas colecciones en camino',
      buttonText: 'Próximamente'
    },
    {
      id: 'default-2',
      title: 'Próximamente',
      previewImageUrl: '/img/placeholder.webp',
      bannerText: 'Nuevas colecciones en camino',
      buttonText: 'Próximamente'
    }
  ] : collections;

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
      items: 3,
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

  return (
    <div className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {collectionsWithProducts.length > 0 ? (
          <>
            {collectionsWithProducts.map((collectionData, index) => {
              const showArrows = collectionData.products.length > 4;
              
              return (
                <div key={collectionData.id} className="mb-16">
                  <div className="text-center mb-12">
                    <span className="text-sm uppercase tracking-wider text-gray-500">
                      Descubre
                    </span>
                    <h2 className="text-3xl md:text-4xl text-gray-800 font-bold mt-2">
                      {collectionData.title}
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
                      customButtonGroup={showArrows ? <CustomButtonGroupAsArrows /> : undefined}
                      renderButtonGroupOutside={true}
                    >
                      {collectionData.products.map((product: any) => (
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

                  <div className="text-center mt-8">
                    <Link 
                      href={`/tienda/colecciones/${slugify(collectionData.title)}`}
                      className="bg-primary font-light text-md text-white hover:scale-105 px-8 py-2 hover:bg-primary/80 transition-all inline-block" style={{ borderRadius: "var(--radius)" }}
                    >
                      Ir a la Colección
                    </Link>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <>
            <div className="text-center mb-12">
              <span className="text-sm uppercase tracking-wider text-gray-500">
                Descubre
              </span>
              <h2 className="text-3xl md:text-4xl text-gray-800 font-bold mt-2">
                Nuestras Colecciones
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {defaultCollections.map((coleccion) => (
                <div
                  key={coleccion.id}
                  className="group relative cursor-pointer overflow-hidden rounded bg-white shadow-sm hover:shadow-xl transition-all duration-300" style={{ borderRadius: "var(--radius)" }}
                >
                  <div className="flex flex-col md:flex-row h-[400px] md:h-[250px]">
                    <div className="w-full md:w-1/2 h-full relative overflow-hidden">
                      <img
                        src={coleccion.previewImageUrl || "/carr/default.jpg"}
                        alt={coleccion.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center text-center bg-white">
                      <h3 className="text-xl text-gray-800 font-bold mb-3">
                        {coleccion.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-6">
                        {coleccion.bannerText || "Descubre nuestra exclusiva colección"}
                      </p>
                      {coleccion.id.startsWith('default-') ? (
                        <span className="bg-gray-200 text-gray-600 px-6 py-2 text-sm font-bold cursor-not-allowed" style={{ borderRadius: "var(--radius)" }}>
                          {coleccion.buttonText}
                        </span>
                      ) : (
                        <Link 
                          href={`/tienda/colecciones/${slugify(coleccion.title)}`}
                          className="bg-black text-white px-6 py-2 text-sm font-bold hover:bg-primary/80 transition-colors hover:text-white" style={{ borderRadius: "var(--radius)" }}
                        >
                          {coleccion.buttonText}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link 
                href="/tienda/colecciones"
                className="bg-primary font-light text-md text-white hover:scale-105 px-8 py-2 hover:bg-primary/80 transition-all inline-block" style={{ borderRadius: "var(--radius)" }}
              >
                Ver Todas las Colecciones
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Colecciones02;