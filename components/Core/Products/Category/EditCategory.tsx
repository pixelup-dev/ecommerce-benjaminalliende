import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { useAPI } from "@/app/Context/ProductTypeContext";
import toast from "react-hot-toast";
import { useRevalidation } from "@/app/Context/RevalidationContext";

interface EditCategoryProps {
  handleCloseModal: any;
  fetchData: any;
  switchToCreateTab: any;
}

const EditCategory: React.FC<EditCategoryProps> = ({
  handleCloseModal,
  fetchData,
  switchToCreateTab,
}) => {
  const { productType, setProductType } = useAPI();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    previewImage: "",
    previewImageName: "",
    previewImageType: "",
    previewImageSize: 0,
    imageLoaded: false,
    base64Data: "",
  });
  const { triggerRevalidation } = useRevalidation();

  useEffect(() => {
    const selectedCategory = productType.find(
      (cat: any) => cat.id === selectedCategoryId
    );

    if (selectedCategory) {
      setFormData({
        name: selectedCategory.name,
        description: selectedCategory.description,
        previewImage: selectedCategory.previewImageUrl,
        previewImageName: "",
        previewImageType: "",
        previewImageSize: 0,
        imageLoaded: true,
        base64Data: "",
      });
    }
  }, [selectedCategoryId, productType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Data = reader.result?.toString().split(",")[1];

        setFormData((prevFormData) => ({
          ...prevFormData,
          previewImage: reader.result as string,
          previewImageName: file.name,
          previewImageType: file.type,
          previewImageSize: file.size,
          imageLoaded: true,
          base64Data: base64Data || "",
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
  };

  const handleRemoveImage = () => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      previewImage: "",
      previewImageName: "",
      previewImageType: "",
      previewImageSize: 0,
      imageLoaded: false,
      base64Data: "",
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedCategoryId || isDeleting) {
      return;
    }

    const authToken = getCookie("AdminTokenAuth");
    const categoryIdToUpdate = selectedCategoryId;

    const requestData = {
      name: formData.name,
      description: formData.description,
      statusCode: "ACTIVE",
      ...(formData.base64Data
        ? {
            previewImage: {
              name: formData.previewImageName,
              type: formData.previewImageType,
              size: formData.previewImageSize,
              data: `data:${formData.previewImageType};base64,${formData.base64Data}`,
            },
          }
        : {}),
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types/${categoryIdToUpdate}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (response.status !== 200) {
        throw new Error("Error al enviar los datos.");
      }
      toast.success("Categoría actualizada correctamente");
      setFormData({
        name: "",
        description: "",
        previewImage: "",
        previewImageName: "",
        previewImageType: "",
        previewImageSize: 0,
        imageLoaded: false,
        base64Data: "",
      });

      const updatedCategories = productType.map((category: any) =>
        category.id === categoryIdToUpdate
          ? { ...category, ...requestData }
          : category
      );
      setProductType(updatedCategories);
      setSelectedCategoryId("");
      handleCloseModal();
      fetchData();
      await triggerRevalidation();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleDeleteCategory = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types/${selectedCategoryId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getCookie("AdminTokenAuth")}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Categoría eliminada correctamente");
        const updatedCategories = productType.filter(
          (category: any) => category.id !== selectedCategoryId
        );
        setProductType(updatedCategories);
        setSelectedCategoryId("");
        setFormData({
          name: "",
          description: "",
          previewImage: "",
          previewImageName: "",
          previewImageType: "",
          previewImageSize: 0,
          imageLoaded: false,
          base64Data: "",
        });

        handleCloseModal();
        switchToCreateTab();
        fetchData();
        await triggerRevalidation();
      } else {
        // Manejo de errores específicos
        if (response.status === 409) {
          toast.error("Error: esta categoría está asociada a un producto.");
        } else {
          const errorData = await response.json();
          toast.error(errorData?.message || "Error al eliminar la categoría.");
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const showDeleteModal = () => {
    setIsDeleteModalVisible(true);
  };

  const hideDeleteModal = () => {
    setIsDeleteModalVisible(false);
  };

  const confirmDeleteCategory = () => {
    handleDeleteCategory();
    hideDeleteModal();
  };

  return (
    <div className="shadow-md rounded-lg p-4 bg-white my-6 overflow-x-auto">
      <div className="relative w-full bg-white rounded-lg sm:p-5">
        <div>
          <div className="pb-4 mb-4 rounded-t border-b sm:mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Editar / Borrar Categoría
            </h3>
          </div>
          <div className="mb-4">
            <label htmlFor="categorySelect">Seleccionar Categoría:</label>
            <select
              id="categorySelect"
              value={selectedCategoryId}
              onChange={handleChangeSelect}
              className="block w-full border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 p-2.5"
            >
              <option value="">Seleccionar...</option>
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
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 mb-4">
              <div>
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="bg-gray-50 border border-gray-300 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                  placeholder="Nombre Categoría"
                  required
                />
              </div>

              <div className="w-full gap-4">
                <div>
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="block w-full min-h-28 p-2.5 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Descripción Categoría"
                  />
                </div>
              </div>
            </div>
            <div className="mb-4 w-full flex gap-3 justify-between flex-wrap">
              <div className="flex gap-3 w-fit">
                <button
                  type="submit"
                  className="bg-primary hover:bg-secondary text-white hover:text-primary font-medium rounded-lg px-5 py-2.5"
                >
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-red-800 hover:bg-secondary text-white hover:text-primary font-medium rounded-lg px-5 py-2.5"
                >
                  Cancelar
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={showDeleteModal}
                  className="bg-red-800 text-white font-medium rounded-lg px-5 py-2.5"
                >
                  Eliminar Categoría
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {isDeleteModalVisible && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <svg
                    className="h-6 w-6 text-red-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Eliminar Categoría
                  </h3>
                  <div className="mt-2">
                    <p>¿Estás seguro de que deseas eliminar esta categoría?</p>
                    <p className="text-sm text-red-500 uppercase mt-2">
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse justify-between">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={hideDeleteModal}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={confirmDeleteCategory}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCategory;
