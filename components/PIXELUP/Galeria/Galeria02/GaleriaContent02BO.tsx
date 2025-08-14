import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";

interface ContentData {
  id: string;
  title: string;
  buttonLink: string;
}

const GaleriaContent02BO: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentData>({
    id: "",
    title: "",
    buttonLink: "",
  });

  // Funciones para manejar URLs de YouTube
  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const convertToEmbedUrl = (url: string): string => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return url;
    
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&playlist=${videoId}&rel=0&modestbranding=1&controls=0&showinfo=0&enablejsapi=1`;
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_GALERIA02_IMGID}`;

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
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_GALERIA02_IMGID}`;

      const embedUrl = convertToEmbedUrl(content.buttonLink);

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          ...content,
          buttonLink: embedUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.banner) {
        setContent(response.data.banner);
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

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <h3 className="text-lg font-semibold mb-4">Contenido Galería</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL del video (YouTube)
          </label>
          <input
            type="text"
            value={content.buttonLink}
            onChange={(e) => {
              const url = e.target.value;
              const embedUrl = convertToEmbedUrl(url);
              setContent({ ...content, buttonLink: embedUrl });
            }}
            className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
            placeholder="Ej: https://www.youtube.com/watch?v=VIDEO_ID"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-bold text-white transition-colors duration-300 flex items-center justify-center gap-2 ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-secondary"
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

export default GaleriaContent02BO;
