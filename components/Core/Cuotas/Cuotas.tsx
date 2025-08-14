"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";

const Cuotas: React.FC = () => {
  const [cuotasOption, setCuotasOption] = useState<{
    id: string;
    contentText: string | null;
  } | null>(null);
  const [enableCuotas, setEnableCuotas] = useState<boolean>(true);
  const [selectedValue, setSelectedValue] = useState<string>("");
  const [pendingChanges, setPendingChanges] = useState<{
    enabled: boolean;
    installments: string;
  } | null>(null);

  const token = getCookie("AdminTokenAuth");

  useEffect(() => {
    fetchCuotasOption();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCuotasOption = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_CUOTAS_CONTENTBLOCK;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.contentBlock;
      let cuotasConfig;
      try {
        cuotasConfig = JSON.parse(data.contentText || '{"enabled": false, "installments": "3"}');
      } catch {
        cuotasConfig = { enabled: false, installments: "3" };
      }

      setEnableCuotas(cuotasConfig.enabled);
      setCuotasOption(data);
      setSelectedValue(cuotasConfig.installments);
    } catch (error) {
      console.error("Error al obtener la configuración de cuotas:", error);
      toast.error("Error al obtener la configuración de cuotas.");
    }
  };

  const handleToggleChange = async (checked: boolean) => {
    setEnableCuotas(checked);
    if (!checked) {
      // Si se desactiva, actualizar automáticamente
      await updateCuotas("0", false);
    } else {
      // Si se activa, mostrar el botón de actualizar
      setPendingChanges({
        enabled: true,
        installments: selectedValue
      });
    }
  };

  const handleValueChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedValue(value);
    
    if (enableCuotas && value !== "") {
      setPendingChanges({
        enabled: true,
        installments: value
      });
    }
  };

  const handleUpdate = async () => {
    if (!pendingChanges) return;
    
    await updateCuotas(pendingChanges.installments, pendingChanges.enabled);
    setPendingChanges(null);
  };

  const updateCuotas = async (value: string, enabled: boolean) => {
    if (!cuotasOption) return;

    try {
      const contentBlockId = process.env.NEXT_PUBLIC_CUOTAS_CONTENTBLOCK;
      const cuotasConfig = {
        enabled: enabled,
        installments: value
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "cuotas",
          contentText: JSON.stringify(cuotasConfig),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Configuración de cuotas actualizada exitosamente.");
      setCuotasOption((prev) => ({
        ...prev!,
        contentText: JSON.stringify(cuotasConfig),
      }));
    } catch (error) {
      console.error("Error al actualizar las cuotas:", error);
      toast.error("Error al actualizar la configuración de cuotas.");
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Visualización de Cuotas Sin Interés
      </h2>
      {cuotasOption ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between min-h-[2rem]">
                <label className="text-lg font-medium text-gray-700">
                  Habilitar información
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableCuotas}
                    onChange={(e) => handleToggleChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {enableCuotas && (
                <div className="mt-6">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    Número de cuotas:
                  </label>
                  <select
                    value={selectedValue}
                    onChange={handleValueChange}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    <option value="">Seleccione cantidad de cuotas</option>
                    <option value="3">3 cuotas</option>
                    <option value="6">6 cuotas</option>
                    <option value="12">12 cuotas</option>
                  </select>
                </div>
              )}

              {pendingChanges && enableCuotas && (
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                  >
                    Actualizar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default Cuotas;
