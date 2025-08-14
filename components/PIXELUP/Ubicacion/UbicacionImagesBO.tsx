/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { BannerImage } from "./types";
import imageCompression from "browser-image-compression";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageInfo {
  name: string;
  type: string;
  size: number;
  data: string;
}

type UploadType = "main" | "secondary";

export default function UbicacionImagesBO() {
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState<BannerImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [uploadType, setUploadType] = useState<UploadType | null>(null);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION_ID}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setImages(response.data.bannerImages || []);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
      toast.error("Error al cargar las imágenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: UploadType
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setUploadType(type);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const handleCropComplete = (
    croppedArea: any,
    croppedAreaPixels: CropArea
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    try {
      if (!tempImage || !croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      if (!croppedImage) return;

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: uploadType === "main" ? 1900 : 1200,
        useWebWorker: true,
        initialQuality: 0.8,
      };

      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: compressedFile.name || "imagen.jpg",
        type: compressedFile.type || "image/jpeg",
        size: compressedFile.size,
        data: base64,
      };

      await handleUploadImage(imageInfo);
      setIsModalOpen(false);
      setTempImage(null);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const handleUploadImage = async (imageInfo: ImageInfo) => {
    if (images.length >= 3) {
      toast.error("Ya has alcanzado el límite de 3 imágenes");
      return;
    }

    const hasMainImage = images.some((img) => img.orderNumber === 1);
    if (uploadType === "main" && hasMainImage) {
      toast.error("Ya existe una imagen principal");
      return;
    }

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      const dataToSend = {
        title: uploadType === "main" ? "Imagen Principal" : "Imagen Secundaria",
        landingText: "Imagen Ubicación",
        buttonText: "ubicacion",
        buttonLink: "https://www.lafuentedebelleza.cl",
        orderNumber: uploadType === "main" ? 1 : images.length + 2,
        mainImageLink: "https://www.lafuentedebelleza.cl",
        mainImage: imageInfo,
      };

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION_ID}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Imagen subida exitosamente");
      await fetchImages();
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      toast.error("Error al subir la imagen");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async (imageId: string, orderNumber: number) => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION_ID}/images/${imageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (orderNumber === 1) {
        setImages((prevImages) =>
          prevImages.filter((img) => img.id !== imageId)
        );
      }

      toast.success("Imagen eliminada exitosamente");
      await fetchImages();
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
      toast.error("Error al eliminar la imagen");
    } finally {
      setLoading(false);
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

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Imágenes de Ubicación</h3>
        <div className="flex gap-4">
          {!images.some((img) => img.orderNumber === 1) && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md transition-colors"
            >
              Agregar Imagen Principal (Recomendado 1024 × 1024px)
            </button>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) =>
            handleImageChange(
              e,
              !images.some((img) => img.orderNumber === 1)
                ? "main"
                : "secondary"
            )
          }
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {images
          .filter((img) => img.orderNumber === 1)
          .map((image) => (
            <div
              key={image.id}
              className="relative bg-white p-3 rounded-lg shadow-md max-w-xl mx-auto w-full"
            >
              <div className="relative aspect-[2/1] overflow-hidden rounded-lg ">
                <img
                  src={image.mainImage.url}
                  alt={image.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">
                  Imagen Principal
                </span>
                <button
                  onClick={() => handleDeleteImage(image.id, image.orderNumber)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
      </div>

      {isModalOpen && (
        <Modal
          showModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={tempImage || ""}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="w-full py-6">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.01}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-between gap-2">
              <button
                onClick={handleCrop}
                className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded"
              >
                Recortar y Guardar
              </button>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setTempImage(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
