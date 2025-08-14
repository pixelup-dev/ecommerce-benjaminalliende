import axios from "axios";
import { getCookie } from "cookies-next";

const token = getCookie("AdminTokenAuth");

const getPricingId = async (id: any, skuId: any) => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data, "responsePricing");
    if (
      response.data &&
      response.data.skuPricings &&
      response.data.skuPricings.length > 0
    ) {
      return response.data.skuPricings[0].id;
    } else {
      console.error("No se encontraron precios para el SKU");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo pricingId:", error);
    return null;
  }
};

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
      return response.data.warehouses[0].id;
    } else {
      console.error("No se encontraron almacenes.");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo almacén:", error);
    return null;
  }
};

const getCurrencyCodeId = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/currency-codes?pageNumber=1&pageSize=50&statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (
      response.data &&
      response.data.currencyCodes &&
      response.data.currencyCodes.length > 0
    ) {
      return response.data.currencyCodes[0].id;
    } else {
      console.error("No se encontraron códigos de moneda.");
      return null;
    }
  } catch (error) {
    console.error("Error obteniendo el código de moneda:", error);
    return null;
  }
};

export const HandlePriceSku = async (
  id: any,
  skuId: any,
  precioNormal: any
) => {
  try {
    const pricingId = await getPricingId(id, skuId);
    const currencyCodeId = await getCurrencyCodeId();

    if (!currencyCodeId) {
      console.error("No se pudo obtener el código de moneda.");
      return;
    }

    if (pricingId) {
      const warehouseId = await getWarehouseId();

      if (!warehouseId) {
        console.error("No se pudo obtener el ID del almacén.");
        return;
      }
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/pricings/${pricingId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          warehouseId: warehouseId,
          currencyCodeId: currencyCodeId,
          unitPrice: precioNormal,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("Precio actualizado correctamente");
      } else {
        console.error("Error actualizando el precio:", response.statusText);
      }
    } else {
      const warehouseId = await getWarehouseId();

      if (!warehouseId) {
        console.error("No se pudo obtener el ID del almacén.");
        return;
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          currencyCodeId: currencyCodeId,
          unitPrice: precioNormal,
          warehouseId: warehouseId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("Precio creado correctamente");
      } else {
        console.error("Error creando el precio:", response.statusText);
      }
    }
  } catch (error) {
    console.error("Error enviando la solicitud:", error);
  }
};
