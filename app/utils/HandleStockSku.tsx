import axios from "axios";
import { getCookie } from "cookies-next";

const token = String(getCookie("AdminTokenAuth"));

const getWarehouseId = async () => {
  try {
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

const getInventoryId = async (id: any, skuId: any, warehouseId: any) => {
  try {
    const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${id}/skus/${skuId}/inventories?warehouseId=${warehouseId}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
    );
    if (
      response.data &&
      response.data.skuInventories &&
      response.data.skuInventories.length > 0
    ) {
      return response.data.skuInventories[0].id;
    } else {
      console.error(
        "No se encontraron inventarios para el SKU en el almacén especificado."
      );
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo inventoryId:", error);
    return null;
  }
};

export const handleStockSku = async (
  id: any,
  skuId: any,
  quantity: any,
  minimumQuantity: any
) => {
  try {
    const warehouseId = await getWarehouseId();
    if (!warehouseId) {
      console.error("No warehouse ID found.");
      return;
    }

    const inventoryId = await getInventoryId(id, skuId, warehouseId);

    let response;
    if (inventoryId) {
      // Realizar PUT si existe inventoryId
      response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/inventories/${inventoryId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          warehouseId: warehouseId,
          quantity: quantity,
          minimumQuantity:
            minimumQuantity !== null && minimumQuantity !== undefined
              ? minimumQuantity
              : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      // Realizar POST si no existe inventoryId
      response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/inventories?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          warehouseId: warehouseId,
          quantity: quantity,
          minimumQuantity:
            minimumQuantity !== null && minimumQuantity !== undefined
              ? minimumQuantity
              : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (response.status >= 200 && response.status < 300) {
      console.log("Stock updated successfully");
    } else {
      console.error("Error updating stock:", response.statusText);
    }
  } catch (error) {
    console.error("Error sending request:", error);
  }
};

export const handleHasUnlimitedStock = async (
  productId: any,
  skuId: any,
  hasUnlimitedStock: boolean,
  description: string,
  hasStockNotifications: boolean
) => {
  try {
    console.log("hasUnlimitedStock:1123123", hasUnlimitedStock);
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        hasUnlimitedStock: hasUnlimitedStock,
        description: description,
        hasStockNotifications: hasStockNotifications,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status >= 200 && response.status < 300) {
      console.log("hasUnlimitedStock actualizado correctamente");
    } else {
      console.error(
        "Error actualizando hasUnlimitedStock:",
        response.statusText
      );
    }
  } catch (error) {
    console.error("Error enviando la solicitud:", error);
  }
};

export const getCurrentStock = async (productId: string, skuId: string) => {
  const warehouseId = await getWarehouseId();
  if (!warehouseId) {
    console.error("No se encontró un ID de almacén.");
    return 0; // Devuelve 0 si no se encuentra un almacén
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/inventories?warehouseId=${warehouseId}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (
      response.data &&
      response.data.skuInventories &&
      response.data.skuInventories.length > 0
    ) {
      const stock = response.data.skuInventories[0].quantity;
      console.log("Stock disponible:", stock);
      return stock;
    } else {
      console.warn(
        "No se encontró stock para este SKU en el almacén especificado."
      );
      return 0; // Devuelve 0 si no se encuentra stock
    }
  } catch (error) {
    console.error("Error obteniendo el stock:", error);
    return 0; // Devuelve 0 en caso de error
  }
};
