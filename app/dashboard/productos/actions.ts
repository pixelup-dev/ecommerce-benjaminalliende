"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateProducts() {
  revalidatePath("/tienda");
  revalidatePath("/dashboard/productos");
  revalidateTag("products");
  revalidateTag("categories");
}
