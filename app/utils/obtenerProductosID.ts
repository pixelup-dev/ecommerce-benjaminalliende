export async function obtenerProductosID(id: string, siteId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${id}?siteId=${siteId}`,
      {
        next: {
          revalidate: 60, // Revalidar cada minuto
          tags: [`product-${id}`], // Tag para revalidación bajo demanda
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch product");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}
