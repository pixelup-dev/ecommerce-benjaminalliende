"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";

const Hero01BO: React.FC = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImageHero, setMainImageHero] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [originalFileName, setOriginalFileName] = useState<string>("");

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

  const fetchBannerHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_BLOGHOME_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_BLOGHOME_IMGID}`;


      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const bannerImage = productTypeResponse.data.bannerImage;
      setBannerData(bannerImage);
      setFormDataHero({
        title: bannerImage.title,
        landingText: bannerImage.landingText,
        buttonLink: bannerImage.buttonLink,
        buttonText: bannerImage.buttonText,
        mainImageLink: bannerImage.mainImageLink,
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
      const bannerId = `${process.env.NEXT_PUBLIC_BLOGHOME_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_BLOGHOME_IMGID}`;
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
      setOriginalFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        setIsModalOpen(true);
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
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null); // Limpiar la imagen seleccionada
  };

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
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
        maxWidthOrHeight: 1200, // Ajusta las dimensiones máximas permitidas
        useWebWorker: true,
        initialQuality: 0.95, // Ajusta la calidad inicial para mantener mejor calidad visual
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: originalFileName,
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
    <section
      id="banner"
      className="w-full"
    >
{/*       <section className="w-full bg-foreground/5">
        <div className="text-gray-600 body-font">
          {bannerData && (
            <div className="container py-10 mx-auto flex flex-col items-center space-y-6 md:space-y-0 md:flex-row md:space-x-4 max-w-3xl">
              <img
                className="w-full sm:w-2/3 md:w-1/3 xl:w-2/4 object-cover object-center rounded"
                alt="hero"
                src={bannerData.mainImage.url}
                style={{ borderRadius: "var(--radius)" }}
              />
              <div className="w-full text-center md:text-left md:pl-4">
                <h4 className="text-primary text-lg md:text-xl mt-6 md:mt-0 break-words overflow-hidden">
                  {bannerData.buttonText}
                </h4>
                <h1 className="mt-2 text-3xl md:text-4xl font-bold leading-tight text-foreground break-words overflow-hidden">
                  {bannerData.title}
                </h1>
                <p className="text-base md:text-lg text-foreground py-3 break-words overflow-hidden">
                  {bannerData.landingText}
                </p>
              </div>
            </div>
          )}
        </div>
      </section> */}

      <section className="w-full bg-white mt-8">
        <div className="container mx-auto px-4">
          <h3 className="font-normal text-primary mb-4">Preview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Banner lateral */}
            <div className="relative h-[600px] md:h-full overflow-hidden rounded">
              <img
                src={bannerData?.mainImage.url || mainImageHero}
                alt="Blog Banner Preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                  {formDataHero.title || 'Título del Banner'}
                </h2>
                <p className="text-white/90 text-lg mb-6 max-w-lg">
                  {formDataHero.landingText || 'Texto descriptivo del banner'}
                </p>
                <div
                  className="inline-block bg-white hover:bg-gray-100 text-gray-900 py-3 px-8 rounded-full transition-all duration-300"
                >
                  Ver todos los artículos
                </div>
              </div>
            </div>

            {/* Panel derecho simulado */}
            <div className="space-y-8 md:p-6 bg-gray-50 rounded">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">
                Últimos Artículos
              </h3>
              <div className="space-y-8">
                {/* Artículo simulado 1 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 opacity-50">
                  <div className="md:col-span-2">
                    <div className="relative h-48 md:h-40 overflow-hidden rounded bg-gray-200"></div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                
                {/* Artículo simulado 2 */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 opacity-50">
                  <div className="md:col-span-2">
                    <div className="relative h-48 md:h-40 overflow-hidden rounded bg-gray-200"></div>
                  </div>
                  <div className="md:col-span-3">
                    <div className="h-4 w-20 bg-gray-200 rounded mb-3"></div>
                    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
        <div className="grid gap-4">
{/*           <div>
            <h3 className="font-normal text-primary">
              Encabezado <span className="text-primary">*</span>
            </h3>
            <input
              type="text"
              name="buttonText"
              value={formDataHero.buttonText}
              onChange={handleChange}
              className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
              style={{ borderRadius: "var(--radius)" }}
              placeholder="Button Text"
            />
          </div> */}
          {/*           <div>
            <span className="font-bold uppercase">Link de destino </span>
            <input
              type="text"
              name="buttonLink"
              value={formData.buttonLink}
              onChange={handleChange}
              className="block w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Button Link"
            />
          </div> */}
        </div>
        <h3 className="font-normal text-primary">
          Título <span className="text-primary">*</span>
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
        <input
          type="text"
          name="mainImageLink"
          value={formDataHero.mainImageLink}
          onChange={handleChange}
          className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />{" "}
        <h3 className="font-normal text-primary">
          Texto <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="landingText"
          value={formDataHero.landingText}
          onChange={handleChange}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          style={{ borderRadius: "var(--radius)" }}
          placeholder="Landing Text"
        />
        {/*         <div>
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
              <h3 className="font-normal text-primary">
                Foto <span className="text-primary">*</span>
              </h3>
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
            <div>
              <h3 className="font-normal text-primary">
                Foto <span className="text-primary">*</span>
              </h3>
              <label
                htmlFor="mainImageHero"
                className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed cursor-pointer w-full z-10"
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
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
              </label>
            </div>
          )}
        </div> */}
        <div>
          <input
            type="file"
            accept="image/*"
            id="mainImageHero"
            className="hidden"
            onChange={(e) =>
              handleImageChange(e, setMainImageHero, "mainImage")
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
                    PNG, JPG o Webp (400x500px)
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
              image={mainImageHero || ""} // Asegurar que se pasa una cadena no nula
              crop={crop}
              zoom={zoom}
              aspect={3 / 2}
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

export default Hero01BO;
