/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState, useEffect } from "react";
import { slugify } from "@/app/utils/slugify";
import axios from "axios";

interface PricingRange {
  minimumAmount: string | number;
  maximumAmount: string | number;
}

interface PriceRange {
  min: number;
  max: number;
}

interface Offer {
  amount: string | number;
}

type ProductCardProps = {
  key: any;
  product: any;
  addToCartHandler: (skuId: string, quantity: number) => void;
  isOnSale: any;
  stock: number | null;
};

const ProductCard02: React.FC<ProductCardProps> = ({
  addToCartHandler,
  product,
  isOnSale,
  stock,
}) => {
  const [cuotasEnabled, setCuotasEnabled] = useState(false);
  const [numeroCuotas, setNumeroCuotas] = useState(0);

  useEffect(() => {
    const fetchCuotasConfig = async () => {
      try {
        const contentBlockId = process.env.NEXT_PUBLIC_CUOTAS_CONTENTBLOCK;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        if (response.data.contentBlock?.contentText) {
          const cuotasConfig = JSON.parse(
            response.data.contentBlock.contentText
          );
          setCuotasEnabled(cuotasConfig.enabled);
          setNumeroCuotas(
            cuotasConfig.enabled ? parseInt(cuotasConfig.installments) : 0
          );
        }
      } catch (error) {
        console.error("Error al obtener configuración de cuotas:", error);
        setCuotasEnabled(false);
        setNumeroCuotas(0);
      }
    };

    fetchCuotasConfig();
  }, []);

  const renderPrice = () => {
    // Para productos con variaciones
    if (product.hasVariations) {
      // Obtener todos los precios normales y de oferta
      const normalPrices = product.pricingRanges
        .map((range: PricingRange) => ({
          min: Number(range.minimumAmount) || 0,
          max: Number(range.maximumAmount) || 0,
        }))
        .filter((price: PriceRange) => price.min > 0 && price.max > 0);

      const offerPrices =
        product.offers
          ?.map((offer: Offer) => Number(offer.amount) || 0)
          .filter((price: number) => price > 0) || [];

      // Si hay ofertas, mostrar ambos rangos de precios
      if (isOnSale && offerPrices.length > 0) {
        const minNormalPrice = Math.min(
          ...normalPrices.map((p: PriceRange) => p.min)
        );
        const maxNormalPrice = Math.max(
          ...normalPrices.map((p: PriceRange) => p.max)
        );
        const minOfferPrice = Math.min(...offerPrices);
        const maxOfferPrice = Math.max(...offerPrices);
        const minPrecioPorCuota = cuotasEnabled
          ? Math.ceil(minOfferPrice / numeroCuotas)
          : 0;

        return (
          <div className="flex flex-col">
            <span className="line-through text-gray-500 text-sm">
              {minNormalPrice === maxNormalPrice
                ? `$${minNormalPrice.toLocaleString("es-CL")}`
                : `$${Math.min(minNormalPrice, maxNormalPrice).toLocaleString(
                    "es-CL"
                  )} - $${Math.max(
                    minNormalPrice,
                    maxNormalPrice
                  ).toLocaleString("es-CL")}`}
            </span>
            <span className="text-red-600 font-semibold text-base">
              {minOfferPrice === maxOfferPrice
                ? `$${minOfferPrice.toLocaleString("es-CL")}`
                : `$${Math.min(minOfferPrice, maxOfferPrice).toLocaleString(
                    "es-CL"
                  )} - $${Math.max(minOfferPrice, maxOfferPrice).toLocaleString(
                    "es-CL"
                  )}`}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-xs text-green-500 mt-1">
                En {numeroCuotas} cuotas desde $
                {minPrecioPorCuota.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        );
      }

      // Si no hay ofertas, mostrar rango de precios normal
      if (normalPrices.length > 0) {
        const minPrice = Math.min(
          ...normalPrices.map((p: PriceRange) => p.min)
        );
        const maxPrice = Math.max(
          ...normalPrices.map((p: PriceRange) => p.max)
        );
        const minPrecioPorCuota = cuotasEnabled
          ? Math.ceil(minPrice / numeroCuotas)
          : 0;

        return (
          <div className="flex flex-col">
            <span className="text-gray-600">
              {minPrice === maxPrice
                ? `$${minPrice.toLocaleString("es-CL")}`
                : `$${Math.min(minPrice, maxPrice).toLocaleString(
                    "es-CL"
                  )} - $${Math.max(minPrice, maxPrice).toLocaleString(
                    "es-CL"
                  )}`}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-xs text-green-500 mt-1">
                En {numeroCuotas} cuotas desde $
                {minPrecioPorCuota.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        );
      }
    } else {
      // Para productos sin variaciones
      const normalPrice = Number(product.pricings?.[0]?.amount) || 0;
      const offerPrice =
        isOnSale && product.offers?.[0]?.amount
          ? Number(product.offers[0].amount)
          : null;
      const precioPorCuota = cuotasEnabled
        ? Math.ceil((offerPrice || normalPrice) / numeroCuotas)
        : 0;

      if (offerPrice) {
        return (
          <div className="flex flex-col">
            <span className="line-through text-gray-500 text-sm">
              ${normalPrice.toLocaleString("es-CL")}
            </span>
            <span className="text-red-600 font-semibold text-lg">
              ${offerPrice.toLocaleString("es-CL")}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-xs text-green-500 mt-1">
                En {numeroCuotas} cuotas de $
                {precioPorCuota.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        );
      }

      if (normalPrice > 0) {
        return (
          <div className="flex flex-col">
            <span className="text-gray-600">
              ${normalPrice.toLocaleString("es-CL")}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-xs text-green-500 mt-1">
                En {numeroCuotas} cuotas de $
                {precioPorCuota.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        );
      }
    }

    return null;
  };

  const handleButtonClick = () => {
    if (product.hasVariations) {
      window.location.href = `/tienda/productos/${slugify(product.name)}`;
    } else {
      addToCartHandler(product.skuId, 1);
    }
  };

  return (
    <div
      className="w-full my-4 bg-white shadow-md duration-500 lg:hover:scale-105 md:hover:shadow-xl relative"
      style={{ borderRadius: "var(--radius)" }}
    >
      {isOnSale && (
        <span
          className="absolute top-2 right-2 bg-red-700 text-white text-[14px] py-1 px-2"
          style={{ borderRadius: "var(--radius)" }}
        >
          En Oferta
        </span>
      )}
      <div
        className="group block overflow-hidden"
        style={{ borderRadius: "var(--radius)" }}
      >
        <Link href={`/tienda/productos/${slugify(product.name)}`}>
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="h-60 w-full object-cover"
            style={{
              borderTopLeftRadius: "var(--radius)",
              borderTopRightRadius: "var(--radius)",
            }}
          />
        </Link>
        <div className="px-4 py-3 w-full">
          {product.productTypes &&
            product.productTypes.length > 0 &&
            product.productTypes
              .slice(0, 1)
              .map((productType: any, index: any) => (
                <span
                  key={index}
                  className="text-gray-400 mr-3 uppercase text-sm text-primary max-w-[14ch] md:max-w-[22ch] truncate"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  {productType.name}
                </span>
              ))}

          <Link href={`/tienda/productos/${slugify(product.name)}`}>
            <p className="text-[18px] font-bold text-black truncate block capitalize">
              {product.name}
            </p>
          </Link>
          <div className="flex items-center text-black min-h-[70px]">
            <span className="text-gray-600 text-[20px]">{renderPrice()}</span>
            <div className="ml-auto flex">
              {product.hasVariations || stock === 0 ? (
                <Link
                  href={`/tienda/productos/${slugify(product.name)}`}
                  className="text-primary hover:text-secondary hover:bg-primary p-2"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </Link>
              ) : (
                <button
                  onClick={handleButtonClick}
                  className="text-primary hover:text-secondary hover:bg-primary p-2"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard02;
