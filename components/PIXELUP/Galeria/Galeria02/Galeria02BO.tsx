import React from "react";
import GaleriaImagesBO from "./GaleriaImages02BO";
import GaleriaContentBO from "./GaleriaContent02BO";
import { Toaster } from "react-hot-toast";

const Galeria02BO: React.FC = () => {
  return (
    <div className="space-y-8">
      <Toaster />
      <GaleriaImagesBO />
      <GaleriaContentBO />
    </div>
  );
};

export default Galeria02BO;