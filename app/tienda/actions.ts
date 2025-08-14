"use server";

export async function getProducts(selectedCategory: string | null) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?siteId=${
        process.env.NEXT_PUBLIC_API_URL_SITEID
      }&pageNumber=1&pageSize=1000${
        selectedCategory ? `&productTypeId=${selectedCategory}` : ""
      }`,
      {
        next: {
          tags: ["products"],
          revalidate: 3600, // Cache por 1 hora
        },
      }
    );
    if (!res.ok) throw new Error("Error fetching data");
    const data = await res.json();
    return data.products || [];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getProductTypes() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/product-types?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&pageNumber=1&pageSize=50`,
      {
        next: {
          tags: ["categories"],
          revalidate: 3600, // Cache por 1 hora
        },
      }
    );
    if (!res.ok) throw new Error("Error fetching data");
    const data = await res.json();
    return data.productTypes || [];
  } catch (error) {
    console.error("Error fetching product types:", error);
    return [];
  }
}
