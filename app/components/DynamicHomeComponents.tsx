import React from "react";
import { HomeConfig } from "@/app/utils/homeConfig";
import ClientHomeComponents from "./ClientHomeComponents";

interface DynamicHomeComponentsProps {
  config: HomeConfig;
}

// Este componente es un Server Component que delega la renderización al Client Component
export default function DynamicHomeComponents({
  config,
}: DynamicHomeComponentsProps) {
  return <ClientHomeComponents config={config} />;
}
