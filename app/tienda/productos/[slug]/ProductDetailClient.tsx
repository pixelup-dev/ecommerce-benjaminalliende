"use client";

import React from "react";
import { getActiveComponents } from "@/app/config/GlobalConfig";

interface ProductDetailClientProps {
  productData: any; // Aquí deberías definir el tipo correcto de tu producto
}

const ProductDetailClient = ({ productData }: ProductDetailClientProps) => {
  const { ProductDetail } = getActiveComponents();

  return <ProductDetail product={productData} />;
};

export default ProductDetailClient; 