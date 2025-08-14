"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { useTypography } from "@/context/TypographyContext";

interface FontOption {
  value: string;
  label: string;
  className: string;
}

const fontOptions: FontOption[] = [
  { value: "montserrat", label: "Montserrat", className: "font-montserrat" },
  { value: "poppins", label: "Poppins", className: "font-poppins" },
  { value: "roboto-mono", label: "Roboto Mono", className: "font-roboto-mono" },
  { value: "kalam", label: "Kalam", className: "font-kalam" },
  { value: "lato", label: "Lato", className: "font-lato" },
  { value: "oswald", label: "Oswald", className: "font-oswald" },
];

// Lista de fuentes válidas para validación
const validFonts = ['montserrat', 'poppins', 'roboto-mono', 'kalam', 'lato', 'oswald'];

const Tipografia: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasInvalidValue, setHasInvalidValue] = useState<boolean>(false);
  const [selectedFont, setSelectedFont] = useState<string>("montserrat");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const { currentFont, setCurrentFont } = useTypography();

  const token = getCookie("AdminTokenAuth");

  useEffect(() => {
    fetchTypographyConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTypographyConfig = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_TIPOGRAFIA_CONTENTBLOCK;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.contentBlock;
      const font = data.contentText || "montserrat";
      
      // Verificar si el valor es válido
      if (!validFonts.includes(font)) {
        setHasInvalidValue(true);
        console.warn(`Valor inválido en content block: "${font}". Se usará Montserrat por defecto.`);
        setCurrentFont("montserrat");
        setSelectedFont("montserrat");
      } else {
        setHasInvalidValue(false);
        setCurrentFont(font);
        setSelectedFont(font);
      }
    } catch (error) {
      console.error("Error al obtener la configuración de tipografía:", error);
      toast.error("Error al obtener la configuración de tipografía.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue);
  };

  const handleUpdateTypography = async () => {
    if (selectedFont === currentFont) {
      toast("La tipografía seleccionada ya está aplicada.");
      return;
    }

    setIsUpdating(true);
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_TIPOGRAFIA_CONTENTBLOCK;
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "tipografia",
          contentText: selectedFont,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCurrentFont(selectedFont);
      setHasInvalidValue(false);
      toast.success("Tipografía actualizada exitosamente.");

    } catch (error) {
      console.error("Error al actualizar la tipografía:", error);
      toast.error("Error al actualizar la tipografía.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentFontOption = () => {
    return fontOptions.find(option => option.value === selectedFont) || fontOptions[0];
  };

  const hasChanges = selectedFont !== currentFont;

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuración de Tipografía
      </h2>
      {!isLoading ? (
        <div className="space-y-6">
          {hasInvalidValue && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Configuración inicial detectada
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      El content block contenía un valor inicial. Se ha configurado Montserrat como fuente por defecto.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between min-h-[2rem] mb-4">
                <label className="text-lg font-medium text-gray-700">
                  Fuente del sitio
                </label>
                {hasChanges && (
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    Cambios pendientes
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar tipografía
                  </label>
                  <select
                    value={selectedFont}
                    onChange={(e) => handleFontChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  >
                    {fontOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Vista previa:
                  </h3>
                  <div className={`text-lg ${getCurrentFontOption().className}`}>
                    <p className="mb-2">Texto de ejemplo con {getCurrentFontOption().label}</p>
                    <p className="text-sm text-gray-600">
                      ABCDEFGHIJKLMNOPQRSTUVWXYZ
                    </p>
                    <p className="text-sm text-gray-600">
                      abcdefghijklmnopqrstuvwxyz
                    </p>
                    <p className="text-sm text-gray-600">
                      0123456789
                    </p>
                  </div>
                </div>

                <div className="flex pt-4">
                  <button
                    onClick={handleUpdateTypography}
                    disabled={!hasChanges || isUpdating}
                    className={`w-full px-6 py-2 rounded-md font-medium transition-colors ${
                      hasChanges && !isUpdating
                        ? 'bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/20'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isUpdating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Actualizando...
                      </div>
                    ) : (
                      'Actualizar tipografía'
                    )}
                  </button>
                </div>
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

export default Tipografia;
