export async function fetchProductData(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${id}/skus?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch product data");
  }

  return response.json();
}

export async function fetchStockData(productId: string, skuId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/inventories?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch stock data");
  }

  return response.json();
}

export async function fetchThumbnailData(productId: string, skuId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch thumbnail data");
  }

  return response.json();
}

export async function fetchAttributesForVariation(
  productId: string,
  variationId: string
) {
  console.log(
    `Fetching attributes for product ${productId}, variation ${variationId}`
  ); // Debug log

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${variationId}/attributes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch variation attributes for ${variationId}`);
  }

  const responseData = await response.json();
  console.log(
    `Attributes response for variation ${variationId}:`,
    responseData
  ); // Debug log

  if (responseData.code === 0) {
    return responseData.skuAttributes.map((skuAttribute: any) => ({
      value: skuAttribute.value,
      label: skuAttribute.attribute.name,
    }));
  }
  return null;
}

export async function fetchPriceForVariation(productId: string, skuId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch variation price");
  }

  const data = await response.json();
  if (data.code === 0) {
    return data.skuPricings.length > 0 ? data.skuPricings[0].unitPrice : null;
  }
  return null;
}

export async function fetchOffersForVariation(
  productId: string,
  skuId: string
) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      { next: { revalidate: 3600 } }
    );

    const data = await response.json();
    if (data.code === 0) {
      const offers = data.sku.offers;
      if (offers.length > 0) {
        return offers[0];
      }

      // Si no hay ofertas en el SKU, buscar en el producto
      const productResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        { next: { revalidate: 3600 } }
      );

      const productData = await productResponse.json();
      if (productData.code === 0 && productData.offers.length > 0) {
        return productData.offers[0];
      }
    }
  } catch (error) {
    console.error("Error fetching offers:", error);
  }
  return null;
}

export async function fetchAllProductData(productId: string) {
  try {
    const [productData, stockData] = await Promise.all([
      fetchProductData(productId),
      fetchStockData(productId, productId), // Para el SKU base
    ]);

    if (productData.code === 0) {
      const variations = productData.skus;
      const variationData = await Promise.all(
        variations.map(async (variation: any) => {
          const [attributes, price, offers] = await Promise.all([
            fetchAttributesForVariation(productId, variation.id),
            fetchPriceForVariation(productId, variation.id),
            fetchOffersForVariation(productId, variation.id),
          ]);

          return {
            ...variation,
            attributes: attributes || [],
            price,
            offers: offers ? [offers] : [],
          };
        })
      );

      return {
        ...productData,
        skus: variationData,
        stock: stockData,
      };
    }
  } catch (error) {
    console.error("Error fetching all product data:", error);
  }
  return null;
}
