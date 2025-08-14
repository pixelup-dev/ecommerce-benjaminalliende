import type { Metadata } from "next";
import MarqueeTOP from "@/components/conMantenedor/MarqueeTOP";
import Footer02 from "@/components/PIXELUP/Footer/Footer02/Footer02";
import Footer01 from "@/components/PIXELUP/Footer/Footer01/Footer01";
import Navbar02 from "@/components/PIXELUP/Navbar/Navbar02/Navbar02";
import { DynamicNavbar, DynamicFooter } from "../components/LayoutComponents";
import WhatsAppButton from "@/components/Core/WhatsAppButton/WhatsAppButton";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    {/*   <MarqueeTOP /> */}
      <DynamicNavbar />
      <div>{children}</div>
        <WhatsAppButton />
      <DynamicFooter />
    </>
  );
}
