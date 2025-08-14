"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";
import { toast } from "react-hot-toast";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface BannerImage {
  id: string;
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  mainImageLink: string;
  orderNumber: number;
  mainImage: {
    url: string;
    name?: string;
    type?: string;
    size?: number;
    data?: string;
  };
}

const Hero13BO: React.FC = () => {
  const [bannerData, setBannerData] = useState<BannerImage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mainImageHero, setMainImageHero] = useState<string | null>(null);
  const [formDataHero, setFormDataHero] = useState<Partial<BannerImage>>({
    title: "",
    landingText: "",
    orderNumber: 1,
    buttonLink: "eduzen.cl",
    buttonText: "eduzen.cl",
    mainImageLink: "eduzen.cl",
  });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const MAX_CHARACTERS = 999;
  const ALERT_CHARACTERS = 900;

  const fetchContent = async () => {
    try {
      setLoading(true);
      const bannerId = process.env.NEXT_PUBLIC_HERO13_ID;
      const bannerImageId = process.env.NEXT_PUBLIC_HERO13_IMGID;
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
      const token = getCookie("AdminTokenAuth");

      if (!bannerId || !siteId || !bannerImageId) {
        throw new Error("Faltan variables de entorno necesarias");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const bannerImage = response.data.bannerImages[0];
        setBannerData(bannerImage);
        setFormDataHero({
          title: bannerImage.title || "",
          landingText: bannerImage.landingText || "",
          orderNumber: bannerImage.orderNumber || 1,
          buttonLink: bannerImage.buttonLink || "eduzen.cl",
          buttonText: bannerImage.buttonText || "eduzen.cl",
          mainImageLink: bannerImage.mainImageLink || "eduzen.cl",
        });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error al cargar el contenido:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Verificar límite de caracteres antes de enviar
    const textWithoutHTML =
      formDataHero.landingText?.replace(/<[^>]*>/g, "") || "";
    if (textWithoutHTML.length > MAX_CHARACTERS) {
      toast.error(
        "No se puede guardar. Excede el límite de caracteres permitidos"
      );
      return;
    }

    try {
      setLoading(true);
      const bannerId = process.env.NEXT_PUBLIC_HERO13_ID;
      const bannerImageId = process.env.NEXT_PUBLIC_HERO13_IMGID;
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
      const token = getCookie("AdminTokenAuth");

      const updatedData: Partial<BannerImage> = {
        title: formDataHero.title,
        landingText: formDataHero.landingText,
        buttonLink: formDataHero.buttonLink || "eduzen.cl",
        buttonText: formDataHero.buttonText || "eduzen.cl",
        mainImageLink: formDataHero.mainImageLink || "eduzen.cl",
        orderNumber: formDataHero.orderNumber || 1,
      };

      if (mainImageHero && formDataHero.mainImage) {
        updatedData.mainImage = formDataHero.mainImage;
      }

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${siteId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchContent();
    } catch (error) {
      console.error("Error al actualizar el contenido:", error);
      toast.error("Error al actualizar el contenido");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = { ...formDataHero, [name]: value };
    setFormDataHero(updatedFormData);
    setBannerData((prev) => (prev ? { ...prev, ...updatedFormData } : null));
  };

  const handleEditorChange = (value: string) => {
    const textWithoutHTML = value.replace(/<[^>]*>/g, "");

    if (textWithoutHTML.length > MAX_CHARACTERS) {
      toast.error("Has superado el límite máximo de caracteres permitidos");
    }

    // Permitir la actualización del valor incluso si excede el límite
    const updatedFormData = { ...formDataHero, landingText: value };
    setFormDataHero(updatedFormData);
    setBannerData((prev) => (prev ? { ...prev, ...updatedFormData } : null));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMainImageHero(result);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const convertToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleCrop = async () => {
    if (!mainImageHero) return;

    try {
      const croppedImage = await getCroppedImg(
        mainImageHero,
        croppedAreaPixels
      );
      if (!croppedImage) return;

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.9,
      };

      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: fileName || "default-image.jpg",
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
        url: base64,
      };

      setMainImageHero(base64);
      setFormDataHero((prev) => ({
        ...prev,
        mainImage: imageInfo,
      }));
      setBannerData((prev) =>
        prev
          ? {
              ...prev,
              mainImage: imageInfo,
            }
          : null
      );
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div role="status">
          <svg
            aria-hidden="true"
            className="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <section
      id="banner"
      className="w-full"
    >
      <div className="flex justify-end px-4 mb-4">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="bg-primary hover:bg-secondary text-secondary hover:text-primary font-bold py-2 px-4 rounded flex items-center gap-2"
        >
          {showPreview ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                />
              </svg>
              Ocultar Vista Previa
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Mostrar Vista Previa
            </>
          )}
        </button>
      </div>

      {showPreview && (
        <div className="bg-white min-h-[350px] text-[#333] font-[sans-serif]">
          <div className="grid md:grid-cols-2 justify-center items-center max-md:text-center gap-8">
            <div className="max-w-2xl mx-auto p-4 px-6">
              <h2 className="text-3xl md:text-3xl font-extrabold font-kalam my-6 uppercase">
                {bannerData?.title}
              </h2>
              <div
                className="text-base"
                dangerouslySetInnerHTML={{
                  __html: bannerData?.landingText || "",
                }}
              />
            </div>
            <div className="md:text-right max-md:mt-12 h-full">
              <img
                src={mainImageHero || bannerData?.mainImage.url}
                alt={bannerData?.title}
                className="w-full h-[600px] object-cover"
              />
            </div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="px-4 mx-auto mt-8"
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Título
          </label>
          <input
            type="text"
            value={formDataHero.title || ""}
            onChange={handleChange}
            name="title"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Contenido
          </label>
          <ReactQuill
            value={formDataHero.landingText || ""}
            onChange={handleEditorChange}
            className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          />
          <div className="text-right text-sm text-gray-600">
            {(formDataHero.landingText?.replace(/<[^>]*>/g, "") || "").length}/
            {MAX_CHARACTERS}
          </div>
          {(formDataHero.landingText?.replace(/<[^>]*>/g, "") || "").length >
            ALERT_CHARACTERS &&
            (formDataHero.landingText?.replace(/<[^>]*>/g, "") || "").length <=
              MAX_CHARACTERS && (
              <div className="text-yellow-500 text-sm">
                ¡Estás cerca del límite de caracteres!
              </div>
            )}
          {(formDataHero.landingText?.replace(/<[^>]*>/g, "") || "").length >
            MAX_CHARACTERS && (
            <div className="text-red-500 text-sm font-bold">
              ¡Has superado el límite máximo de caracteres permitidos!
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Imagen
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            (formDataHero.landingText?.replace(/<[^>]*>/g, "") || "").length >
              MAX_CHARACTERS
          }
          className={`shadow w-full uppercase font-bold py-2 px-4 rounded transition-all duration-200 ${
            loading ||
            (formDataHero.landingText?.replace(/<[^>]*>/g, "") || "").length >
              MAX_CHARACTERS
              ? "bg-gray-400 text-gray-700 cursor-not-allowed opacity-60"
              : "bg-primary hover:bg-secondary text-secondary hover:text-primary"
          }`}
        >
          {loading
            ? "Actualizando..."
            : (formDataHero.landingText?.replace(/<[^>]*>/g, "") || "").length >
              MAX_CHARACTERS
            ? "Reduce el número de caracteres"
            : "Actualizar Contenido"}
        </button>
      </form>

      {isModalOpen && (
        <Modal
          showModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={mainImageHero || ""}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1.2}
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
                step={0.1}
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
                  setMainImageHero(null);
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
    </section>
  );
}

export default Hero13BO;