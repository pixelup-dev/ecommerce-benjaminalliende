import TableClientes from "@/components/Core/Tables/TableClientes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clientes",
  description: "Listado Clientes",
  // other metadata
};

const ClientesPage = () => {
  return (
    <>
      <TableClientes />
    </>
  );
};

export default ClientesPage;
