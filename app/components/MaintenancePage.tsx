"use client";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useLogo } from '@/context/LogoContext';

export const getMaintenanceStatus = async () => {
  try {
    const contentBlockId = process.env.NEXT_PUBLIC_MANTENIMIENTO_CONTENTBLOCK;
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
    );
    
    const data = response.data.contentBlock;
    const maintenanceConfig = JSON.parse(data.contentText);
    return {
      isEnabled: maintenanceConfig.enabled || false,
      message: maintenanceConfig.message || 'Estamos realizando mejoras en el sitio. Volveremos pronto.'
    };
  } catch (error) {
    console.error("Error al obtener el estado de mantenimiento:", error);
    return { isEnabled: false, message: 'Estamos realizando mejoras en el sitio. Volveremos pronto.' };
  }
};

const MaintenancePage = () => {
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>('Estamos realizando mejoras en el sitio. Volveremos pronto.');
  const { logo } = useLogo();

  useEffect(() => {
    const fetchMaintenanceMessage = async () => {
      const { message } = await getMaintenanceStatus();
      setMaintenanceMessage(message);
    };

    fetchMaintenanceMessage();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center">
      <div className="text-center text-white p-8 max-w-lg">
        <img
          src={logo?.mainImage?.url || process.env.NEXT_PUBLIC_LOGO || '/logo-default.png'}
          alt="Ícono de mantenimiento"
          className="w-60 mx-auto"
        />
        <h1 className="text-4xl font-bold mb-4">Sitio en Mantenimiento</h1>
        <div 
          className="text-lg mb-6"
          dangerouslySetInnerHTML={{ __html: maintenanceMessage }}
        />
      </div>
    </div>
  );
};

export default MaintenancePage;
  