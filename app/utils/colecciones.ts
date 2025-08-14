import { cookies } from "next/headers";

export async function getCollections() {
  const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${siteId}`,
    {
      next: { tags: ["collections"] },
      cache: "force-cache",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch collections");
  }

  return res.json();
}

export async function getCollectionById(id: string) {
  const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/collections/${id}?siteId=${siteId}`,
    {
      next: { tags: ["collections"] },
      cache: "force-cache",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch collection");
  }

  return res.json();
}

// API del backoffice (requiere autenticación)
export async function getCollectionsBO() {
  const cookieStore = cookies();
  const token = cookieStore.get("AdminTokenAuth")?.value;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
    {
      next: { tags: ["collections"] },
      cache: "force-cache",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch collections");
  }

  return res.json();
}
