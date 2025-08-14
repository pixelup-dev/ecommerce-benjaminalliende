import React from "react";
import ProductDetail from "@/components/PIXELUP/ProductDetail/ProductDetail03/ProductDetail03";
import { notFound } from "next/navigation";
import { slugify } from "@/app/utils/slugify";
import BannerTienda01 from "@/components/PIXELUP/BannerTienda/BannerTienda01/BannerTienda01";
export async function generateMetadata({ params }: any) {
  const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

  try {
    // Obtener todos los productos
    const productsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?siteId=${siteId}&pageNumber=1&pageSize=1000`,
      { next: { revalidate: 60 } }
    );

    if (!productsRes.ok) {
      throw new Error("Failed to fetch products");
    }

    const products = await productsRes.json();

    // Encontrar el producto por slug
    const product = products.products.find(
      (p: any) => slugify(p.name) === params.slug
    );

    if (!product) {
      return {
        title: "Producto no encontrado",
        description: "No se encontró el producto solicitado.",
      };
    }

    const canonicalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tienda/productos/${params.slug}`;
    const description = product.description
      ? product.description.replace(/(<([^>]+)>)/gi, "")
      : "";
    const keywords = description
      ? description.split(/\s+/).slice(0, 10).join(", ")
      : "";

    return {
      title: product.name,
      description: description,
      keywords: keywords,
      openGraph: {
        title: product.name,
        description: description,
        images: [
          {
            url: product.mainImageUrl,
            width: 800,
            height: 600,
            alt: product.name,
          },
        ],
        url: canonicalUrl,
      },
      twitter: {
        title: product.name,
        description: description,
        images: [product.mainImageUrl],
      },
      alternates: {
        canonical: canonicalUrl,
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Error",
      description: "Error cargando el producto",
    };
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&pageNumber=1&pageSize=1000`
    );
    const data = await res.json();

    return data.products.map((product: any) => ({
      slug: slugify(product.name),
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

async function DetalleProductos({ params }: { params: { slug: string } }) {
  const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

  try {
    // Obtener todos los productos
    const productsRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?siteId=${siteId}&pageNumber=1&pageSize=1000`,
      {
        next: {
          tags: ["products"],
          revalidate: 0,
        },
      }
    );

    if (!productsRes.ok) {
      notFound();
    }

    const products = await productsRes.json();

    // Encontrar el producto por slug
    const product = products.products.find(
      (p: any) => slugify(p.name) === params.slug
    );

    if (!product) {
      notFound();
    }

    // Obtener los detalles completos del producto incluyendo atributos
    const productData = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${product.id}/skus?siteId=${siteId}`,
      {
        next: {
          tags: ["products", `product-${product.id}`],
          revalidate: 0,
        },
      }
    ).then((res) => res.json());

    // Obtener atributos y precios para cada SKU
    if (productData.code === 0) {
      const skusWithAttributesAndPrices = await Promise.all(
        productData.skus.map(async (sku: any) => {
          // Obtener atributos
          const attributesResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${product.id}/skus/${sku.id}/attributes?siteId=${siteId}`
          );
          const attributesData = await attributesResponse.json();

          // Obtener precios
          const pricingsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${product.id}/skus/${sku.id}/pricings?siteId=${siteId}`
          );
          const pricingsData = await pricingsResponse.json();

          return {
            ...sku,
            attributes:
              attributesData.code === 0
                ? attributesData.skuAttributes.map((attr: any) => ({
                    label: attr.attribute.name,
                    value: attr.value,
                  }))
                : [],
            pricings: pricingsData.code === 0 ? pricingsData.skuPricings : [],
          };
        })
      );

      productData.skus = skusWithAttributesAndPrices;
    }

    return (
      <>
        <div>
          <BannerTienda01 />
        </div>

        <div className="mx-auto">
          <ProductDetail product={productData} />
        </div>
      </>
    );
  } catch (error) {
    console.error("Error loading product:", error);
    notFound();
  }
}

export default DetalleProductos;
