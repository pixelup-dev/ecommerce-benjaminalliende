"use client";
import React, { useEffect, useState } from "react";
import BannerPrincipalBO from "@/components/conMantenedor/Mantenedores/BannerPrincipalBO";
import BannerTiendaBO from "@/components/conMantenedor/Mantenedores/BannerTiendaBO";
import BannersCategoriasBO from "@/components/conMantenedor/Mantenedores/BannersCategoriasBO";
import Ofertas from "@/app/dashboard/ofertas/Ofertas";

export default function BannerHome() {
  return (
    <section className="gap-4 flex flex-col">
      <title>Ofertas</title>
      <div
        className=""
        style={{ borderRadius: "var(--radius)" }}
      >
        {/* <h4 className="uppercase font-bold mb-4">Colecciones</h4> */}
        <Ofertas />
      </div>
    </section>
  );
}
