"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { useColor } from "@/context/ColorContext";

const Color: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasInvalidValue, setHasInvalidValue] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>("purple");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [customHexColor, setCustomHexColor] = useState<string>("#");
  const [useCustomColor, setUseCustomColor] = useState<boolean>(false);
  const [selectedRadius, setSelectedRadius] = useState<string>("soft");
  const [isUpdatingRadius, setIsUpdatingRadius] = useState<boolean>(false);
  const { 
    currentColor, 
    setCurrentColor, 
    colorOptions, 
    getColorValues, 
    currentRadius, 
    setCurrentRadius, 
    radiusOptions, 
    isValidHex 
  } = useColor();

  const token = getCookie("AdminTokenAuth");

  useEffect(() => {
    fetchColorConfig();
    fetchRadiusConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchColorConfig = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_COLORSITIO_CONTENTBLOCK;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.contentBlock;
      const color = data.contentText || "purple";
      
      // Verificar si el valor es válido
      const validColors = colorOptions.map(option => option.value);
      if (validColors.includes(color) || isValidHex(color)) {
        setCurrentColor(color);
        setSelectedColor(color);
        if (isValidHex(color)) {
          setCustomHexColor(color);
          setUseCustomColor(true);
        } else {
          setUseCustomColor(false);
        }
      } else {
        setHasInvalidValue(true);
        console.warn(`Valor inválido en content block: "${color}". Se usará Púrpura por defecto.`);
        setCurrentColor("purple");
        setSelectedColor("purple");
        setUseCustomColor(false);
      }
    } catch (error) {
      console.error("Error al obtener la configuración de color:", error);
      toast.error("Error al obtener la configuración de color.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRadiusConfig = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_RADIUS_CONTENTBLOCK;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.contentBlock;
      const radius = data.contentText || "soft";
      
      // Verificar si el valor es válido
      const validRadius = radiusOptions.map(option => option.value);
      if (validRadius.includes(radius)) {
        setCurrentRadius(radius);
        setSelectedRadius(radius);
      } else {
        console.warn(`Valor inválido en content block: "${radius}". Se usará Suave por defecto.`);
        setCurrentRadius("soft");
        setSelectedRadius("soft");
      }
    } catch (error) {
      console.error("Error al obtener la configuración de radius:", error);
      toast.error("Error al obtener la configuración de radius.");
    }
  };

  const handleColorChange = (colorValue: string) => {
    if (colorValue === "custom") {
      setUseCustomColor(true);
      setSelectedColor("custom");
    } else {
      setUseCustomColor(false);
      setSelectedColor(colorValue);
    }
  };

  const handleHexColorChange = (hexValue: string) => {
    setCustomHexColor(hexValue);
    if (isValidHex(hexValue)) {
      setSelectedColor(hexValue);
    }
  };

  const handleRadiusChange = (radiusValue: string) => {
    setSelectedRadius(radiusValue);
  };

  const handleUpdateColor = async () => {
    const finalColor = useCustomColor ? customHexColor : selectedColor;
    
    if (finalColor === currentColor) {
      toast("El color seleccionado ya está aplicado.");
      return;
    }

    if (useCustomColor && !isValidHex(customHexColor)) {
      toast.error("Por favor ingresa un color hexadecimal válido (ej: #FF0000)");
      return;
    }

    setIsUpdating(true);
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_COLORSITIO_CONTENTBLOCK;
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "color-sitio",
          contentText: finalColor,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCurrentColor(finalColor);
      setHasInvalidValue(false);
      toast.success("Color actualizado exitosamente.");

    } catch (error) {
      console.error("Error al actualizar el color:", error);
      toast.error("Error al actualizar el color.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateRadius = async () => {
    if (selectedRadius === currentRadius) {
      toast("El border-radius seleccionado ya está aplicado.");
      return;
    }

    setIsUpdatingRadius(true);
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_RADIUS_CONTENTBLOCK;
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: "border-radius",
          contentText: selectedRadius,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCurrentRadius(selectedRadius);
      toast.success("Border-radius actualizado exitosamente.");

    } catch (error) {
      console.error("Error al actualizar el border-radius:", error);
      toast.error("Error al actualizar el border-radius.");
    } finally {
      setIsUpdatingRadius(false);
    }
  };

  const getCurrentColorOption = () => {
    if (useCustomColor && isValidHex(customHexColor)) {
      const colorValues = getColorValues(customHexColor);
      return {
        value: "custom",
        label: "Color personalizado",
        primaryColor: colorValues?.primary || "0 0% 0%",
        secondaryColor: colorValues?.secondary || "0 0% 0%",
        accentColor: colorValues?.accent || "0 0% 0%"
      };
    }
    return colorOptions.find(option => option.value === selectedColor) || colorOptions[0];
  };

  const getCurrentRadiusOption = () => {
    return radiusOptions.find(option => option.value === selectedRadius) || radiusOptions[1];
  };

  const hasColorChanges = (useCustomColor ? customHexColor : selectedColor) !== currentColor;
  const hasRadiusChanges = selectedRadius !== currentRadius;

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuración de Color y Estilo del Sitio
      </h2>
      {!isLoading ? (
        <div className="space-y-8">
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
                      El content block contenía un valor inicial. Se ha configurado Púrpura como color por defecto.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Configuración de Color */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between min-h-[2rem] mb-4">
                  <label className="text-lg font-medium text-gray-700">
                    Color principal del sitio
                  </label>
                  {hasColorChanges && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      Cambios pendientes
                    </span>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar color
                    </label>
                    <select
                      value={useCustomColor ? "custom" : selectedColor}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      {colorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                      <option value="custom">Color personalizado (Hex)</option>
                    </select>
                  </div>

                  {useCustomColor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color hexadecimal
                      </label>
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={customHexColor}
                          onChange={(e) => handleHexColorChange(e.target.value)}
                          placeholder="#FF0000"
                          className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary ${
                            customHexColor !== "#" && !isValidHex(customHexColor) 
                              ? 'border-red-500' 
                              : 'border-gray-300'
                          }`}
                        />
                        <div 
                          className="w-10 h-10 rounded border border-gray-300"
                          style={{ 
                            backgroundColor: isValidHex(customHexColor) ? customHexColor : 'transparent' 
                          }}
                        ></div>
                      </div>
                      {customHexColor !== "#" && !isValidHex(customHexColor) && (
                        <p className="text-sm text-red-600 mt-1">
                          Formato inválido. Usa formato hexadecimal (ej: #FF0000)
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Vista previa del color:
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ 
                            backgroundColor: `hsl(${getCurrentColorOption().primaryColor})` 
                          }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          Color primario: {getCurrentColorOption().label}
                        </span>
                      </div>
                     {/* <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ 
                            backgroundColor: `hsl(${getCurrentColorOption().secondaryColor})` 
                          }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          Color secundario
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ 
                            backgroundColor: `hsl(${getCurrentColorOption().accentColor})` 
                          }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          Color de acento
                        </span>
                      </div>*/}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex pt-4">
                <button
                  onClick={handleUpdateColor}
                  disabled={!hasColorChanges || isUpdating || (useCustomColor && !isValidHex(customHexColor))}
                  className={`w-full px-6 py-2 rounded-md font-medium transition-colors ${
                    hasColorChanges && !isUpdating && (!useCustomColor || isValidHex(customHexColor))
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
                    'Actualizar color'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Configuración de Border Radius */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between min-h-[2rem] mb-4">
                  <label className="text-lg font-medium text-gray-700">
                    Border Radius del sitio
                  </label>
                  {hasRadiusChanges && (
                    <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                      Cambios pendientes
                    </span>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seleccionar border radius
                    </label>
                    <select
                      value={selectedRadius}
                      onChange={(e) => handleRadiusChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                    >
                      {radiusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Vista previa del border radius:
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-16 h-12 bg-primary"
                          style={{ 
                            borderRadius: getCurrentRadiusOption().radius 
                          }}
                        ></div>
                        <span className="text-sm text-gray-600">
                          {getCurrentRadiusOption().label} ({getCurrentRadiusOption().radius})
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button 
                          className="px-4 py-2 bg-primary text-white"
                          style={{ 
                            borderRadius: getCurrentRadiusOption().radius 
                          }}
                        >
                          Botón de ejemplo
                        </button>
                        <span className="text-sm text-gray-600">
                          Botón con {getCurrentRadiusOption().label.toLowerCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex pt-4">
                <button
                  onClick={handleUpdateRadius}
                  disabled={!hasRadiusChanges || isUpdatingRadius}
                  className={`w-full px-6 py-2 rounded-md font-medium transition-colors ${
                    hasRadiusChanges && !isUpdatingRadius
                      ? 'bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary/20'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isUpdatingRadius ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Actualizando...
                    </div>
                  ) : (
                    'Actualizar border radius'
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

export default Color;
