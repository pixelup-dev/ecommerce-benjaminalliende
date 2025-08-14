"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Cargar react-quill dinámicamente para evitar problemas de SSR (Server-Side Rendering)
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });


const Hero02BO: React.FC = () => {
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

  const MAX_CHARACTERS = 450;
  const ALERT_CHARACTERS = 449;

  const fetchBannerHome = async () => {
    try {
      setLoading(true); // Mostrar el indicador de carga
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO02_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO02_IMGID}`;
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${siteId}`,
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
      const bannerId = `${process.env.NEXT_PUBLIC_HERO02_ID}`;
      const bannerImageId = `${process.env.NEXT_PUBLIC_HERO02_IMGID}`;
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}?siteId=${siteId}`,
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
    }
  };

  const handleImageChange = (
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      e.preventDefault(); // Prevenir comportamiento predeterminado del Tab
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
      <div>
        {bannerData && (
          <div className="px-0 md:px-6 lg:px-0 mt-0 md:mt-18 flex justify-center">
    <div
      className="relative w-full h-[800px] md:h-[600px] bg-cover bg-center"
      style={{ borderRadius: "var(--radius)" }}
    >
              <img
                src={bannerData.mainImage.url}
                alt={bannerData.title}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
                />
      <div className="absolute top-1/2 left-1/2 lg:left-[24%] transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-75 p-4 md:p-8 rounded-lg shadow-lg max-w-lg text-gray-800 w-[90%] md:w-full">
      <h2 className="text-2xl font-bold mb-4">{bannerData.title}</h2>
                <div
                  className="mb-4 editortexto"
                  dangerouslySetInnerHTML={{ __html: bannerData.landingText }}
                />
                {/*                     <p className="mb-4">{bannerData.buttonLink}</p>
                 */}{" "}
                <a
                  
                  className="text-blue-500 hover:underline text-right"
                >
                  {bannerData.buttonText}
                </a>
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
          Título <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="title"
          value={formDataHero.title}
          onChange={handleChange}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          style={{ borderRadius: "var(--radius)" }}
          placeholder="Título"
        />
        <input
          type="text"
          name="mainImageLink"
          value={formDataHero.mainImageLink}
          onChange={handleChange}
          className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />{" "}
        <h3 className="font-normal text-primary">
          Primer Párrafo <span className="text-primary">*</span>
        </h3>
        <ReactQuill
          value={formDataHero.landingText}
          onChange={handleEditorChange}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          style={{ borderRadius: "var(--radius)" }}
          placeholder="Contenido"
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
        )}
        <div>
          <h3 className="font-normal text-primary">
            Texto Botón <span className="text-primary">*</span>
          </h3>
          <input
            type="text"
            name="buttonText"
            value={formDataHero.buttonText}
            onChange={handleChange}
            className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
            style={{ borderRadius: "var(--radius)" }}
            placeholder="Texto"
          />
        </div>
        <div>
          <h3 className="font-normal text-primary">
            Link Botón <span className="text-primary">*</span>
          </h3>
          <input
            type="text"
            name="buttonLink"
            value={formDataHero.buttonLink}
            onChange={handleChange}
            className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
            style={{ borderRadius: "var(--radius)" }}
            placeholder="Link Botón"
          />
        </div>
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
    </section>
  );
};

export default Hero02BO;
