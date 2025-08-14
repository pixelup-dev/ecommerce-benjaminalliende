"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface ColorContextType {
  currentColor: string;
  setCurrentColor: (color: string) => void;
  colorOptions: ColorOption[];
  getColorValues: (colorName: string) => ColorValues | null;
  currentRadius: string;
  setCurrentRadius: (radius: string) => void;
  radiusOptions: RadiusOption[];
  hexToHsl: (hex: string) => string;
  isValidHex: (hex: string) => boolean;
  isColorLoaded: boolean;
}

interface ColorOption {
  value: string;
  label: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

interface RadiusOption {
  value: string;
  label: string;
  radius: string;
}

interface ColorValues {
  primary: string;
  secondary: string;
  accent: string;
}

const colorOptions: ColorOption[] = [
  {
    value: "black",
    label: "Negro",
    primaryColor: "0 0% 0%",
    secondaryColor: "0 0% 20%",
    accentColor: "0 0% 40%",
  },
  {
    value: "purple",
    label: "Púrpura",
    primaryColor: "302 24% 56%",
    secondaryColor: "302 30% 90%",
    accentColor: "264 30% 90%",
  },
  {
    value: "blue",
    label: "Azul",
    primaryColor: "210 100% 50%",
    secondaryColor: "210 30% 90%",
    accentColor: "210 30% 90%",
  },
  {
    value: "green",
    label: "Verde",
    primaryColor: "142 76% 36%",
    secondaryColor: "142 30% 90%",
    accentColor: "142 30% 90%",
  },
  {
    value: "red",
    label: "Rojo",
    primaryColor: "0 84% 60%",
    secondaryColor: "0 30% 90%",
    accentColor: "0 30% 90%",
  },
  {
    value: "orange",
    label: "Naranja",
    primaryColor: "25 95% 53%",
    secondaryColor: "25 30% 90%",
    accentColor: "25 30% 90%",
  },
  {
    value: "pink",
    label: "Rosa",
    primaryColor: "330 81% 60%",
    secondaryColor: "330 30% 90%",
    accentColor: "330 30% 90%",
  },
  {
    value: "teal",
    label: "Verde azulado",
    primaryColor: "180 100% 25%",
    secondaryColor: "180 30% 90%",
    accentColor: "180 30% 90%",
  },
  {
    value: "indigo",
    label: "Índigo",
    primaryColor: "240 100% 50%",
    secondaryColor: "240 30% 90%",
    accentColor: "240 30% 90%",
  },
];

const radiusOptions: RadiusOption[] = [
  { value: "square", label: "Cuadrado", radius: "0rem" },
  { value: "soft", label: "Suave", radius: "0.5rem" },
  { value: "rounded", label: "Redondeado", radius: "1rem" },
];

const ColorContext = createContext<ColorContextType | undefined>(undefined);

export const useColor = () => {
  const context = useContext(ColorContext);
  if (context === undefined) {
    throw new Error("useColor must be used within a ColorProvider");
  }
  return context;
};

interface ColorProviderProps {
  children: React.ReactNode;
}

export const ColorProvider: React.FC<ColorProviderProps> = ({ children }) => {
  const [currentColor, setCurrentColor] = useState<string>("black");
  const [currentRadius, setCurrentRadius] = useState<string>("soft");
  const [isColorLoaded, setIsColorLoaded] = useState<boolean>(false);

  useEffect(() => {
    fetchColorConfig();
    fetchRadiusConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchColorConfig = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_COLORSITIO_CONTENTBLOCK;

      if (!contentBlockId) {
        console.warn("NEXT_PUBLIC_COLORSITIO_CONTENTBLOCK no está configurado");
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const data = response.data.contentBlock;
      const color = data.contentText || "purple";

      // Verificar si el valor es válido (incluye colores predefinidos y hexadecimales)
      const validColors = colorOptions.map((option) => option.value);
      if (validColors.includes(color) || isValidHex(color)) {
        setCurrentColor(color);
        setIsColorLoaded(true);
      } else {
        console.warn(
          `Valor inválido en content block: "${color}". Se usará Negro por defecto.`
        );
        setCurrentColor("black");
        setIsColorLoaded(true);
      }
    } catch (error) {
      console.error("Error al obtener la configuración de color:", error);
      // Mantener el color por defecto en caso de error
      setIsColorLoaded(true);
    }
  };

  const fetchRadiusConfig = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_RADIUS_CONTENTBLOCK;

      if (!contentBlockId) {
        console.warn("NEXT_PUBLIC_RADIUS_CONTENTBLOCK no está configurado");
        return;
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const data = response.data.contentBlock;
      const radius = data.contentText || "soft";

      // Verificar si el valor es válido
      const validRadius = radiusOptions.map((option) => option.value);
      if (validRadius.includes(radius)) {
        setCurrentRadius(radius);
      } else {
        console.warn(
          `Valor inválido en content block: "${radius}". Se usará Suave por defecto.`
        );
        setCurrentRadius("soft");
      }
    } catch (error) {
      console.error("Error al obtener la configuración de radius:", error);
      // Mantener el radius por defecto en caso de error
    }
  };

  const hexToHsl = (hex: string): string => {
    // Remover el # si está presente
    hex = hex.replace("#", "");

    // Convertir hex a RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h,
      s,
      l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
        default:
          h = 0;
      }
      h /= 6;
    }

    // Convertir a grados y porcentajes
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `${h} ${s}% ${l}%`;
  };

  const isValidHex = (hex: string): boolean => {
    const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexRegex.test(hex);
  };

  const getColorValues = (colorName: string): ColorValues | null => {
    // Si es un color hexadecimal, convertirlo a HSL
    if (isValidHex(colorName)) {
      const primaryHsl = hexToHsl(colorName);
      // Crear variaciones para secondary y accent
      const [h, s, l] = primaryHsl.split(" ");
      const secondaryHsl = `${h} 30% 90%`;
      const accentHsl = `${h} 30% 90%`;

      return {
        primary: primaryHsl,
        secondary: secondaryHsl,
        accent: accentHsl,
      };
    }

    // Si es un color predefinido
    const colorOption = colorOptions.find(
      (option) => option.value === colorName
    );
    if (!colorOption) return null;

    return {
      primary: colorOption.primaryColor,
      secondary: colorOption.secondaryColor,
      accent: colorOption.accentColor,
    };
  };

  const value: ColorContextType = {
    currentColor,
    setCurrentColor,
    colorOptions,
    getColorValues,
    currentRadius,
    setCurrentRadius,
    radiusOptions,
    hexToHsl,
    isValidHex,
    isColorLoaded,
  };

  return (
    <ColorContext.Provider value={value}>{children}</ColorContext.Provider>
  );
};
