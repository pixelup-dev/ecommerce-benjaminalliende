"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import Modal from "@/components/Core/Modals/ModalSeo";
import { getCroppedImg } from "@/lib/cropImage";

const Hero: React.FC = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImageHero, setMainImageHero] = useState<string | null>(null);
  const [formDataHero, setFormDataHero] = useState<any>({
    title: "",
    landingText: "",
    buttonLink: "",
    buttonText: "",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [updatedBannerData, setUpdatedBannerData] = useState({
    title: "",
    landingText: "",
    buttonLink: "",
    buttonText: "",
    mainImageLink: "",
    orderNumber: 1, // Modifica este valor según tu lógica
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const MAX_CHARACTERS = 250;
  const ALERT_CHARACTERS = 154;

  const fetchBannerHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_SEO_BANNER_ID}`;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const bannerImage = productTypeResponse.data.bannerImages;
      setBannerData(bannerImage);
      setFormDataHero({
        title: bannerImage[0].title,
        landingText: bannerImage[0].landingText,
        buttonLink: bannerImage[0].buttonLink,
        buttonText: bannerImage[0].buttonText,
        mainImageLink: bannerImage[0].mainImageLink,
        orderNumber: 1,
      });
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  useEffect(() => {
    fetchBannerHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Debería ejecutarse solo en el montaje inicial

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormDataHero({ ...formDataHero, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); // Mostrar el indicador de carga
      const token = getCookie("AdminTokenAuth");

      // Crear un objeto de datos actualizado excluyendo mainImage si no hay una imagen seleccionada
      const updatedDataWithoutImage = {
        ...formDataHero,
        orderNumber: formDataHero.orderNumber,
      };

      if (!mainImageHero) {
        delete updatedDataWithoutImage.mainImage;
      }

      // Enviar los datos actualizados al servidor
      const bannerId = `${process.env.NEXT_PUBLIC_SEO_BANNER_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_SEO_BANNER_IMGID}`;
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        updatedDataWithoutImage,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Opcionalmente, puedes volver a obtener los datos del banner para asegurarte de que estén actualizados
      fetchBannerHome();
    } catch (error) {
      console.error("Error actualizando el banner:", error);
      // Manejar el error según sea necesario
    } finally {
      setLoading(false); // Ocultar el indicador de carga
    }
  };

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    imageKey: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
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
    if (!mainImageHero) return;

    try {
      const croppedImage = await getCroppedImg(
        mainImageHero,
        croppedAreaPixels
      );
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }
      const options = {
        maxSizeMB: 1, // Ajusta el tamaño máximo permitido
        maxWidthOrHeight: 1900, // Ajusta las dimensiones máximas permitidas
        useWebWorker: true,
        initialQuality: 0.9, // Ajusta la calidad inicial para mantener mejor calidad visual
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: "seoIMG",
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };
      setFormDataHero((prevFormDataHero: any) => ({
        ...prevFormDataHero,
        mainImage: imageInfo,
      }));
      setUpdatedBannerData((prevData: any) => ({
        ...prevData,
        mainImage: imageInfo,
      }));
      setMainImageHero(base64);
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
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null); // Limpiar la imagen seleccionada
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault();
    }
    if (e.key === "Enter") {
      e.preventDefault();
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
      className="w-full "
    >
      <div className="flex justify-center ">
        {bannerData && (
          <div className="flex flex-col items-center">
            <div
              className="flex items-center text-center justify-center gap-4 w-full py-10 px-10 bg-gray-100 flex-wrap"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div>
                <img
                  src={bannerData[0].mainImage.url}
                  alt="Banner Image"
                  className="w-[200px] h-[200px] object-cover"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl sm:text-4xl">{bannerData[0].title}</h1>
                <p className="text-lg max-w-sm">{bannerData[0].landingText}</p>
              </div>
            </div>
            <div className="mt-5 w-full text-center bg-gray-100 rounded p-4">
              <span className="font-bold"> Palabras Clave:</span>
              <p className="text-lg max-w-sm text-center">
                {bannerData[0].buttonText}
              </p>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-4 mx-auto mt-8"
      >
        <input
          type="number"
          name="orderNumber"
          value={formDataHero.orderNumber}
          onChange={handleChange}
          className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex-1 flex flex-col">
            <h3 className="font-normal text-primary">Foto</h3>
            <div className="flex-1 flex flex-col">
              <input
                type="file"
                accept="image/*"
                id="mainImageHero"
                className="hidden"
                onChange={(e) =>
                  handleImageChange(e, setMainImageHero, "mainImage")
                }
              />
              {mainImageHero ? (
                <div>
                  <div className="relative mt-2 h-[150px] rounded-lg object-contain overflow-hidden">
                    <img
                      src={mainImageHero}
                      alt="Main Image"
                      className="w-full"
                    />
                    <button
                      className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 m-1 text-xs"
                      onClick={() => handleClearImage(setMainImageHero)}
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
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <label
                  htmlFor="mainImageHero"
                  className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed cursor-pointer w-full z-10 flex-1"
                  style={{ borderRadius: "var(--radius)" }}
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
                      PNG, JPG o Webp (800x800px)
                    </p>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <h3 className="font-normal text-primary">Título</h3>
            <input
              type="text"
              name="title"
              value={formDataHero.title}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="shadow block w-full px-4 py-3 mt-2 mb-1 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Title"
            />
            <div className="text-right text-sm text-gray-600">
              {formDataHero.title.length}/60
            </div>
            <small className="text-gray-500">
              Recomendación: El título debe tener entre 50-60 caracteres y
              contener la palabra clave principal al principio.
            </small>
            {formDataHero.title.length > 60 && (
              <div
                style={{ borderRadius: "var(--radius)" }}
                className="shadow flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 bg-blue-50"
                role="alert"
              >
                <svg
                  className="flex-shrink-0 inline w-4 h-4 me-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <div>
                  <span className="font-semibold">Recomendación.</span> El
                  título debe tener entre 50-60 caracteres.
                </div>
              </div>
            )}

            <h3 className="font-normal text-primary mt-4">
              Keywords{" "}
              <small className="text-gray-500 text-xs">
                {" "}
                (Las keywords deben estar separadas por comas.)
              </small>
            </h3>
            <input
              type="text"
              name="buttonText"
              value={formDataHero.buttonText}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="shadow block w-full px-4 py-3 mt-2 mb-1 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="keywords., keywords, keywords..."
            />
            <div className="text-right text-sm text-gray-600">
              {formDataHero.buttonText
                ? formDataHero.buttonText
                    .split(",")
                    .filter((keyword: string) => keyword.trim() !== "").length
                : 0}
              /5 (Palabras clave)
            </div>
            <small className="text-gray-500">
              Recomendación: Usa entre 3-5 keywords relevantes, incluyendo
              variantes y palabras clave long-tail. Sepáralas con comas.
            </small>

            <h3 className="font-normal text-primary mt-4">Descripción</h3>
            <textarea
              name="landingText"
              value={formDataHero.landingText}
              onChange={handleChange}
              className="shadow block w-full px-4 py-3 mt-2 mb-1 border border-gray-300 flex-1"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Landing Text"
              onKeyDown={handleKeyDown}
              rows={4}
            />
            <div className="text-right text-sm text-gray-600">
              {formDataHero.landingText.length}/160
            </div>
            <small className="text-gray-500">
              Recomendación: La descripción debe tener entre 150-160 caracteres,
              resumiendo el contenido con una palabra clave principal y una
              llamada a la acción.
            </small>
            {formDataHero.landingText.length > 160 && (
              <div
                style={{ borderRadius: "var(--radius)" }}
                className="shadow flex items-center p-4 mb-4 text-sm text-blue-800 border border-blue-300 bg-blue-50"
                role="alert"
              >
                <svg
                  className="flex-shrink-0 inline w-4 h-4 me-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                </svg>
                <span className="sr-only">Info</span>
                <div>
                  <span className="font-semibold">Recomendación.</span> La
                  descripción debe tener entre 150-160 caracteres.
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded flex-wrap mt-6"
          style={{ borderRadius: "var(--radius)" }}
        >
          <svg
            aria-hidden="true"
            role="status"
            className={`inline w-4 h-4 me-3 text-white animate-spin ${
              loading ? "block" : "hidden"
            }`}
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="#E5E7EB"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          {loading ? "Loading..." : "Actualizar Información"}
        </button>
      </form>

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
                setMainImageHero(null);
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
                image={mainImageHero || ""}
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
                  setMainImageHero(null);
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

export default Hero;
