import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import TableUsers from "@/components/Core/Tables/TableUsers";
import MenuOpcion from "@/components/Core/MenuOpcion/MenuOpcion";
import { Metadata } from "next";
import Mantenimiento from "@/components/Core/Mantenimiento/Mantenimiento";
import LogoEdit from "@/components/Core/LogoEdit/LogoEdit";
export const metadata: Metadata = {
  title: "Configuración | PixelUP",
  description: "PixelUP",
  // other metadata
};

const UsuariosPage = () => {
  return (
    <section className="p-4 md:p-10">
      <Breadcrumb pageName="Configuración" />

      <div className="flex flex-col gap-4 md:gap-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
          <MenuOpcion/>
          <Mantenimiento/>
          
        </div>
      </div>
      <div className="flex flex-col mt-4 md:mt-10 gap-4 md:gap-10">
      <LogoEdit/>
      </div>
      <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <div className="flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-blue-500 mb-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-600 text-lg">¡Próximamente nuevas funcionalidades disponibles! Estamos trabajando para mejorar tu experiencia.</p>
          </div>
        </div>
{/*       <div className="flex flex-col mt-4 md:mt-10 gap-4 md:gap-10 min-h-screen">
        <TableUsers />
      </div> */}
    </section>
  );
};

export default UsuariosPage;
