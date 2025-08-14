"use client";
import React, { useEffect, useState } from "react";
import BannerPrincipalBO from "@/components/conMantenedor/Mantenedores/BannerPrincipalBO";
import BannerTiendaBO from "@/components/conMantenedor/Mantenedores/BannerTiendaBO";
import BannersCategoriasBO from "@/components/conMantenedor/Mantenedores/BannersCategoriasBO";
import ColeccionesBO01 from "@/components/PIXELUP/Colecciones/ColeccionesBO01";

import type { Metadata } from "next";

export default function BannerHome() {
  return (
    <section className="gap-4 flex flex-col">
      <title>Colecciones</title>
      <div
        className="py-10 mx-4 "
        style={{ borderRadius: "var(--radius)" }}
      >
        {/* <h4 className="uppercase font-bold mb-4">Colecciones</h4> */}
        <ColeccionesBO01 />
      </div>
    </section>
  );
}
