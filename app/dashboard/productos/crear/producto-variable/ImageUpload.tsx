/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback } from "react";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";
import Modal from "@/components/Core/Modals/ModalSeo";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onImageChange: (imageData: any) => void;
  preloadedImageUrl?: string | null;
}

function ImageUpload({ onImageChange, preloadedImageUrl }: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [originalFile, setOriginalFile] = useState<File | null>(null);

  useEffect(() => {
    if (preloadedImageUrl) {
      setImage(preloadedImageUrl);
    }
  }, [preloadedImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
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
    if (!originalFile || !image) return;

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es nulo");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.95,
      };

      const file = new File([croppedImage], originalFile.name, {
        type: croppedImage.type,
        lastModified: originalFile.lastModified,
      });

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result as string;
        const imageData = {
          name: originalFile.name,
          type: compressedFile.type,
          size: compressedFile.size,
          data: base64data,
        };
        setImage(base64data);
        onImageChange(imageData);
        setIsModalOpen(false);
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error al recortar o comprimir la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const handleClearImage = () => {
    setImage(null);
    onImageChange(null);
  };

  return (
    <div className="h-[150px] w-full">
      {image ? (
        <div className="relative h-full w-full">
          <img
            src={image}
            alt="Imagen principal"
            className="w-full h-full object-cover shadow rounded-md"
          />
          <button
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-1.5"
            onClick={handleClearImage}
            title="Eliminar imagen"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ) : (
        <label
          htmlFor="imageUpload"
          style={{ borderRadius: "var(--radius)" }}
          className="shadow flex flex-col bg-white justify-center items-center border border-dashed border-gray-800 cursor-pointer w-full h-full relative"
        >
          <div className="flex flex-col justify-center items-center p-2 text-center">
            <svg
              className="w-8 h-8 text-gray-400 mb-2"
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
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG o Webp
            </p>
          </div>
          <input
            id="imageUpload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="bg-white rounded-lg shadow-lg relative w-[95%] md:w-[80%] max-w-3xl p-6">
            <div className="sticky top-0 bg-white border-b flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Recortar Imagen Principal
              </h2>
              <button
                onClick={() => {
                  setImage(null);
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
            <div className="relative h-96 w-full">
              <Cropper
                image={image || ""}
                crop={crop}
                zoom={zoom}
                aspect={1}
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
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
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
                    setImage(null);
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
      )}
    </div>
  );
}

export default ImageUpload;
