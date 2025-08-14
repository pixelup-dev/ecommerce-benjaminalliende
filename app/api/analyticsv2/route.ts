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
    // Ejecutar un informe
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: "30daysAgo",
          endDate: "today",
        },
      ],
      dimensions: [
        { name: "date" },
        { name: "city" },
        { name: "deviceCategory" },
        { name: "browser" },
        { name: "source" },
        { name: "medium" },
      ],
      metrics: [
        { name: "activeUsers" },
        { name: "sessions" },
        { name: "newUsers" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
    });

    console.log(
      "Google Analytics API Response:",
      JSON.stringify(response, null, 2)
    ); // Imprimir los datos de la respuesta para inspeccionarlos

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Error fetching analytics data:", error); // Registrar cualquier error en la consola
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
