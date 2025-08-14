"use client";
import React from "react";
import { useAPI } from "@/app/Context/ProductTypeContext";
import ProductCard01 from "../PIXELUP/ProductCards/ProductCards01/ProductCard01";
import BannerColeccion01 from "../PIXELUP/BannerColeccion/BannerColeccion01/BannerColeccion01";
import { Collection } from "@/types/collection";
import Link from "next/link";
import { getActiveComponents } from "@/app/config/GlobalConfig";

interface ColeccionesProps {
  collections?: Collection[];
  collection?: Collection;
  collectionProducts?: any[];
}

const Colecciones: React.FC<ColeccionesProps> = ({
  collections,
  collection,
  collectionProducts,
}) => {
  console.log("Datos de collection:", collection);
  const { addToCartHandler } = useAPI();
  const { ProductCard } = getActiveComponents();
  if (!collection && !collections) {
    return <p>No se encontraron datos.</p>;
  }

  // Si es una colección individual (detalle)
  if (collection && collectionProducts) {
    let bannerConfig;
    try {
      bannerConfig = JSON.parse(collection.bannerText);
    } catch (e) {
      bannerConfig = {
        desktop: {
          showTitle: true,
          showLandingText: true,
          showButton: true,
          textAlignment: "center",
          textContent: "",
          title: "",
          buttonText: "Ver más",
          buttonLink: "#",
        },
        mobile: {
          showTitle: true,
          showLandingText: true,
          showButton: true,
          textAlignment: "center",
          textContent: "",
          title: "",
          buttonText: "Ver más",
          buttonLink: "#",
        },
      };
    }

    return (
      <>
        <title>{collection.bannerTitle}</title>
        <meta
          name={collection.bannerTitle}
          content={collection.bannerText}
        />
        <div className="z-10">
          <BannerColeccion01
            title={collection.bannerTitle}
            text={collection.bannerText}
            imageUrl={collection.mainImageUrl}
            previewImageUrl={collection.previewImageUrl}
            config={bannerConfig}
            isMobile={false}
          />
          <div className="flex justify-center mx-auto px-4 mt-10 mb-20">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 min-w-[300px] max-w-[1100px]">
              {collectionProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  addToCartHandler={addToCartHandler}
                  isOnSale={product.hasValidOffer}
                  stock={product.stock}
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Si son múltiples colecciones (listado)
  return <div>{/* Renderizar lista de colecciones */}</div>;
};

export default Colecciones;
