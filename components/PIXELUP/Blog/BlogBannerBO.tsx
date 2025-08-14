"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Modal from "@/components/Core/Modals/ModalSeo"; // Asegúrate de importar el modal
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";

// Cargar react-quill dinámicamente para evitar problemas de SSR (Server-Side Rendering)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const BannerBlog01BO: React.FC<any> = () => {
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);

  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImageHero, setMainImageHero] = useState<string | null>(null);
  // States for image cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formDataHero, setFormDataHero] = useState<any>({
    title: "Pixelup.cl",
    landingText: "Pixelup.cl",
    buttonLink: "Pixelup.cl",
    buttonText: "Pixelup.cl",
  });


  const [loading, setLoading] = useState<boolean>(true);
  const [updatedBannerData, setUpdatedBannerData] = useState({
    title: "Pixelup.cl",
    landingText: "Pixelup.cl",
    buttonLink: "Pixelup.cl",
    buttonText: "Pixelup.cl",
    mainImageLink: "Pixelup.cl",


    orderNumber: 1, // Modifica este valor según tu lógica
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const [originalFileName, setOriginalFileName] = useState<string>("");

  const MAX_CHARACTERS = 200;
  const ALERT_CHARACTERS = 199;

  const fetchBannerHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_BANNER_BLOG_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_BANNER_BLOG_IMGID}`;


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
      console.log(bannerImage, "bannerimage");
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataHero({ ...formDataHero, [name]: value });
  };

  const handleEditorChange = (value: string) => {
    if (value.length <= MAX_CHARACTERS) {
      setFormDataHero({ ...formDataHero, landingText: value });
    }
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

      // Send updated data to the server
      const bannerId = `${process.env.NEXT_PUBLIC_BANNER_BLOG_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_BANNER_BLOG_IMGID}`;

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

      // Optionally, you can refetch the banner data to ensure it's updated
      fetchBannerHome();
    } catch (error) {
      console.error("Error updating banner:", error);
      // Handle error
    } finally {
      setLoading(false); // Ocultar el indicador de carga
      setIsMainImageUploaded(false);
    }
  };

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    imageKey: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name); // Guardar el nombre del archivo original
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);

        const imageInfo = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: result,
        };
        setFormDataHero((prevFormDataHero: any) => ({
          ...prevFormDataHero,
          [imageKey]: imageInfo,
        }));
        // Actualizar updatedBannerData con la información de la imagen
        setUpdatedBannerData((prevData: any) => ({
          ...prevData,
          [imageKey]: imageInfo,
        }));
        setIsModalOpen(true); // Abrir el modal para recortar la imagen
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null); // Limpiar la imagen seleccionada
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Prevenir comportamiento predeterminado del Tab
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
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
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

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
        name: originalFileName, // Usar el nombre del archivo original
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      setFormDataHero((prevFormDataHero: any) => ({
        ...prevFormDataHero,
        mainImage: imageInfo,
      }));
      setMainImageHero(base64);
      setIsModalOpen(false);
      setIsMainImageUploaded(true);
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
    <section id="banner" className="w-full">
      <div>
        {bannerData && (
          <div 
            className="carousel relative bg-cover bg-center text-white h-[300px] flex items-center justify-center"
            style={{ backgroundImage: `url(${bannerData[0].mainImage.url})` }}
          >
            <div className="carousel-item flex flex-col justify-center items-center w-full bg-gradient-to-r from-black/30 via-black/70 to-black/30 h-full">
              <div className="p-8 flex flex-col justify-center items-center">
                <h1 className="text-6xl font-bold mb-4 font-oswald">
                  {bannerData[0].title}
                </h1>
{/*                 <p 
                  className="mb-6"
                  dangerouslySetInnerHTML={{ __html: bannerData[0].landingText }}
                /> */}
              </div>
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
        <div className="grid gap-4"></div>
        <h3 className="font-normal text-primary">
          Titulo <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="title"
          value={formDataHero.title}
          onChange={handleChange}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          style={{ borderRadius: "var(--radius)" }}
          placeholder="Title"
        />
{/*         <input
          type="text"
          name="mainImageLink"
          value={formDataHero.mainImageLink}
          onChange={handleChange}
          className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />{" "}
        <h3 className="font-normal text-primary">
          Párrafo <span className="text-primary">*</span>
        </h3>
        <ReactQuill
          value={formDataHero.landingText}
          onChange={handleEditorChange}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          style={{ borderRadius: "var(--radius)" }}
          placeholder="Landing Text"
          onKeyDown={handleKeyDown}
        /> 
        <div className="text-right text-sm text-gray-600">
          {formDataHero.landingText.length}/{MAX_CHARACTERS}
        </div>
        {formDataHero.landingText.length > ALERT_CHARACTERS && (
          <div
            className="flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
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
              <span className="font-medium">Limite Alcanzado!</span> Los
              caracteres extras no seran mostrados.
            </div>
          </div>
        )}*/}
        <div>
          <input
            type="file"
            accept="image/*"
            id="mainImageHero"
            className="hidden"
            onChange={(e) =>
              handleImageChange(e, setMainImageHero, "mainImageHero")
            }
          />
          {isMainImageUploaded ? (
            <div className="flex flex-col items-center mt-3 relative">
              <h4 className="font-normal text-primary text-center text-slate-600 w-full">
                Tu fotografía{" "}
                <span className="text-dark">
                  {" "}
                  {formDataHero.mainImage.name}
                </span>{" "}
                ya ha sido cargada.
                <br /> Actualiza para ver los cambios.
              </h4>

              <button
                className="bg-red-500 gap-4 flex item-center justify-center px-4 py-2 hover:bg-red-700 text-white rounded-full   text-xs mt-4"
                onClick={() => handleClearImage(setMainImageHero)}
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
                htmlFor="mainImageHero"
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
                    PNG, JPG o Webp (800x800px)
                  </p>
                </div>
              </label>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary  font-bold py-2 px-4 rounded flex-wrap mt-6"
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
              fill="currentColor"
            />
          </svg>
          {loading ? "Loading..." : "Actualizar Banner"}
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
              aspect={1920 / 300}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
            <div className="controls"></div>
          </div>
          <div className="flex flex-col  justify-end ">
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
                className="zoom-range w-full custom-range "
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
                  setMainImageHero(null);
                  setIsMainImageUploaded(false);
                  setIsModalOpen(false);
                }}
                className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
};

export default BannerBlog01BO;