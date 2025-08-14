import axios from "axios";

export const obtenerProductosID = async (id: any, SiteId: string) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener el usuario: " + error);
    throw error;
  }
};
