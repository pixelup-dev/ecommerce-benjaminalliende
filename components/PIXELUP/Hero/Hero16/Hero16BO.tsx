import React from "react";
import Hero16ImagesBO from "./Hero16ImagesBO";
import Hero16ContentBO from "./Hero16ContentBO";
import { Toaster } from "react-hot-toast";

const Hero16BO: React.FC = () => {
  return (
    <div className="space-y-8">
      <Toaster />
      <Hero16ImagesBO />
      <Hero16ContentBO />
    </div>
  );
};

export default Hero16BO;
