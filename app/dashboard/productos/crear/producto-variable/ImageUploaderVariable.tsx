/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { getCookie } from "cookies-next";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";
import toast from "react-hot-toast";
import { validateImage } from "@/utils/imageValidation";

type ImageUploaderVariableProps = {
  productId: string;
  skuId: string;
  variationImages: any[];
  fetchVariationImages: (productId: string, skuId: string) => void;
  onImagesChange?: (changes: {
    pendingImages: any[];
    pendingDeletions: string[];
    currentImages: any[];
  }) => void;
};

const ImageUploaderVariable: React.FC<ImageUploaderVariableProps> = ({
  productId,
  skuId,
  variationImages,
  fetchVariationImages,
  onImagesChange,
}) => {
  const token = getCookie("AdminTokenAuth");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImages, setPendingImages] = useState<any[]>([]);
  const [pendingDeletions, setPendingDeletions] = useState<string[]>([]);
  const [imageSrc, setImageSrc] = useState<any>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Limpiar estados cuando cambia la variación
  useEffect(() => {
    setPendingImages([]);
    setPendingDeletions([]);
    setCurrentImages([]);
    setIsLoading(true);
  }, [skuId]);

  useEffect(() => {
    const loadImages = async () => {
      if (productId && skuId) {
        setIsLoading(true);
        await fetchVariationImages(productId, skuId);
        setIsLoading(false);
      }
    };
    loadImages();
  }, [productId, skuId]);

  useEffect(() => {
    if (!isLoading) {
      setCurrentImages(
        variationImages.filter((img) => !pendingDeletions.includes(img.id))
      );
    }
  }, [variationImages, pendingDeletions, isLoading]);

  const notifyChanges = useCallback(() => {
    if (onImagesChange) {
      onImagesChange({
        pendingImages,
        pendingDeletions,
        currentImages: variationImages.filter(
          (img) => !pendingDeletions.includes(img.id)
        ),
      });
    }
  }, [pendingImages, pendingDeletions, variationImages, onImagesChange]);

  useEffect(() => {
    notifyChanges();
  }, [pendingImages, pendingDeletions, notifyChanges]);

  const processNextImage = () => {
    if (currentFileIndex < selectedFiles.length - 1) {
      setCurrentFileIndex((prev) => prev + 1);
      const nextFile = selectedFiles[currentFileIndex + 1];
      handleSingleFileUpload(nextFile);
    } else {
      setSelectedFiles([]);
      setCurrentFileIndex(0);
      setIsCropModalOpen(false);
    }
  };

  const handleSingleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageSrc(reader.result as string);
      setOriginalFile(file);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Validar cada archivo antes de procesarlo
      for (const file of files) {
        if (!validateImage(file)) {
          return;
        }
      }

      const totalImages =
        files.length + currentImages.length + pendingImages.length;
      if (totalImages > 4) {
        toast.error("No puedes subir más de 4 imágenes en total");
        return;
      }
      setSelectedFiles(files);
      setCurrentFileIndex(0);
      handleSingleFileUpload(files[0]);
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSaveCroppedImage = async () => {
    if (!originalFile || !imageSrc) return;

    try {
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es nulo");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      const file = new File([croppedImage], originalFile.name, {
        type: croppedImage.type,
        lastModified: originalFile.lastModified,
      });

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result as string;
        const newImage = {
          name: originalFile.name,
          type: compressedFile.type,
          size: compressedFile.size,
          data: base64data,
        };

        setPendingImages((prev) => [...prev, newImage]);
        processNextImage();
      };

      reader.readAsDataURL(compressedFile);
    } catch (error: any) {
      console.error("Error al recortar o comprimir la imagen:", error);
      processNextImage();
    }
  };

  // Función para reiniciar el input de archivo
  const resetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setPendingDeletions((prev) => [...prev, imageId]);
    resetFileInput(); // Reiniciar el input de archivo
  };

  const handleRemovePendingImage = (index: number) => {
    setPendingImages((prev) => prev.filter((_, i) => i !== index));
    resetFileInput(); // Reiniciar el input de archivo
  };

  const handleUndoDelete = (imageId: string) => {
    setPendingDeletions((prev) => prev.filter((id) => id !== imageId));
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 h-[150px]">
      {/* Botón de carga */}
      {!isLoading && currentImages.length + pendingImages.length < 4 && (
        <label
          htmlFor="variationImageUpload"
          style={{ borderRadius: "var(--radius)" }}
          className="shadow flex flex-col bg-white justify-center items-center border border-dashed border-gray-800 cursor-pointer w-[150px] h-full relative shrink-0"
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
            {selectedFiles.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {currentFileIndex + 1}/{selectedFiles.length}
              </span>
            )}
          </div>
          <input
            id="variationImageUpload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      )}

      {/* Contenedor de miniaturas */}
      <div className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div
            className="grid gap-4 h-full w-full"
            style={{
              gridTemplateColumns: `repeat(${Math.min(
                currentImages.length + pendingImages.length,
                4
              )}, 1fr)`,
            }}
          >
            {/* Mostrar imágenes existentes */}
            {variationImages.map((image) => {
              const isPendingDeletion = pendingDeletions.includes(image.id);
              return !isPendingDeletion ? (
                <div
                  key={image.id}
                  className="relative h-full w-full"
                >
                  <div
                    className="w-full h-full bg-center bg-no-repeat bg-cover shadow rounded-md"
                    style={{ backgroundImage: `url(${image.imageUrl})` }}
                  />
                  <button
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-1.5"
                    onClick={() => handleRemoveImage(image.id)}
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
              ) : null;
            })}

            {/* Mostrar imágenes pendientes */}
            {pendingImages.map((image, index) => (
              <div
                key={`pending-${index}`}
                className="relative h-full w-full"
              >
                <div
                  className="w-full h-full bg-center bg-no-repeat bg-cover shadow rounded-md"
                  style={{ backgroundImage: `url(${image.data})` }}
                />
                <button
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-1.5"
                  onClick={() => handleRemovePendingImage(index)}
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
            ))}
          </div>
        )}
      </div>

      {/* Modal de recorte */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="bg-white rounded-lg shadow-lg relative w-[95%] md:w-[80%] max-w-3xl p-6">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Recortar Imagen
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Imagen {currentFileIndex + 1} de {selectedFiles.length}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedFiles([]);
                  setCurrentFileIndex(0);
                  setIsCropModalOpen(false);
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
                image={imageSrc}
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
                  onClick={handleSaveCroppedImage}
                  className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Recortar y Continuar
                </button>
                <button
                  onClick={() => {
                    setSelectedFiles([]);
                    setCurrentFileIndex(0);
                    setIsCropModalOpen(false);
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
};

export default ImageUploaderVariable;
