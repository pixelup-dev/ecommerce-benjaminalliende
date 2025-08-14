"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useCallback, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const Hero18BO: React.FC = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImageHero, setMainImageHero] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [originalFileName, setOriginalFileName] = useState<string>("");

  const [formDataHero, setFormDataHero] = useState<any>({
    landingText: "",
    title: "Huella Sustentable",
    buttonText: "Conoce más",
    buttonLink: "#",
    // Nuevos campos para el contenido estructurado
    epigrafe: "",
    titulo: "",
    parrafo: "",
    linkBoton: "",
    textoBoton: "",
    cards: [
      {
        titulo: "",
        texto: ""
      },
      {
        titulo: "",
        texto: ""
      },
      {
        titulo: "",
        texto: ""
      },
      {
        titulo: "",
        texto: ""
      }
    ]
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [updatedBannerData, setUpdatedBannerData] = useState({
    landingText: "",
    mainImageLink: "",
    orderNumber: 1,
    title: "Huella Sustentable",
    buttonText: "Conoce más",
    buttonLink: "#",
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const fetchBannerHome = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO18_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO18_IMGID}`;

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
      
      // Parsear el landingText si existe y tiene contenido estructurado
      let parsedData = {
        epigrafe: "",
        titulo: "",
        parrafo: "",
        linkBoton: "",
        textoBoton: "",
        cards: [
          { titulo: "", texto: "" },
          { titulo: "", texto: "" },
          { titulo: "", texto: "" },
          { titulo: "", texto: "" }
        ]
      };

      if (bannerImage.landingText) {
        try {
          // Intentar parsear como JSON
          const parsed = JSON.parse(bannerImage.landingText);
          if (parsed.epigrafe || parsed.titulo || parsed.parrafo || parsed.cards) {
            parsedData = { ...parsedData, ...parsed };
          }
        } catch (e) {
          // Si no es JSON válido, usar como texto plano
          parsedData.parrafo = bannerImage.landingText;
        }
      }

              setFormDataHero({
          landingText: bannerImage.landingText || "",
          mainImageLink: bannerImage.mainImageLink || "",
          orderNumber: 1,
          title: bannerImage.title || "Huella Sustentable",
          buttonText: bannerImage.buttonText || "Conoce más",
          buttonLink: bannerImage.buttonLink || "#",
          epigrafe: parsedData.epigrafe,
          titulo: parsedData.titulo,
          parrafo: parsedData.parrafo,
          linkBoton: parsedData.linkBoton,
          textoBoton: parsedData.textoBoton,
          cards: parsedData.cards
        });
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBannerHome();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string) => {
    if (typeof e === 'string') {
      setFormDataHero({ ...formDataHero, landingText: e });
    } else {
      const { name, value } = e.target;
      setFormDataHero({ ...formDataHero, [name]: value });
    }
  };

  const handleCardChange = (index: number, field: string, value: string) => {
    const updatedCards = [...formDataHero.cards];
    updatedCards[index] = { ...updatedCards[index], [field]: value };
    setFormDataHero({ ...formDataHero, cards: updatedCards });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      // Crear el JSON estructurado para landingText
      const structuredContent = {
        epigrafe: formDataHero.epigrafe,
        titulo: formDataHero.titulo,
        parrafo: formDataHero.parrafo,
        linkBoton: formDataHero.linkBoton,
        textoBoton: formDataHero.textoBoton,
        cards: formDataHero.cards
      };

      const updatedDataWithoutImage = {
        ...formDataHero,
        landingText: JSON.stringify(structuredContent),
        orderNumber: formDataHero.orderNumber,
      };

      if (!mainImageHero) {
        delete updatedDataWithoutImage.mainImage;
      }

      const bannerId = `${process.env.NEXT_PUBLIC_HERO18_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO18_IMGID}`;
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

      fetchBannerHome();
    } catch (error) {
      console.error("Error updating banner:", error);
    } finally {
      setLoading(false);
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
      {/* Vista Previa con el diseño de diseño.tsx */}
      <section className="py-20 bg-gray-100" id="metodologia">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
          <div className="mb-10 text-center">
            <span className="inline-block mb-2 text-primary font-semibold text-xl uppercase">
              {formDataHero.epigrafe || "Conoce mi enfoque"}
            </span>
            <h2 className="text-4xl max-w-3xl mx-auto md:text-5xl uppercase font-ubuntu font-bold text-dark mb-4 leading-tight">
              {formDataHero.titulo || "Conoce mi enfoque"}
            </h2>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-8">
              {formDataHero.parrafo || "Te escucho con atención, evalúo tu historia, tus hábitos, tus emociones para ayudarte a identificar el origen de tus síntomas, no solo a silenciarlos."}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12 mb-10">
            {/* Listado de características */}
            <div className="flex-1 space-y-6">
              {formDataHero.cards.map((card: any, index: number) => (
                <div key={index} className="bg-white p-6 mb-4 shadow flex items-center min-h-[100px]" style={{ borderRadius: "var(--radius)" }}>
                  <div>
                    <h4 className="text-xl font-bold text-dark mb-1">
                      {card.titulo || `Card ${index + 1}`}
                    </h4>
                    <p className="text-gray-600 text-[15px] leading-tight">
                      {card.texto || `Texto de la card ${index + 1}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Imagen al lado */}
            <div className="flex-1 flex justify-center">
              <div className="relative w-full max-h-[600px] overflow-hidden shadow-xl" style={{ borderRadius: "var(--radius)" }}>
                <img
                  src={bannerData?.mainImage?.url || "/pixelup.webp"}
                  alt="Imagen Hero 18"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href={formDataHero.linkBoton || "#"}
              target="_blank"
              className="bg-primary hover:scale-105 text-white font-bold px-8 py-4  shadow-lg transition inline-block"
              style={{ borderRadius: "var(--radius)" }}
            >
              {formDataHero.textoBoton || "Agenda tu consulta personalizada"}
            </a>
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
        
        <div className="grid gap-6">
          {/* Epígrafe */}
          <div>
            <h3 className="font-normal text-primary mb-2">
              Epígrafe <span className="text-primary">*</span>
            </h3>
            <input
              type="text"
              name="epigrafe"
              value={formDataHero.epigrafe}
              onChange={handleChange}
              placeholder="Ingresa el epígrafe"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Título */}
          <div>
            <h3 className="font-normal text-primary mb-2">
              Título <span className="text-primary">*</span>
            </h3>
            <input
              type="text"
              name="titulo"
              value={formDataHero.titulo}
              onChange={handleChange}
              placeholder="Ingresa el título principal"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Párrafo */}
          <div>
            <h3 className="font-normal text-primary mb-2">
              Párrafo <span className="text-primary">*</span>
            </h3>
            <textarea
              name="parrafo"
              value={formDataHero.parrafo}
              onChange={handleChange}
              placeholder="Ingresa el párrafo descriptivo"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Botón Genérico */}
          <div>
            <h3 className="font-normal text-primary mb-2">
              Botón de Acción <span className="text-primary">*</span>
            </h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Texto del Botón
                </label>
                <input
                  type="text"
                  name="textoBoton"
                  value={formDataHero.textoBoton}
                  onChange={handleChange}
                  placeholder="Ej: Agenda tu consulta personalizada"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Link del Botón
                </label>
                <input
                  type="text"
                  name="linkBoton"
                  value={formDataHero.linkBoton}
                  onChange={handleChange}
                  placeholder="Ej: /contacto o https://ejemplo.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Cards */}
          <div>
            <h3 className="font-normal text-primary mb-4">
              Cards <span className="text-primary">*</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {formDataHero.cards.map((card: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-3">Card {index + 1}</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Título
                      </label>
                      <input
                        type="text"
                        value={card.titulo}
                        onChange={(e) => handleCardChange(index, 'titulo', e.target.value)}
                        placeholder={`Título ${index + 1}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Texto
                      </label>
                      <textarea
                        value={card.texto}
                        onChange={(e) => handleCardChange(index, 'texto', e.target.value)}
                        placeholder={`Texto ${index + 1}`}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <input
          type="text"
          name="mainImageLink"
          value={formDataHero.mainImageLink}
          onChange={handleChange}
          className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />
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
              aspect={1}
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

export default Hero18BO;
