const axios = require("axios");
require("dotenv").config({ path: ".env.local" });

const defaultFooterConfig = {
  title: "Footer",
  description: "Descripción del footer",
  copyrightText: `© ${new Date().getFullYear()} ${
    process.env.NEXT_PUBLIC_NOMBRE_TIENDA
  } | Todos los derechos reservados.`,

  selectedTemplate: "Footer01",

  showLogo: true,
  showMenuLinks: true,
  showLinks: true,
  showCollections: true,
  showSocial: true,
  showDescription: false,

  // Las redes sociales se gestionan desde el componente RedesSociales
  // No se incluyen aquí para evitar duplicación

  backgroundColor: "#1f2937",
  textColor: "#ffffff",
  accentColor: "#f59e0b",

  customLinks: [
    {
      title: "Política de Privacidad",
      url: "/politica-privacidad",
      enabled: true,
    },
    {
      title: "Términos y Condiciones",
      url: "/terminos-condiciones",
      enabled: true,
    },
    { title: "Política de Devoluciones", url: "/devoluciones", enabled: true },
  ],
};

async function initFooterConfig() {
  try {
    console.log("🚀 Inicializando configuración del footer...");

    const contentBlockId =
      process.env.NEXT_PUBLIC_FOOTER_CONFIG_CONTENTBLOCK ||
      "footer-config-default";
    const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE;

    if (!siteId || !apiUrl) {
      console.error("❌ Error: Faltan variables de entorno necesarias");
      console.log("Asegúrate de tener configuradas:");
      console.log("- NEXT_PUBLIC_API_URL_SITEID");
      console.log("- NEXT_PUBLIC_API_URL_BO_CLIENTE");
      return;
    }

    console.log(`📝 Content Block ID: ${contentBlockId}`);
    console.log(`🌐 Site ID: ${siteId}`);

    // Verificar si ya existe la configuración
    try {
      const checkResponse = await axios.get(
        `${apiUrl}/api/v1/content-blocks/${contentBlockId}?siteId=${siteId}`
      );

      if (checkResponse.data.contentBlock) {
        console.log("⚠️  La configuración del footer ya existe");
        console.log("¿Deseas sobrescribirla? (y/N)");

        // En un script automático, no sobrescribir por defecto
        console.log(
          "Saltando inicialización para evitar sobrescribir configuración existente"
        );
        return;
      }
    } catch (error) {
      // Si no existe, continuar con la creación
      console.log(
        "✅ No existe configuración previa, procediendo con la inicialización..."
      );
    }

    // Crear la configuración inicial
    const response = await axios.post(
      `${apiUrl}/api/v1/content-blocks?siteId=${siteId}`,
      {
        id: contentBlockId,
        title: "Configuración del Footer",
        contentText: JSON.stringify(defaultFooterConfig, null, 2),
        type: "footer-config",
        isActive: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.code === 0) {
      console.log("✅ Configuración del footer inicializada exitosamente");
      console.log("📋 Configuración por defecto:");
      console.log(`   - Plantilla: ${defaultFooterConfig.selectedTemplate}`);
      console.log(
        `   - Logo: ${defaultFooterConfig.showLogo ? "Visible" : "Oculto"}`
      );
      console.log(
        `   - Enlaces del Menú: ${
          defaultFooterConfig.showMenuLinks ? "Visibles" : "Ocultos"
        }`
      );
      console.log(
        `   - Enlaces Personalizados: ${
          defaultFooterConfig.showLinks ? "Visibles" : "Ocultos"
        }`
      );
      console.log(
        `   - Colecciones: ${
          defaultFooterConfig.showCollections ? "Visibles" : "Ocultas"
        }`
      );
      console.log(
        `   - Redes Sociales: ${
          defaultFooterConfig.showSocial ? "Visibles" : "Ocultas"
        }`
      );
      console.log(
        `   - Descripción: ${
          defaultFooterConfig.showDescription ? "Visible" : "Oculta"
        }`
      );
      console.log(
        `   - Color de fondo: ${defaultFooterConfig.backgroundColor}`
      );
      console.log(`   - Color de texto: ${defaultFooterConfig.textColor}`);
      console.log(`   - Color de acento: ${defaultFooterConfig.accentColor}`);

      console.log("\n🎨 Plantillas disponibles:");
      console.log("   - Footer01: Clásico (por defecto)");
      console.log("   - Footer02: Moderno");
      console.log("   - Footer03: Minimalista");
      console.log("   - Footer04: Descriptivo");

      console.log("\n🔗 Configuración de Redes Sociales:");
      console.log(
        "   - Las redes sociales se gestionan desde el componente RedesSociales"
      );
      console.log(
        "   - Se sincroniza automáticamente con la configuración existente"
      );
      console.log(
        "   - Configúralas desde: Dashboard > Configuración > Redes Sociales"
      );

      console.log("\n📝 Para personalizar la configuración:");
      console.log("   1. Ve al dashboard de tu sitio");
      console.log('   2. Navega a la sección "Footer"');
      console.log("   3. Configura según tu plan de suscripción");
      console.log("   4. Las redes sociales se sincronizan automáticamente");
    } else {
      console.error(
        "❌ Error al crear la configuración:",
        response.data.message
      );
    }
  } catch (error) {
    console.error("❌ Error durante la inicialización:", error.message);
    if (error.response) {
      console.error("Respuesta del servidor:", error.response.data);
    }
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initFooterConfig();
}

module.exports = { initFooterConfig, defaultFooterConfig };
