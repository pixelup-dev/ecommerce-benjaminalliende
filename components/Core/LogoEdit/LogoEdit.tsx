"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, ChangeEvent, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import imageCompression from "browser-image-compression";
import Modal from "@/components/Core/Modals/ModalSeo";
import { getCroppedImg } from "@/lib/cropImage";
import { useLogo } from "@/context/LogoContext";

interface UpdatedData {
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  mainImageLink: string;
  orderNumber: number;
  mainImage?: {
    name: string;
    type: string;
    size: number;
    data: string;
  };
}

interface LogoEditProps {
  onClose?: () => void;
}

const LogoEdit: React.FC<LogoEditProps> = ({ onClose }) => {
  const [logoData, setLogoData] = useState<any | null>(null);
  const [mainImageLogo, setMainImageLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [formDataHero, setFormDataHero] = useState<any>({
    title: "Logo Principal",
    landingText: "Logo Principal",
    buttonText: "Logo Principal",
    buttonLink: "Logo Principal",
    mainImageLink: "Logo Principal",
    orderNumber: 1,
  });
  const { refreshLogo } = useLogo();

  const fetchLogoData = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LOGOEDIT_ID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const bannerImage = response.data.bannerImages;
      setLogoData(bannerImage);
      
      // Actualizar el estado formDataHero con los datos del logo
      if (bannerImage && bannerImage.length > 0) {
        setFormDataHero({
          title: bannerImage[0].title || "Logo Principal",
          landingText: bannerImage[0].landingText || "Logo Principal",
          buttonText: bannerImage[0].buttonText || "Logo Principal",
          buttonLink: bannerImage[0].buttonLink || "Logo Principal",
          mainImageLink: bannerImage[0].mainImageLink || "Logo Principal",
          orderNumber: 1,
        });
      }
    } catch (error) {
      console.error("Error al obtener el logo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogoData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_LOGOEDIT_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_LOGOEDIT_IMGID}`;

      // Crear un objeto de datos actualizado basado en formDataHero
      const updatedData: UpdatedData = {
        ...formDataHero,
      };

      // Si hay una imagen seleccionada, incluirla en los datos
      if (mainImageLogo) {
        // Obtener el tamaño real de la imagen en base64
        const base64Size = Math.ceil((mainImageLogo.length * 3) / 4);
        
        updatedData.mainImage = {
          name: "logoIMG",
          type: "image/png",
          size: base64Size,
          data: mainImageLogo,
        };
      }

      // Enviar los datos actualizados al servidor
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Revalidar la caché para que se actualice el logo en el frontend
      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: `/api/v1/banners/${bannerId}`,
        }),
      });

      // Volver a obtener los datos del logo
      fetchLogoData();
      
      // Actualizar el logo en el contexto global
      await refreshLogo();
      
      // Cerrar el modal después de guardar
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error al actualizar el logo:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    imageKey: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        
        // Comprimir la imagen directamente
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          initialQuality: 0.8,
          fileType: 'image/png'
        });

        // Convertir el archivo comprimido a base64
        const reader = new FileReader();
        reader.readAsDataURL(compressedFile);
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          const imageInfo = {
            name: "logoIMG",
            type: "image/png",
            size: compressedFile.size,
            data: base64,
          };

          setMainImageLogo(base64);
          setFormDataHero((prevFormDataHero: any) => ({
            ...prevFormDataHero,
            mainImage: imageInfo,
          }));
        };
      } catch (error) {
        console.error('Error al procesar la imagen:', error);
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

  const handleClearImage = (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormDataHero({ ...formDataHero, [name]: value });
  };

  const hasChanges = mainImageLogo !== null;

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Configuración del Logo Principal
      </h2>
      {!loading ? (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between min-h-[2rem] mb-4">
                <label className="text-lg font-medium text-gray-700">
                  Logo del sitio
                </label>
                {hasChanges && (
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                    Cambios pendientes
                  </span>
                )}
              </div>
              
              <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {logoData && (
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md h-full">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Logo actual:
                    </h3>
                    <div className="flex flex-col items-center h-full">
                      <img
                        src={logoData[0].mainImage.url}
                        alt="Logo Principal"
                        className="w-[150px] h-[150px] object-contain rounded-md"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Este es el logo actual que se muestra en el sitio web
                      </p>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-white border border-gray-200 rounded-md h-full flex flex-col">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Subir nuevo logo:
                  </h3>
                  <div className="flex-1 flex flex-col">
                    <input
                      type="file"
                      accept="image/*"
                      id="mainImage"
                      className="hidden"
                      onChange={(e) => handleImageChange(e, setMainImageLogo, "mainImage")}
                    />
                    {mainImageLogo ? (
                      <div className="flex flex-col items-center justify-center h-full">
                        <h4 className="font-normal text-primary text-center text-slate-600 w-full mb-2">
                          Tu logo{" "}
                          <span className="text-dark">
                            {formDataHero.mainImage?.name || "logo.png"}
                          </span>{" "}
                          ya ha sido cargado.
                          <br /> Actualiza para ver los cambios.
                        </h4>

                        <button
                          className="bg-red-500 gap-2 flex items-center justify-center px-4 py-2 hover:bg-red-700 text-white rounded-md text-xs"
                          onClick={() => handleClearImage(setMainImageLogo)}
                        >
                          <span>Seleccionar otra imagen</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col">
                        <label
                          htmlFor="mainImage"
                          className="border-primary shadow flex flex-col bg-white justify-center items-center border border-dashed rounded-lg cursor-pointer w-full h-full z-10"
                        >
                          <div className="flex flex-col justify-center items-center">
                            <svg
                              className="w-12 h-12 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-semibold">Subir Logo</span>
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              PNG, JPG o Webp (800x800px)
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                </div>


              </div>
              <div className="mt-4">


                <div className="flex pt-4">
                  <button
                    onClick={handleSubmit}
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
                      'Actualizar logo'
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

export default LogoEdit;
