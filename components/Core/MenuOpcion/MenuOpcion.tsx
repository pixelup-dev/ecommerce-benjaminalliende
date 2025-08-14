"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";

const MenuOpcion: React.FC = () => {
  const [menuOption, setMenuOption] = useState<{
    id: string;
    contentText: string | null;
  } | null>(null);
  const [enableMenu, setEnableMenu] = useState<boolean>(true);

  const token = getCookie("AdminTokenAuth");

  useEffect(() => {
    fetchMenuOption();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMenuOption = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_MENUOPTION_CONTENTBLOCK;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.contentBlock;
      const isEnabled = data.contentText !== "0" && data.contentText !== null;
      setEnableMenu(isEnabled);
      setMenuOption(data);
    } catch (error) {
      console.error("Error al obtener la configuración del menú:", error);
      toast.error("Error al obtener la configuración del menú.");
    }
  };

  const handleToggleChange = async (checked: boolean) => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_MENUOPTION_CONTENTBLOCK;
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "menu",
          contentText: checked ? "1" : "0",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setEnableMenu(checked);
      toast.success("Configuración del menú actualizada exitosamente.");
      
      // Recargar la página después de un breve retraso
      setTimeout(() => {
        window.location.reload();
      }, 1000); // Esperar 1 segundo para que el usuario vea el mensaje de éxito

    } catch (error) {
      console.error("Error al actualizar la configuración del menú:", error);
      toast.error("Error al actualizar la configuración del menú.");
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuración del Menú
      </h2>
      {menuOption ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between min-h-[2rem]">
                <label className="text-lg font-medium text-gray-700">
                  Menú desplegable
                </label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enableMenu}
                    onChange={(e) => handleToggleChange(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
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

export default MenuOpcion;
