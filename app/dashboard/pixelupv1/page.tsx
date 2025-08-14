"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";

const ContentBlockForm = () => {
  const { executeRecaptcha } = useGoogleReCaptcha();
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [variables, setVariables] = useState<
    Array<{
      nombre: string;
      tipo: string;
      id?: string;
    }>
  >([]);
  const [nombreVariable, setNombreVariable] = useState("");
  const [tipoVariable, setTipoVariable] = useState("");
  const [idsGenerados, setIdsGenerados] = useState<
    Array<{
      nombre: string;
      id: string;
    }>
  >([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Nuevos estados para siteId personalizado
  const [useCustomSiteId, setUseCustomSiteId] = useState(false);
  const [customSiteId, setCustomSiteId] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customPassword, setCustomPassword] = useState("");
  const [customToken, setCustomToken] = useState("");
  const [showCustomLogin, setShowCustomLogin] = useState(false);
  const [customLoginLoading, setCustomLoginLoading] = useState(false);
  const [customLoginError, setCustomLoginError] = useState("");

  useEffect(() => {
    fetchContentBlocks();
    const fetchUserData = async () => {
      const token = getCookie("AdminTokenAuth");
      try {
        if (!token) return;

        const decodedToken = jwtDecode<{ sub: string }>(token as string);
        const userId = decodedToken.sub;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/users/${userId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userEmail = response.data.user.email;
        setUserEmail(userEmail);
        // Autorizar automáticamente solo si es el usuario de PixelUP
        if (userEmail === "hola.pixelup@gmail.com") {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
      }
    };

    fetchUserData();
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

  // Función para login con siteId personalizado
  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomLoginLoading(true);
    setCustomLoginError("");

    if (!executeRecaptcha) {
      console.error("Execute recaptcha not yet available");
      setCustomLoginLoading(false);
      return;
    }

    try {
      const recaptchaToken = await executeRecaptcha("login");

      const data = {
        email: customEmail.toLowerCase(),
        password: customPassword,
        recaptchaToken: recaptchaToken,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/authentications`,
        data
      );

      if (response.status === 200) {
        const token = response.data.token;
        setCustomToken(token);
        setShowCustomLogin(false);
        setCustomLoginError("");
        alert("Login exitoso con siteId personalizado");
      } else {
        throw new Error("Error durante el login");
      }
    } catch (error: any) {
      console.error("Error durante el login personalizado:", error);
      setCustomLoginError(
        "Error de inicio de sesión. Por favor, verifica tus credenciales."
      );
    } finally {
      setCustomLoginLoading(false);
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

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode === "vamoscontodo") {
      setIsAuthorized(true);
    } else {
      alert("Código incorrecto. Por favor, intente nuevamente.");
      setAccessCode("");
    }
  };

  const generarVariables = async () => {
    // Determinar qué token y siteId usar
    const token = useCustomSiteId ? customToken : getCookie("AdminTokenAuth");
    const siteId = useCustomSiteId
      ? customSiteId
      : process.env.NEXT_PUBLIC_API_URL_SITEID;

    if (!token) {
      alert("No hay token disponible. Por favor, inicia sesión.");
      return;
    }

    if (useCustomSiteId && !customSiteId) {
      alert("Por favor, ingresa un siteId personalizado.");
      return;
    }

    const nuevosIds = [];
    const bannerPairs: { [key: string]: string } = {};

    // Primero procesamos los bannerID
    for (const variable of variables) {
      if (variable.tipo === "bannerID") {
        try {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners?siteId=${siteId}`,
            {
              title: variable.nombre,
              landingText: "pixelup",
              buttonText: "pixelup",
              buttonLink: "https://pixelup.cl",
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const bannerId = response.data.banner.id;
          const baseVarName = variable.nombre.replace("_ID", "");
          bannerPairs[baseVarName] = bannerId;

          nuevosIds.push({
            nombre: variable.nombre,
            id: bannerId,
          });
        } catch (error) {
          console.error(
            `Error generando Banner ID para ${variable.nombre}:`,
            error
          );
        }
      }
    }

    // Luego procesamos los demás tipos
    for (const variable of variables) {
      try {
        if (variable.tipo === "contentblock") {
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks?siteId=${siteId}`,
            {
              title: variable.nombre,
              contentText: "Contenido inicial",
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          nuevosIds.push({
            nombre: variable.nombre,
            id: response.data.contentBlock.id,
          });
        } else if (variable.tipo === "bannerIMGID") {
          const baseVarName = variable.nombre.replace("_IMGID", "");
          const bannerId = bannerPairs[baseVarName];

          if (bannerId) {
            // Crear un nuevo Blob con un pixel transparente
            const transparentPixel = new Blob(
              [
                new Uint8Array([
                  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00,
                  0x00, 0x0d, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01,
                  0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f,
                  0x15, 0xc4, 0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41,
                  0x54, 0x78, 0x9c, 0x63, 0x00, 0x00, 0x00, 0x05, 0x00, 0x01,
                  0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45,
                  0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
                ]),
              ],
              { type: "image/png" }
            );

            // Convertir el Blob a File
            const defaultImage = new File([transparentPixel], "default.png", {
              type: "image/png",
            });

            try {
              // Usar la misma función toBase64 que se usa en handleBannerSubmit
              const defaultImageBase64 = await toBase64(defaultImage);

              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images?siteId=${siteId}`,
                {
                  title: variable.nombre,
                  landingText: "pixelup",
                  buttonText: "pixelup",
                  buttonLink: "https://pixelup.cl",
                  orderNumber: 1,
                  mainImageLink: "https://pixelup.cl/default-image.jpg",
                  mainImage: {
                    name: "default.png",
                    type: "image/png",
                    size: 1024,
                    data: `data:image/png;base64,${defaultImageBase64}`,
                  },
                },
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              nuevosIds.push({
                nombre: variable.nombre,
                id: response.data.banner.id,
              });
            } catch (error: any) {
              console.error(
                `Error generando Banner IMG ID para ${variable.nombre}:`,
                error
              );
              console.error("Error details:", error.response?.data);
            }
          } else {
            console.error(
              `No se encontró un banner ID correspondiente para ${variable.nombre}`
            );
          }
        }
      } catch (error) {
        console.error(`Error generando ID para ${variable.nombre}:`, error);
      }
    }

    setIdsGenerados(nuevosIds);
    setVariables([]); // Limpiar la lista de variables después de generar
  };

  const handleVariableInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lines = e.target.value.split("\n").filter((line) => line.trim());

    // Procesar cada línea y determinar automáticamente el tipo
    const nuevasVariables = lines
      .map((line) => {
        const nombre = line.trim();
        let tipo = "";

        if (nombre.endsWith("_CONTENTBLOCK")) {
          tipo = "contentblock";
        } else if (nombre.endsWith("_IMGID")) {
          tipo = "bannerIMGID";
        } else if (nombre.endsWith("_ID")) {
          tipo = "bannerID";
        }

        return { nombre, tipo };
      })
      .filter((v) => v.tipo); // Solo incluir variables con tipo válido

    setVariables([...variables, ...nuevasVariables]);
    setNombreVariable("");
  };

  const copiarIdsGenerados = () => {
    const texto = idsGenerados
      .map((item) => `${item.nombre}=${item.id}`)
      .join("\n");

    navigator.clipboard
      .writeText(texto)
      .then(() => {
        alert("IDs copiados al portapapeles");
      })
      .catch((err) => {
        console.error("Error al copiar:", err);
        alert("Error al copiar los IDs");
      });
  };

  if (!isAuthorized && userEmail !== "hola.pixelup@gmail.com") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="p-8 bg-white rounded-lg shadow-md w-96">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Acceso Restringido
          </h2>
          <form onSubmit={handleCodeSubmit}>
            <div className="mb-4">
              <label
                htmlFor="accessCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Ingrese el código de acceso
              </label>
              <input
                type="password"
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Verificar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <section>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && (
        <p className="text-green-500 mb-4">Formulario enviado con éxito!</p>
      )}
      <div className="w-full px-10 mx-auto flex gap-6 py-20">
        <div className="p-4 bg-white shadow-md rounded w-[800px]">
          <h2 className="text-2xl font-bold mb-4">Generador de Variables</h2>

          {/* Configuración de SiteId */}
          <div className="mb-6 p-4 border border-gray-200 rounded-lg">
            <h3 className="font-bold mb-3">Configuración de SiteId</h3>
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useCustomSiteId}
                  onChange={() => setUseCustomSiteId(false)}
                  className="mr-2"
                />
                Usar SiteId por defecto (
                {process.env.NEXT_PUBLIC_API_URL_SITEID})
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useCustomSiteId}
                  onChange={() => setUseCustomSiteId(true)}
                  className="mr-2"
                />
                Usar SiteId personalizado
              </label>
            </div>

            {useCustomSiteId && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SiteId Personalizado
                  </label>
                  <input
                    type="text"
                    value={customSiteId}
                    onChange={(e) => setCustomSiteId(e.target.value)}
                    placeholder="Ingresa el siteId personalizado"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                {!customToken ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 mb-3">
                      Para usar un siteId personalizado, necesitas iniciar
                      sesión con las credenciales de ese sitio.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowCustomLogin(true)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    >
                      Iniciar Sesión
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">
                      ✓ Sesión iniciada con siteId personalizado
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomToken("");
                        setCustomSiteId("");
                      }}
                      className="text-sm text-red-600 hover:text-red-800 mt-2"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 mb-4">
            <textarea
              placeholder="Ingresa las variables (una por línea)
