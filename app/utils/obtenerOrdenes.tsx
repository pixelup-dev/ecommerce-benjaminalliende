import axios from "axios";
export const obtenerOrdenes = async (token: any) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/orders?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
