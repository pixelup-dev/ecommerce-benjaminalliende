import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { toast } from "react-hot-toast";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

import Hero17ImagesBO from "./Hero17ImagesBO";

interface ContentBlockData {
  epigrafe: string;
  mainTitle: string;
  mainDescription: string;
  imageText: string;
  features: {
    title1: string;
    title2: string;
    title3: string;
    title4: string;
  };
  casos: string[];
  historia: {
    titulo: string;
    texto: string;
  };
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

const defaultContentData: ContentBlockData = {
  epigrafe: "",
  mainTitle: "",
  mainDescription: "",
  imageText: "",
  features: {
    title1: "",
    title2: "",
    title3: "",
    title4: "",
  },
    casos: [],
  historia: {
    titulo: "",
    texto: "",
  },
};

const Hero17BO: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [contentData, setContentData] = useState<ContentBlockData>(defaultContentData);
  const [newCaso, setNewCaso] = useState("");
  const [editingCasoIndex, setEditingCasoIndex] = useState<number | null>(null);
  const [editingCasoText, setEditingCasoText] = useState("");

  const fetchContent = useCallback(async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = `${process.env.NEXT_PUBLIC_HERO17_CONTENTBLOCK}`;

      console.log('Fetching contentblock ID:', contentBlockId);
      console.log('Token disponible:', !!token);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      
      );

      console.log('Response completa:', response.data);
      console.log('Contentblock encontrado:', response.data?.contentBlock);
      console.log('ContentText encontrado:', response.data?.contentBlock?.contentText);

