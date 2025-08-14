import axios from "axios";
import { getCookie } from "cookies-next";

export async function obtenerPrecioProducto(
  productId: string,
  SiteId: string,
  skuId: string
): Promise<number | null> {
  try {
    const token = getCookie("AdminTokenAuth");
    
    if (!token) {
      console.error("No hay token de autenticación");
      return null;
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    
    console.log("Respuesta de precios:", response.data);
    
    const { skuPricings } = response.data;
    // Verifica si hay al menos un precio de producto disponible
    if (skuPricings && skuPricings.length > 0) {
      // Tomamos el primer precio disponible
      const { unitPrice } = skuPricings[0];
      console.log("Precio encontrado:", unitPrice);
      return unitPrice;
    } else {
      console.log("No se encontraron precios para el SKU:", skuId);
      return null;
    }
  } catch (error) {
    console.error("Error al obtener el precio del producto:", error);
    return null;
  }
}
