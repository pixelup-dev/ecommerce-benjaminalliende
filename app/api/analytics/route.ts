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
    console.log("Starting request to Google Analytics API");

    // Solicitud a la API de Google Analytics para datos en tiempo real
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [
        { name: "unifiedScreenName" }, // Título de la página o nombre de la pantalla
        { name: "country" }, // País
        { name: "city" }, // Ciudad
        { name: "deviceCategory" }, // Dispositivo (móvil, escritorio, tablet)
      ],
      metrics: [
        { name: "activeUsers" }, // Usuarios activos
        { name: "screenPageViews" }, // Vistas de pantalla/página
      ],
    });

    console.log("Response from Google Analytics API:", response);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error(
      "Error while fetching data from Google Analytics API:",
      error.message
    );
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
