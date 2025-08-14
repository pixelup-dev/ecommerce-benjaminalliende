"use client";
import React, { useState, useRef } from "react";
import dynamic from "next/dynamic";
import { useSubscriptionPlan } from "@/hooks/useSubscriptionPlan";

// Importación dinámica para evitar problemas de SSR
const Footer01BO = dynamic(
  () => import("@/components/PIXELUP/Footer/FooterBO"),
  { ssr: false }
);

export default function FooterConfig() {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Usar el hook personalizado para verificación de suscripción
  const {
    hasAdvancedOrProPlan,
    currentPlan,
    loading: subscriptionLoading,
    error: subscriptionError,
  } = useSubscriptionPlan();

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const newState = {
        ...prev,
        [sectionId]: !prev[sectionId],
      };

      if (newState[sectionId] && sectionRefs.current[sectionId]) {
        setTimeout(() => {
          sectionRefs.current[sectionId]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }

      return newState;
    });
  };

  return (
    <section className="gap-4 flex flex-col py-10 mx-4">
      <title>Content block - Footer</title>

      {/* Panel de configuración del footer */}
      <div className="rounded-sm border w-full border-stroke bg-white shadow-default dark:border-black dark:bg-black">
        <div className="p-6">
          <Footer01BO planType={hasAdvancedOrProPlan ? "advanced" : "basic"} />
        </div>
      </div>

      {/* Mensaje informativo para Plan Inicia */}
      {!subscriptionLoading && !hasAdvancedOrProPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm text-blue-700">
                <p>
                  <strong>Plan Inicia:</strong> Puedes configurar colores
                  básicos y redes sociales. Para acceso completo a todas las
                  opciones (enlaces personalizados, newsletter, plantillas de
                  diseño, etc.), actualiza a{" "}
                  <a
                    href="/dashboard/suscripciones/estado"
                    rel="noopener noreferrer"
                    className="underline font-semibold"
                  >
                    Plan Avanzado o Pro
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje informativo para Plan Avanzado y Pro */}
      {!subscriptionLoading && hasAdvancedOrProPlan && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm text-green-700">
                <p>
                  <strong>Plan {currentPlan}:</strong> Tienes acceso completo a
                  todas las funcionalidades del footer, incluyendo la selección
                  de plantillas de diseño, enlaces personalizados y
                  configuración de newsletter.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
