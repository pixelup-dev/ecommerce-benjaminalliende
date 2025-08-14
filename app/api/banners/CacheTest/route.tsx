export const revalidate = 60; // ISR: Regenerar cada 60 segundos

export async function GET() {
  const bannerId = process.env.NEXT_PUBLIC_BANNER_TIENDA_ID;
  const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${siteId}`,
    { cache: "force-cache" }
  );

  if (!res.ok) {
    return new Response(
      JSON.stringify({ error: "Error fetching banner data" }),
      { status: 500 }
    );
  }

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
