import React from "react";
import UbicacionContentBO from "./UbicacionContentBO";
import UbicacionImagesBO from "./UbicacionImagesBO";

interface UbicacionBOProps {
  // agregar props si los hay
}

const UbicacionBO: React.FC<UbicacionBOProps> = () => {
  return (
    <div className="space-y-8 pb-20">
      <UbicacionContentBO />
      <UbicacionImagesBO />
    </div>
  );
};

export default UbicacionBO;
