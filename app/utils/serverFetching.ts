export async function getProductTypes() {
  const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/product-types?siteId=${SiteId}&pageNumber=1&pageSize=50`,
    {
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch product types");
  }

  const data = await response.json();
  return data.productTypes;
}

export async function getCollections() {
  const siteid = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${siteid}`,
    {
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  const data = await response.json();
  return data.collections;
}

export async function getInitialData() {
  const [productTypes, collections] = await Promise.all([
    getProductTypes(),
    getCollections(),
  ]);

  return {
    productTypes,
    collections: collections.filter(
      (c: any) => !process.env.NEXT_PUBLIC_BANNER_NAVBAR?.includes(c.id)
    ),
  };
}
