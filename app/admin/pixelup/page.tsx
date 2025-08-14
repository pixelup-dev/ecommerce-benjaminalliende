"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

const ContentBlockForm = () => {
  const [title, setTitle] = useState("");
  const [contentText, setContentText] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [landingText, setLandingText] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonLink, setButtonLink] = useState("");
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [contentBlocks, setContentBlocks] = useState([]);

  useEffect(() => {
    fetchContentBlocks();
  }, []);

  const fetchContentBlocks = async () => {
    const token = getCookie("AdminTokenAuth");

    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data, "response.data blocks");
      if (response.status === 200) {
        setContentBlocks(response.data.attributes);
      }
    } catch (error) {
      console.error("Error fetching content blocks:", error);
    }
  };

  const handleContentSubmit = async (e: any) => {
    e.preventDefault();

    const token = getCookie("AdminTokenAuth");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title,
          contentText,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        setTitle("");
        setContentText("");
        fetchContentBlocks(); // Refresh the list after adding new content block
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleBannerSubmit = async (e: any) => {
    e.preventDefault();

    const token = getCookie("AdminTokenAuth");

    if (!mainImage) {
      console.log("Imagen principal es requerida");
      return;
    }

    try {
      const mainImageBase64 = await toBase64(mainImage);
      const mainImageDataUrl = `data:${mainImage.type};base64,${mainImageBase64}`;

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          title: bannerTitle,
          landingText,
          buttonText,
          buttonLink,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 201) {
        console.log(response.data.banner.id, "Banner creado con éxito");
        const bannerId = response.data.banner.id; // Asumiendo que la respuesta contiene el ID del banner creado
        const imageResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            title: bannerTitle,
            landingText,
            buttonText,
            buttonLink,
            orderNumber: 1,
            mainImageLink: "https://www.google.cl/123",
            mainImage: {
              name: "pixelup.cl",
              type: "image/png",
              size: 10385,
              data: mainImageDataUrl,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(imageResponse.data, "AAAAA");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (reader.result) {
          resolve(String(reader.result).split(",")[1]);
        } else {
          reject(new Error("reader.result is null"));
        }
      };
      reader.onerror = (error) => reject(error);
    });

  const handleImageChange = (e: any) => {
    setMainImage(e.target.files[0]);
  };

  return (
    <section>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && (
        <p className="text-green-500 mb-4">Formulario enviado con éxito!</p>
      )}
      <div className="w-full px-10 mx-auto flex gap-6 py-20">
        <div className="p-4 bg-white shadow-md rounded w-[400px]">
          <h2 className="text-2xl font-bold mb-4">Crear Content Block</h2>
          <form onSubmit={handleContentSubmit}>
            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Título
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="contentText"
                className="block text-sm font-medium text-gray-700"
              >
                Contenido
              </label>
              <textarea
                id="contentText"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Enviar
            </button>
          </form>
        </div>

        <div className="p-4 bg-white shadow-md rounded">
          <h2 className="text-2xl font-bold mt-8 mb-4">Crear Banner</h2>
          <form onSubmit={handleBannerSubmit}>
            <div className="mb-4">
              <label
                htmlFor="bannerTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Título del Banner
              </label>
              <input
                type="text"
                id="bannerTitle"
                value={bannerTitle}
                onChange={(e) => setBannerTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="landingText"
                className="block text-sm font-medium text-gray-700"
              >
                Texto de Bienvenida
              </label>
              <textarea
                id="landingText"
                value={landingText}
                onChange={(e) => setLandingText(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="buttonText"
                className="block text-sm font-medium text-gray-700"
              >
                Texto del Botón
              </label>
              <input
                type="text"
                id="buttonText"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="buttonLink"
                className="block text-sm font-medium text-gray-700"
              >
                Enlace del Botón
              </label>
              <input
                type="url"
                id="buttonLink"
                value={buttonLink}
                onChange={(e) => setButtonLink(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="mainImage"
                className="block text-sm font-medium text-gray-700"
              >
                Imagen Principal
              </label>
              <input
                type="file"
                id="mainImage"
                onChange={handleImageChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 p-4 bg-white shadow-md rounded">
        <h2 className="text-2xl font-bold mb-4">Listado de Content Blocks</h2>
        {contentBlocks.length > 0 ? (
          <ul>
            {contentBlocks.map((block: any) => (
              <li
                key={block.title}
                className="mb-2 border-b pb-2"
              >
                <h2>{block.id}</h2>
                <h3 className="text-lg font-bold">{block.title}</h3>
                <p>{block.contentText}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay Content Blocks disponibles.</p>
        )}
      </div>
    </section>
  );
};

export default ContentBlockForm;
