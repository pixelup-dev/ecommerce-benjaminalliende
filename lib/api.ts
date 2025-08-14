import axios from "axios";
import { BannerResponse } from "@/components/PIXELUP/BannerPrincipal/types";

export async function getBannerData(
  bannerId: string
): Promise<BannerResponse["banner"]> {
  if (!bannerId) {
    throw new Error("Banner ID es requerido");
  }

  try {
    const response = await axios.get<BannerResponse>(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
    );
    return response.data.banner;
  } catch (error) {
    throw new Error("Error al obtener los datos del banner");
  }
}
