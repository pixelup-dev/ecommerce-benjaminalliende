import type { Metadata } from "next";
import CrearProductoSimple from "./CrearProductoSimple";

export const metadata: Metadata = {
  title: "Crear Producto Simple",
  description: "Crear Producto Simple",
};
const CrearProductoSimplePage = () => {
  return (
    <div className="pb-20">
      <CrearProductoSimple />
    </div>
  );
};

export default CrearProductoSimplePage;
