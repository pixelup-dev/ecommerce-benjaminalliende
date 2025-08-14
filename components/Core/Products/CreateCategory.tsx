/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { obtenerTiposProductos } from "@/app/utils/obtenerTiposProductos";

interface CreateCategoryProps {
  handleCloseModal: any;
  onCategoriaNueva: any; // Definir el tipo de la función
}

type Category = {
  previewImageBase64: any;
  id: number;
  name: string;
  description: string;
  previewImageUrl: string; // Cambiar el nombre de la propiedad
  previewImage?: {
    name: string;
    type: string;
    size: number;
    data: string;
  };
  statusCode: string;
  // Otros campos de la categoría
};

const CreateCategory: React.FC<CreateCategoryProps> = ({
  handleCloseModal,
  onCategoriaNueva,
}) => {
  const [mode, setMode] = useState<"create" | "update">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [previewImageBase64, setPreviewImageBase64] = useState("");
  const [previewFileInfo, setPreviewFileInfo] = useState({
    name: "",
    type: "",
    size: 0,
    data: "",
  });
  const token = String(getCookie("AdminTokenAuth"));
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    statusCode: "ACTIVE",
    previewImage: {
      name: "",
      type: "",
      size: 0,
      data: "",
    },
  });

  async function fetchCategories() {
    try {
      const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
      const PageNumber = 1;
      const PageSize = 10;
      const token = getCookie("AdminTokenAuth");

      const data = await obtenerTiposProductos(
        SiteId,
        token,
        PageNumber,
        PageSize
      );

      setCategories(data.productTypes);
      setLoading(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        console.error("An error occurred:", error.message);
      } else {
        console.error("An unknown error occurred:", error);
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategorySelection = (category: Category | string) => {
    if (typeof category === "object") {
      // category es un objeto de tipo Category
      setFormData((prevFormData) => ({
        ...prevFormData,
        name: category.name,
        description: category.description,
        statusCode: category.statusCode,
        previewImage: category.previewImage
          ? {
              name: category.previewImage.name || "",
              type: category.previewImage.type || "",
              size: category.previewImage.size || 0,
              data: category.previewImage.data || "",
            }
          : {
              name: "",
              type: "",
              size: 0,
              data: "",
            },
        // Otros campos del formulario
      }));
    } else {
      // category es una cadena
      // Maneja este caso según sea necesario, por ejemplo, establece valores predeterminados
      setFormData((prevFormData) => ({
        ...prevFormData,
        name: "Default Name",
        description: "Default Description",
        statusCode: "ACTIVE",
        previewImage: {
          name: "",
          type: "",
          size: 0,
          data: "",
        },
        // Otros campos del formulario
      }));
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    imageType: string
  ) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result?.toString().split(",")[1];
        console.log("File read successfully:", {
          name: file.name,
          type: file.type,
          size: file.size,
          data: base64String || "",
        });
        setFormData((prevFormData) => ({
          ...prevFormData,
          previewImage: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: `data:${file.type};base64,${base64String}`,
          },
        }));

        // Solo guardar la nueva imagen en base64 si hay un cambio
        if (base64String !== previewImageBase64) {
          setPreviewImageBase64(base64String || "");
        }
      };
      reader.readAsDataURL(file);
    } else {
      console.error("No file selected");
    }
  };

  // Actualizar la imagen previa al seleccionar una categoría para editar
  useEffect(() => {
    if (selectedCategory) {
      if (selectedCategory.previewImageUrl) {
        setPreviewImageBase64(selectedCategory.previewImageUrl);
        setFormData((prevFormData) => ({
          ...prevFormData,
          previewImage: {
            ...prevFormData.previewImage,
            data: selectedCategory.previewImageUrl, // Actualizar data con la URL de la imagen
          },
        }));
      } else if (selectedCategory.previewImageBase64) {
        setPreviewImageBase64(selectedCategory.previewImageBase64);
        setFormData((prevFormData) => ({
          ...prevFormData,
          previewImage: {
            ...prevFormData.previewImage,
            data: selectedCategory.previewImageBase64, // Usar base64 si previewImageUrl no está definido
          },
        }));
      } else {
        setPreviewImageBase64(""); // Limpiar la imagen previa si no hay ninguna seleccionada
      }
    }
  }, [selectedCategory]);

  // Mostrar la imagen previa al cargar el formulario de edición
  useEffect(() => {
    if (mode === "update" && previewImageBase64) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        previewImage: {
          ...prevFormData.previewImage,
          data: previewImageBase64,
        },
      }));
    }
  }, [mode, previewImageBase64]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      console.log("Datos a enviar:", formData); // Agregar este console.log para verificar los datos antes de enviarlos al servidor

      const url =
        mode === "create"
          ? `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types`
          : `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types/${selectedCategory?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          statusCode: formData.statusCode,
          previewImage: formData.previewImage,
        }),
      });

      if (response.ok) {
        const nuevaCategoria = { name: formData.name }; // Crear objeto de nueva categoría
        onCategoriaNueva(nuevaCategoria); // Llamar a la función onCategoriaNueva
        handleCloseModal();
        setFormData({
          ...formData,
          previewImage: {
            name: "",
            type: "",
            size: 0,
            data: "",
          },
        });
        fetchCategories();
      } else {
        console.error(
          "Error al crear o actualizar la categoría:",
          response.statusText
        );
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  const handleRemovePreview = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      previewImage: {
        name: "",
        type: "",
        size: 0,
        data: "", // Limpiar el valor de data
      },
    }));
    setPreviewImageBase64(""); // Limpiar la vista previa de la imagen
    setPreviewFileInfo({
      name: "",
      type: "",
      size: 0,
      data: "",
    });
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      statusCode: "ACTIVE",
      previewImage: {
        name: "",
        type: "",
        size: 0,
        data: "",
      },
    });
    setSelectedCategory(null);
    setMode("create");
    handleCloseModal();
    setPreviewImageBase64(""); // Limpiar la imagen al cancelar
  };

  return (
    <div className="relative px-12 flex  mt-[16vh]">
      <div className="relative p-4 grid grid-cols-1 sm:grid-cols-2  px-8 md:px-12   justify-center w-full lg:w-[70%] bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <div>
          <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600 ">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === "create" ? "Add Category" : "Update Category"}
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 mb-4 sm:grid-cols-1">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      name: event.target.value,
                    }))
                  }
                  name="name"
                  id="name"
                  className="bg-gray-50  border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Type Category name"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      description: event.target.value,
                    }))
                  }
                  rows={4}
                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Write category description here"
                />
              </div>

              <div className="flex justify-center flex-col items-center w-full relative">
                {previewImageBase64 ? (
                  <>
                    <button
                      className="absolute top-1 right-1 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 focus:outline-none z-10"
                      onClick={handleRemovePreview}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <img
                      src={
                        mode === "update"
                          ? previewImageBase64
                          : `data:image/jpeg;base64,${previewImageBase64}`
                      }
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg z-0"
                    />
                  </>
                ) : (
                  <label
                    htmlFor="dropzone-file-preview"
                    className="flex flex-col justify-center items-center pt-5 pb-6 border border-dashed border-gray-300 rounded-lg cursor-pointer w-full z-10"
                  >
                    <div className="flex flex-col justify-center items-center">
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
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Subir Imagen</span> or
                        drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG o Webp (800x800px)
                      </p>
                    </div>
                    <input
                      id="dropzone-file-preview"
                      type="file"
                      className="hidden"
                      onChange={(event) =>
                        handleFileChange(event, "previewImage")
                      }
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="items-center space-y-4 sm:flex sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                className="w-full sm:w-auto justify-center text-white inline-flex bg-secondary hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-secondary dark:focus:ring-primary-800"
              >
                {mode === "create" ? "Crear Categoría" : "Actualizar Categoría"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full justify-center sm:w-auto text-gray-500 inline-flex items-center bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
        <div className="px-4 bg-white">
          <div className="flex justify-between items-center pb-3 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600 ">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white ">
              Categories
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={handleCloseModal}
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          {Array.isArray(categories) &&
            categories.map((category) => (
              <h1
                className={`border-b py-1 text-xs ${
                  selectedCategory?.id === category.id
                    ? "bg-gray-200 dark:bg-gray-800"
                    : ""
                }`}
                key={category.id}
                onClick={() => handleCategorySelection(category)}
              >
                {category.name}
              </h1>
            ))}
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
