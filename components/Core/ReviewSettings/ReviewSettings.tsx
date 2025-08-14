"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader";

interface ReviewSettingsProps {
  // Props si las necesitas
}

const ReviewSettings: React.FC<ReviewSettingsProps> = () => {
  const [isReviewEnabled, setIsReviewEnabled] = useState<boolean>(false);
  const [originalIsReviewEnabled, setOriginalIsReviewEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [hasValidPlan, setHasValidPlan] = useState<boolean>(false);
  const [hasIniciaPlan, setHasIniciaPlan] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>("");

  const token = getCookie("AdminTokenAuth");

  // Función para detectar si hay cambios
  const hasChanges = () => {
    return isReviewEnabled !== originalIsReviewEnabled;
  };

  // Verificar el plan de suscripción
  const checkSubscriptionPlan = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/subscriptions?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Buscar suscripciones activas
      const activeSubscriptions = response.data.subscriptions.filter(
        (sub: any) => sub.statusCode === "ACTIVE" || sub.statusCode === "EXPIRED"
      );

      if (activeSubscriptions.length > 0) {
        const subscription = activeSubscriptions[0];
        const planName = subscription.name.toLowerCase();
        
        // Determinar el plan actual
        let planDisplayName = "Plan Inicia";
        if (planName.includes("pro")) {
          planDisplayName = "Plan PRO";
        } else if (planName.includes("avanzado")) {
          planDisplayName = "Plan Avanzado";
        } else if (planName.includes("inicia")) {
          planDisplayName = "Plan Inicia";
        } else {
          planDisplayName = subscription.name;
        }

        setCurrentPlan(planDisplayName);

        // Verificar si tiene plan INICIA
        const hasInicia = planName.includes("inicia");
        setHasIniciaPlan(hasInicia);

        // Verificar si tiene un plan válido (superior al "inicia")
        const hasValidPlan = planName.includes("avanzado") || planName.includes("pro");
        setHasValidPlan(hasValidPlan);

        if (hasValidPlan || hasInicia) {
          // Cargar la configuración actual para cualquier plan
          await loadReviewSettings();
          
          // Si tiene plan INICIA, automáticamente deshabilitar y guardar
          if (hasInicia) {
            setIsReviewEnabled(false);
            // Guardar automáticamente la configuración deshabilitada
            await saveReviewSettingsForIniciaPlan();
          }
        }
      } else {
        setCurrentPlan("Sin suscripción activa");
        setHasValidPlan(false);
        setHasIniciaPlan(false);
      }
    } catch (error) {
      console.error("Error verificando plan de suscripción:", error);
      toast.error("Error al verificar el plan de suscripción");
      setHasValidPlan(false);
      setHasIniciaPlan(false);
    } finally {
      setLoading(false);
    }
  };

  // Cargar configuración actual de reviews
  const loadReviewSettings = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_REVIEWSPRODUCTOS_CONTENTBLOCK || "REVIEWSPRODUCTOS";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.contentBlock?.contentText) {
        const reviewConfig = JSON.parse(response.data.contentBlock.contentText);
        setIsReviewEnabled(reviewConfig.enabled);
        setOriginalIsReviewEnabled(reviewConfig.enabled); // Guardar el valor original
      } else {
        // Si no existe la configuración, usar valor por defecto (deshabilitado)
        setIsReviewEnabled(false);
        setOriginalIsReviewEnabled(false); // Guardar el valor por defecto
      }
    } catch (error) {
      console.error("Error cargando configuración de reviews:", error);
      // Si no existe la configuración, usar valor por defecto
      setIsReviewEnabled(false);
      setOriginalIsReviewEnabled(false); // Guardar el valor por defecto
    }
  };

  // Guardar configuración de reviews automáticamente para plan INICIA
  const saveReviewSettingsForIniciaPlan = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_REVIEWSPRODUCTOS_CONTENTBLOCK || "REVIEWSPRODUCTOS";
      const reviewConfig = {
        enabled: false, // Siempre false para plan INICIA
        updatedAt: new Date().toISOString(),
        reason: "Plan Inicia - Reviews automáticamente deshabilitados"
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "reviews-productos",
          contentText: JSON.stringify(reviewConfig),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("Reviews automáticamente deshabilitados para plan INICIA");
        toast.success("Configuración automática aplicada para Plan Inicia");
        // Actualizar el valor original después de guardar automáticamente
        setOriginalIsReviewEnabled(false);
      }
    } catch (error) {
      console.error("Error guardando configuración automática para plan INICIA:", error);
      toast.error("Error al aplicar configuración automática");
    }
  };

  // Guardar configuración de reviews
  const saveReviewSettings = async () => {
    if (!hasValidPlan) {
      toast.error("No tienes un plan válido para acceder a esta funcionalidad");
      return;
    }

    try {
      setSaving(true);

      const contentBlockId = process.env.NEXT_PUBLIC_REVIEWSPRODUCTOS_CONTENTBLOCK || "REVIEWSPRODUCTOS";
      const reviewConfig = {
        enabled: isReviewEnabled,
        updatedAt: new Date().toISOString()
      };

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "reviews-productos",
          contentText: JSON.stringify(reviewConfig),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(`Reviews de productos ${isReviewEnabled ? 'habilitados' : 'deshabilitados'} correctamente`);
        // Actualizar el valor original después de guardar exitosamente
        setOriginalIsReviewEnabled(isReviewEnabled);
      }
    } catch (error) {
      console.error("Error guardando configuración de reviews:", error);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    checkSubscriptionPlan();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <Loader />
      </div>
    );
  }

  if (!hasValidPlan && !hasIniciaPlan) {
    return (
      <div className="p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Configuración de Reviews de Productos
        </h2>
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Función no disponible
          </h3>
          <p className="text-sm text-gray-500">
            Para acceder a esta función, necesitas un plan Avanzado o PRO.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuración de Reviews de Productos
      </h2>
      
      {/* Mensaje de restricción para plan Inicia */}
      {hasIniciaPlan && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <div className="text-sm text-red-700">
                <p>La función Reviews de Productos es exclusiva del Plan Avanzado y Plan Pro. Puedes actualizar tu plan en la sección <a href="/dashboard/suscripciones/estado" rel="noopener noreferrer" className="underline"> Suscripción.</a> </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between min-h-[2rem]">
              <div className="flex-1">
                <label className="text-lg font-medium text-gray-700">
                  Habilitar Reviews de Productos
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  Permite a los clientes calificar y comentar sobre los productos comprados
                </p>
              </div>
              <label className={`relative inline-flex items-center ${hasIniciaPlan ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                <input
                  type="checkbox"
                  checked={isReviewEnabled}
                  onChange={(e) => !hasIniciaPlan && setIsReviewEnabled(e.target.checked)}
                  disabled={hasIniciaPlan}
                  className="sr-only peer"
                />
                <div className={`w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary ${hasIniciaPlan ? 'opacity-50' : ''}`}></div>
              </label>
            </div>
          </div>
        </div>

        {!hasIniciaPlan && (
          <div className="flex justify-center w-full">
            <button
              onClick={saveReviewSettings}
              disabled={saving || !hasChanges()}
              className={`w-full px-4 py-2 rounded-md font-medium transition-colors ${
                hasChanges() && !saving
                  ? 'bg-primary text-white hover:bg-primary/80 focus:ring-2 focus:ring-primary/20'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Guardando...
                </>
              ) : (
                'Guardar Configuración'
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSettings; 