      if (response.data?.contentBlock?.contentText) {
        try {
          const parsed = JSON.parse(response.data.contentBlock.contentText);
          console.log('Contenido cargado del contentblock:', parsed);
          setContentData({
            ...defaultContentData,
            ...parsed,
            features: {
              ...defaultContentData.features,
              ...(parsed.features || {}),
            },
          });
          console.log('ContentData actualizado con datos del contentblock');
        } catch (error) {
          console.error("Error al parsear el contenido:", error);
          console.log('Usando datos por defecto debido a error de parsing');
          setContentData(defaultContentData);
        }
      } else {
        console.log('No se encontró contentText en la respuesta');
        console.log('Usando datos por defecto');
        setContentData(defaultContentData);
      }
    } catch (error) {
      console.error("Error al obtener el contenido:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", error.response?.data);
        console.error("Status:", error.response?.status);
        if (error.response?.status === 404) {
          console.log('Contentblock no encontrado (404)');
        }
      }
      toast.error("Error al cargar el contenido", {
        duration: 3000,
        position: "top-right",
        icon: "❌",
      });
      console.log('Usando datos por defecto debido a error');
      setContentData(defaultContentData);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Monitorear cambios en contentData
  useEffect(() => {
    console.log('contentData actualizado en BO:', contentData);
  }, [contentData]);

  const handleContentChange = (field: keyof ContentBlockData, value: any) => {
    const newContent = { ...contentData, [field]: value };
    setContentData(newContent);
  };

  const handleFeatureChange = (featureField: keyof ContentBlockData['features'], value: string) => {
    const newContent = {
      ...contentData,
      features: {
        ...contentData.features,
        [featureField]: value
      }
    };
    setContentData(newContent);
  };

  const handleHistoriaChange = (field: 'titulo' | 'texto', value: string) => {
    const newContent = {
        ...contentData,
      historia: {
        ...contentData.historia,
        [field]: value
      }
    };
    setContentData(newContent);
  };

  const handleAddCaso = () => {
    if (newCaso.trim()) {
      const updatedCasos = [...contentData.casos, newCaso.trim()];
      setContentData({ ...contentData, casos: updatedCasos });
      setNewCaso("");
    }
  };

  const handleEditCaso = (index: number) => {
    setEditingCasoIndex(index);
    setEditingCasoText(contentData.casos[index]);
  };

  const handleSaveCaso = () => {
    if (editingCasoIndex !== null && editingCasoText.trim()) {
      const updatedCasos = [...contentData.casos];
      updatedCasos[editingCasoIndex] = editingCasoText.trim();
      setContentData({ ...contentData, casos: updatedCasos });
      setEditingCasoIndex(null);
      setEditingCasoText("");
    }
  };

  const handleDeleteCaso = (index: number) => {
    const updatedCasos = contentData.casos.filter((_, i) => i !== index);
    setContentData({ ...contentData, casos: updatedCasos });
  };

  const handleSaveAll = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const contentBlockId = `${process.env.NEXT_PUBLIC_HERO17_CONTENTBLOCK}`;

      console.log('Guardando contentblock:', contentBlockId);
      console.log('Datos a guardar:', contentData);

      // Guardar todo en el contentblock
      const payload = {
        id: contentBlockId,
        title: "Hero 17 Content",
        contentText: JSON.stringify(contentData),
      };
      console.log('Payload a enviar:', payload);

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Todos los cambios guardados exitosamente", {
        duration: 3000,
        position: "top-right",
        icon: "✅",
      });
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      if (axios.isAxiosError(error)) {
        console.error("Error details:", error.response?.data);
      }
      toast.error("Error al guardar los datos", {
        duration: 4000,
        position: "top-right",
        icon: "❌",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Hero17ImagesBO />
      
      {/* Contenido del Hero */}
      <div className="max-w-5xl mx-auto mt-12">
        <h3 className="text-lg font-semibold mb-4">Contenido Hero 17</h3>
        <div className="space-y-8">
          {/* Sección de contenido principal */}
          <div className="space-y-6">
            <h4 className="font-semibold text-lg border-b pb-2">Contenido Principal</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Epígrafe
              </label>
              <input
                type="text"
                value={contentData.epigrafe}
                onChange={(e) => handleContentChange("epigrafe", e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: Hola, Soy..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Principal
              </label>
              <input
                type="text"
                value={contentData.mainTitle}
                onChange={(e) => handleContentChange("mainTitle", e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: Tu cuerpo habla… y yo te enseño a escucharlo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción Principal
              </label>
              <div className="prose max-w-full">
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  value={contentData.mainDescription}
                  onChange={(value) => handleContentChange("mainDescription", value)}
                  className="h-[200px] mb-12"
                  placeholder="Escribe la descripción principal..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto junto a las fotos
              </label>
              <input
                type="text"
                value={contentData.imageText}
                onChange={(e) => handleContentChange("imageText", e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: Experiencia Profesional"
              />
              <p className="text-sm text-gray-500 mt-1">
                Este texto aparece en la tarjeta junto a las imágenes en desktop
              </p>
            </div>
          </div>

          {/* Sección de características */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Características</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Característica 1
                </label>
                <input
                  type="text"
                  value={contentData.features.title1}
                  onChange={(e) => handleFeatureChange("title1", e.target.value)}
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Ej: Enfoque Integrativo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Característica 2
                </label>
                <input
                  type="text"
                  value={contentData.features.title2}
                  onChange={(e) => handleFeatureChange("title2", e.target.value)}
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Ej: Tratamiento Natural"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Característica 3
                </label>
                <input
                  type="text"
                  value={contentData.features.title3}
                  onChange={(e) => handleFeatureChange("title3", e.target.value)}
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Ej: Enfoque Personalizado"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Característica 4
                </label>
                <input
                  type="text"
                  value={contentData.features.title4}
                  onChange={(e) => handleFeatureChange("title4", e.target.value)}
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Ej: Resultados Garantizados"
                />
              </div>
            </div>
          </div>

          {/* Sección de casos */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Casos que acompaño</h4>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCaso}
                  onChange={(e) => setNewCaso(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCaso()}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Agregar nuevo caso..."
                />
                <button
                  onClick={handleAddCaso}
                  className="px-4 py-3 bg-primary text-white rounded-md hover:bg-secondary transition"
                >
                  Agregar
                </button>
              </div>

              <div className="space-y-2">
                {contentData.casos.map((caso, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    {editingCasoIndex === index ? (
                      <>
                        <input
                          type="text"
                          value={editingCasoText}
                          onChange={(e) => setEditingCasoText(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <button
                          onClick={handleSaveCaso}
                          className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setEditingCasoIndex(null);
                            setEditingCasoText("");
                          }}
                          className="px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">{caso}</span>
                        <button
                          onClick={() => handleEditCaso(index)}
                          className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteCaso(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sección de historia */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg border-b pb-2">Mi Historia</h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título de la Historia
              </label>
              <input
                type="text"
                value={contentData.historia.titulo}
                onChange={(e) => handleHistoriaChange("titulo", e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: Mi Historia"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido de la Historia
              </label>
              <div className="prose max-w-full">
                <ReactQuill
                  theme="snow"
                  modules={modules}
                  formats={formats}
                  value={contentData.historia.texto}
                  onChange={(value) => handleHistoriaChange("texto", value)}
                  className="h-[200px] mb-12"
                  placeholder="Escribe tu historia..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Botón de guardado al final */}
      <div className="max-w-5xl mx-auto mt-8">
        <button
          onClick={handleSaveAll}
          disabled={loading}
          className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-colors duration-300 flex items-center justify-center gap-2 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-secondary"
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Guardando todos los cambios...</span>
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
              <span>Guardar Todos los Cambios</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Hero17BO;