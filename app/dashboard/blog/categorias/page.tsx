"use client";
import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import axios from "axios";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  description: string | null;
  statusCode: string;
  previewImageUrl: string | null;
  mainImageUrl: string | null;
}

const BlogCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("create");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  // Estado para el formulario de creación
  const [formDataCreate, setFormDataCreate] = useState({
    name: "",
    description: "",
  });

  // Estado para el formulario de edición
  const [formDataEdit, setFormDataEdit] = useState({
    name: "",
    description: "",
  });

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/article-categories?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&pageSize=100&pageNumber=1`
      );
      setCategories(response.data.articleCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const selectedCategory = categories.find((cat) => cat.id === selectedCategoryId);
    if (selectedCategory) {
      setFormDataEdit({
        name: selectedCategory.name,
        description: selectedCategory.description || "",
      });
    }
  }, [selectedCategoryId, categories]);

  const handleChangeCreate = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormDataCreate((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeEdit = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormDataEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategoryId(e.target.value);
  };

  const handleSubmitCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const authToken = getCookie("AdminTokenAuth");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/article-categories?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          name: formDataCreate.name,
          description: formDataCreate.description,
          statusCode: "ACTIVE",
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Categoría creada correctamente");
      setFormDataCreate({
        name: "",
        description: "",
      });
      fetchCategories();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la categoría");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategoryId || isDeleting) return;

    const authToken = getCookie("AdminTokenAuth");

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/article-categories/${selectedCategoryId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          name: formDataEdit.name,
          description: formDataEdit.description,
          statusCode: "ACTIVE",
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Categoría actualizada correctamente");
      setFormDataEdit({
        name: "",
        description: "",
      });
      setSelectedCategoryId("");
      fetchCategories();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar la categoría");
    }
  };

  const handleDeleteCategory = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/article-categories/${selectedCategoryId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${getCookie("AdminTokenAuth")}`,
          },
        }
      );

      toast.success("Categoría eliminada correctamente");
      setSelectedCategoryId("");
      setFormDataEdit({
        name: "",
        description: "",
      });
      setActiveTab("create");
      fetchCategories();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.error("Error: esta categoría está asociada a un artículo.");
      } else {
        toast.error("Error al eliminar la categoría");
      }
    } finally {
      setIsDeleting(false);
      setIsDeleteModalVisible(false);
    }
  };

  const renderCreateForm = () => (
    <div className="shadow-md rounded-lg p-4 bg-white my-6 overflow-x-auto">
      <div className="relative w-full bg-white rounded-lg sm:p-5">
        <div>
          <div className="pb-4 mb-4 rounded-t border-b sm:mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Crear Categoría
            </h3>
          </div>
          <form onSubmit={handleSubmitCreate}>
            <div className="grid gap-4 mb-4">
              <div>
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formDataCreate.name}
                  onChange={handleChangeCreate}
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
                    value={formDataCreate.description}
                    onChange={handleChangeCreate}
                    rows={4}
                    className="block w-full min-h-28 p-2.5 text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Descripción Categoría"
                  />
                </div>
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
                type="button"
                onClick={() => setActiveTab("edit")}
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

  const renderEditForm = () => (
    <div className="shadow-md rounded-lg p-4 bg-white my-6 overflow-x-auto">
      <div className="relative w-full bg-white rounded-lg sm:p-5">
        <div>
          <div className="pb-4 mb-4 rounded-t border-b sm:mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              Editar Categoría
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
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 mb-4">
              <div>
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formDataEdit.name}
                  onChange={handleChangeEdit}
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
                    value={formDataEdit.description}
                    onChange={handleChangeEdit}
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
                  onClick={() => setActiveTab("create")}
                  className="bg-red-800 hover:bg-secondary text-white hover:text-primary font-medium rounded-lg px-5 py-2.5"
                >
                  Cancelar
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalVisible(true)}
                  className="bg-red-800 text-white font-medium rounded-lg px-5 py-2.5"
                >
                  Eliminar Categoría
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
      <Breadcrumb pageName="Categorías del Blog" />
      <div className="w-full">
        <div className="flex flex-col sm:flex-row mb-6 gap-4">
          <button
            className={`flex-1 p-4 rounded-xl bg-gray-200  text-primary shadow-md transition-all duration-300 ${
              activeTab === "create" ? "bg-primary text-white" : ""
            }`}
            onClick={() => setActiveTab("create")}
          >
            Crear Categoría
          </button>
          <button
            className={`flex-1 p-4 rounded-xl bg-gray-200  text-primary shadow-md transition-all duration-300 ${
              activeTab === "edit" ? "bg-primary text-white" : ""
            }`}
            onClick={() => setActiveTab("edit")}
          >
            Editar Categoría
          </button>
        </div>
        {activeTab === "create" ? renderCreateForm() : renderEditForm()}
      </div>

      {isDeleteModalVisible && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
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
                  onClick={() => setIsDeleteModalVisible(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteCategory}
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

export default BlogCategories;