Ejemplo:
VARIABLE_CONTENTBLOCK
VARIABLE_ID
VARIABLE_IMGID"
              value={nombreVariable}
              onChange={handleVariableInput}
              className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[100px]"
            />
          </div>

          <div className="mb-4">
            <h3 className="font-bold mb-2">Variables pendientes:</h3>
            <ul>
              {variables.map((variable, index) => (
                <li
                  key={index}
                  className="mb-2"
                >
                  {variable.nombre} - {variable.tipo}
                </li>
              ))}
            </ul>
          </div>

          {variables.length > 0 && (
            <button
              onClick={generarVariables}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Generar variables
            </button>
          )}

          {idsGenerados.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">IDs generados:</h3>
                <button
                  onClick={copiarIdsGenerados}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="13"
                      height="13"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  Copiar todos
                </button>
              </div>
              <div className="bg-gray-100 p-4 rounded-md">
                {idsGenerados.map((item, index) => (
                  <div
                    key={index}
                    className="mb-2"
                  >
                    {item.nombre}={item.id}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Login Personalizado */}
      {showCustomLogin && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-[9999]">
          <div className="bg-white p-8 rounded-lg shadow-md w-96">
            <h3 className="text-2xl font-bold mb-6 text-center">
              Login con SiteId Personalizado
            </h3>

            {customLoginError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {customLoginError}</span>
              </div>
            )}

            <form onSubmit={handleCustomLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={customLoginLoading}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {customLoginLoading ? "Cargando..." : "Iniciar Sesión"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomLogin(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default function App() {
  const siteKey = process.env.RECAPTCHA_SITE_KEY || "";
  return (
    <GoogleReCaptchaProvider reCaptchaKey={siteKey}>
      <ContentBlockForm />
    </GoogleReCaptchaProvider>
  );
}
