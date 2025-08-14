import type { Metadata } from "next";
import CrearVariable from "./CrearVariable";
import { RevalidationProvider } from "@/app/Context/RevalidationContext";

export const metadata: Metadata = {
  title: "Crear Producto Varibale",
  description: "Crear Producto Varibale",
};
const CrearProductoVariablePage = () => {
  return (
    <RevalidationProvider>
      <CrearVariable />
    </RevalidationProvider>
  );
};

export default CrearProductoVariablePage;
