import { toast } from "react-hot-toast";

export const validateImage = (file: File) => {
  // Validar tipo de archivo
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    toast.error("Formato de imagen no válido. Use PNG, JPG o WebP");
    return false;
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.error("La imagen es demasiado grande. Máximo 5MB");
    return false;
  }

  return true;
}; 