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

const ProductCard04: React.FC<ProductCardProps> = ({
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
            <span className="line-through text-gray-500 text-sm">
              {minNormalPrice === maxNormalPrice
                ? `$${minNormalPrice.toLocaleString("es-CL")}`
                : `$${Math.min(minNormalPrice, maxNormalPrice).toLocaleString("es-CL")} - $${Math.max(minNormalPrice, maxNormalPrice).toLocaleString("es-CL")}`
              }
            </span>
            <span className="text-red-600 text-base">
              {minOfferPrice === maxOfferPrice
                ? `$${minOfferPrice.toLocaleString("es-CL")}`
                : `$${Math.min(minOfferPrice, maxOfferPrice).toLocaleString("es-CL")} - $${Math.max(minOfferPrice, maxOfferPrice).toLocaleString("es-CL")}`
              }
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-xs text-green-500 mt-1">
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
            <span>
              {minPrice === maxPrice
                ? `$${minPrice.toLocaleString("es-CL")}`
                : `$${Math.min(minPrice, maxPrice).toLocaleString("es-CL")} - $${Math.max(minPrice, maxPrice).toLocaleString("es-CL")}`
              }
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-xs text-green-500 mt-1">
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
            <span className="line-through text-gray-500 text-sm">
              ${normalPrice.toLocaleString("es-CL")}
            </span>
            <span className="text-red-600">
              ${offerPrice.toLocaleString("es-CL")}
            </span>
            {cuotasEnabled && numeroCuotas > 0 && (
              <span className="text-xs text-green-500 mt-1">
                En {numeroCuotas} cuotas de ${precioPorCuota.toLocaleString("es-CL")}
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
      <div className="bg-gray-50 rounded overflow-hidden hover:shadow-xl transition-all duration-300 border border-[#81C4BA]/10" style={{ borderRadius: "var(--radius)" }}>
        <div className="relative aspect-square">
          <Link href={`/tienda/productos/${slugify(product.name)}`}>
            <img
              src={product.mainImageUrl}
              alt={product.name}
              className="md:min-w-[250px] md:min-h-[250px] w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              
            />
          </Link>
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.productTypes && product.productTypes.length > 0 && (
              <span className="bg-[#81C4BA] px-3 py-1 rounded text-sm text-white font-medium max-w-[14ch] md:max-w-[22ch] truncate" style={{ borderRadius: "var(--radius)" }}>
                {product.productTypes[0].name}
              </span>
            )}
            {isOnSale && (
              <span className="bg-red-500 px-3 py-1 rounded text-sm text-white font-medium " style={{ borderRadius: "var(--radius)" }}>
                En Oferta
              </span>
            )}
          </div>
        </div>
        <div className="p-4 min-h-[170px] md:min-h-[138px]">
          <Link href={`/tienda/productos/${slugify(product.name)}`}>
            <h3 className="text-primary font-medium mb-2 max-w-[8ch]  md:max-w-[15ch]  truncate">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center justify-between">
            <p className="text-primary font-medium">{renderPrice()}</p>
            {product.hasVariations || stock === 0 ? (
              <Link
                href={`/tienda/productos/${slugify(product.name)}`}
                className="bg-white p-2 rounded border text-primary hover:text-secondary hover:shadow-md transition-all" style={{ borderRadius: "var(--radius)" }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774Z"
                  />
                </svg>
              </Link>
            ) : (
              <button
                onClick={handleButtonClick}
                className="bg-white hover:bg-primary p-2 rounded border border-primary/10 text-primary hover:text-secondary hover:shadow-md transition-all" style={{ borderRadius: "var(--radius)" }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductCard04;