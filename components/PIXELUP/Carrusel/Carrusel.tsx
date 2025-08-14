"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";
import { obtenerProductos } from "@/app/utils/obtenerProductos";
import Carrusel01 from "@/components/PIXELUP/Carrusel/Carrusel01/cdgcarrusel01";

interface ProductType {
  [x: string]: /* eslint-disable @next/next/no-img-element */ any;
  id: number;
  name: string;
  // add other properties as needed
}

export default function Carrusel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [products, setProducts] = useState<ProductType[]>([]);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const PageNumber = 1;
        const PageSize = 8;

        const data = await obtenerProductos(
          SiteId,
          PageNumber,
          PageSize,
          null,
          true
        );
        setProducts(data.products);
        setLoading(false); // set loading to false after successful data fetch
      } catch (error) {
        setLoading(false); // set loading to false in case of error
        setError(error as Error); // set error state if an error occurs
      }
    };
    fetchProductos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  const Carrusel = {
    titulo: "Destacados",
    parrafo: "Lorem ipsum dolor sit amet consectetur adipisicing elit.",
    Productos: products.map((product) => {
      const { pricingRanges, pricings } = product;
      let price;

      if (pricingRanges && pricingRanges.length > 0) {
        const { minimumAmount, maximumAmount } = pricingRanges[0];
        price = `${formatCurrency(minimumAmount)} - ${formatCurrency(
          maximumAmount
        )}`;
      } else if (pricings && pricings.length > 0) {
        price = formatCurrency(pricings[0].amount);
      } else {
        price = "N/A";
      }

      return {
        id: product.id,
        src: product.mainImageUrl, // Ajusta según la estructura real de tu objeto producto
        name: product.name,
        price: price,
      };
    }),
    etiqueta: "Nuevo",
    textoboton: "Ver todos",
  };

  if (loading) {
    return <div>Cargando...</div>;
  } else if (error) {
    return <div>Error: {error.message}</div>;
  } else {
    return <Carrusel01 CarruselData={Carrusel} />;
  }
}
