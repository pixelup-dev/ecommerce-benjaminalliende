export async function seoDATA(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${id}/skus?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    console.log(data, "productData2222222222222");
    if (data.code !== 0) return null;

    return {
      id: data.product.id,
      name: data.product.name,
      description: data.product.description,
      mainImageUrl: data.product.mainImageUrl,
      categories: data.product.categories.map((cat: any) => cat.name),
      reviewAverageScore: data.product.reviewAverageScore,
      totalReviews: data.product.totalReviews,
      enabledForDelivery: data.product.enabledForDelivery,
      enabledForWithdrawal: data.product.enabledForWithdrawal,
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
}
