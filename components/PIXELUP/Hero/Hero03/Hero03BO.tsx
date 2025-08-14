"use client";
import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useRef,
} from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import Modal from "@/components/Core/Modals/ModalSeo"; // Asegúrate de importar el modal
import { getCroppedImg } from "@/lib/cropImage";
import toast from "react-hot-toast";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface ImageData {
  name: string;
  type: string;
  size: number;
  data: string;
}

interface FormData {
  title: string;
  landingText: string;
  mainImageLink: string;
  mainImage?: ImageData;
}

type ServiceType = "uno" | "dos";

const Hero03BO: React.FC = () => {
  const [activeService, setActiveService] = useState<ServiceType>("uno");
  const [loading, setLoading] = useState<boolean>(true);
  const [servicioUno, setServicioUno] = useState<any>(null);
  const [servicioDos, setServicioDos] = useState<any>(null);

  const [mainImageUno, setMainImageUno] = useState<ImageData | null>(null);
  const [mainImageDos, setMainImageDos] = useState<ImageData | null>(null);

  const [formDataUno, setFormDataUno] = useState<FormData>({
    title: "",
    landingText: "",
    mainImageLink: "",
  });

  const [formDataDos, setFormDataDos] = useState<FormData>({
    title: "",
    landingText: "",
    mainImageLink: "",
  });

  const MAX_CHARACTERS = 450;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    service: "uno" | "dos"
  ) => {
    const { name, value } = e.target;
    if (service === "uno") {
      setFormDataUno({ ...formDataUno, [name]: value });
    } else {
      setFormDataDos({ ...formDataDos, [name]: value });
    }
  };

  const handleEditorChange = (value: string, service: "uno" | "dos") => {
    if (value.length <= MAX_CHARACTERS) {
      if (service === "uno") {
        setFormDataUno({ ...formDataUno, landingText: value });
      } else {
        setFormDataDos({ ...formDataDos, landingText: value });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, service: "uno" | "dos") => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

      const bannerId =
        service === "uno"
          ? process.env.NEXT_PUBLIC_SERVICIO_UNO_ID
          : process.env.NEXT_PUBLIC_SERVICIO_DOS_ID;

      const formData = service === "uno" ? formDataUno : formDataDos;
      const mainImage = service === "uno" ? mainImageUno : mainImageDos;

      const updatedData = {
        title: formData.title || "",
        landingText: formData.landingText || "",
        buttonText: "Saber más",
        buttonLink: "/referidos",
        orderNumber: 1,
        mainImageLink: formData.mainImageLink || "",
        ...(mainImage && {
          mainImage: {
            name: mainImage.name,
            type: mainImage.type,
            size: mainImage.size,
            data: mainImage.data,
          },
        }),
      };

      await axios.put(
        `${
          process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE
        }/api/v1/banners/${bannerId}/images/${
          service === "uno"
            ? process.env.NEXT_PUBLIC_SERVICIO_UNO_IMGID
            : process.env.NEXT_PUBLIC_SERVICIO_DOS_IMGID
        }?siteId=${siteId}`,
        updatedData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessage({
        text: "Los cambios se guardaron correctamente",
        type: "success",
      });

      setLoading(false);

      await fetchData();

      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error("Error al actualizar banner:", error);
      setMessage({
        text: "Hubo un error al guardar los cambios",
        type: "error",
      });
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleImageChange = async (
    e: ChangeEvent<HTMLInputElement>,
    service: "uno" | "dos"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        setMessage({
          text: "La imagen es demasiado grande. El tamaño máximo es 5MB",
          type: "error",
        });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (service === "uno") {
          setMainImageUno({
            name: file.name,
            type: file.type,
            size: file.size,
            data: result,
          });
        } else {
          setMainImageDos({
            name: file.name,
            type: file.type,
            size: file.size,
            data: result,
          });
        }
        setIsMainImageUploaded(true);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    const mainImage = activeService === "uno" ? mainImageUno : mainImageDos;
    if (!mainImage?.data) return;

    try {
      const croppedImage = await getCroppedImg(
        mainImage.data,
        croppedAreaPixels
      );
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1800,
        useWebWorker: true,
        initialQuality: 0.9,
      };

      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo: ImageData = {
        name: fileName,
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      if (activeService === "uno") {
        setMainImageUno(imageInfo);
        setFormDataUno((prev) => ({ ...prev, mainImage: imageInfo }));
      } else {
        setMainImageDos(imageInfo);
        setFormDataDos((prev) => ({ ...prev, mainImage: imageInfo }));
      }

      setIsModalOpen(false);
      setIsMainImageUploaded(true);
      toast.success("Imagen recortada y guardada correctamente");
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const convertToBase64 = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

      // Fetch Servicio
      const responseUno = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_SERVICIO_UNO_ID}/images/${process.env.NEXT_PUBLIC_SERVICIO_UNO_IMGID}?siteId=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch Servicio Empresa
      const responseDos = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_SERVICIO_DOS_ID}/images/${process.env.NEXT_PUBLIC_SERVICIO_DOS_IMGID}?siteId=${siteId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setServicioUno(responseUno.data.bannerImage);
      setServicioDos(responseDos.data.bannerImage);

      setFormDataUno({
        title: responseUno.data.bannerImage.title,
        landingText: responseUno.data.bannerImage.landingText,
        mainImageLink: responseUno.data.bannerImage.mainImageLink,
      });

      setFormDataDos({
        title: responseDos.data.bannerImage.title,
        landingText: responseDos.data.bannerImage.landingText,
        mainImageLink: responseDos.data.bannerImage.mainImageLink,
      });
    } catch (error) {
      console.error("Error al obtener datos:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formData = activeService === "uno" ? formDataUno : formDataDos;
  const mainImage = activeService === "uno" ? mainImageUno : mainImageDos;

  const handleClearImage = (service: "uno" | "dos") => {
    if (service === "uno") {
      setMainImageUno(null);
      setFormDataUno((prev) => ({ ...prev, mainImage: undefined }));
    } else {
      setMainImageDos(null);
      setFormDataDos((prev) => ({ ...prev, mainImage: undefined }));
    }
    setIsMainImageUploaded(false);
  };

  if (loading) {
    return (
      <div className="w-full">
        {/* Mostrar el mensaje si existe, incluso durante la carga */}
        {message && (
          <div
            className={`mx-auto max-w-4xl mt-4 p-4 rounded-lg text-center ${
              message.type === "success" ? "bg-green-500" : "bg-red-500"
            } text-white animate-fade-in-down`}
          >
            {message.text}
          </div>
        )}

        {/* Loader */}
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
      </div>
    );
  }

  return (
    <section className="w-full">
      {/* Selector de Servicio */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveService("uno")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeService === "uno"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Servicio Uno
        </button>
        <button
          onClick={() => setActiveService("dos")}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeService === "dos"
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Servicio Dos
        </button>
      </div>

      {/* Formulario Reutilizable */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          Servicio {activeService === "uno" ? "Uno" : "Dos"}
        </h2>
        <form
          onSubmit={(e) => handleSubmit(e, activeService)}
          className="px-4 mx-auto mt-8 max-w-4xl"
        >
          <div className="grid grid-cols-1 gap-6">
            <div className="mb-6">
              <h3 className="font-normal text-primary mb-2">
                Título <span className="text-primary">*</span>
              </h3>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) => handleChange(e, activeService)}
                className="shadow block w-full px-4 py-3 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
                placeholder={`Ej: ${
                  activeService === "uno"
                    ? "Empoderamiento Personal"
                    : "Proyección de Marca"
                }`}
              />
            </div>

            <div className="mb-6">
              <h3 className="font-normal text-primary mb-2">
                Descripción <span className="text-primary">*</span>
              </h3>
              <ReactQuill
                value={formData.landingText}
                onChange={(value) => handleEditorChange(value, activeService)}
                className="shadow block w-full border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
              />
              <div className="text-right text-sm text-gray-600 mt-2">
                {formData.landingText.length}/{MAX_CHARACTERS} caracteres
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-normal text-primary mb-2">
                Imagen <span className="text-primary">*</span>
              </h3>
              <input
                type="file"
                accept="image/*"
                id={`mainImage${activeService}`}
                className="hidden"
                onChange={(e) => handleImageChange(e, activeService)}
              />
              {mainImage ? (
                <div className="relative mt-2">
                  <img
                    src={mainImage.data}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                  />
                  <button
                    onClick={() => handleClearImage(activeService)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full"
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <label
                  htmlFor={`mainImage${activeService}`}
                  className="cursor-pointer block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center"
                >
                  <div className="flex flex-col items-center">
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
                    <span className="mt-2 text-gray-600">
                      Seleccionar imagen
                    </span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {loading
              ? "Actualizando..."
              : `Actualizar Servicio ${
                  activeService === "uno" ? "Uno" : "Dos"
                }`}
          </button>

          {message && (
            <div
              className={`mt-4 p-4 rounded-lg text-center ${
                message.type === "success" ? "bg-green-500" : "bg-red-500"
              } text-white animate-fade-in-down`}
            >
              {message.text}
            </div>
          )}
        </form>
      </div>

      {isModalOpen && (
        <Modal
          showModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={
                activeService === "uno"
                  ? mainImageUno?.data || ""
                  : mainImageDos?.data || ""
              }
              crop={crop}
              zoom={zoom}
              aspect={16 / 9}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
          <div className="flex flex-col justify-end">
            <div className="w-full py-6">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.01}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="zoom-range w-full custom-range"
              />
            </div>
            <div className="flex justify-between w-full">
              <button
                onClick={handleCrop}
                className="bg-primary hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Recortar y Subir
              </button>
              <button
                onClick={() => {
                  if (activeService === "uno") {
                    setMainImageUno(null);
                  } else {
                    setMainImageDos(null);
                  }
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

export default Hero03BO;
