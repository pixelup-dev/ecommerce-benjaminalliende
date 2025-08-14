import { NextResponse } from "next/server";

interface Product {
  id: string;
  name: string;
  mainImageUrl: string;
  productTypes: any[];
  hasVariations: boolean;
  offers: any[];
  pricingRanges: any[];
  pricings: any[];
  stock: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?siteId=${SiteId}&pageNumber=${page}&pageSize=1000`
    );

    if (!response.ok) {
      throw new Error("Error al cargar productos");
    }

    const data = await response.json();

    const products = Array.isArray(data.products)
      ? data.products.map((p: any) => ({
          id: p.id || "",
          name: p.name || "",
          mainImageUrl: p.mainImageUrl || "",
          productTypes: p.productTypes || [],
          hasVariations: p.hasVariations || false,
          offers: p.offers || [],
          pricingRanges: p.pricingRanges || [],
          pricings: p.pricings || [],
          stock: p.stock || 0,
        }))
      : [];

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json(
      { products: [], error: "Error al cargar productos" },
      { status: 500 }
    );
  }
}
