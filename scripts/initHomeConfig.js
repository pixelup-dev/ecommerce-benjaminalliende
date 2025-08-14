const axios = require("axios");

async function initHomeConfig() {
  try {
    const configId =
      process.env.NEXT_PUBLIC_HOME_CONFIG_CONTENTBLOCK ||
      "home-config-12345-67890-abcdef";
    const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
    const token = process.env.ADMIN_TOKEN; // Necesitarás configurar este token

    const defaultConfig = {
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

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${configId}?siteId=${siteId}`,
      {
        title: "Configuración del Home",
        contentText: JSON.stringify(defaultConfig),
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "Configuración del home inicializada exitosamente:",
      response.data
    );
  } catch (error) {
    console.error(
      "Error al inicializar configuración del home:",
      error.response?.data || error.message
    );
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initHomeConfig();
}

module.exports = { initHomeConfig };
