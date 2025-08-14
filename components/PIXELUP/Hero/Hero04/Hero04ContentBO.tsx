import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface ContentData {
  id: string;
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link"],
    [{ color: [] }],
    ["clean"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "list",
  "bullet",
  "link",
  "color",
];

const Hero04ContentBO: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentData>({
    id: "",
    title: "",
    landingText: "",
    buttonLink: "",
    buttonText: "Pixel Up",
  });
  const [misionCharCount, setMisionCharCount] = useState(0);
  const MAX_MISION_CHARS = 200;

  const getTextLength = useCallback((htmlString: string) => {
    if (typeof window !== "undefined") {
      const temp = document.createElement("div");
      temp.innerHTML = htmlString;
      const textContent = temp.textContent || temp.innerText;
      return textContent.trim().length;
    } else {
      // Fallback para entorno de servidor
      return htmlString.replace(/<[^>]*>/g, "").trim().length;
    }
  }, []);

  useEffect(() => {
    if (content.buttonLink && !misionCharCount) {
      const length = getTextLength(content.buttonLink);
      setMisionCharCount(length);
    }
  }, [content.buttonLink, misionCharCount, getTextLength]);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO04_IMGID}`;

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.banner) {
        const misionLength = getTextLength(response.data.banner.buttonLink);
        if (misionLength > MAX_MISION_CHARS) {
          toast.error(
            `El texto actual de la misión excede el nuevo límite de ${MAX_MISION_CHARS} caracteres`,
            {
              duration: 5000,
              position: "top-right",
              icon: "⚠️",
            }
          );
        }
        setContent(response.data.banner);
      }
    } catch (error) {
      console.error("Error al obtener el contenido:", error);
      toast.error("Error al cargar el contenido", {
        duration: 3000,
        position: "top-right",
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  }, [getTextLength, MAX_MISION_CHARS]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent, getTextLength]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const misionLength = getTextLength(content.buttonLink);
    if (misionLength > MAX_MISION_CHARS) {
      toast.error(
        "No se puede guardar. El texto de la misión excede el límite permitido",
        {
          duration: 4000,
          position: "top-right",
          icon: "❌",
        }
      );
      return;
    }

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO04_IMGID}`;

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        content,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.banner) {
        setContent(response.data.banner);
        const newLength = getTextLength(response.data.banner.buttonLink);
        setMisionCharCount(newLength);
      }

      toast.success("Contenido guardado exitosamente", {
        duration: 3000,
        position: "top-right",
        icon: "✅",
      });
    } catch (error) {
      console.error("Error al actualizar el contenido:", error);
      toast.error("Error al guardar el contenido", {
        duration: 4000,
        position: "top-right",
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMisionChange = (value: string) => {
    const length = getTextLength(value);
    const prevLength = getTextLength(content.buttonLink);

    setContent({ ...content, buttonLink: value });
    setMisionCharCount(length);

    // Solo mostrar aviso cuando RECIÉN excede el límite
    if (length > MAX_MISION_CHARS && prevLength <= MAX_MISION_CHARS) {
      toast.error(
        `El texto excede el límite de ${MAX_MISION_CHARS} caracteres`,
        {
          duration: 3000,
          position: "top-right",
          icon: "⚠️",
        }
      );
    }
    // Solo mostrar aviso cuando RECIÉN está por exceder el límite
    else if (
      length > MAX_MISION_CHARS - 25 &&
      prevLength <= MAX_MISION_CHARS - 25
    ) {
      toast.error(
        `¡Atención! Te quedan ${MAX_MISION_CHARS - length} caracteres`,
        {
          duration: 2000,
          position: "top-right",
          icon: "⚠️",
        }
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <h3 className="text-lg font-semibold mb-4">Contenido About</h3>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título Principal
          </label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
            placeholder="Ej: Hola, soy Pixel Up"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido Principal
          </label>
          <div className="prose max-w-full">
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={formats}
              value={content.landingText}
              onChange={(value) =>
                setContent({ ...content, landingText: value })
              }
              className="h-[200px] mb-12"
              placeholder="Escribe aquí tu historia personal..."
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Mi Misión
            </label>
            <span
              className={`text-sm ${
                misionCharCount > MAX_MISION_CHARS - 25
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
            >
              {misionCharCount}/{MAX_MISION_CHARS} caracteres
            </span>
          </div>
          <div className="prose max-w-full">
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={formats}
              value={content.buttonLink}
              onChange={handleMisionChange}
              className="h-[200px] mb-12"
              placeholder="Describe tu misión (máximo 200 caracteres)..."
            />
            {misionCharCount > MAX_MISION_CHARS && (
              <p className="text-red-500 text-sm mt-1">
                El texto excede el límite de {MAX_MISION_CHARS} caracteres
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || misionCharCount > MAX_MISION_CHARS}
          className={`w-full py-2 px-4 rounded font-bold text-white transition-colors duration-300 flex items-center justify-center gap-2 ${
            loading || misionCharCount > MAX_MISION_CHARS
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-secondary"
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Guardar Cambios</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Hero04ContentBO;
