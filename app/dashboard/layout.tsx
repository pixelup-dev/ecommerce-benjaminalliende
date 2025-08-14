"use client";

import { useState, useEffect } from "react";
import Loader from "@/components/common/Loader";
import Sidebar from "@/components/Core/Sidebar";
import Header from "@/components/Core/HeaderDashboard";
import { getCookie, deleteCookie, setCookie } from "cookies-next";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { obtenerUsuarioPorID } from "@/app/utils/obtenerUsuarioID";
import { jwtDecode } from "jwt-decode";
import NextTopLoader from "nextjs-toploader";
import { SocialNetworksProvider } from "@/context/SocialNetworksContext";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleLogout = async () => {
    deleteCookie("AdminTokenAuth");
    window.location.href = "/";
  };

  const checkCookie = async () => {
    const token = getCookie("AdminTokenAuth")?.toString();

    if (!token) {
      const currentPath =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : "");
      setCookie("redirectAfterLogin", currentPath);
      router.push("/admin/login");
    } else {
      try {
        const decodedToken: { sub: string } = jwtDecode(token);
        const userId = decodedToken.sub;
        const userData = await obtenerUsuarioPorID(userId, token);

        if (userData.user) {
          setLoading(false);
        } else {
          throw new Error("User data not found");
        }
      } catch (error) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    checkCookie();
    const intervalDuration = parseInt(
      process.env.NEXT_PUBLIC_INTERVAL_DURATION || "6000000",
      10
    );
    const intervalId = setInterval(checkCookie, intervalDuration);
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    checkCookie();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (loading) {
    return <Loader />;
  }

  return (
    <SocialNetworksProvider>
      <div className="dark:bg-boxdark-2 dark:text-bodydark bg-[#e9f0ee]">
        <div className="flex h-screen overflow-hidden">
          <Sidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <NextTopLoader showSpinner={false} />
          {/*           <Header
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
            /> */}
          <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
            <main className="mx-auto w-full">{children}</main>
          </div>
        </div>
      </div>
    </SocialNetworksProvider>
  );
}
