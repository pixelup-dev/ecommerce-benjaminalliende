import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import TableUsers from "@/components/Core/Tables/TableUsers";
import MenuOpcion from "@/components/Core/MenuOpcion/MenuOpcion";
import { Metadata } from "next";
import Mantenimiento from "@/components/Core/Mantenimiento/Mantenimiento";
import LogoEdit from "@/components/Core/LogoEdit/LogoEdit";
import Tipografia from "@/components/Core/Tipografia/Tipografia";
import Color from "@/components/Core/Color/Color";
import ReviewSettings from "@/components/Core/ReviewSettings/ReviewSettings";
import RedesSociales from "@/components/Core/RedesSociales/RedesSociales";

export const metadata: Metadata = {
  title: "CRUD de Usuarios | PixelUP",
  description: "PixelUP",
  // other metadata
};

const UsuariosPage = () => {
  return (
    <section className="p-4 md:p-10">
      <Breadcrumb pageName="Usuarios" />

      <div className="flex flex-col gap-4 md:gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
          <MenuOpcion/>
          <Mantenimiento/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
        <Tipografia/>
        <LogoEdit/>
        </div>

        <Color/>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
        <ReviewSettings />
        <RedesSociales/>
        </div>
      </div>
      <div className="flex flex-col mt-4 md:mt-10 gap-4 md:gap-10 min-h-screen">
        <TableUsers />
      </div>
    </section>
  );
};

export default UsuariosPage;
