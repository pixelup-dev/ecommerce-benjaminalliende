import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import Link from "next/link";

interface ContentData {
  id: string;
  title: string;
  landingText: string;
  buttonLink: string;
  buttonText: string;
}

interface LandingTextContent {
  mainTitle: string;
  mainDescription: string;
  features: {
    title1: string;
    description1: string;
    price: string;
    time: string;
    planLabel: string;
    notIncluded: string;
    weekdaysSchedule: string;
    saturdaySchedule: string;
    plan2Label: string;
    plan2Title1: string;
    plan2Price: string;
    plan2Time: string;
    plan2Description1: string;
    plan2NotIncluded: string;
    plan2WeekdaysSchedule: string;
    plan2SaturdaySchedule: string;
  };
  buttonText: string;
  buttonLink: string;
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

const defaultLandingContent: LandingTextContent = {
  mainTitle: "",
  mainDescription: "",
  features: {
    title1: "",
    description1: "",
    price: "",
    time: "",
    planLabel: "",
    notIncluded: "",
    weekdaysSchedule: "",
    saturdaySchedule: "",
    plan2Label: "",
    plan2Title1: "",
    plan2Price: "",
    plan2Time: "",
    plan2Description1: "",
    plan2NotIncluded: "",
    plan2WeekdaysSchedule: "",
    plan2SaturdaySchedule: "",
  },
  buttonText: "Agendar",
  buttonLink: "/agendar",
};

const Hero15BO: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentData>({
    id: "",
    title: "Hero 15",
    landingText: "",
    buttonLink: "/agendar",
    buttonText: "Agendar",
  });
  const [landingContent, setLandingContent] = useState<LandingTextContent>(
    defaultLandingContent
  );
  const [misionCharCount, setMisionCharCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const MAX_MISION_CHARS = 200;

  // Estados para los inputs de pills
  const [plan1IncludesInput, setPlan1IncludesInput] = useState("");
  const [plan1NotIncludesInput, setPlan1NotIncludesInput] = useState("");
  const [plan2IncludesInput, setPlan2IncludesInput] = useState("");
  const [plan2NotIncludesInput, setPlan2NotIncludesInput] = useState("");

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

  useEffect(() => {
    try {
      const parsedContent = JSON.parse(content.landingText || "{}");
      // Asegurarse de que el contenido parseado tenga la estructura correcta
      const validContent = {
        ...defaultLandingContent,
        ...parsedContent,
        features: {
          ...defaultLandingContent.features,
          ...(parsedContent.features || {}),
        },
        buttonLink: content.buttonLink || "/agendar",
      };
      setLandingContent(validContent);
    } catch (error) {
      console.error("Error al parsear landingText:", error);
      setLandingContent(defaultLandingContent);
    }
  }, [content.landingText, content.buttonLink]);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO15_IMGID}`;

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
      toast.error("Error al cargar el contenido");
    } finally {
      setLoading(false);
    }
  }, [getTextLength, MAX_MISION_CHARS]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent, getTextLength]);

  // Función para formatear URLs
  const formatURL = (url: string): string => {
    // Si está vacío o es solo espacios en blanco, devolver string vacío
    if (!url || url.trim() === "") return "";

    let formattedURL = url.trim().toLowerCase();

    // Si es una ruta interna que comienza con /, la devolvemos tal cual
    if (formattedURL.startsWith("/")) return formattedURL;

    // Si no tiene protocolo (http/https)
    if (
      !formattedURL.startsWith("http://") &&
      !formattedURL.startsWith("https://")
    ) {
      // Si comienza con www., agregamos https://
      if (formattedURL.startsWith("www.")) {
        formattedURL = "https://" + formattedURL;
      }
      // Si no comienza con www., agregamos https://www.
      else {
        // Excluimos dominios comunes que no necesitan www
        const noWWWDomains = [
          "localhost",
          "mail.",
          "api.",
          "app.",
          "dev.",
          "stage.",
        ];
        const shouldAddWWW = !noWWWDomains.some((domain) =>
          formattedURL.startsWith(domain)
        );

        formattedURL = "https://" + (shouldAddWWW ? "www." : "") + formattedURL;
      }
    }

    return formattedURL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const misionLength = getTextLength(content.buttonLink);
    if (misionLength > MAX_MISION_CHARS) {
      toast.error(
        "No se puede guardar. El texto de la misión excede el límite permitido"
      );
      return;
    }

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO15_IMGID}`;

