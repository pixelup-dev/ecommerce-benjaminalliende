"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface TypographyContextType {
  currentFont: string;
  setCurrentFont: (font: string) => void;
  isLoading: boolean;
}

const TypographyContext = createContext<TypographyContextType | undefined>(undefined);

export const useTypography = () => {
  const context = useContext(TypographyContext);
  if (context === undefined) {
    throw new Error("useTypography must be used within a TypographyProvider");
  }
  return context;
};

interface TypographyProviderProps {
  children: React.ReactNode;
}

// Lista de fuentes válidas
const validFonts = ['montserrat', 'poppins', 'roboto-mono', 'kalam', 'lato', 'oswald'];

// Función para validar si una fuente es válida
const isValidFont = (font: string): boolean => {
  return validFonts.includes(font);
};

export const TypographyProvider: React.FC<TypographyProviderProps> = ({ children }) => {
  const [currentFont, setCurrentFont] = useState<string>("montserrat");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchTypographyConfig();
  }, []);

  const fetchTypographyConfig = async () => {
    try {
      const contentBlockId = process.env.NEXT_PUBLIC_TIPOGRAFIA_CONTENTBLOCK;
      if (contentBlockId) {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        const font = response.data.contentBlock.contentText || "montserrat";
        
        // Validar que la fuente sea válida
        if (isValidFont(font)) {
          setCurrentFont(font);
        } else {
          console.warn(`Fuente inválida recibida: "${font}". Usando Montserrat por defecto.`);
          setCurrentFont("montserrat");
        }
      }
    } catch (error) {
      console.error("Error al obtener la configuración de tipografía:", error);
      setCurrentFont("montserrat"); // Fallback a Montserrat
    } finally {
      setIsLoading(false);
    }
  };

  const applyFontToBody = (font: string) => {
    if (typeof window !== 'undefined' && document.body) {
      // Validar que la fuente sea válida antes de aplicarla
      if (!isValidFont(font)) {
        console.warn(`Intento de aplicar fuente inválida: "${font}". Usando Montserrat.`);
        font = "montserrat";
      }
      
      // Lista de todas las clases de fuente posibles
      const fontClasses = [
        'font-montserrat',
        'font-poppins', 
        'font-roboto-mono',
        'font-kalam',
        'font-lato',
        'font-oswald'
      ];
      
      // Remover todas las clases de fuente existentes
      fontClasses.forEach(className => {
        document.body.classList.remove(className);
      });
      
      // Agregar la nueva clase de fuente
      document.body.classList.add(`font-${font}`);
    }
  };

  const handleSetCurrentFont = (font: string) => {
    // Validar la fuente antes de establecerla
    if (!isValidFont(font)) {
      console.warn(`Fuente inválida: "${font}". No se aplicará.`);
      return;
    }
    
    setCurrentFont(font);
    applyFontToBody(font);
  };

  useEffect(() => {
    if (!isLoading) {
      applyFontToBody(currentFont);
    }
  }, [currentFont, isLoading]);

  const value = {
    currentFont,
    setCurrentFont: handleSetCurrentFont,
    isLoading,
  };

  return (
    <TypographyContext.Provider value={value}>
      {children}
    </TypographyContext.Provider>
  );
}; 