import axios from "axios";

export const obtenerProductos = async (
  SiteId: any,
  PageNumber: any,
  PageSize: any,
  productTypeId?: string | null,
  isFeatured?: boolean | null
) => {
  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products?siteId=${SiteId}&pageNumber=${PageNumber}&pageSize=${PageSize}`;

    if (productTypeId) {
      url += `&productTypeId=${productTypeId}`;
    }
    if (isFeatured) {
      `&isFeatured=${isFeatured}`;
    }

    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos: " + error);
    throw error;
  }
};