      // Formatear el buttonLink antes de enviar
      const formattedButtonLink = formatURL(content.buttonLink || "/agendar");

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          ...content,
        title: content.title || "Hero 15",
          buttonLink: formattedButtonLink,
          buttonText: content.buttonText || "Agendar",
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
        const newLength = getTextLength(response.data.banner.buttonLink);
        setMisionCharCount(newLength);
      }

      toast.success("Contenido actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar el contenido:", error);
      if (axios.isAxiosError(error)) {
        console.error("Detalles del error:", {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        toast.error(
          error.response?.data?.message ||
            "Error al actualizar el contenido. Por favor, intente nuevamente."
        );
      } else {
        toast.error(
          "Error al actualizar el contenido. Por favor, intente nuevamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLandingContentChange = (
    field: keyof LandingTextContent,
    value: string
  ) => {
    const newContent = { ...landingContent, [field]: value };
    setLandingContent(newContent);
    setContent({ ...content, landingText: JSON.stringify(newContent) });
  };

  const handleFeatureChange = (
    featureField: keyof LandingTextContent["features"],
    value: string
  ) => {
    const newContent = {
      ...landingContent,
      features: {
        ...landingContent.features,
        [featureField]: value,
      },
    };
    setLandingContent(newContent);
    setContent({ ...content, landingText: JSON.stringify(newContent) });
  };

  const handleMisionChange = (value: string) => {
    const length = getTextLength(value);
    const prevLength = getTextLength(content.buttonLink);

    setContent({ ...content, buttonLink: value });
    setLandingContent((prev) => ({ ...prev, buttonLink: value }));
    setMisionCharCount(length);

    // Solo mostrar aviso cuando RECIÉN excede el límite
    if (length > MAX_MISION_CHARS && prevLength <= MAX_MISION_CHARS) {
      toast.error(
        `El texto excede el límite de ${MAX_MISION_CHARS} caracteres`
      );
    }
    // Solo mostrar aviso cuando RECIÉN está por exceder el límite
    else if (
      length > MAX_MISION_CHARS - 25 &&
      prevLength <= MAX_MISION_CHARS - 25
    ) {
      toast.error(
        `¡Atención! Te quedan ${MAX_MISION_CHARS - length} caracteres`
      );
    }
  };

  // Funciones para manejar pills
  const addPlan1Includes = () => {
    if (plan1IncludesInput.trim()) {
      const currentItems = landingContent.features.description1
        .split("\n")
        .filter((item) => item.trim() !== "");
      const newItems = [...currentItems, `• ${plan1IncludesInput.trim()}`];
      const newText = newItems.join("\n");
      handleFeatureChange("description1", newText);
      setPlan1IncludesInput("");
    }
  };

  const removePlan1Includes = (index: number) => {
    const currentItems = landingContent.features.description1
      .split("\n")
      .filter((item) => item.trim() !== "");
    const newItems = currentItems.filter((_, i) => i !== index);
    const newText = newItems.join("\n");
    handleFeatureChange("description1", newText);
  };

  const addPlan1NotIncludes = () => {
    if (plan1NotIncludesInput.trim()) {
      const currentItems = landingContent.features.notIncluded
        .split("\n")
        .filter((item) => item.trim() !== "");
      const newItems = [...currentItems, `• ${plan1NotIncludesInput.trim()}`];
      const newText = newItems.join("\n");
      handleFeatureChange("notIncluded", newText);
      setPlan1NotIncludesInput("");
    }
  };

  const removePlan1NotIncludes = (index: number) => {
    const currentItems = landingContent.features.notIncluded
      .split("\n")
      .filter((item) => item.trim() !== "");
    const newItems = currentItems.filter((_, i) => i !== index);
    const newText = newItems.join("\n");
    handleFeatureChange("notIncluded", newText);
  };

  const addPlan2Includes = () => {
    if (plan2IncludesInput.trim()) {
      const currentItems = landingContent.features.plan2Description1
        .split("\n")
        .filter((item) => item.trim() !== "");
      const newItems = [...currentItems, `• ${plan2IncludesInput.trim()}`];
      const newText = newItems.join("\n");
      handleFeatureChange("plan2Description1", newText);
      setPlan2IncludesInput("");
    }
  };

  const removePlan2Includes = (index: number) => {
    const currentItems = landingContent.features.plan2Description1
      .split("\n")
      .filter((item) => item.trim() !== "");
    const newItems = currentItems.filter((_, i) => i !== index);
    const newText = newItems.join("\n");
    handleFeatureChange("plan2Description1", newText);
  };

  const addPlan2NotIncludes = () => {
    if (plan2NotIncludesInput.trim()) {
      const currentItems = landingContent.features.plan2NotIncluded
        .split("\n")
        .filter((item) => item.trim() !== "");
      const newItems = [...currentItems, `• ${plan2NotIncludesInput.trim()}`];
      const newText = newItems.join("\n");
      handleFeatureChange("plan2NotIncluded", newText);
      setPlan2NotIncludesInput("");
    }
  };

  const removePlan2NotIncludes = (index: number) => {
    const currentItems = landingContent.features.plan2NotIncluded
      .split("\n")
      .filter((item) => item.trim() !== "");
    const newItems = currentItems.filter((_, i) => i !== index);
    const newText = newItems.join("\n");
    handleFeatureChange("plan2NotIncluded", newText);
  };

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Contenido</h3>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200"
        >
          {showPreview ? "Ocultar Vista Previa" : "Mostrar Vista Previa"}
        </button>
      </div>

      {showPreview && (
        <div className="mb-8 overflow-x-auto">
          <h3 className="font-medium text-gray-700 mb-4">Vista Previa:</h3>
          <div
            className="p-4 mb-4 text-sm text-blue-800 rounded-lg bg-blue-50"
            role="alert"
          >
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>
                Este es un preview referencial, por lo cual algunos elementos
                pueden no quedar correctamente organizados.
              </span>
            </div>
          </div>

          <div className="py-12 bg-gray-50">
            <div className="mx-auto px-4 max-w-7xl">
              <div className="text-center mb-16 mt-10">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  {landingContent.mainTitle || "Nuestros Planes"}
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  {landingContent.mainDescription ||
                    "Todos nuestros planes ofrecen un horario flexible y un servicio personalizado para cada necesidad."}
                </p>
              </div>

              {/* Planes de Arriendo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {/* Plan Básico */}
                <div className="bg-white p-8 rounded shadow-xl border-2 border-blue-100">
                  <div className="text-center mb-8">
                    <span className="bg-primary text-white text-sm font-semibold px-4 py-1 rounded">
                      {landingContent.features.planLabel || "Plan Básico"}
                    </span>
                    <h3 className="text-3xl font-bold mt-4">
                      {landingContent.features.title1 || "Pabellón Básico"}
                    </h3>
                    <div className="mt-4">
                      <span className="text-5xl font-bold text-primary">
                        {landingContent.features.price || "$120.000"}
                      </span>
                      <span className="text-gray-500">
                        /{landingContent.features.time || "2.5 horas"}
                      </span>
                    </div>
                  </div>
                  <div className="mb-8">
                    {landingContent.features.description1 &&
                      landingContent.features.description1.trim() !== "" && (
                        <>
                          <h4 className="font-semibold text-lg mb-3 text-primary">
                            Incluye:
                          </h4>
                          <div className="space-y-2">
                            {landingContent.features.description1
                              .split("\n")
                              .filter((line) => line.trim() !== "")
                              .map((line, index) => (
                                <div
                                  key={index}
                                  className="flex items-start"
                                >
                                  {line.trim().startsWith("•") ? (
                                    <span className="text-primary mr-2">•</span>
                                  ) : (
                                    <span className="text-primary mr-2">•</span>
                                  )}
                                  <span>
                                    {line.trim().replace(/^•\s*/, "")}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                  </div>
                  <div className="mb-8">
                    {landingContent.features.notIncluded &&
                      landingContent.features.notIncluded.trim() !== "" && (
                        <>
                          <h4 className="font-semibold text-lg mb-3 text-red-600">
                            No Incluye:
                          </h4>
                          <div className="space-y-2">
                            {landingContent.features.notIncluded
                              .split("\n")
                              .filter((line) => line.trim() !== "")
                              .map((line, index) => (
                                <div
                                  key={index}
                                  className="flex items-start"
                                >
                                  {line.trim().startsWith("•") ? (
                                    <span className="text-red-600 mr-2">•</span>
                                  ) : (
                                    <span className="text-red-600 mr-2">•</span>
                                  )}
                                  <span>
                                    {line.trim().replace(/^•\s*/, "")}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                  </div>

                  <div className="bg-blue-50 p-4 rounded mb-8">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-6 h-6 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-primary">
                          Horarios Disponibles
                        </h4>
                        <p className="text-sm text-gray-600">
                          {landingContent.features.weekdaysSchedule ||
                            "Lunes a Viernes 09:30-19:00"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {landingContent.features.saturdaySchedule ||
                            "Sábado 09:00-16:00"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-[#d97706] text-white px-8 py-3 rounded font-semibold w-full inline-block">
                      Reservar Ahora
                    </div>
                  </div>
                </div>

                {/* Plan Premium */}
                <div className="bg-gradient-to-br from-primary to-primary/80 p-8 rounded shadow-xl text-white">
                  <div className="text-center mb-8">
                    <span className="bg-white text-primary text-sm font-semibold px-4 py-1 rounded">
                      {landingContent.features.plan2Label || "Plan Premium"}
                    </span>
                    <h3 className="text-3xl font-bold mt-4">
                      {landingContent.features.plan2Title1 || "Pabellón Full"}
                    </h3>
                    <div className="mt-4">
                      <span className="text-5xl font-bold">
                        {landingContent.features.plan2Price || "$280.000"}
                      </span>
                      <span className="text-blue-200">
                        /{landingContent.features.plan2Time || "2.5 horas"}
                      </span>
                    </div>
                  </div>
                  <div className="mb-8">
                    {landingContent.features.plan2Description1 &&
                      landingContent.features.plan2Description1.trim() !==
                        "" && (
                        <>
                          <h4 className="font-semibold text-lg mb-3 text-blue-200">
                            Incluye Todo:
                          </h4>
                          <div className="space-y-2">
                            {landingContent.features.plan2Description1
                              .split("\n")
                              .filter((line) => line.trim() !== "")
                              .map((line, index) => (
                                <div
                                  key={index}
                                  className="flex items-start"
                                >
                                  {line.trim().startsWith("•") ? (
                                    <span className="text-blue-200 mr-2">
                                      •
                                    </span>
                                  ) : (
                                    <span className="text-blue-200 mr-2">
                                      •
                                    </span>
                                  )}
                                  <span>
                                    {line.trim().replace(/^•\s*/, "")}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                  </div>
                  <div className="mb-8">
                    {landingContent.features.plan2NotIncluded &&
                      landingContent.features.plan2NotIncluded.trim() !==
                        "" && (
                        <>
                          <h4 className="font-semibold text-lg mb-3 text-blue-200">
                            No Incluye:
                          </h4>
                          <div className="space-y-2">
                            {landingContent.features.plan2NotIncluded
                              .split("\n")
                              .filter((line) => line.trim() !== "")
                              .map((line, index) => (
                                <div
                                  key={index}
                                  className="flex items-start"
                                >
                                  {line.trim().startsWith("•") ? (
                                    <span className="text-blue-200 mr-2">
                                      •
                                    </span>
                                  ) : (
                                    <span className="text-blue-200 mr-2">
                                      •
                                    </span>
                                  )}
                                  <span>
                                    {line.trim().replace(/^•\s*/, "")}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </>
                      )}
                  </div>

                  <div className="bg-white p-4 rounded mb-8">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-6 h-6 text-[#d97706]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div>
                        <h4 className="font-semibold text-primary">
                          Horarios Disponibles
                        </h4>
                        <p className="text-sm text-primary">
                          {landingContent.features.plan2WeekdaysSchedule ||
                            "Lunes a Viernes 09:30-19:00"}
                        </p>
                        <p className="text-sm text-primary">
                          {landingContent.features.plan2SaturdaySchedule ||
                            "Sábado 09:00-16:00"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-white text-primary px-8 py-3 rounded font-semibold w-full inline-block">
                      Reservar Ahora
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
            value={landingContent.mainTitle}
            onChange={(e) =>
              handleLandingContentChange("mainTitle", e.target.value)
            }
            className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
            placeholder="Ej: Proyectos Personalizados a tu Medida"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción Principal
          </label>
          <textarea
            value={landingContent.mainDescription}
            onChange={(e) =>
              handleLandingContentChange("mainDescription", e.target.value)
            }
            className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md resize-none"
            placeholder="Escribe la descripción principal..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plan 1 */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-lg">Plan 1</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta del Plan
              </label>
              <input
                type="text"
                value={landingContent.features.planLabel}
                onChange={(e) =>
                  handleFeatureChange("planLabel", e.target.value)
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: Plan Básico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Plan 1
              </label>
              <input
                type="text"
                value={landingContent.features.title1}
                onChange={(e) => handleFeatureChange("title1", e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: Diseño Personalizado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio:
              </label>
              <input
                type="text"
                value={landingContent.features.price}
                onChange={(e) => handleFeatureChange("price", e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: $99.990"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo
              </label>
              <input
                type="text"
                value={landingContent.features.time}
                onChange={(e) => handleFeatureChange("time", e.target.value)}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: 2.5 horas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incluye:
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={plan1IncludesInput}
                  onChange={(e) => setPlan1IncludesInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addPlan1Includes())
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Escribe un elemento y presiona Enter o +"
                />
                <button
                  type="button"
                  onClick={addPlan1Includes}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {landingContent.features.description1
                  .split("\n")
                  .filter((item) => item.trim() !== "")
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                    >
                      <span>{item.trim().replace(/^•\s*/, "")}</span>
                      <button
                        type="button"
                        onClick={() => removePlan1Includes(index)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No Incluye:
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={plan1NotIncludesInput}
                  onChange={(e) => setPlan1NotIncludesInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addPlan1NotIncludes())
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Escribe un elemento y presiona Enter o +"
                />
                <button
                  type="button"
                  onClick={addPlan1NotIncludes}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {landingContent.features.notIncluded
                  .split("\n")
                  .filter((item) => item.trim() !== "")
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full"
                    >
                      <span>{item.trim().replace(/^•\s*/, "")}</span>
                      <button
                        type="button"
                        onClick={() => removePlan1NotIncludes(index)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario Lunes a Viernes
              </label>
              <input
                type="text"
                value={landingContent.features.weekdaysSchedule}
                onChange={(e) =>
                  handleFeatureChange("weekdaysSchedule", e.target.value)
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: 9:00 AM - 6:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario Sábados
              </label>
              <input
                type="text"
                value={landingContent.features.saturdaySchedule}
                onChange={(e) =>
                  handleFeatureChange("saturdaySchedule", e.target.value)
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: 9:00 AM - 1:00 PM"
              />
            </div>
          </div>

          {/* Plan 2 */}
          <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
            <h4 className="font-semibold text-lg">Plan 2</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta del Plan
              </label>
              <input
                type="text"
                value={landingContent.features.plan2Label}
                onChange={(e) =>
                  handleFeatureChange("plan2Label", e.target.value)
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: Plan Premium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título Plan 2
              </label>
              <input
                type="text"
                value={landingContent.features.plan2Title1}
                onChange={(e) =>
                  handleFeatureChange("plan2Title1", e.target.value)
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: Diseño Personalizado"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio:
              </label>
              <input
                type="text"
                value={landingContent.features.plan2Price}
                onChange={(e) =>
                  handleFeatureChange("plan2Price", e.target.value)
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: $99.990"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiempo
              </label>
              <input
                type="text"
                value={landingContent.features.plan2Time}
                onChange={(e) =>
                  handleFeatureChange("plan2Time", e.target.value)
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: 2.5 horas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Incluye:
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={plan2IncludesInput}
                  onChange={(e) => setPlan2IncludesInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addPlan2Includes())
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Escribe un elemento y presiona Enter o +"
                />
                <button
                  type="button"
                  onClick={addPlan2Includes}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {landingContent.features.plan2Description1
                  .split("\n")
                  .filter((item) => item.trim() !== "")
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                    >
                      <span>{item.trim().replace(/^•\s*/, "")}</span>
                      <button
                        type="button"
                        onClick={() => removePlan2Includes(index)}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No Incluye:
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={plan2NotIncludesInput}
                  onChange={(e) => setPlan2NotIncludesInput(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), addPlan2NotIncludes())
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Escribe un elemento y presiona Enter o +"
                />
                <button
                  type="button"
                  onClick={addPlan2NotIncludes}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  +
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {landingContent.features.plan2NotIncluded
                  .split("\n")
                  .filter((item) => item.trim() !== "")
                  .map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full"
                    >
                      <span>{item.trim().replace(/^•\s*/, "")}</span>
                      <button
                        type="button"
                        onClick={() => removePlan2NotIncludes(index)}
                        className="text-red-600 hover:text-red-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario Lunes a Viernes
              </label>
              <input
                type="text"
                value={landingContent.features.plan2WeekdaysSchedule}
                onChange={(e) =>
                  handleFeatureChange("plan2WeekdaysSchedule", e.target.value)
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: 9:00 AM - 6:00 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horario Sábados
              </label>
              <input
                type="text"
                value={landingContent.features.plan2SaturdaySchedule}
                onChange={(e) =>
                  handleFeatureChange("plan2SaturdaySchedule", e.target.value)
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="Ej: 9:00 AM - 1:00 PM"
              />
            </div>
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

export default Hero15BO;
