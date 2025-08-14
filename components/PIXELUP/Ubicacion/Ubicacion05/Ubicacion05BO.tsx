"use client";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import { BannerImage } from "./types";
import imageCompression from "browser-image-compression";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface FormEvent extends React.FormEvent<HTMLFormElement> {
  preventDefault: () => void;
}

interface InputEvent extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> {
  target: HTMLInputElement | HTMLTextAreaElement;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageInfo {
  name: string;
  type: string;
  size: number;
  data: string;
}

type UploadType = "main" | "secondary";

interface TempImage {
  title: string;
  landingText: string;
  buttonText: string;
  buttonLink: string;
  orderNumber: number;
  mainImageLink: string;
  mainImage: {
    name: string;
    type: string;
    size: number;
    data: string;
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

export default function UbicacionBO() {
  // Estados para el contenido
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<any>({
    title: "Ubicación",
    contentText: JSON.stringify({
      title: "Pixel Up",
      contentText: "<p>Pixel Up es una plataforma que te da acceso a una serie de herramientas.</p>",
      additionalData: {
        subtitle: "Nuestra ubicación",
        description: "<p>Pixel Up es una plataforma que te da acceso a una serie de herramientas.</p>",
        secondaryTitle: "Visítanos",
        address: {
          street: "Calle, Comuna",
          city: "Santiago, Chile",
        },
        schedule: {
          weekdays: "Lunes a Viernes: 10:00 - 20:00",
          saturday: "Sábados: 10:00 - 18:00",
          sunday: "Domingos: Cerrado"
        },
        contact: {
          phone: "+56 9 6236 5458",
          email: "hola@pixelup.cl",
        },
      },
    }),
  });

  const [formData, setFormData] = useState<any>({
    title: "Pixel Up",
    contentText: "<p>Pixel Up es una plataforma que te da acceso a una serie de herramientas.</p>",
    additionalData: {
      subtitle: "Nuestra ubicación",
      description: "<p>Pixel Up es una plataforma que te da acceso a una serie de herramientas.</p>",
      secondaryTitle: "Visítanos",
      address: {
        street: "Calle, Comuna",
        city: "Santiago, Chile",
      },
      schedule: {
        weekdays: "Lunes a Viernes: 10:00 - 20:00",
        saturday: "Sábados: 10:00 - 18:00",
        sunday: "Domingos: Cerrado"
      },
      contact: {
        phone: "+56 9 6236 5458",
        email: "hola@pixelup.cl",
      },
    },
  });

  // Estados para las imágenes
  const [images, setImages] = useState<BannerImage[]>([]);
  const [tempImages, setTempImages] = useState<TempImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [uploadType, setUploadType] = useState<UploadType | null>(null);

  // Función para cargar el contenido
  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_UBICACION05_CONTENTBLOCK}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.contentBlock) {
        const data = response.data.contentBlock;
        try {
          const parsedContent = JSON.parse(data.contentText);
          // Asegurarse de que el horario domingo exista en el contenido cargado
          if (!parsedContent.additionalData.schedule.sunday) {
            parsedContent.additionalData.schedule.sunday = "Domingos: Cerrado";
          }
          setContent({
            title: data.title,
            contentText: data.contentText,
          });
          setFormData(parsedContent);
        } catch (e) {
          console.error("Error parsing content:", e);
          toast.error("Error al cargar el contenido");
        }
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast.error("Error al cargar el contenido");
    }
  };

