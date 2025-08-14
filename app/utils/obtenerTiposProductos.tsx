import axios from "axios";

export const obtenerTiposProductos = async (
  SiteId: any,
  token: any,
  PageNumber: any,
  PageSize: any
) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types?pageNumber=${PageNumber}&pageSize=${PageSize}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener el usuario: " + error);
    throw error;
  }
};
