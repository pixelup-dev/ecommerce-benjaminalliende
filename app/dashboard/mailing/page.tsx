"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import Modal from "@/components/Core/Modals/ModalSeo";
import { getCroppedImg } from "@/lib/cropImage";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader-t";

const Mailing: React.FC = () => {
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const [footerImageFile, setFooterImageFile] = useState<File | null>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHeaderLoading, setIsHeaderLoading] = useState(false);
  const [isFooterLoading, setIsFooterLoading] = useState(false);

  const [currentImageType, setCurrentImageType] = useState<"header" | "footer">(
    "header"
  );

  // Constantes para validación
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB en bytes
  const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Función para validar archivo
  const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `El archivo es demasiado grande. Tamaño máximo permitido: 5MB. Tu archivo: ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      };
    }

    // Validar formato
    if (!ALLOWED_FORMATS.includes(file.type)) {
      return {
        isValid: false,
        error: `Formato de archivo no permitido. Formatos aceptados: JPG, PNG, WebP. Tu archivo: ${file.type}`
      };
    }

    return { isValid: true };
  };

  const fetchBannerData = async () => {
    try {
      setIsLoading(true);
      const token = getCookie("AdminTokenAuth");
      const headerId = `${process.env.NEXT_PUBLIC_HEADER_BANNER_ID}`;
      const footerId = `${process.env.NEXT_PUBLIC_FOOTER_BANNER_ID}`;

      const headerResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${headerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const footerResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${footerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setHeaderImage(headerResponse.data.bannerImages[0].mainImage.url);
      setFooterImage(footerResponse.data.bannerImages[0].mainImage.url);
    } catch (error) {
      console.error("Error al obtener los banners:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerData();
  }, []);

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>,
    imageType: "header" | "footer"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar el archivo antes de procesarlo
      const validation = validateImageFile(file);
      
      if (!validation.isValid) {
        toast.error(validation.error || "Error al validar el archivo");
        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageToCrop(result); // Asignar la imagen que se va a recortar
        setImageFile(file); // Guardar el archivo de la imagen en el estado
        setCurrentImageType(imageType); // Establecer el tipo de imagen (header o footer)
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!imageToCrop) return;

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 1,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      if (currentImageType === "header") {
        setHeaderImage(base64);
        setHeaderImageFile(compressedFile);
      } else if (currentImageType === "footer") {
        setFooterImage(base64);
        setFooterImageFile(compressedFile);
      }

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
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
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    setImageFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    setImage(null);
    setImageFile(null);
  };

  const handleSubmitHeader = async (
    e: React.FormEvent,
    image: string | null,
    bannerId: string,
    imageFile: File | null
  ) => {
    e.preventDefault();
    if (!image || !imageFile) return;

    try {
      setIsHeaderLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerImageId = `${process.env.NEXT_PUBLIC_HEADER_BANNER_IMGID}`;

      const updatedData = {
        title: "Lorem Ipsum",
        landingText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        buttonLink: "#",
        buttonText: "Click here",
        orderNumber: 1,
        mainImageLink: "#",
        mainImage: {
          name: "imageFile",
          type: imageFile.type,
          size: imageFile.size,
          data: image,
        },
      };

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

      fetchBannerData();
      toast.success("Header actualizado con éxito"); // Toast de éxito
    } catch (error) {
      console.error("Error actualizando el banner:", error);
      toast.error("Error actualizando el header"); // Toast de error
    } finally {
      setIsHeaderLoading(false);
    }
  };

  const handleSubmitFooter = async (
    e: React.FormEvent,
    image: string | null,
    bannerId: string,
    imageFile: File | null
  ) => {
    e.preventDefault();
    if (!image || !imageFile) return;

    try {
      setIsFooterLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerImageId = `${process.env.NEXT_PUBLIC_FOOTER_BANNER_IMGID}`;

      const updatedData = {
        title: "Lorem Ipsum",
        landingText: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        buttonLink: "#",
        buttonText: "Click here",
        orderNumber: 1,
        mainImageLink: "#",
        mainImage: {
          name: "imageFile",
          type: imageFile.type,
          size: imageFile.size,
          data: image,
        },
      };

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

      fetchBannerData();
      toast.success("Footer actualizado con éxito");
    } catch (error) {
      console.error("Error actualizando el banner:", error);
      toast.error("Error actualizando el footer");
    } finally {
      setIsFooterLoading(false);
    }
  };

  return (
    <section
      id="mailing"
      className="w-full p-10"
    >
      <title>Mailing</title>

      <div className="flex flex-col gap-8">
        <div
          className="rounded-sm border w-full border-stroke bg-white py-6 px-8 shadow-default dark:border-black dark:bg-black mt-4"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div className="text-sm flex gap-2 font-medium border-b pb-2 mb-6 ">
            <div>Header Banner</div>
            <div>/ Mailing</div>
          </div>
          <div>
            {headerImage && (
              <div className="flex justify-center mb-4">
                {isHeaderLoading ? (
                  <Loader />
                ) : (
                  <img
                    src={headerImage}
                    alt="Header Banner Preview"
                    className="w-[1000px] h-[250px] object-cover"
                  />
                )}
              </div>
            )}

            <form
              onSubmit={(e) =>
                handleSubmitHeader(
                  e,
                  headerImage,
                  process.env.NEXT_PUBLIC_HEADER_BANNER_ID || "",
                  headerImageFile
                )
              }
            >
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  id="headerImage"
                  className="hidden"
                  onChange={(e) =>
                    handleImageChange(
                      e,
                      setHeaderImage,
                      setHeaderImageFile,
                      "header"
                    )
                  }
                />
                <label
                  htmlFor="headerImage"
                  className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed cursor-pointer w-full z-10 flex-1"
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
                    <p className="mb-2 text-sm text-gray-500">Subir Imagen</p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG o WebP (máx. 5MB)
                    </p>
                  </div>
                </label>
                {headerImage && (
                  <button
                    type="submit"
                    disabled={isHeaderLoading}
                    className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded mt-6"
                  >
                    {isHeaderLoading ? "Cargando..." : "Actualizar Header"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div
          className="rounded-sm border w-full border-stroke bg-white py-6 px-8 shadow-default dark:border-black dark:bg-black mt-4"
          style={{ borderRadius: "var(--radius)" }}
        >
          <div className="text-sm flex gap-2 font-medium border-b pb-2 mb-6 ">
            <div>Footer Banner</div>
            <div>/ Mailing</div>
          </div>
          <div>
            {footerImage && (
              <div className="flex justify-center mb-4">
                {isFooterLoading ? (
                  <Loader />
                ) : (
                  <img
                    src={footerImage}
                    alt="Footer Banner Preview"
                    className="w-[1000px] h-[250px] object-cover"
                  />
                )}
              </div>
            )}
            <form
              onSubmit={(e) =>
                handleSubmitFooter(
                  e,
                  footerImage,
                  process.env.NEXT_PUBLIC_FOOTER_BANNER_ID || "",
                  footerImageFile
                )
              }
            >
              <div className="flex flex-col items-center">
                <input
                  type="file"
                  accept="image/*"
                  id="footerImage"
                  className="hidden"
                  onChange={(e) =>
                    handleImageChange(
                      e,
                      setFooterImage,
                      setFooterImageFile,
                      "footer"
                    )
                  }
                />
                <label
                  htmlFor="footerImage"
                  className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed cursor-pointer w-full z-10 flex-1"
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
                    <p className="mb-2 text-sm text-gray-500">Subir Imagen</p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG o WebP (máx. 5MB)
                    </p>
                  </div>
                </label>
                {footerImage && (
                  <button
                    type="submit"
                    disabled={isFooterLoading}
                    className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded mt-6"
                  >
                    {isFooterLoading ? "Cargando..." : "Actualizar Footer"}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Recortar Imagen</h2>
              </div>
              <button
                onClick={() => {
                  setImageToCrop(null);
                  setIsModalOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="relative h-96 w-full">
                <Cropper
                  image={imageToCrop || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom
                  </label>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.01}
                    aria-labelledby="Zoom"
                    onChange={(e) => {
                      setZoom(parseFloat(e.target.value));
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCrop}
                    className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recortar y Continuar
                  </button>
                  <button
                    onClick={() => {
                      setImageToCrop(null);
                      setIsModalOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Mailing;
