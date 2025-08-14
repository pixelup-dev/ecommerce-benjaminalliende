import axios from "axios";

export interface AboutConfig {
  visibleComponents: string[];
  order: string[];
}

export async function fetchAboutConfig(): Promise<AboutConfig | null> {
  try {
    const configId =
      process.env.NEXT_PUBLIC_ABOUT_CONFIG_CONTENTBLOCK || "about-config-default";

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${configId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
    );

    if (response.data.code === 0 && response.data.contentBlock) {
      try {
        const config = JSON.parse(response.data.contentBlock.contentText);
        return config;
      } catch (error) {
        console.error("Error al parsear configuración de About:", error);
        return null;
      }
    }
  } catch (error) {
    console.error("Error al cargar configuración de About:", error);
  }

  return null;
}

export function getDefaultAboutConfig(): AboutConfig {
  return {
    visibleComponents: [
      "bannerAbout",
      "aboutUs",
    ],
    order: [
      "bannerAbout",
      "aboutUs",
    ],
  };
} 