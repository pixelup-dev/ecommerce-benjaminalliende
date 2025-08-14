import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";

const FreeShippingOption: React.FC<any> = ({}) => {
  const [freeShippingOption, setFreeShippingOption] = useState<{
    id: string;
    value: string | null;
  } | null>(null);
  const [newValue, setNewValue] = useState<string>("");
  const [enableMinAmount, setEnableMinAmount] = useState<boolean>(true);
  const [hasProPlan, setHasProPlan] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>("");

  const token = getCookie("AdminTokenAuth");

  useEffect(() => {
    const fetchOption = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/options?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Filtrar la opción de "FREE_SHIPPING_MINIMUM_AMOUNT"
        const option = response.data.options.find(
          (opt: any) => opt.code === "FREE_SHIPPING_MINIMUM_AMOUNT"
        );

        if (option) {
          const isEnabled = option.value !== null;
          setEnableMinAmount(isEnabled);
          setFreeShippingOption({
            id: option.id,
            value: option.value || "",
          });
          setNewValue(isEnabled ? option.value || "" : "");
        }
      } catch (error) {
        console.error("Error fetching free shipping option:", error);
        toast.error("Error al obtener la opción de envío gratis.");
      }
    };

    fetchOption();
    checkSubscriptionPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // Verificar si tiene plan PRO
      const proSubscription = activeSubscriptions.find((sub: any) =>
        sub.name.toLowerCase().includes("pro")
      );

      // Determinar el plan actual
      let planName = "Sin suscripción activa";
      if (activeSubscriptions.length > 0) {
        const subscription = activeSubscriptions[0]; // Tomar la primera suscripción activa
        if (subscription.name.toLowerCase().includes("pro")) {
          planName = "Plan PRO";
        } else if (subscription.name.toLowerCase().includes("avanzado")) {
          planName = "Plan Avanzado";
        } else if (subscription.name.toLowerCase().includes("inicia")) {
          planName = "Plan Inicia";
        } else {
          planName = subscription.name;
        }
      }

      setHasProPlan(!!proSubscription);
      setCurrentPlan(planName);
    } catch (error) {
      console.error("Error verificando plan de suscripción:", error);
      setHasProPlan(false);
      setCurrentPlan("Error al verificar plan");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const numericValue = value.replace(/[^0-9]/g, "");
    setNewValue(numericValue);
  };
  const updateContentBlock = async (value: string | null) => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_MONTOENVIOGRATIS_CONTENTBLOCK;
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "Monto Envío Gratis",
          contentText: value || "",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.error("Error updating content block:", error);
      toast.error("Error al actualizar el content block de envío gratis.");
    }
  };

  const handleToggleChange = async (checked: boolean) => {
    setEnableMinAmount(checked);

    if (!checked) {
      // Si se desactiva el switch, actualizar automáticamente
      if (!freeShippingOption) return;

      try {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/options/${freeShippingOption.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            value: null,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        await updateContentBlock(null);
        toast.success("Envío gratis sin monto mínimo configurado exitosamente.");
        setFreeShippingOption((prev) => ({
          id: prev ? prev.id : "",
          value: null,
        }));
      } catch (error) {
        console.error("Error updating free shipping option:", error);
        toast.error("Error al actualizar la configuración de envío gratis.");
        // Revertir el switch si hay error
        setEnableMinAmount(true);
      }
    }
  };

  const handleUpdate = async () => {
    if (!freeShippingOption) return;

    const valueToSend = enableMinAmount ? newValue : null;

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/options/${freeShippingOption.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          value: valueToSend,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      await updateContentBlock(valueToSend);
      toast.success("Configuración de envío gratis actualizada exitosamente.");
      setFreeShippingOption((prev) => ({
        id: prev ? prev.id : "",
        value: valueToSend,
      }));
    } catch (error) {
      console.error("Error updating free shipping option:", error);
      toast.error("Error al actualizar la configuración de envío gratis.");
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuración de Envío Gratis
      </h2>
      
      {/* Información del plan actual */}


      {/* Mensaje de restricción para usuarios sin plan PRO */}
      {!subscriptionLoading && !hasProPlan && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <div className=" text-sm text-red-700">
                <p>La función Envío Gratis es exclusiva del Plan Pro. Puedes actualizar tu plan en la sección <a href="/dashboard/suscripciones/estado" rel="noopener noreferrer" className="underline"> Suscripción.</a> </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {freeShippingOption ? (
        <div className={`space-y-6 ${!hasProPlan ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between min-h-[2rem]">
                <label className="text-lg font-medium text-gray-700">
                  Establecer monto mínimo para envío gratis
                </label>
                <label className={`relative inline-flex items-center ${hasProPlan ? 'cursor-pointer' : 'cursor-not-allowed'}`}>
                  <input
                    type="checkbox"
                    checked={enableMinAmount}
                    onChange={(e) => handleToggleChange(e.target.checked)}
                    disabled={!hasProPlan}
                    className="sr-only peer"
                  />
                  <div className={`w-14 h-7 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${
                    hasProPlan 
                      ? 'bg-gray-200 peer-checked:bg-primary' 
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}></div>
                </label>
              </div>

              {enableMinAmount && (
                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Monto mínimo para envío gratis:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newValue}
                      onChange={handleValueChange}
                      disabled={!hasProPlan}
                      className={`block w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                        !hasProPlan ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      placeholder="Ingresa el monto mínimo"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {enableMinAmount && (
            <button
              onClick={handleUpdate}
              disabled={!hasProPlan}
              className={`w-full transition-colors duration-200 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg ${
                hasProPlan 
                  ? 'bg-primary hover:bg-secondary' 
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Actualizar monto mínimo
            </button>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default FreeShippingOption;
