import { cache } from "react";

interface ProductResponse {
  products: Array<{
    id: string;
    name: string;
    mainImageUrl: string;
    productTypes: any[];
    hasVariations: boolean;
    offers: any[];
    pricingRanges: any[];
    pricings: any[];
    stock: number;
  }>;
}

export const obtenerProductosServer = cache(
  async (): Promise<ProductResponse> => {
    const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?siteId=${SiteId}&pageNumber=1&pageSize=1000`,
        {
          cache: "force-cache",
        }
      );

      if (!response.ok) {
        throw new Error("Error al cargar productos");
      }

      const data = await response.json();
      console.log("Datos recibidos del servidor:", data);

      if (!data || !Array.isArray(data.products)) {
        console.error("Formato de respuesta inválido:", data);
        return { products: [] };
      }

      const products = data.products.map((p: any) => ({
        id: p.id || "",
        name: p.name || "",
        mainImageUrl: p.mainImageUrl || "",
        productTypes: p.productTypes || [],
        hasVariations: p.hasVariations || false,
        offers: p.offers || [],
        pricingRanges: p.pricingRanges || [],
        pricings: p.pricings || [],
        stock: p.stock || 0,
      }));

      console.log("Productos procesados:", products);
      return { products };
    } catch (error) {
      console.error("Error:", error);
      return { products: [] };
    }
  }
);
