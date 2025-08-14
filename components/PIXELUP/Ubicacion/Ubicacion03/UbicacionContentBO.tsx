"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
  import { UbicacionContent, ContentBlockData } from "./types"
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface FormEvent extends React.FormEvent<HTMLFormElement> {
  preventDefault: () => void;
}

interface InputEvent
  extends React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> {
  target: HTMLInputElement | HTMLTextAreaElement;
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

export default function UbicacionContentBO() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<ContentBlockData>({
    title: "Ubicación",
    contentText: JSON.stringify({
      title: "PixelUp",
      contentText:
        "<p>Un espacio diseñado para brindarte la mejor experiencia en cuidado y belleza.</p>",
      additionalData: {
        subtitle: "Nuestra ubicación",
        description:
          "<p>Descripción de la ubicación</p>",
        secondaryTitle: "Visítanos",
        buttonText: "Ver ubicación",
        buttonLink: "#",
        address: {
          street: "Dirección, Comuna",
          city: "Santiago, Chile",
        },
        schedule: {
          weekdays: "Lunes a Viernes: 10:00 - 20:00",
          saturday: "Sábados: 10:00 - 18:00",
        },
        contact: {
          phone: "+56 9 6769 1191",
          email: "contacto@pixelup.cl",
        },
      },
    }),
  });

  const [formData, setFormData] = useState<UbicacionContent>({
    title: "PixelUp",
    contentText:
      "<p>Descripción de la ubicación</p>",
    additionalData: {
      subtitle: "Nuestra ubicación",
      description:
        "<p>Descripción de la ubicación</p>",
      secondaryTitle: "Visítanos",
      buttonText: "Ver ubicación",
      buttonLink: "#",
      address: {
        street: "Dirección, Comuna",
        city: "Santiago, Chile",
      },
      schedule: {
        weekdays: "Lunes a Viernes: 10:00 - 20:00",
        saturday: "Sábados: 10:00 - 18:00",
      },
      contact: {
        phone: "+56 9 6769 1191",
        email: "contacto@pixelup.cl",
      },
    },
  });

  const fetchContent = async () => {
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_UBICACION03_CONTENTBLOCK}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = getCookie("AdminTokenAuth");

      const contentToSubmit = {
        title: content.title,
        contentText: JSON.stringify(formData),
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/content-blocks/${process.env.NEXT_PUBLIC_UBICACION03_CONTENTBLOCK}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        contentToSubmit,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Contenido actualizado exitosamente");
      await fetchContent();
    } catch (error) {
      console.error("Error updating content:", error);
      toast.error("Error al actualizar el contenido");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: InputEvent, field: keyof UbicacionContent) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleNestedChange = (
    e: InputEvent,
    parent: keyof UbicacionContent["additionalData"],
    field?: string
  ) => {
    const parentValue = formData.additionalData[parent];
    if (typeof parentValue === "object" && field) {
      setFormData({
        ...formData,
        additionalData: {
          ...formData.additionalData,
          [parent]: {
            ...parentValue,
            [field]: e.target.value,
          },
        },
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-12">
      <h3 className="text-lg font-semibold mb-4">Información de Ubicación</h3>
      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título del Bloque
          </label>
          <input
            type="text"
            value={content.title}
            onChange={(e) => setContent({ ...content, title: e.target.value })}
            className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <ReactQuill
            value={formData.contentText}
            onChange={(value) =>
              setFormData({ ...formData, contentText: value })
            }
            modules={modules}
            className="shadow block w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subtítulo
          </label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Calle
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario entre semana
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Horario sábado
            </label>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Texto Adicional
          </label>
          <ReactQuill
            value={formData.additionalData.description || ""}
            onChange={(value) =>
              setFormData({
                ...formData,
                additionalData: {
                  ...formData.additionalData,
                  description: value,
                },
              })
            }
            modules={modules}
            className="shadow block w-full border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título Secundario
          </label>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto del Botón
            </label>
            <input
              type="text"
              value={formData.additionalData.buttonText}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  additionalData: {
                    ...formData.additionalData,
                    buttonText: e.target.value,
                  },
                })
              }
              className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link del Botón
            </label>
            <input
              type="text"
              value={formData.additionalData.buttonLink}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  additionalData: {
                    ...formData.additionalData,
                    buttonLink: e.target.value,
                  },
                })
              }
              className="shadow block w-full px-4 py-3 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded font-bold text-white transition-colors duration-300 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-primary hover:bg-secondary"
          }`}
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
      </form>
    </div>
  );
}
