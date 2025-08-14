import axios from "axios";

export interface HomeConfig {
  visibleComponents: string[];
  order: string[];
}

export async function fetchHomeConfig(): Promise<HomeConfig | null> {
  try {
    const configId =
      process.env.NEXT_PUBLIC_HOME_CONFIG_CONTENTBLOCK || "home-config-default";

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${configId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
    );

    if (response.data.code === 0 && response.data.contentBlock) {
      try {
        const config = JSON.parse(response.data.contentBlock.contentText);
        return config;
      } catch (error) {
        console.error("Error al parsear configuración del home:", error);
        return null;
      }
    }
  } catch (error) {
    console.error("Error al cargar configuración del home:", error);
  }

  return null;
}

export function getDefaultHomeConfig(): HomeConfig {
  return {
    visibleComponents: [
      "marqueeTOP",
      "bannerPrincipal01",
      "destacadosCat",
      "testimonios03",
      "testimonios",
      "testimonios04",
      "sinFoto04",
      "colecciones01",
      "colecciones02",
      "galeria02",
      "nosotros01",
      "sinFoto06",
      "sinFoto07",
      "ubicacion02",
      "servicios01",
      "servicios02",
      "servicios03",
      "servicios04",
    ],
    order: [
      "marqueeTOP",
      "bannerPrincipal01",
      "destacadosCat",
      "testimonios03",
      "testimonios",
      "testimonios04",
      "sinFoto04",
      "colecciones01",
      "colecciones02",
      "galeria02",
      "nosotros01",
      "sinFoto06",
      "sinFoto07",
      "ubicacion02",
      "servicios01",
      "servicios02",
      "servicios03",
      "servicios04",
    ],
  };
}
