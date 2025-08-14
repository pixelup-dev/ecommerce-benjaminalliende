/* eslint-disable @next/next/no-img-element */
"use client";
import {
  Roboto_Mono,
  Kalam,
  Oswald,
  Lato,
  Montserrat,
  Poppins,
} from "next/font/google";
import "./globals.css";
import { APIContextProvider } from "@/app/Context/ProductTypeContext";
import { Toaster } from "react-hot-toast";
import { useState, useEffect } from "react";
import axios from "axios";
import { FloatingWhatsApp } from "react-floating-whatsapp";
import { RevalidationProvider } from "@/app/Context/RevalidationContext";
import Head from "next/head";
import { NavbarProvider } from "./Context/NavbarContext";
import { AuthProvider } from "./Context/AuthContext";
import { TypographyProvider } from "@/context/TypographyContext";
import { ColorProvider, useColor } from "@/context/ColorContext";
import MarqueeTOP from "@/components/conMantenedor/MarqueeTOP";
import GoogleAnalytics from "@/components/Core/Google/Analytics";
import PopVisual from "@/components/Core/Popup/Popupvisual";
import { useRouter, usePathname } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { LogoProvider, useLogo } from "@/context/LogoContext";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import DynamicColorStyles from "@/components/Core/Color/DynamicColorStyles";
import { SocialNetworksProvider } from "@/context/SocialNetworksContext";
const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID;

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-poppins",
});
const kalam = Kalam({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-kalam",
});
const lato = Lato({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-lato",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-Montserrat",
});
const oswald = Oswald({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-oswald",
});

const DynamicFavicon = () => {
  const { logo } = useLogo();

  // Función utilitaria para calcular dimensiones del favicon
  const calculateFaviconDimensions = (
    imgWidth: number,
    imgHeight: number,
    canvasSize: number
  ) => {
    const imgAspectRatio = imgWidth / imgHeight;
    const padding = canvasSize * 0.1; // 10% de padding
    const availableSize = canvasSize - padding * 2;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgAspectRatio > 1) {
      // Imagen horizontal: ajustar al ancho disponible con padding
      drawWidth = availableSize;
      drawHeight = drawWidth / imgAspectRatio;
      offsetX = padding;
      offsetY = (canvasSize - drawHeight) / 2;
    } else {
      // Imagen vertical o cuadrada: ajustar al alto disponible con padding
      drawHeight = availableSize;
      drawWidth = drawHeight * imgAspectRatio;
      offsetX = (canvasSize - drawWidth) / 2;
      offsetY = padding;
    }

    // Asegurar que la imagen no sea más pequeña que el espacio disponible
    if (drawWidth < availableSize && drawHeight < availableSize) {
      const scale = availableSize / Math.max(drawWidth, drawHeight);
      drawWidth *= scale;
      drawHeight *= scale;
      offsetX = (canvasSize - drawWidth) / 2;
      offsetY = (canvasSize - drawHeight) / 2;
    }

    return { drawWidth, drawHeight, offsetX, offsetY };
  };

  // Función utilitaria para crear favicon
  const createFavicon = (img: HTMLImageElement, size: number): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    canvas.width = size;
    canvas.height = size;

    // Limpiar el canvas con fondo transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const { drawWidth, drawHeight, offsetX, offsetY } =
      calculateFaviconDimensions(img.width, img.height, size);

    // Aplicar suavizado para mejor calidad
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Dibujar la imagen centrada y escalada
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    return canvas.toDataURL("image/png");
  };

  useEffect(() => {
    if (logo?.mainImage?.url) {
      const processFavicon = async () => {
        try {
          // Crear una imagen para cargar el logo
          const img = new Image();
          img.crossOrigin = "anonymous";

          img.onload = () => {
            // Tamaños estándar para favicons
            const faviconSizes = [16, 32, 48, 64, 128];

            faviconSizes.forEach((size) => {
              const faviconDataUrl = createFavicon(img, size);

              if (faviconDataUrl) {
                // Crear o actualizar el link del favicon
                const linkId = `favicon-${size}`;
                let link = document.getElementById(linkId) as HTMLLinkElement;

                if (!link) {
                  link = document.createElement("link") as HTMLLinkElement;
                  link.id = linkId;
                  link.rel = "icon";
                  link.type = "image/png";
                  document.getElementsByTagName("head")[0].appendChild(link);
                }

                link.href = faviconDataUrl;
              }
            });

            // También crear un favicon genérico para compatibilidad
            const genericFaviconUrl = createFavicon(img, 32);

            if (genericFaviconUrl) {
              // Actualizar el favicon genérico
              let genericLink = document.querySelector(
                "link[rel='shortcut icon']"
              ) as HTMLLinkElement;
              if (!genericLink) {
                genericLink = document.createElement("link") as HTMLLinkElement;
                genericLink.rel = "shortcut icon";
                genericLink.type = "image/png";
                document
                  .getElementsByTagName("head")[0]
                  .appendChild(genericLink);
              }
              genericLink.href = genericFaviconUrl;
            }
          };

          img.onerror = () => {
            // Si falla el procesamiento, usar la imagen original
            const link =
              (document.querySelector(
                "link[rel*='icon']"
              ) as HTMLLinkElement) ||
              (document.createElement("link") as HTMLLinkElement);
            link.type = "image/x-icon";
            link.rel = "shortcut icon";
            link.href = logo.mainImage.url;

            if (!document.querySelector("link[rel*='icon']")) {
              document.getElementsByTagName("head")[0].appendChild(link);
            }
          };

          img.src = logo.mainImage.url;
        } catch (error) {
          console.error("Error al procesar el favicon:", error);
          // Fallback a la imagen original
          const link =
            (document.querySelector("link[rel*='icon']") as HTMLLinkElement) ||
            (document.createElement("link") as HTMLLinkElement);
          link.type = "image/x-icon";
          link.rel = "shortcut icon";
          link.href = logo.mainImage.url;

          if (!document.querySelector("link[rel*='icon']")) {
            document.getElementsByTagName("head")[0].appendChild(link);
          }
        }
      };

      processFavicon();
    }
  }, [logo]);

  return null;
};

