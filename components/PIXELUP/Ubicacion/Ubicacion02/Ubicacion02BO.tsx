import React from "react";
import { Toaster } from "react-hot-toast";
import UbicacionContent02BO from "./UbicacionContent02BO";

interface UbicacionBOProps {
  // agregar props si los hay
}

const Ubicacion02BO: React.FC<UbicacionBOProps> = () => {
  return (
    <div className="space-y-8 pb-20">
      <Toaster />
      <UbicacionContent02BO />
{/*       <UbicacionImagesBO /> */}
    </div>
  );
};

export default Ubicacion02BO;
