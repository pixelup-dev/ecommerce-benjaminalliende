import axios from "axios";
import { getCookie } from "cookies-next";

export const HandleStockSkuPut = async (
  id: string,
  skuId: string,
  quantity: number
) => {
  try {
    // Obtener el inventoryId
    const inventoryId = await getInventoryId(id, skuId);
    if (!inventoryId) {
      console.error("No se pudo obtener el inventoryId.");
      return;
    }

    const warehouseId = await getWarehouseId(); // Obtener el warehouseId
    if (!warehouseId) return;

    // Realizar la solicitud PUT utilizando el inventoryId
    const token = String(getCookie("AdminTokenAuth"));
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/inventories/${inventoryId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        warehouseId: warehouseId,
        quantity: quantity,
        minimumQuantity: 5,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      console.log("Stock updated successfully");
    } else {
      console.error("Error updating stock:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending request:", error);
  }
};

const getInventoryId = async (id: string, skuId: string) => {
  try {
    const token = String(getCookie("AdminTokenAuth"));
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/inventories?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data, "response");
    if (response.data && response.data.skuInventories) {
      return response.data.skuInventories.id;
    } else {
      console.error("No se encontraron inventarios para el SKU.");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo inventoryId:", error);
    return null;
  }
};
const getWarehouseId = async () => {
  try {
    const token = String(getCookie("AdminTokenAuth"));
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/warehouses?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (
      response.data &&
      response.data.warehouses &&
      response.data.warehouses.length > 0
    ) {
      return response.data.warehouses[0].id; // Devuelve el id del primer almacén
    } else {
      console.error("No se encontraron almacenes.");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo almacén:", error);
    return null;
  }
};
