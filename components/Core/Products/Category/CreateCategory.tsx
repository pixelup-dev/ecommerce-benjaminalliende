/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import { useRevalidation } from "@/app/Context/RevalidationContext";

interface CreateCategoryProps {
  handleCloseModal: any | null;
  fetchData: any;
}

const CreateCategory: React.FC<CreateCategoryProps> = ({
  handleCloseModal,
  fetchData,
}) => {
  const { triggerRevalidation } = useRevalidation();

  const [formDataCategory, setFormDataCategory] = useState({
    name: "",
    description: "",
    previewImageCategory: "",
    previewImageNameCategory: "",
    previewImageTypeCategory: "",
    previewImageSizeCategory: 0,
    imageLoaded: false,
    base64Data: "", // Datos base64 de la imagen para enviar al servidor
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormDataCategory((prevFormDataCategory) => ({
      ...prevFormDataCategory,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result?.toString().split(",")[1];

        setFormDataCategory((prevFormDataCategory) => ({
          ...prevFormDataCategory,
          previewImageCategory: reader.result as string,
          previewImageNameCategory: file.name,
          previewImageTypeCategory: file.type,
          previewImageSizeCategory: file.size,
          imageLoaded: true,
          base64Data: base64Data || "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormDataCategory((prevFormDataCategory) => ({
      ...prevFormDataCategory,
      previewImageCategory: "",
      previewImageNameCategory: "",
      previewImageTypeCategory: "",
      previewImageSizeCategory: 0,
      imageLoaded: false,
      base64Data: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const authToken = getCookie("AdminTokenAuth");

    const requestData = {
      name: formDataCategory.name,
      description: formDataCategory.description || "texto predeterminado",
      statusCode: "ACTIVE",
      ...(formDataCategory.base64Data
        ? {
            previewImage: {
              name: formDataCategory.previewImageNameCategory,
              type: formDataCategory.previewImageTypeCategory,
              size: formDataCategory.previewImageSizeCategory,
              data: `data:${formDataCategory.previewImageTypeCategory};base64,${formDataCategory.base64Data}`,
            },
          }
        : {}),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar los datos.");
      }

      const responseData = await response.json();

      await triggerRevalidation();

      console.log("Datos enviados correctamente:", responseData);
      toast.success("Categoría creada correctamente");
      fetchData();

      setFormDataCategory({
        name: "",
        description: "",
        previewImageCategory: "",
        previewImageNameCategory: "",
        previewImageTypeCategory: "",
        previewImageSizeCategory: 0,
        imageLoaded: false,
        base64Data: "",
      });

      handleCloseModal();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="shadow-md b rounded-lg p-4 bg-white my-6 overflow-x-auto">
      <div className="relative w-full bg-white rounded-lg sm:p-5">
        <div>
          <div className="pb-4 mb-4 rounded-t border-b sm:mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Crear Categoría
            </h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 mb-4">
              <div>
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formDataCategory.name}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Nombre Categoría"
                  required
                />
              </div>

              <div className="w-full  gap-4">
                {" "}
                {/* grid grid-cols-1 sm:grid-cols-2 */}
                <div>
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formDataCategory.description}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full min-h-28 p-2.5 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Descripción Categoría"
                  />
                </div>
                {/*                 <div className="flex flex-col justify-center mt-6 items-center w-full relative border border-dashed border-gray-300 rounded-lg p-5">
                  {formDataCategory.imageLoaded ? (
                    <div className="w-full h-40 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute inset-0 overflow-hidden rounded-lg ">
                          <img
                            src={formDataCategory.previewImageCategory}
                            alt="Preview"
                            className="w-full  object-cover rounded-lg"
                          />
                        </div>
                        <button
                          type="button"
                          className="absolute top-0 right-0 m-2 text-red-600  bg-white rounded-xl p-2"
                          onClick={handleRemoveImage}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-4 h-4"
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
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="previewImageCategory"
                      className="cursor-pointer"
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
                          <span className="font-semibold uppercase">
                            Click para Cargar Foto
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          SVG, PNG, JPG o GIF (MAX. 1MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        id="previewImageCategory"
                        name="previewImageCategory"
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*"
                      />
                    </label>
                  )}
                </div> */}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary hover:bg-secondary text-white hover:text-primary font-medium rounded-lg px-5 py-2.5"
              >
                Crear Categoría
              </button>
{/*               <button
                data-modal-toggle="createProductModal"
                type="button"
                onClick={handleCloseModal}
                className="bg-red-800 hover:bg-secondary text-white hover:text-primary font-medium rounded-lg px-5 py-2.5"
              >
                Cancelar
              </button> */}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCategory;
