import axios from "axios";

export const obtenerCuponesBO = async (
  PageNumber: any,
  PageSize: any,
  token: any
) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/discount-coupons?&pageNumber=${PageNumber}&pageSize=${PageSize}&statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
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
