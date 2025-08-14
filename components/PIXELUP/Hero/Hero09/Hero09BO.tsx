import React from "react";
import Hero09ImagesBO from "./Hero09ImagesBO";
import Hero09ContentBO from "./Hero09ContentBO";
import { Toaster } from "react-hot-toast";

const Hero04BO: React.FC = () => {
  return (
    <div className="space-y-8">
      <Toaster />
      <Hero09ImagesBO />
      <Hero09ContentBO />
    </div>
  );
};

export default Hero04BO;