// Componente para ocultar contenido hasta que se carguen los colores
const ColorLoader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isColorLoaded } = useColor();

  if (!isColorLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [siteStatus, setSiteStatus] = useState<string | null>(null);
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkSiteStatus = async () => {
      try {
        const id = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const siteResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/sites/${id}`
        );
        setSiteStatus(siteResponse.data.site.statusCode);

        if (
          !pathname.startsWith("/admin") &&
          !pathname.startsWith("/dashboard")
        ) {
          const adminToken = getCookie("AdminTokenAuth");
          let userEmail = null;

          if (adminToken) {
            try {
              const decodedToken = jwtDecode(adminToken.toString());
              const userId = decodedToken.sub;
              const userResponse = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/users/${userId}?siteId=${id}`,
                {
                  headers: {
                    Authorization: `Bearer ${adminToken}`,
                  },
                }
              );
              userEmail = userResponse.data.user.email;
            } catch (error) {
              console.error("Error al obtener el email del usuario:", error);
            }
          }

          // Solo redirigir si no hay usuario logueado Y el sitio no tiene suscripción activa
          if (
            !userEmail &&
            siteResponse.data.site.statusCode !== "SUBSCRIPTION_ACTIVE"
          ) {
            router.push("/subscription-pending");
          }
        }
      } catch (error) {
        console.error("Error al verificar estado del sitio:", error);
      }
    };

    const checkMaintenanceMode = async () => {
      try {
        const id = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const contentBlockId =
          process.env.NEXT_PUBLIC_MANTENIMIENTO_CONTENTBLOCK;
        const maintenanceResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${id}`
        );

        const maintenanceConfig = JSON.parse(
          maintenanceResponse.data.contentBlock.contentText
        );
        setIsMaintenanceMode(maintenanceConfig.enabled || false);

        if (
          maintenanceConfig.enabled &&
          !pathname.startsWith("/admin") &&
          !pathname.startsWith("/dashboard")
        ) {
          router.push("/mantenimiento");
        }
      } catch (error) {
        console.error("Error al verificar modo mantenimiento:", error);
      }
    };

    const checkPopupStatus = async () => {
      try {
        const id = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const popupContentBlockId = process.env.NEXT_PUBLIC_POPUP_CONTENTBLOCK;
        if (popupContentBlockId) {
          const popupResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${popupContentBlockId}?siteId=${id}`
          );
          const popupConfig = JSON.parse(
            popupResponse.data.contentBlock.contentText || '{"enabled": false}'
          );
          setShowPopup(
            popupConfig.enabled &&
              !pathname.startsWith("/admin") &&
              !pathname.startsWith("/dashboard")
          );
        }
      } catch (error) {
        console.error("Error al verificar estado del popup:", error);
      }
    };

    const initializeChecks = async () => {
      try {
        await Promise.all([
          checkSiteStatus(),
          checkMaintenanceMode(),
          checkPopupStatus(),
        ]);
      } catch (error) {
        console.error("Error en las verificaciones iniciales:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeChecks();
  }, [router, pathname]);

  return (
    <html
      lang="es"
      className="light"
    >
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
        <link
          rel="canonical"
          href={`${
            typeof window !== "undefined" ? window.location.origin : ""
          }${pathname}`}
        />

        <meta
          httpEquiv="Content-Language"
          content="es"
        />
        <meta
          name="googlebot"
          content="index, follow"
        />
        <meta
          name="author"
          content="PixelUP"
        />
        <meta
          name="publisher"
          content="PixelUP"
        />

        <meta
          name="robots"
          content="index, follow"
        />
        <meta
          property="og:type"
          content="website"
        />
      </head>
      <body
        className={` ${robotoMono.variable} ${kalam.variable} ${oswald.variable} ${lato.variable} ${montserrat.variable} ${poppins.variable} `}
      >
        <GoogleAnalytics
          GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ""}
        />
        <AuthProvider>
          <RevalidationProvider>
            <NavbarProvider>
              <LogoProvider>
                <TypographyProvider>
                  <ColorProvider>
                    <SocialNetworksProvider>
                      <APIContextProvider SiteId={SiteId}>
                        <DynamicFavicon />
                        <DynamicColorStyles />
                        <Toaster />
                        <NextTopLoader showSpinner={false} />
                        <ColorLoader>
                          <div className="md:min-h-screen ">{children}</div>
                        </ColorLoader>
                        {showPopup && <PopVisual />}
                      </APIContextProvider>
                    </SocialNetworksProvider>
                  </ColorProvider>
                </TypographyProvider>
              </LogoProvider>
            </NavbarProvider>
          </RevalidationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
