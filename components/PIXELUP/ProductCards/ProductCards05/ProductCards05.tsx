/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState, useEffect } from "react";
import { slugify } from "@/app/utils/slugify";
import axios from "axios";

type ProductCardProps = {
  key: any;
  product: any;
  addToCartHandler: (skuId: string, quantity: number) => void;
  isOnSale: any;
  stock: number | null;
};

interface PriceRange {
  min: number;
  max: number;
}

const ProductCard05: React.FC<ProductCardProps> = ({
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
          const cuotasConfig = JSON.parse(response.data.contentBlock.contentText);
          setCuotasEnabled(cuotasConfig.enabled);
          setNumeroCuotas(cuotasConfig.enabled ? parseInt(cuotasConfig.installments) : 0);
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
      const normalPrices = product.pricingRanges.map((range: any) => ({
        min: Number(range.minimumAmount) || 0,
        max: Number(range.maximumAmount) || 0
      })).filter((price: PriceRange) => price.min > 0 && price.max > 0);

      const offerPrices = product.offers?.map((offer: any) => Number(offer.amount) || 0)
        .filter((price: number) => price > 0) || [];

      // Si hay ofertas, mostrar ambos rangos de precios
      if (isOnSale && offerPrices.length > 0) {
        const minNormalPrice = Math.min(...normalPrices.map((p: PriceRange) => p.min));
        const maxNormalPrice = Math.max(...normalPrices.map((p: PriceRange) => p.max));
        const minOfferPrice = Math.min(...offerPrices);
        const maxOfferPrice = Math.max(...offerPrices);
        const minPrecioPorCuota = cuotasEnabled ? Math.ceil(minOfferPrice / numeroCuotas) : 0;

        return (
          <div className="flex flex-col">
            <span className="line-through text-gray-500 text-xs md:text-sm">
              {minNormalPrice === maxNormalPrice
                ? `$${minNormalPrice.toLocaleString("es-CL")}`
                : `$${Math.min(minNormalPrice, maxNormalPrice).toLocaleString("es-CL")} - $${Math.max(minNormalPrice, maxNormalPrice).toLocaleString("es-CL")}`
              }
            </span>
            <span className="text-red-600 text-sm md:text-base">
              {minOfferPrice === maxOfferPrice
                ? `$${minOfferPrice.toLocaleString("es-CL")}`
                : `$${Math.min(minOfferPrice, maxOfferPrice).toLocaleString("es-CL")} - $${Math.max(minOfferPrice, maxOfferPrice).toLocaleString("es-CL")}`
              }
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-[10px] md:text-xs text-green-500 mt-1">
                En {numeroCuotas} cuotas desde ${minPrecioPorCuota.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        );
      }

      // Si no hay ofertas, mostrar rango de precios normal
      if (normalPrices.length > 0) {
        const minPrice = Math.min(...normalPrices.map((p: PriceRange) => p.min));
        const maxPrice = Math.max(...normalPrices.map((p: PriceRange) => p.max));
        const minPrecioPorCuota = cuotasEnabled ? Math.ceil(minPrice / numeroCuotas) : 0;

        return (
          <div className="flex flex-col">
            <span className="text-sm md:text-base">
              {minPrice === maxPrice
                ? `$${minPrice.toLocaleString("es-CL")}`
                : `$${Math.min(minPrice, maxPrice).toLocaleString("es-CL")} - $${Math.max(minPrice, maxPrice).toLocaleString("es-CL")}`
              }
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-[10px] md:text-xs text-green-500 mt-1">
                En {numeroCuotas} cuotas desde ${minPrecioPorCuota.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        );
      }
    } else {
      // Para productos sin variaciones
      const normalPrice = Number(product.pricings?.[0]?.amount) || 0;
      const offerPrice = isOnSale && product.offers?.[0]?.amount 
        ? Number(product.offers[0].amount) 
        : null;
      const precioPorCuota = cuotasEnabled ? Math.ceil((offerPrice || normalPrice) / numeroCuotas) : 0;

      if (offerPrice) {
        return (
          <div className="flex flex-col">
            <span className="line-through text-gray-500 text-xs md:text-sm">
              ${normalPrice.toLocaleString("es-CL")}
            </span>
            <span className="text-red-600 text-sm md:text-base">
              ${offerPrice.toLocaleString("es-CL")}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-[10px] md:text-xs text-green-500 mt-1">
                En {numeroCuotas} cuotas de ${precioPorCuota.toLocaleString("es-CL")}
              </span>
            )}
          </div>
        );
      }

      if (normalPrice > 0) {
        return (
          <div className="flex flex-col">
            <span className="text-sm md:text-base">${normalPrice.toLocaleString("es-CL")}</span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-[10px] md:text-xs text-green-500 mt-1">
                En {numeroCuotas} cuotas de ${precioPorCuota.toLocaleString("es-CL")}
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
    <section className="mt-4"> 
      <div className="bg-gray-50 aspect-square relative group overflow-hidden rounded-lg hover:shadow-lg transition-all duration-300">
        <Link
          href={`/tienda/productos/${slugify(product.name)}`}
          className="block w-full h-full"
        >
          <img
            src={product.mainImageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Overlay con botón de ver detalle */}
          <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
            <span className="font-poiret cursor-pointer text-white text-sm md:text-lg border-b border-white hover:border-white transition-colors">
              VER DETALLE
            </span>
          </div>
        </Link>

        {/* Etiquetas de producto */}
        <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-col gap-1 md:gap-2 z-10">
           {product.productTypes && product.productTypes.length > 0 && (
            <div className="bg-primary text-white px-2 md:px-3 py-0.5 md:py-1 font-montserrat text-xs md:text-md" style={{ borderRadius: "var(--radius)" }}>
              {product.productTypes[0].name}
            </div>
          )} 
          {isOnSale && (
            <div className="bg-red-500 text-white px-2 md:px-3 py-0.5 md:py-1 font-montserrat text-xs md:text-md" style={{ borderRadius: "var(--radius)" }}>
              En Oferta
            </div>
          )}
        </div>
      </div>

      <div className="p-2 md:p-4 flex justify-between items-start">
        <div className="text-left flex-1 mr-2">
          <Link href={`/tienda/productos/${slugify(product.name)}`}>
            <h3 className="font-montserrat text-xs md:text-sm font-medium text-gray-700 truncate max-w-[12ch] md:max-w-[18ch] hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          {renderPrice()}
        </div>

        {product.hasVariations || stock === 0 ? (
          <div
            className="bg-primary p-1 md:p-1.5 cursor-pointer flex-shrink-0"
            data-tooltip-id="cart-tooltip"
            data-tooltip-content="Ver más"
            style={{ borderRadius: "var(--radius)" }}
          >
            <Link href={`/tienda/productos/${slugify(product.name)}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="md:w-5 md:h-5"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </Link>
          </div>
        ) : (
          <div
            className="bg-primary p-1 md:p-1.5 cursor-pointer flex-shrink-0"
            data-tooltip-id="cart-tooltip"
            data-tooltip-content="Agregar al carrito"
            onClick={handleButtonClick}
            style={{ borderRadius: "var(--radius)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="md:w-5 md:h-5"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductCard05;