import axios from "axios";

export const obtenerClienteID = async (id: any, token: any) => {
  try {
    const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}?siteId=${SiteId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error: " + error);
    throw error;
  }
};
