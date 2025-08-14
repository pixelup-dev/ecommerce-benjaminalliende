import type { Metadata } from "next";
import Footer01 from "@/components/PIXELUP/Footer/Footer01/Footer01";
import Navbar02 from "@/components/PIXELUP/Navbar/Navbar02/Navbar02";
import MarqueeTOP from "@/components/PIXELUP/Marquee/MarqueeTop/Marquee";
import WhatsAppButton from "@/components/Core/WhatsAppButton/WhatsAppButton";
import { DynamicFooter, DynamicNavbar } from "../components/LayoutComponents";
export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacto",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <MarqueeTOP />
      <DynamicNavbar />
      <div>{children}</div>
      <WhatsAppButton />
      <DynamicFooter />
    </>
  );
}
