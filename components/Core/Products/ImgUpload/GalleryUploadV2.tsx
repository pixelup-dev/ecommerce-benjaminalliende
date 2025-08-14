/* eslint-disable @next/next/no-img-element */
import React, { useState, ChangeEvent, useCallback } from "react";
import ModalGalleryUpload from "@/components/Core/Products/ImgUpload/ModalGalleryUpload";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";
import Modal from "@/components/Core/Modals/ModalSeo";
import toast from "react-hot-toast";

interface Props {
  selectedImages: any[];
  handleImageGalleryChange: (newImages: any[]) => void;
  handleImageRemove: (index: number) => void;
}

const GalleryUpload: React.FC<Props> = ({
  selectedImages,
  handleImageGalleryChange,
  handleImageRemove,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const totalImages = files.length + selectedImages.length;
      if (totalImages > 4) {
        toast.error("Solo puedes subir un máximo de 4 imágenes");
        return;
      }
      setSelectedFiles(files);
      setCurrentFileIndex(0);
      const file = files[0];
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMainImage(result);
        setIsCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const processNextImage = () => {
    if (currentFileIndex < selectedFiles.length - 1) {
      setCurrentFileIndex((prev) => prev + 1);
      const nextFile = selectedFiles[currentFileIndex + 1];
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMainImage(result);
        setFileName(nextFile.name);
      };
      reader.readAsDataURL(nextFile);
    } else {
      setSelectedFiles([]);
      setCurrentFileIndex(0);
      setIsCropModalOpen(false);
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
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.95,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const newImage = {
          name: fileName || "cropped_image",
          type: compressedFile.type,
          size: compressedFile.size,
          data: base64data,
        };

        handleImageGalleryChange([...selectedImages, newImage]);
        processNextImage();
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
      processNextImage();
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    handleImageGalleryChange(newImages);
  };

  return (
    <div className="flex flex-col md:flex-row h-[150px]">
      {selectedImages.length < 4 && (
        <>
          <label
            htmlFor="fileInput"
            style={{ borderRadius: "var(--radius)" }}
            className="shadow flex flex-col bg-white justify-center items-center border border-dashed border-gray-800 cursor-pointer w-[150px] h-full shrink-0"
          >
            <div className="flex flex-col justify-center items-center p-2 text-center w-full">
              <svg
                className="w-8 h-8 text-gray-400"
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
              <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                <span className="font-semibold">Subir Imagen</span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
                PNG, JPG o Webp
              </p>
            </div>
          </label>

          <input
            id="fileInput"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </>
      )}

      <div className={`flex-1 ${selectedImages.length > 0 ? "ml-4" : ""}`}>
        <div
          className="grid gap-4 h-full w-full"
          style={{
            gridTemplateColumns: `repeat(${Math.min(
              selectedImages.length,
              4
            )}, 1fr)`,
          }}
        >
          {selectedImages.map((image: any, index: any) => (
            <div
              key={index}
              className="relative h-full w-full"
            >
              <div
                className="w-full h-full bg-center bg-no-repeat bg-cover shadow rounded-md"
                style={{ backgroundImage: `url(${image.data})` }}
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-700 text-white rounded-full p-1.5"
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
          ))}
        </div>
      </div>

      <ModalGalleryUpload
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="bg-white rounded-lg shadow-lg relative w-[95%] md:w-[80%] max-w-3xl p-6">
            <div className="sticky top-0 bg-white border-b flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Recortar Imagen {currentFileIndex + 1} de {selectedFiles.length}
              </h2>
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
                image={mainImage || ""}
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

export default GalleryUpload;
