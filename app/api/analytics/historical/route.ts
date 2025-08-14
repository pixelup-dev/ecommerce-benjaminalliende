import { NextResponse } from "next/server";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"), // Reemplazar \\n con \n
  },
});

export async function GET() {
  try {
    // Verificar si las variables de entorno están cargadas correctamente
    console.log("Property ID:", propertyId);
    console.log(
      "Client Email:",
      process.env.GOOGLE_CLIENT_EMAIL
        ? "Client email loaded"
        : "Client email not loaded"
    );
    console.log(
      "Private Key:",
      process.env.GOOGLE_PRIVATE_KEY
        ? "Private key loaded"
        : "Private key not loaded"
    );

    // Informe histórico (no en tiempo real)
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      dimensions: [
        { name: "city" }, // Ciudad
        { name: "deviceCategory" }, // Dispositivo (mobile, desktop, tablet)
      ],
      metrics: [
        { name: "activeUsers" }, // Usuarios activos (históricos)
      ],
    });

    // Log de la respuesta para inspeccionarla
    console.log("Historical data from Google Analytics API:", response);
    return NextResponse.json(response);
  } catch (error: any) {
    // Log detallado del error para rastrear el problema
    console.error(
      "Error while fetching historical data from Google Analytics API:",
      error.message
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
