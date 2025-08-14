"use client";
import React from "react";
import { redirect, useSearchParams } from "next/navigation";
import ValidateComponent from "./ValidateComponent";

const ValidatePage: React.FC = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const token_ws = searchParams.get("token_ws");
  const tbkToken = searchParams.get("TBK_TOKEN");

  // Si no hay orderId, redirigir a la tienda
  if (!orderId) {
    return redirect("/tienda/");
  }

  // Renderizar el componente de validación tanto para token_ws como para TBK_TOKEN
  return (
    <div>
      <ValidateComponent
        orderId={orderId}
        token_ws={token_ws || undefined}
      />
    </div>
  );
};

export default ValidatePage;
