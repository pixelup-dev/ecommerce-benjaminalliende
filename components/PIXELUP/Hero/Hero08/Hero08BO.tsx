/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import imageCompression from "browser-image-compression";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { getCroppedImg } from "@/lib/cropImage";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";

interface ContentData {
  id: string;
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  mainImageLink: string;
  orderNumber: number;
  mainImage: {
    name: string;
    type: string;
    size: number | null;
    data: string;
  };
}

interface AdditionalData {
  subtitle: string;
  phoneNumber: string;
  stats: {
    stat1: {
      value: string;
      label: string;
    };
    stat2: {
      value: string;
      label: string;
    };
  };
  email: string;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
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

const Hero08BO: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentData>({
    id: "",
    title: "",
    landingText: "",
    buttonText: "",
    buttonLink: "",
    mainImageLink: "",
    orderNumber: 1,
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const [additionalData, setAdditionalData] = useState<AdditionalData>({
    subtitle: "",
    phoneNumber: "",
    stats: {
      stat1: {
        value: "",
        label: "profesionales",
      },
      stat2: {
        value: "",
        label: "satisfacción",
      },
    },
    email: "",
  });

  const [mainImage, setMainImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estados para el cropper
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);

  const prepareDataForSubmit = () => {
    console.log("Preparing data for submit");
    console.log("Current content state:", content);
    console.log("Current mainImage:", content.mainImage);

    const dataToSubmit = {
      ...content,
      buttonText: JSON.stringify(additionalData),
    };

    console.log("Data prepared for submit:", dataToSubmit);
    return dataToSubmit;
  };

  const parseReceivedData = (data: any) => {
    const parsedContent = {
      ...data,
      buttonText: "",
    };

    try {
      const additionalInfo = JSON.parse(data.buttonText);
      setAdditionalData({
        subtitle: additionalInfo.subtitle || "Bienvenidos",
        phoneNumber: additionalInfo.phoneNumber || "+569 1234 5678",
        stats: {
          stat1: {
            value: additionalInfo.stats?.stat1?.value || "15+",
            label: additionalInfo.stats?.stat1?.label || "profesionales",
          },
          stat2: {
            value: additionalInfo.stats?.stat2?.value || "100%",
            label: additionalInfo.stats?.stat2?.label || "satisfacción",
          },
        },
        email: additionalInfo.email || "contacto@pixelup.cl",
      });
    } catch (e) {
      console.error("Error parsing additional data:", e);
      setAdditionalData({
        subtitle: "Bienvenidos",
        phoneNumber: "+569 1234 5678",
        stats: {
          stat1: {
            value: "15+",
            label: "profesionales",
          },
          stat2: {
            value: "100%",
            label: "satisfacción",
          },
        },
        email: "contacto@pixelup.cl",
      });
    }

    setContent({
      ...parsedContent,
      title:
        parsedContent.title || "Tu espacio de trabajo",
      landingText:
        parsedContent.landingText ||
        "<p>En PixelUp te ofrecemos una experiencia única.</p>",
      buttonLink:
        parsedContent.buttonLink ||
        "<p>Ubicados en Dirección 123, Santiago, tu espacio de trabajo.</p>",
      mainImageLink: parsedContent.mainImageLink || "",
      orderNumber: parsedContent.orderNumber || 1,
      mainImage: {
        name: parsedContent.mainImage?.name || "",
        type: parsedContent.mainImage?.type || "",
        size: parsedContent.mainImage?.size || null,
        data: parsedContent.mainImage?.data || "",
      },
    });
  };

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO08_ID}`;

      // Obtener contenido general
      const contentResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (contentResponse.data?.banner) {
        parseReceivedData(contentResponse.data.banner);
      }

      // Obtener imagen
      try {
        const imageId = `${process.env.NEXT_PUBLIC_HERO08_IMGID}`;
        const imageResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${imageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const mainImage = imageResponse.data?.bannerImage?.mainImage;

        if (mainImage) {
          setContent((prev) => ({
            ...prev,
            mainImage: {
              name: mainImage.name || "",
              type: mainImage.type || "",
              size: mainImage.size || null,
              data: mainImage.url || mainImage.data || "",
            },
          }));
          setMainImage(mainImage.url || mainImage.data || "");
        }
      } catch (imageError) {
        console.error("Error al obtener la imagen:", imageError);
      }
    } catch (error) {
      console.error("Error al obtener el contenido:", error);
      toast.error("Error al cargar el contenido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const bannerId = `${process.env.NEXT_PUBLIC_HERO08_ID}`;
      const imageId = `${process.env.NEXT_PUBLIC_HERO08_IMGID}`;

      // Aseguramos la estructura correcta pero manteniendo valores existentes
      const defaultData = {
        title: content.title || "Tu espacio de trabajo",
        landingText: content.landingText || "<p>En PixelUp...</p>",
        buttonText: JSON.stringify({
          subtitle: additionalData.subtitle || "Bienvenidos",
          phoneNumber: additionalData.phoneNumber || "+569 1234 5678",
          stats: {
            stat1: {
              value: additionalData.stats?.stat1?.value || "15+",
              label: additionalData.stats?.stat1?.label || "profesionales",
            },
            stat2: {
              value: additionalData.stats?.stat2?.value || "100%",
              label: additionalData.stats?.stat2?.label || "satisfacción",
            },
          },
          email: additionalData.email || "contacto@pixelup.cl",
        }),
        buttonLink: content.buttonLink || "<p>Ubicados en Dirección 123...</p>",
        mainImageLink:
          content.mainImageLink || "https://www.pixelup.cl",
        orderNumber: content.orderNumber || 1,
      };

      // Enviamos los datos con la estructura asegurada
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        defaultData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Si hay una imagen en el estado (nueva o existente), la actualizamos
      if (content.mainImage?.data) {
        const imageData = {
          title: "Imagen Hero 08",
          landingText: "Imagen Hero 08",
          buttonText: "Imagen",
          buttonLink: "https://www.pixelup.cl",
          orderNumber: 1,
          mainImageLink: "https://www.pixelup.cl",
          mainImage: content.mainImage,
        };

        console.log("Enviando imagen:", imageData);

        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${bannerId}/images/${imageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          imageData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Recargamos el contenido
      await fetchContent();
      toast.success("Todos los cambios guardados exitosamente");
    } catch (error) {
      console.error("Error al actualizar el contenido:", error);
      toast.error("Error al guardar los cambios");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const handleCropComplete = (
    croppedArea: any,
    croppedAreaPixels: CropArea
  ) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    try {
      if (!tempImage || !croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      if (!croppedImage) return;

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        initialQuality: 0.8,
      };

      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      setContent((prev) => ({
        ...prev,
        mainImage: {
          name: compressedFile.name || "imagen.jpg",
          type: compressedFile.type || "image/jpeg",
          size: compressedFile.size,
          data: base64,
        },
      }));
      setMainImage(base64);

      setIsModalOpen(false);
      setTempImage(null);
      toast.success("Imagen procesada correctamente");
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
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

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <h3 className="text-lg font-semibold mb-4">Hero 08</h3>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtítulo
          </label>
          <input
            type="text"
            value={additionalData.subtitle}
            onChange={(e) =>
              setAdditionalData({ ...additionalData, subtitle: e.target.value })
            }
            className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
            placeholder="Bienvenidos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título Principal
          </label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
            placeholder="Tu espacio de trabajo..."
          />
        </div>

        <div className="mb-20">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción Principal
          </label>
          <div className="h-[300px]">
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={formats}
              value={content.landingText}
              onChange={(value) =>
                setContent({ ...content, landingText: value })
              }
              className="h-[250px]"
            />
          </div>
        </div>

        <div className="mb-20">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción Secundaria
          </label>
          <div className="h-[300px]">
            <ReactQuill
              theme="snow"
              modules={modules}
              formats={formats}
              value={content.buttonLink}
              onChange={(value) =>
                setContent({ ...content, buttonLink: value })
              }
              className="h-[250px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Teléfono
            </label>
            <input
              type="text"
              value={additionalData.phoneNumber}
              onChange={(e) =>
                setAdditionalData({
                  ...additionalData,
                  phoneNumber: e.target.value,
                })
              }
              className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contacto
            </label>
            <input
              type="email"
              value={additionalData.email}
              onChange={(e) =>
                setAdditionalData({ ...additionalData, email: e.target.value })
              }
              className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estadística 1
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={additionalData.stats.stat1.value}
                onChange={(e) =>
                  setAdditionalData({
                    ...additionalData,
                    stats: {
                      ...additionalData.stats,
                      stat1: {
                        ...additionalData.stats.stat1,
                        value: e.target.value,
                      },
                    },
                  })
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="15+"
              />
              <input
                type="text"
                value={additionalData.stats.stat1.label}
                onChange={(e) =>
                  setAdditionalData({
                    ...additionalData,
                    stats: {
                      ...additionalData.stats,
                      stat1: {
                        ...additionalData.stats.stat1,
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="profesionales"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estadística 2
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={additionalData.stats.stat2.value}
                onChange={(e) =>
                  setAdditionalData({
                    ...additionalData,
                    stats: {
                      ...additionalData.stats,
                      stat2: {
                        ...additionalData.stats.stat2,
                        value: e.target.value,
                      },
                    },
                  })
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="100%"
              />
              <input
                type="text"
                value={additionalData.stats.stat2.label}
                onChange={(e) =>
                  setAdditionalData({
                    ...additionalData,
                    stats: {
                      ...additionalData.stats,
                      stat2: {
                        ...additionalData.stats.stat2,
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="satisfacción"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Imagen Principal
          </label>
          <div className="mt-1 flex items-center gap-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              Seleccionar Imagen
            </button>
            {(mainImage || content.mainImage?.data) && (
              <div className="relative w-32 h-32">
                <img
                  src={mainImage || content.mainImage?.data}
                  alt="Vista previa"
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    setMainImage(null);
                    setContent({
                      ...content,
                      mainImage: {
                        name: "",
                        type: "",
                        size: null,
                        data: "",
                      },
                    });
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-bold text-white transition-colors duration-300 flex items-center justify-center gap-2 ${
            loading
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

      {isModalOpen && (
        <Modal
          title="Recortar Imagen"
          showModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="relative w-full h-[60vh]">
            <Cropper
              image={tempImage || ""}
              crop={crop}
              zoom={zoom}
              aspect={560 / 500}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrop}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
            >
              Recortar y Guardar
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Hero08BO;
