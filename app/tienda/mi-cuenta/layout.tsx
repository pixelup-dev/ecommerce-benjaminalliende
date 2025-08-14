"use client";
import { useState, useEffect } from "react";
import Loader from "@/components/common/Loader";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const Token = getCookie("ClientTokenAuth");

  useEffect(() => {
    // Simular una carga inicial con un delay de 1 segundo
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    const checkCookie = () => {
      const token = getCookie("ClientTokenAuth");
      if (!token) {
        router.push("/tienda"); // Redirigir al home si no hay token
      }
    };

    checkCookie();

    // Obtener la duración del intervalo desde la variable de entorno
    const intervalDuration = parseInt(
      process.env.NEXT_PUBLIC_INTERVAL_DURATION || "10800000",
      10
    );

    const intervalId = setInterval(checkCookie, intervalDuration);

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, [router]);

  // Mostrar loader mientras se verifica el token
  if (loading) {
    return <Loader />;
  }

  // Si no hay token, redirigir al home
  if (!Token) {
    router.push("/tienda");
    return <Loader />; // Puedes mostrar un loader mientras se redirige
  }

  // Si hay token y no se está cargando, mostrar el contenido
  return (
    <div className="bg-gray-50">
      <div className="flex overflow-hidden">
        <div className="mx-auto w-full">{children}</div>
      </div>
    </div>
  );
}
