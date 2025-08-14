import axios from "axios";

export const obtenerOrdenesId = async (orderId: any) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/orders/${orderId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
    );
    return response.data;
  } catch (error) {
    console.error("Error : " + error);
    throw error;
  }
};
