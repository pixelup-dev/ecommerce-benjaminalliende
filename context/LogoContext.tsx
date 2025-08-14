import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

interface LogoImage {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface LogoData {
  mainImage: LogoImage;
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  mainImageLink: string;
  orderNumber: number;
}

interface LogoContextType {
  logo: LogoData | null;
  setLogo: (logo: LogoData | null) => void;
  refreshLogo: () => Promise<void>;
}

const LogoContext = createContext<LogoContextType | undefined>(undefined);

export const useLogo = () => {
  const context = useContext(LogoContext);
  if (context === undefined) {
    throw new Error("useLogo debe ser usado dentro de un LogoProvider");
  }
  return context;
};

interface LogoProviderProps {
  children: ReactNode;
}

export const LogoProvider: React.FC<LogoProviderProps> = ({ children }) => {
  const [logo, setLogo] = useState<LogoData | null>(null);

  const fetchLogo = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LOGOEDIT_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_LOGOEDIT_IMGID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (
        response.data.banner &&
        response.data.banner.images &&
        response.data.banner.images[0]
      ) {
        setLogo(response.data.banner.images[0]);
      }
    } catch (error) {
      console.error("Error al obtener el logo:", error);
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  const refreshLogo = async () => {
    await fetchLogo();
  };

  return (
    <LogoContext.Provider value={{ logo, setLogo, refreshLogo }}>
      {children}
    </LogoContext.Provider>
  );
};

export default LogoContext;
