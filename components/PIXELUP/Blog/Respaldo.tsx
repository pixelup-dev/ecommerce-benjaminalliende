"use client";
import React, { useEffect, useState, useRef, ChangeEvent } from "react";
import axios from "axios";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";
import { getCookie } from "cookies-next";

interface BannerData {
  mainImage: {
    url: string;
    name?: string;
    type?: string;
    size?: number;
    data?: string;
  };
  title: string;
  landingText: string;
}

const BlogSection01BO = () => {
  const [bannerData, setBannerData] = useState<BannerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  
  // Estados para el recorte de imagen
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para los campos editables
  const [formData, setFormData] = useState({
    title: "",
    landingText: "",
    mainImage: {
      name: "",
      type: "",
      size: null as number | null,
      data: "",
      url: ""
    }
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchBannerData();
  }, []);

  const fetchBannerData = async () => {
    try {
      setLoading(true);
      const bannerId = `${process.env.NEXT_PUBLIC_BLOGHOME_ID}`;
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      const banner = response.data.banner;
      setBannerData(banner);
      setFormData({
        title: banner.title || "",
        landingText: banner.landingText || "",
        mainImage: banner.mainImage || {
          name: "",
          type: "",
          size: null,
          data: "",
          url: ""
        }
      });
      setMainImage(banner.mainImage?.url || null);
    } catch (error) {
      console.error("Error al obtener datos del banner:", error);
      setMessage({ text: "Error al cargar los datos", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name);
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

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

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
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 0.95,
      };
      const compressedFile = await imageCompression(croppedImage as File, options);
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: originalFileName,
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
        url: base64
      };

      setFormData(prev => ({
        ...prev,
        mainImage: imageInfo
      }));
      setMainImage(base64);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
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

  const handleClearImage = () => {
    setMainImage(null);
    setIsMainImageUploaded(false);
    setFormData(prev => ({
      ...prev,
      mainImage: {
        name: "",
        type: "",
        size: null,
        data: "",
        url: ""
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
        const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_BLOGHOME_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_BLOGHOME_IMGID}`;
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
      );

      setMessage({ text: "Cambios guardados exitosamente", type: "success" });
      fetchBannerData();
      setIsMainImageUploaded(false);
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setMessage({ text: "Error al guardar los cambios", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Editar Banner del Blog</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vista previa */}
        <div className="mb-8 border rounded-lg overflow-hidden">
          <div className="relative h-[300px]">
            <img
              src={mainImage || '/fallback-image.jpg'}
              alt="Banner Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-3xl font-bold text-white mb-2">{formData.title}</h3>
              <p className="text-white/90">{formData.landingText}</p>
            </div>
          </div>
        </div>

        {/* Campos de edición */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Título del banner"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texto descriptivo
            </label>
            <textarea
              value={formData.landingText}
              onChange={(e) => setFormData(prev => ({ ...prev, landingText: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
              rows={4}
              placeholder="Descripción del banner"
            />
          </div>
          <div>
            <input
              type="file"
              accept="image/*"
              id="blogImage"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            {isMainImageUploaded ? (
              <div className="flex flex-col items-center mt-3 relative">
                <h4 className="font-normal text-primary text-center text-slate-600 w-full">
                  Tu fotografía{" "}
                  <span className="text-dark">{originalFileName}</span>{" "}
                  ya ha sido cargada.
                  <br /> Actualiza para ver los cambios.
                </h4>

                <button
                  type="button"
                  className="bg-red-500 gap-4 flex items-center justify-center px-4 py-2 hover:bg-red-700 text-white rounded-full text-xs mt-4"
                  onClick={handleClearImage}
                >
                  <span className="self-center">Seleccionar otra Imagen</span>
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
                      d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                    />
                  </svg>
                </button>
              </div>
            ) : (
              <div>
                <h3 className="font-normal text-primary">
                  Foto <span className="text-primary">*</span>
                </h3>
                <label
                  htmlFor="blogImage"
                  className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed rounded-lg cursor-pointer w-full z-10"
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
                      <span className="font-semibold">Subir Imagen</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG o Webp (1800x400px)
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Mensaje de estado */}
        {message.text && (
          <div
            className={`p-4 rounded-md ${
              message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Botón de guardar */}
        <button
          type="submit"
          disabled={saving}
          className={`w-full py-3 px-4 rounded-md text-white font-medium ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>

      {/* Modal de recorte de imagen */}
      {isModalOpen && (
        <Modal
          showModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={mainImage || ""}
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
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
                onChange={(e) => {
                  setZoom(parseFloat(e.target.value));
                }}
                className="zoom-range w-full custom-range"
              />
            </div>

            <div className="flex justify-between w-full gap-2">
              <button
                onClick={handleCrop}
                className="bg-primary text-[13px] md:text-[16px] hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Recortar y Subir
              </button>
              <button
                onClick={() => {
                  setMainImage(null);
                  setIsMainImageUploaded(false);
                  setIsModalOpen(false);
                }}
                className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-[13px] md:text-[16px]"
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

export default BlogSection01BO;
