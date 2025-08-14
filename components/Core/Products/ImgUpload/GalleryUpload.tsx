/* eslint-disable @next/next/no-img-element */
import React, { useState, ChangeEvent, useCallback } from "react";
import ModalGalleryUpload from "@/components/Core/Products/ImgUpload/ModalGalleryUpload";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";
import Modal from "@/components/Core/Modals/ModalSeo"; // Importar el modal de recorte

interface Props {
  selectedImages: string[];
  handleImageGalleryChange: (images: string[]) => void;
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

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMainImage(result);
        setIsCropModalOpen(true); // Open modal for cropping
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
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 0.95,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const newImagesArray = [base64];

      const totalImages = selectedImages.length + newImagesArray.length;
      if (totalImages <= 4) {
        handleImageGalleryChange([...selectedImages, ...newImagesArray]);
      } else {
        setIsModalOpen(true);
      }

      setIsCropModalOpen(false);
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

  const handleRemoveImage = (index: number) => {
    handleImageRemove(index);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-end w-full">
      <label
        htmlFor="fileInput"
        style={{ borderRadius: "var(--radius)" }}
        className={`shadow flex flex-col bg-white justify-center items-center mt-2 pt-2 pb-5 border border-dashed border-gray-600 cursor-pointer ${
          selectedImages.length > 0 ? "md:w-1/4" : "md:w-full"
        } z-10`}
      >
        <div className="flex flex-col justify-center items-center  p-2 text-center w-full">
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
          {selectedImages.length > 0 ? null : (
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              <span className="font-semibold">Subir Imagen</span>
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
            PNG, JPG o Webp (800x800px)
          </p>
        </div>
      </label>

      <input
        id="fileInput"
        type="file"
        multiple
        className="hidden"
        onChange={handleImageChange}
      />

      <div
        className={`flex flex-wrap gap-4 md:w-3/4 md:flex-initial p-4  ${
          selectedImages.length > 0 ? "block" : "hidden"
        } `}
      >
        {selectedImages.map((image, index) => (
          <div
            key={index}
            className="relative "
          >
            <img
              src={image}
              alt={`Image ${index}`}
              className="w-14 h-14 object-cover rounded-md"
            />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 m-1 text-xs"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <ModalGalleryUpload
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {isCropModalOpen && (
        <Modal
          showModal={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={mainImage || ""} // Asegurar que se pasa una cadena no nula
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
            <div className="controls"></div>
          </div>
          <div className="flex flex-col justify-end ">
            <div className="w-full py-6">
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
                className="zoom-range w-full custom-range"
              />
            </div>
            <div className="flex justify-between w-full ">
              <button
                onClick={handleCrop}
                className="bg-primary hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Recortar y Subir
              </button>
              <button
                onClick={() => {
                  setMainImage(null);
                  setIsCropModalOpen(false);
                }}
                className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default GalleryUpload;
