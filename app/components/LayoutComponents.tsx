"use client";

import { getActiveComponents } from "@/app/config/GlobalConfig";
import Footer from "@/components/PIXELUP/Footer/Footer";

export function DynamicNavbar() {
  const { Navbar } = getActiveComponents();
  return <Navbar />;
}

export function DynamicFooter() {
  return <Footer />;
}
