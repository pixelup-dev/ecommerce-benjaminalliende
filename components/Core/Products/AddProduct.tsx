/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { useAPI } from "@/app/Context/ProductTypeContext";

interface AddprodcutProps {
  handleCloseModal: any;
  fetchData: any;
  fetchProductos: any;
}

const AddProduct: React.FC<AddprodcutProps> = ({
  handleCloseModal,
  fetchData,
  fetchProductos,
}) => {
  const { productType, setProductType } = useAPI();
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
    mainImage: {
      name: "",
      type: "",
      size: 0,
      data: "",
    },
    productTypeId: "",
  });

  const token = String(getCookie("AdminTokenAuth"));

  const handleCategoryChange = (event: any) => {
    const { value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      productTypeId: value, // Actualizar el productTypeId con el ID de la categoría seleccionada
    }));
  };

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: value,
    }));
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
        setFormData((prevFormData) => ({
          ...prevFormData,
          [imageType]: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: `data:${file.type};base64,${base64String}`,
          },
        }));
      };
      reader.readAsDataURL(file);
    } else {
      console.error("No file selected");
    }
  };

  const handleRemoveImage = (imageType: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [imageType]: {
        name: "",
        type: "",
        size: 0,
        data: "",
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log("Form data:", formData);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        console.log("Product created successfully");
        fetchData();
        handleCloseModal();
        fetchProductos();
      } else {
        console.error("Error al crear el producto:", response.statusText);
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
    }
  };

  return (
    <div className="relative px-12 flex mt-[15vh] justify-center">
      <div className="relative p-4 grid grid-cols-1  max-w-[45vw] min-w-[45vw] bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
        <div>
          <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600 ">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Product
            </h3>
          </div>
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prevFormData) => ({
                      ...prevFormData,
                      name: event.target.value,
                    }))
                  }
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Type Product name"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="precio"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Precio
                </label>
                <input
                  type="number"
                  id="precio"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Precio del Producto"
                  required
                />
              </div>
            </div>
            {/* Otros campos del formulario */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Category
              </label>
              <select
                id="category"
                value={formData.productTypeId}
                onChange={(event) => handleCategoryChange(event)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                required
              >
                <option>Select Category</option>
                {productType.map((category: any) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {/* Resto del formulario */}
            <div>
              <label
                htmlFor="description"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
              >
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleDescriptionChange}
                rows={4}
                className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Write product description here"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="previewImage"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Preview Image
                </label>
                {!formData.previewImage.data && (
                  <input
                    type="file"
                    id="previewImage"
                    onChange={(event) =>
                      handleFileChange(event, "previewImage")
                    }
                    className="hidden"
                    required
                  />
                )}
                {formData.previewImage.data && (
                  <div className="relative">
                    <img
                      src={formData.previewImage.data}
                      alt="Preview"
                      className="w-full h-36 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage("previewImage")}
                      className="absolute top-2 right-2  bg-gray-800 rounded-full text-white "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                {!formData.previewImage.data && (
                  <label
                    htmlFor="previewImage"
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
                  </label>
                )}
              </div>

              <div>
                <label
                  htmlFor="mainImage"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Main Image
                </label>
                {!formData.mainImage.data && (
                  <input
                    type="file"
                    id="mainImage"
                    onChange={(event) => handleFileChange(event, "mainImage")}
                    className="hidden"
                    required
                  />
                )}
                {formData.mainImage.data && (
                  <div className="relative">
                    <img
                      src={formData.mainImage.data}
                      alt="Main"
                      className="w-full h-36 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage("mainImage")}
                      className="absolute top-2 right-2  bg-gray-800 rounded-full text-white "
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                {!formData.mainImage.data && (
                  <label
                    htmlFor="mainImage"
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
                  </label>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full justify-center text-white inline-flex bg-secondary hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-secondary dark:focus:ring-primary-800"
              >
                Create Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
