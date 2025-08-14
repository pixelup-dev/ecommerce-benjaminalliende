export function slugify(text: string | undefined | null) {
  if (!text) return '';
  
  const slug = text
    .toString()
    .toLowerCase()
    .trim()
    // Reemplazar caracteres acentuados por sus equivalentes sin acento
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
  return slug;
}