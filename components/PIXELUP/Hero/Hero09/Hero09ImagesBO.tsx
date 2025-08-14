/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";

interface BannerImage {
  id: string;
  mainImage: {
    url: string;
    data?: string;
    name?: string;
    type?: string;
    size?: number;
  };
}

const Hero09ImagesBO: React.FC = () => {
  const [bannerData, setBannerData] = useState<BannerImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Fetch solo de imágenes
  const fetchImages = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO09_IMGID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setBannerData(response.data.bannerImages);
    } catch (error) {
      console.error("Error al obtener las imágenes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMainImage(result);
        setIsMainImageUploaded(true);
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
    if (!mainImage) return;

    try {
      const croppedImage = await getCroppedImg(mainImage, croppedAreaPixels);
      if (!croppedImage) return;

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

      const imageInfo = {
        name: fileName,
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      setMainImage(base64);
      setIsModalOpen(false);
      handleSubmit(imageInfo);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
    }
  };

  const convertToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
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
      const bannerId = `${process.env.NEXT_PUBLIC_HERO09_IMGID}`;

      const dataToSend = {
        title: "Imagen",
        landingText: "Imagen",
        buttonLink: "ABOUT",
        buttonText: "Imagen",
        mainImageLink: "ABOUT",
        orderNumber: bannerData.length + 1,
        mainImage: imageInfo,
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

      setIsAddingImage(false);
      setIsMainImageUploaded(false);
      fetchImages();
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO09_IMGID}`;

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${imageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      fetchImages();
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (bannerData.length >= 4 && !isAddingImage) {
      alert("Solo se permiten un máximo de 4 imágenes");
      return;
    }

    if (!isAddingImage) {
      setIsAddingImage(true);
      fileInputRef.current?.click();
    } else {
      setIsAddingImage(false);
      setIsMainImageUploaded(false);
      setMainImage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <h3 className="text-lg font-semibold mb-4">Galería de Imágenes Hero 09</h3>
      <div className="text-sm text-gray-600 mb-4">
        Imágenes cargadas: {bannerData.length} de 4
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {bannerData.map((image) => (
          <div
            key={image.id}
            className="relative"
          >
            <img
              src={image.mainImage.url}
              alt="About image"
              className="w-full h-40 object-cover rounded"
            />
            <button
              onClick={() => handleDeleteImage(image.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
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

      <button
        type="button"
        onClick={handleAddImageClick}
        disabled={bannerData.length >= 4 && !isAddingImage}
        className={`w-full py-2 px-4 rounded font-bold text-white ${
          isAddingImage
            ? "bg-red-600 hover:bg-red-700"
            : bannerData.length >= 4
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {isAddingImage ? "Cancelar" : "Agregar Imagen"}
      </button>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={handleImageChange}
      />

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
                  setMainImage(null);
                  setIsMainImageUploaded(false);
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
                  image={mainImage || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 3}
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
                      setMainImage(null);
                      setIsMainImageUploaded(false);
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
    </div>
  );
};

export default Hero09ImagesBO;
