/* eslint-disable @next/next/no-img-element */
"use client";
import { RevalidationProvider } from "@/app/Context/RevalidationContext";
import Navbar from "@/components/PIXELUP/Navbar/Navbar02/cdgnavbar";
import { DynamicNavbar, DynamicFooter } from "../components/LayoutComponents";
import WhatsAppButton from "@/components/Core/WhatsAppButton/WhatsAppButton";
import NextTopLoader from "nextjs-toploader";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RevalidationProvider>
      <div>
      
        <NextTopLoader showSpinner={false} />
        <DynamicNavbar />
        {children}
        <WhatsAppButton />
        <DynamicFooter />
      </div>
    </RevalidationProvider>
  );
}
