import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tagFromQuery = request.nextUrl.searchParams.get("tag");

    if (tagFromQuery) {
      revalidateTag(tagFromQuery);
      return Response.json({ revalidated: true, tag: tagFromQuery });
    }

    if (body.path) {
      revalidatePath(body.path, body.type as "page" | "layout");
      return Response.json({ revalidated: true, path: body.path });
    }

    return Response.json({
      revalidated: false,
      message: "Se requiere path o tag para revalidar",
    });
  } catch (error) {
    return Response.json({
      revalidated: false,
      message: "Error en la revalidación",
      error: (error as Error).message,
    });
  }
}
