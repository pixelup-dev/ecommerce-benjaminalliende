"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

const BannerTiendaBO = () => {
  const [bannerData, setBannerData] = useState<any | null>(null);
  const [mainImageTienda, setMainImageTienda] = useState<string | null>(null);
  const [formDataTienda, setFormDataTienda] = useState<any>({
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
      const bannerId = "0c482c67-65eb-4cbc-be04-2786262cb8fd";
      const bannerImageId = "90c5ff6c-d258-4b26-8d94-d694efdfd9e8";

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const bannerImage = productTypeResponse.data.bannerImage;
      setBannerData(bannerImage);
      setFormDataTienda({
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
    setFormDataTienda({ ...formDataTienda, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true); // Mostrar el indicador de carga
      const token = getCookie("AdminTokenAuth");

      // Crear un objeto de datos actualizado excluyendo mainImage si no hay una imagen seleccionada
      const updatedDataWithoutImage = {
        ...formDataTienda,
        orderNumber: formDataTienda.orderNumber,
      };

      if (!mainImageTienda) {
        delete updatedDataWithoutImage.mainImage;
      }

      // Send updated data to the server
      const bannerId = "0c482c67-65eb-4cbc-be04-2786262cb8fd";
      const bannerImageId = "90c5ff6c-d258-4b26-8d94-d694efdfd9e8";
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${bannerImageId}`,
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
    console.log(file, "Image file");
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
        setFormDataTienda((prevFormData: any) => ({
          ...prevFormData,
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
      <div className="relative font-[sans-serif] before:absolute before:w-full before:h-full before:inset-0 before:bg-black before:opacity-50 before:z-10">
        <img
          src={bannerData.mainImage.url}
          alt="Banner Image"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="min-h-[300px] relative z-10 h-full max-w-6xl mx-auto flex flex-col justify-center items-center text-center text-white p-6">
          <h2 className="sm:text-4xl text-2xl font-bold mb-6">
            {bannerData.title}
          </h2>
          <p className="text-lg text-center text-gray-200">
            {bannerData.landingText}
          </p>
          <a
            href={bannerData.buttonLink}
            className="mt-8 hidden bg-transparent text-white text-base font-semibold py-2.5 px-6 border-2 border-white rounded hover:bg-white hover:text-black transition duration-300 ease-in-out"
          >
            {bannerData.buttonText}
          </a>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-4 mx-auto mt-8"
      >
        <input
          type="number"
          name="orderNumber"
          value={formDataTienda.orderNumber}
          onChange={handleChange}
          className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />
        <h3 className="font-normal text-primary">
          Titulo <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="title"
          value={formDataTienda.title}
          onChange={handleChange}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          style={{ borderRadius: "var(--radius)" }}
          placeholder="Title"
        />
        <input
          type="text"
          name="mainImageLink"
          value={formDataTienda.mainImageLink}
          onChange={handleChange}
          className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
        />{" "}
        <h3 className="font-normal text-primary">
          Texto <span className="text-primary">*</span>
        </h3>
        <input
          type="text"
          name="landingText"
          value={formDataTienda.landingText}
          onChange={handleChange}
          className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
          style={{ borderRadius: "var(--radius)" }}
          placeholder="Landing Text"
        />
        {/*         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-bold uppercase hidden">Texto Boton </span>
            <input
              type="text"
              name="buttonText"
              value={formDataTienda.buttonText}
              onChange={handleChange}
              className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Button Text"
            />
          </div>
          <div>
            <span className="font-bold uppercase hidden">Link de destino </span>
            <input
              type="text"
              name="buttonLink"
              value={formDataTienda.buttonLink}
              onChange={handleChange}
              className="hidden w-full px-4 py-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Button Link"
            />
          </div>
        </div> */}
        <div>
          <input
            type="file"
            accept="image/*"
            id="mainImageTienda"
            className="hidden"
            onChange={(e) =>
              handleImageChange(e, setMainImageTienda, "mainImage")
            }
          />
          {mainImageTienda ? (
            <div>
              <h3 className="font-normal text-primary">
                Foto <span className="text-primary">*</span>
              </h3>
              <div className="relative mt-2 h-[150px] rounded-lg object-contain overflow-hidden">
                <img
                  src={mainImageTienda}
                  alt="Main Image"
                  className="w-full"
                />
                <button
                  className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 m-1 text-xs"
                  onClick={() => handleClearImage(setMainImageTienda)}
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
                htmlFor="mainImageTienda"
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
          {loading ? "Loading..." : "Actualizar"}
        </button>
      </form>
    </section>
  );
};

export default BannerTiendaBO;
