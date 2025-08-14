import React, { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import { useAPI } from "@/app/Context/ProductTypeContext";
import toast from "react-hot-toast";
import { useRevalidation } from "@/app/Context/RevalidationContext";

interface CreateAttributeProps {
  handleCloseModal: any;
  fetchData: any;
}

const CreateAtribute: React.FC<CreateAttributeProps> = ({
  handleCloseModal,
  fetchData,
}) => {
  const token = String(getCookie("AdminTokenAuth"));

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    statusCode: "ACTIVE",
  });

  const { fetchAttributes, attributes, setAttributes, loading, error } =
    useAPI();

  const { triggerRevalidation } = useRevalidation();

  // State for delete confirmation modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<any>(null);

  const showDeleteModal = (attribute: any) => {
    setAttributeToDelete(attribute);
    setIsDeleteModalVisible(true);
  };

  const hideDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setAttributeToDelete(null);
  };

  const confirmDeleteAttribute = async () => {
    if (attributeToDelete) {
      await handleDelete(attributeToDelete.id);
      hideDeleteModal();
    }
  };

  const handleDelete = async (id: number) => {
    /*     const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este atributo?"
    );
    if (!confirmed) return;
 */
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/attributes/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        await triggerRevalidation();

        fetchAttributes();
        fetchData();
        toast.success("Atributo eliminado exitosamente");
      } else if (response.status === 409) {
        toast.error(
          "Este atributo está asociado a un producto y no se puede eliminar."
        );
      } else {
        console.error("Error al eliminar el Atributo:", response.statusText);
        toast.error("Ocurrió un error al eliminar el atributo.");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast.error("Ocurrió un error al eliminar el atributo.");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedDescription = formData.description.trim();

    const attributeExists = attributes.some(
      (attribute: any) =>
        attribute.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (attributeExists) {
      toast.error("Ya existe un atributo con este nombre.");
      return;
    }

    if (trimmedName === "") {
      toast.error(
        "El nombre del atributo no puede estar vacío o contener solo espacios."
      );
      return;
    }
    const finalDescription =
      trimmedDescription === "" ? "sin descripción" : trimmedDescription;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/attributes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            name: trimmedName,
            description: finalDescription,
          }),
        }
      );

      if (response.ok) {
        await triggerRevalidation();

        handleCloseModal();
        setFormData({
          name: "",
          description: "",
          statusCode: "ACTIVE",
        });
        fetchAttributes();
        toast.success("Atributo creado exitosamente");
      } else {
        console.error("Error al crear el Atributo:", response.statusText);
        toast.error("Ocurrió un error al crear el atributo.");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast.error("Ocurrió un error al crear el atributo.");
    }
  };

  useEffect(() => {
    fetchAttributes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDescriptionChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: value,
    }));
  };

  return (
    <div className="flex items-center justify-end lg:pr-32 w-full">
      <div className="relative px-8 md:px-12  flex mt-[16vh] justify-center w-full lg:w-[70%]">
        <div className="relative p-4 grid grid-cols-1 sm:grid-cols-2 w-full  bg-white rounded-lg shadow dark:bg-gray-800 sm:p-5">
          <div>
            <div className="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600 ">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Crear / Eliminar Atributo
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 mb-4 sm:grid-cols-1">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Nombre
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
                    placeholder="Ingresa el nombre del atributo"
                    required
                  />
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="description"
                      className="mt-2 block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      rows={4}
                      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      placeholder="Ingrese descripción del atributo..."
                    />
                  </div>
                </div>
              </div>
              <div className="items-center  flex  space-x-4 mb-8">
                <button
                  type="submit"
                  className="bg-primary hover:bg-secondary text-white hover:text-primary font-medium rounded-lg px-5 py-2.5"
                >
                  Crear Atributo
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-red-800 hover:bg-secondary text-white hover:text-primary font-medium rounded-lg px-5 py-2.5"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
          <div className="px-4 bg-white">
            <div className="flex justify-between items-center pb-3 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600 ">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white ">
                Atributos
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-primary hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={handleCloseModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className=" overflow-y-auto px-8 py-2 pb-6 bg-gray-50 rounded">
              {loading && <p>Loading...</p>}
              {error && <p>Error: {error.message}</p>}
              {Array.isArray(attributes) && attributes.length > 0 ? (
                attributes.map((attribute) => (
                  <div
                    className="flex justify-between items-center border-b py-2 text-xs"
                    key={attribute.id}
                  >
                    <span>{attribute.name}</span>
                    <button
                      className="text-red-500 hover:text-red-700"
                      onClick={() => showDeleteModal(attribute)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              ) : (
                <p>No attributes found</p>
              )}
            </div>
          </div>
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
                    Eliminar Atributo
                  </h3>
                  <div className="mt-2">
                    <p>¿Estás seguro de que deseas eliminar este atributo?</p>
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
                  onClick={confirmDeleteAttribute}
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

export default CreateAtribute;
