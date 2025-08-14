"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie, setCookie } from "cookies-next";
import toast from "react-hot-toast";
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const Mantenimiento: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState<{
    id: string;
    contentText: string | null;
  } | null>(null);
  const [enableMaintenance, setEnableMaintenance] = useState<boolean>(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('');
  const [unsavedMessage, setUnsavedMessage] = useState<string>('');
  const [unsavedMaintenance, setUnsavedMaintenance] = useState<boolean>(false);

  const token = getCookie("AdminTokenAuth");

  useEffect(() => {
    fetchMaintenanceMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setUnsavedMessage(maintenanceMessage);
    setUnsavedMaintenance(enableMaintenance);
  }, [maintenanceMessage, enableMaintenance]);

  const fetchMaintenanceMode = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_MANTENIMIENTO_CONTENTBLOCK;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.contentBlock;
      let maintenanceConfig;
      try {
        maintenanceConfig = JSON.parse(data.contentText || '{"enabled": false, "message": "Estamos realizando mejoras en el sitio. Volveremos pronto."}');
      } catch {
        maintenanceConfig = { enabled: false, message: "" };
      }

      setEnableMaintenance(maintenanceConfig.enabled);
      setMaintenanceMessage(maintenanceConfig.message);
      setMaintenanceMode(data);
    } catch (error) {
      console.error("Error al obtener la configuración de mantenimiento:", error);
      toast.error("Error al obtener la configuración de mantenimiento.");
    }
  };

  const handleToggleChange = async (checked: boolean) => {
    setUnsavedMaintenance(checked);
    
    if (!checked) {
      try {
        const contentBlockId = process.env.NEXT_PUBLIC_MANTENIMIENTO_CONTENTBLOCK;
        const maintenanceConfig = {
          enabled: false,
          message: maintenanceMessage
        };

        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            title: "maintenance",
            contentText: JSON.stringify(maintenanceConfig),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setEnableMaintenance(false);
        toast.success("Modo mantenimiento desactivado exitosamente.");
      } catch (error) {
        console.error("Error al actualizar la configuración de mantenimiento:", error);
        toast.error("Error al actualizar la configuración de mantenimiento.");
        setUnsavedMaintenance(true);
      }
    }
  };

  const handleMessageChange = (content: string) => {
    setUnsavedMessage(content);
  };

  const handleSaveMessage = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_MANTENIMIENTO_CONTENTBLOCK;
      const maintenanceConfig = {
        enabled: unsavedMaintenance,
        message: unsavedMessage
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "maintenance",
          contentText: JSON.stringify(maintenanceConfig),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setEnableMaintenance(unsavedMaintenance);
      setMaintenanceMessage(unsavedMessage);
      toast.success("Configuración de mantenimiento actualizada exitosamente.");
    } catch (error) {
      console.error("Error al actualizar la configuración de mantenimiento:", error);
      toast.error("Error al actualizar la configuración de mantenimiento.");
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuración del Modo Mantenimiento
      </h2>
      {maintenanceMode ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between min-h-[2rem]">
                <label className="text-lg font-medium text-gray-700">
                  Modo Mantenimiento
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={unsavedMaintenance}
                    onChange={(e) => handleToggleChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>
          {unsavedMaintenance && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <label className="block text-lg font-medium text-gray-700 mb-4">
                Mensaje de Mantenimiento
              </label>
              <ReactQuill
                value={unsavedMessage}
                onChange={handleMessageChange}
                className="bg-white"
                theme="snow"
              />
              <div className="mt-4 flex justify-center w-full">
                <button
                  onClick={handleSaveMessage}
                  className="w-full max-w-md px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                >
                  Guardar y Actualizar Modo Mantenimiento
                </button>
              </div>
            </div>
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

export default Mantenimiento;
