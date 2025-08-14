import React from "react";
import Hero04ImagesBO from "./Hero04ImagesBO";
import Hero04ContentBO from "./Hero04ContentBO";

const Hero04BO: React.FC = () => {
  return (
    <div className="space-y-8">
      <Hero04ImagesBO />
      <Hero04ContentBO />
    </div>
  );
};

export default Hero04BO;