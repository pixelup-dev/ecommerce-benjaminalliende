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

const ProductCard03: React.FC<ProductCardProps> = ({
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
            <span className="text-red-600 text-lg">
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
            <span>
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
            <span className="text-red-600 text-lg">
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
            <span>${normalPrice.toLocaleString("es-CL")}</span>
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
    <div className="relative flex flex-col items-center mt-8 ">
      {isOnSale && (
        <span
          className={`mt-6 absolute top-0 -right-2 bg-red-600 text-white text-[14px] py-1 px-2`}
          style={{ borderRadius: "var(--radius)" }}
        >
          En Oferta
        </span>
      )}
      <Link href={`/tienda/productos/${slugify(product.name)}`}>
        {/* <div className="absolute top-4 right-4 bg-primary text-secondary px-2 py-1 rounded-bl-lg">{productType.name}</div> */}
        <img
          src={product.mainImageUrl}
          alt={product.name}
          className="w-full sm:w-96 h-auto object-cover"
          style={{ borderRadius: "var(--radius)" }}
        />
        <p
          className={`font-semibold mt-4 max-w-[8ch] md:max-w-[20ch] max- truncate`}
        >
          {product.name}
        </p>
        <div className={`text-xl mt-2 min-h-[76px]  md:min-h-[70px] `}>
          {renderPrice()}
        </div>
        <button
          type="button"
          className={`mt-3 sm:mt-4 uppercase w-full inline-flex items-center justify-center border-2 border-transparent bg-primary md:hover:scale-105 duration-300 px-4 sm:px-12 py-2 sm:py-3 text-center text-sm sm:text-base font-bold text-white transition-all ease-in-out focus:shadow`}
          style={{ borderRadius: "var(--radius)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0 mr-3 h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          Ver Detalle
        </button>
      </Link>
    </div>
  );
};

export default ProductCard03;
