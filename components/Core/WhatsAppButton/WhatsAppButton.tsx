"use client";
import { globalConfig } from "@/app/config/GlobalConfig";

const WhatsAppButton = () => {
  if (!globalConfig.whatsappButton.isActive) return null;

  return (
    <a
      href={globalConfig.whatsappButton.link}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-6 bottom-[30px] z-50 bg-green-500 rounded-full p-3 hover:bg-green-600 transition-colors animate-pulse-whatsapp"
      style={{ zIndex: 999 }}
    >
      <img
        src="/whatsapp.svg"
        alt="WhatsApp"
        className="w-8 h-8 hover:scale-110 transition-transform duration-200"
      />
    </a>
  );
};

export default WhatsAppButton; 