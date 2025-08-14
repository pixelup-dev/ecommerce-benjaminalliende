/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import Joyride, { CallBackProps, Step } from "react-joyride";
import { useRouter } from "next/navigation";

const InicioDashboard = () => {
  const [iframeError, setIframeError] = useState(false);
  const [runTutorial, setRunTutorial] = useState(false);
  const [tutorialSteps, setTutorialSteps] = useState<Step[]>([]);
  const router = useRouter();
  const isDevelopment = process.env.NODE_ENV === "development";
  const targetUrl = isDevelopment
    ? "https://www.development.pixelup.cl/"
    : "https://www.pixelup.cl/";

  // Definir los pasos del tutorial
  useEffect(() => {
    setTutorialSteps([
      {
        target: ".sidebar-logo",
        content:
          "Este es el logo de tu Sitio Web. Haz clic aquí para volver al inicio.",
        disableBeacon: true,
      },
      {
        target: ".sidebar-menu",
        content:
          "Aquí encontrarás todas las opciones de navegación del dashboard.",
        disableBeacon: true,
      },
      /*       {
        target: "a[href='/dashboard/']",
        content: "Inicio: Aquí podrás ver el resumen general de tu tienda.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/pixelcoins']",
        content: "PixelCoins: Gestiona tus monedas virtuales y recompensas.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/tienda-pixelup']",
        content: "Tienda Pixel Up: Accede a tu tienda online.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/ventas']",
        content: "Informes: Visualiza el rendimiento de tu tienda.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/pedidos']",
        content: "Pedidos: Gestiona todos los pedidos de tu tienda.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/content-blocks']",
        content: "Contenido: Administra el contenido de tu tienda.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/ofertas']",
        content: "Promociones: Crea y gestiona ofertas y cupones.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/zona-repartos']",
        content: "Zona de Repartos: Configura las áreas de entrega.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/SEO']",
        content: "SEO: Optimiza tu tienda para los motores de búsqueda.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/mailing']",
        content: "Mailing: Gestiona tus campañas de email marketing.",
        disableBeacon: true,
      },
      {
        target: "a[href='/dashboard/blog']",
        content: "Blog: Administra el contenido de tu blog.",
        disableBeacon: true,
      }, */
      {
        target: ".sidebar-user",
        content:
          "Tu perfil de usuario. Aquí puedes acceder a la configuración y cerrar sesión.",
        disableBeacon: true,
      },
      {
        target: ".sidebar-store-link",
        content: "Haz clic aquí para ir a la tienda.",
        disableBeacon: true,
      },
    ]);
  }, []);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      setRunTutorial(false);

      // Restaurar el scroll del Sidebar después de completar el tutorial
      setTimeout(() => {
        const sidebarElement = document.querySelector(
          ".sidebar-scroll"
        ) as HTMLElement;
        if (sidebarElement) {
          sidebarElement.classList.remove("overflow-hidden");
          sidebarElement.style.overflow = "auto";
          sidebarElement.style.height = "auto";
        }
      }, 100);
    }
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  const openInNewWindow = () => {
    window.open(targetUrl, "_blank");
  };

  const startTutorial = () => {
    // Asegurarse de que el Sidebar esté expandido antes de iniciar el tutorial
    const sidebarElement = document.querySelector(
      ".sidebar-scroll"
    ) as HTMLElement;
    if (sidebarElement) {
      sidebarElement.classList.add("overflow-hidden");
      sidebarElement.style.overflow = "auto";
      sidebarElement.style.height = "auto";
    }

    setRunTutorial(true);
  };

  if (iframeError) {
    return (
      <>
        <title>PixelUP - Dashboard</title>
        <div className="w-full h-screen flex flex-col items-center justify-center bg-gray-50">
          <div className="text-center max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No se pudo cargar el contenido en esta ventana
            </h2>
            <p className="text-gray-600 mb-6">
              Por razones de seguridad, el contenido debe abrirse en una nueva
              ventana.
            </p>
            <button
              onClick={openInNewWindow}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Abrir en nueva ventana
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="w-full h-screen relative">
      <title>PixelUP - Dashboard</title>

      {/* Botón de tutorial */}
      <button
        onClick={startTutorial}
        className="absolute hidden top-4 right-12 bg-primary text-white px-4 py-2 rounded-lg shadow-md hover:bg-primary/90 transition-colors flex items-center gap-2 z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        Tutorial
      </button>

      {/* Componente Joyride para el tutorial */}
      <Joyride
        steps={tutorialSteps}
        run={runTutorial}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        styles={{
          options: {
            primaryColor: "#4F46E5",
            zIndex: 10000,
            overlayColor: "rgba(0, 0, 0, 0.5)",
            arrowColor: "#4F46E5",
            backgroundColor: "#ffffff",
            textColor: "#333333",
          },
          tooltip: {
            borderRadius: "8px",
            fontSize: "14px",
          },
          buttonNext: {
            backgroundColor: "#4F46E5",
            fontSize: "14px",
            padding: "8px 16px",
          },
          buttonBack: {
            color: "#4F46E5",
            marginRight: "10px",
            fontSize: "14px",
          },
          buttonSkip: {
            color: "#666666",
            fontSize: "14px",
          },
        }}
        callback={handleJoyrideCallback}
        locale={{
          last: "Finalizar",
          skip: "Saltar tutorial",
          next: "Siguiente",
          back: "Anterior",
        }}
        disableOverlayClose={true}
        spotlightClicks={false}
        disableScrolling={false}
        scrollToFirstStep={true}
        spotlightPadding={5}
        floaterProps={{
          disableAnimation: true,
        }}
      />

      <iframe
        src="https://welcome-client-git-development-pixelups-projects.vercel.app/home-clientes-dashboard"
        className="w-full h-full border-0"
        onError={handleIframeError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default InicioDashboard;