  // Función para cargar las imágenes
  const fetchImages = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION05_ID}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setImages(response.data.bannerImages || []);
    } catch (error) {
      console.error("Error al cargar imágenes:", error);
      toast.error("Error al cargar las imágenes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchContent(), fetchImages()]);
  }, []);

  // Función para guardar todo
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      // Actualizar contenido
      const contentToSubmit = {
        title: content.title,
        contentText: JSON.stringify(formData),
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_UBICACION05_CONTENTBLOCK}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        contentToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Eliminar imágenes marcadas para eliminar
      for (const imageId of imagesToDelete) {
        await axios.delete(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION05_ID}/images/${imageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Subir nuevas imágenes
      for (const image of tempImages) {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/banners/${process.env.NEXT_PUBLIC_UBICACION05_ID}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          image,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Limpiar estados temporales
      setTempImages([]);
      setImagesToDelete([]);

      toast.success("Contenido actualizado exitosamente");
      await Promise.all([fetchContent(), fetchImages()]);
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Error al actualizar el contenido");
    } finally {
      setLoading(false);
    }
  };

  // Funciones para manejar imágenes
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>, type: UploadType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setUploadType(type);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const handleCropComplete = (croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    try {
      if (!tempImage || !croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels);
      if (!croppedImage) return;

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: uploadType === "main" ? 1900 : 1200,
        useWebWorker: true,
        initialQuality: 0.8,
      };

      const compressedFile = await imageCompression(croppedImage as File, options);
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: compressedFile.name || "imagen.jpg",
        type: compressedFile.type || "image/jpeg",
        size: compressedFile.size,
        data: base64,
      };

      const newImage = {
        title: uploadType === "main" ? "Imagen Principal" : "Imagen Secundaria",
        landingText: "Imagen Ubicación",
        buttonText: "ubicacion",
        buttonLink: "https://www.pixelup.cl",
        orderNumber: uploadType === "main" ? 1 : images.length + tempImages.length + 2,
        mainImageLink: "https://www.pixelup.cl",
        mainImage: imageInfo,
      };

      setTempImages([...tempImages, newImage]);
      setIsModalOpen(false);
      setTempImage(null);
    } catch (error) {
      console.error("Error al procesar la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setImagesToDelete([...imagesToDelete, imageId]);
  };

  // Función para calcular el total de imágenes
  const getTotalImages  = () => {
    const currentImages = images.filter(img => !imagesToDelete.includes(img.id));
    return currentImages.length + tempImages.length;
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
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección de Información de Ubicación */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Información de Ubicación</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Epígrafe</label>
              <input
                type="text"
                value={formData.additionalData.subtitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalData: {
                      ...formData.additionalData,
                      subtitle: e.target.value,
                    },
                  })
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <ReactQuill
                value={formData.contentText}
                onChange={(value) => setFormData({ ...formData, contentText: value })}
                modules={modules}
                className="shadow block w-full border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Calle</label>
                <input
                  type="text"
                  value={formData.additionalData.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalData: {
                        ...formData.additionalData,
                        address: {
                          ...formData.additionalData.address,
                          street: e.target.value,
                        },
                      },
                    })
                  }
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input
                  type="text"
                  value={formData.additionalData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalData: {
                        ...formData.additionalData,
                        address: {
                          ...formData.additionalData.address,
                          city: e.target.value,
                        },
                      },
                    })
                  }
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horario entre semana</label>
                <input
                  type="text"
                  value={formData.additionalData.schedule.weekdays}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalData: {
                        ...formData.additionalData,
                        schedule: {
                          ...formData.additionalData.schedule,
                          weekdays: e.target.value,
                        },
                      },
                    })
                  }
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horario sábado</label>
                <input
                  type="text"
                  value={formData.additionalData.schedule.saturday}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalData: {
                        ...formData.additionalData,
                        schedule: {
                          ...formData.additionalData.schedule,
                          saturday: e.target.value,
                        },
                      },
                    })
                  }
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Horario domingo</label>
                <input
                  type="text"
                  value={formData.additionalData.schedule.sunday}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalData: {
                        ...formData.additionalData,
                        schedule: {
                          ...formData.additionalData.schedule,
                          sunday: e.target.value,
                        },
                      },
                    })
                  }
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input
                  type="text"
                  value={formData.additionalData.contact.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalData: {
                        ...formData.additionalData,
                        contact: {
                          ...formData.additionalData.contact,
                          phone: e.target.value,
                        },
                      },
                    })
                  }
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.additionalData.contact.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      additionalData: {
                        ...formData.additionalData,
                        contact: {
                          ...formData.additionalData.contact,
                          email: e.target.value,
                        },
                      },
                    })
                  }
                  className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Texto Botón</label>
              <input
                type="text"
                value={formData.additionalData.secondaryTitle}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalData: {
                      ...formData.additionalData,
                      secondaryTitle: e.target.value,
                    },
                  })
                }
                className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Sección de Imágenes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Imágenes de Ubicación</h3>
              <span className="text-sm text-gray-500">
                ({getTotalImages()}/5 imágenes cargadas)
              </span>
            </div>
            <div className="flex gap-4">
              {!images.some((img) => img.orderNumber === 1) && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md transition-colors"
                >
                  Agregar Imagen Principal (Recomendado 1024 × 1024px)
                </button>
              )}
              {images.some((img) => img.orderNumber === 1) && getTotalImages() < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md transition-colors"
                >
                  Agregar Imagen Secundaria
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) =>
                handleImageChange(
                  e,
                  !images.some((img) => img.orderNumber === 1) ? "main" : "secondary"
                )
              }
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.filter(img => !imagesToDelete.includes(img.id)).map((image) => (
              <div key={image.id} className="relative bg-white p-3 rounded-lg shadow-md">
                <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
                  <img
                    src={image.mainImage.url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    {image.orderNumber === 1 ? "Imagen Principal" : "Imagen Secundaria"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {tempImages.map((image, index) => (
              <div key={`temp-${index}`} className="relative bg-white p-3 rounded-lg shadow-md">
                <div className="relative aspect-[2/1] overflow-hidden rounded-lg">
                  <img
                    src={image.mainImage.data}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    {image.orderNumber === 1 ? "Imagen Principal" : "Imagen Secundaria"} (Nueva)
                  </span>
                  <button
                    type="button"
                    onClick={() => setTempImages(tempImages.filter((_, i) => i !== index))}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de Guardar */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-bold text-white transition-colors duration-300 ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-secondary"
          }`}
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>

      {/* Modal de Recorte de Imagen */}
      {isModalOpen && (
        <Modal showModal={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="relative h-96 w-full">
            <Cropper
              image={tempImage || ""}
              crop={crop}
              zoom={zoom}
              aspect={1 / 1}
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
                className="w-full"
              />
            </div>
            <div className="flex justify-between gap-2">
              <button
                type="button"
                onClick={handleCrop}
                className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded"
              >
                Recortar y Guardar
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setTempImage(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
