"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Modal from "@/components/Core/Modals/ModalSeo";
import imageCompression from "browser-image-compression";
import Loader from "@/components/common/Loader-t";
import Marquee from "react-fast-marquee";

interface LogoImage {
  id: string;
  mainImage: {
    url: string;
    name: string;
    type: string;
    size: number;
    data: string;
  };
}

const LogosDinamicosBO: React.FC = () => {
  const [logoData, setLogoData] = useState<LogoImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isAddingImage, setIsAddingImage] = useState(false);

  const fetchLogos = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LOGOSDINAMICO_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setLogoData(response.data.bannerImages);
    } catch (error) {
      console.error("Error al obtener los logos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogos();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        setFileName(file.name);

        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 500,
          useWebWorker: true,
        };

        const compressedFile = await imageCompression(file, options);
        const base64 = await convertToBase64(compressedFile);

        const imageInfo = {
          name: file.name,
          type: compressedFile.type,
          size: compressedFile.size,
          data: base64,
        };

        handleSubmit(imageInfo);
      } catch (error) {
        console.error("Error al procesar la imagen:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (imageInfo: any) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LOGODINAMICO_ID}`;

      const dataToSend = {
        title: "Logo Marca", // Valor por defecto
        landingText: "Logo Marca", // Valor por defecto
        buttonText: "Logo Marca", // Valor por defecto
        buttonLink: "Logo Marca", // Valor por defecto
        mainImageLink: "Logo Marca", // Valor por defecto
        mainImage: imageInfo,
        orderNumber: logoData.length + 1,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/api/v1/banners/${bannerId}`,
        }),
      });

      fetchLogos();
      setIsAddingImage(false);
      setMainImage(null);
      setIsMainImageUploaded(false);
    } catch (error) {
      console.error("Error al subir el logo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogo = async (logoId: string) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LOGODINAMICO_ID}`;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${logoId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchLogos();
    } catch (error) {
      console.error("Error al eliminar el logo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-4  mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
          >
            {showPreview ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
                <span className="pl-2">Ocultar Vista Previa</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
                <span className="pl-2">Mostrar Vista Previa</span>
              </>
            )}
          </button>
        </div>

        {/* Vista previa */}
        {showPreview && (
          <div className="mb-8">
            <h3 className="font-medium text-gray-700 mb-4">Vista Previa:</h3>
            <div className="w-full max-w-4xl mx-auto">
              <Marquee
                speed={50}
                gradient={false}
                className="mt-4"
              >
                {logoData.map((logo, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center w-32 h-32 mx-4 bg-gray-50 rounded-full"
                  >
                    <img
                      src={logo.mainImage.url || logo.mainImage.data}
                      alt={`Logo ${index + 1}`}
                      className="w-28 h-28 object-contain rounded-full"
                    />
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
        )}

        {/* Formulario para agregar logos */}
        <div className="mt-6">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-4"
          >
            Agregar Nuevo Logo
          </button>

          {/* Grid de logos existentes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {logoData.map((logo, index) => (
              <div
                key={logo.id}
                className="relative group bg-gray-50 p-4 rounded-lg"
              >
                <img
                  src={logo.mainImage.url || logo.mainImage.data}
                  alt={`Logo ${index + 1}`}
                  className="w-full h-32 object-contain"
                />
                <button
                  onClick={() => handleDeleteLogo(logo.id)}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LogosDinamicosBO;