export async function fetchAboutContent() {
  try {
    const bannerId = process.env.NEXT_PUBLIC_ABOUTMECONTENT_ID;
    console.log("Fetching about content with bannerId:", bannerId);

    if (!bannerId) {
      console.error("NEXT_PUBLIC_ABOUTMECONTENT_ID is not defined");
      return null;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        next: { revalidate: 3600 },
        cache: "force-cache",
      }
    );

    console.log("About content response:", response.status);

    if (!response.ok) {
      throw new Error(`Failed to fetch about content: ${response.status}`);
    }

    const data = await response.json();
    console.log("About content data:", data);

    if (data.code === 0 && data.contentBlock) {
      return data.contentBlock;
    } else {
      console.error("Invalid response format:", data);
      return null;
    }
  } catch (error) {
    console.error("Error fetching about content:", error);
    return null;
  }
}
