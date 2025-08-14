/* eslint-disable @next/next/no-img-element */
import React, {
  useState,
  useEffect,
  ChangeEvent,
  useCallback,
  useRef,
} from "react";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import { getCookie } from "cookies-next";
import axios from "axios";
import Select from "react-select";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/cropImage";
import imageCompression from "browser-image-compression";

function Colecciones() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const editFormRef = useRef<HTMLDivElement>(null);
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [mainImageColeccion, setMainImageColeccion] = useState<string | null>(
    null
  );
  const nombreTienda = process.env.NEXT_PUBLIC_NOMBRE_TIENDA || "pixelup.cl";
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(
    null
  );
  const [imageModified, setImageModified] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formDataColeccion, setFormDataColeccion] = useState<any>({
    bannerTitle: nombreTienda,
    bannerText: nombreTienda,
    previewImage: "",
    title: "",
    landingText: nombreTienda,
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [collectionToDelete, setCollectionToDelete] = useState<any>(null);

  const showDeleteModal = (collection: any) => {
    setCollectionToDelete(collection);
    setIsDeleteModalVisible(true);
  };

  const hideDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setCollectionToDelete(null);
  };

  const confirmDeleteCollection = async () => {
    if (collectionToDelete) {
      await handleDelete(collectionToDelete.id);
      hideDeleteModal();
    }
  };

  // Lista de IDs de colecciones que no deberían tener el botón "Eliminar"
  const noEliminarIDs = [
    "e2b1263f-7cd3-42b9-b08a-8d26e59d91d8",
    "6f1fc389-c295-418e-b43d-c12f1351bfc8",
    "eb1f78e0-f6e4-4a5a-89e1-eca0b1b97ff1",
    "ac61d5e9-93c0-44c5-96ae-a69ac64dab5d",
  ]; // Reemplaza estos IDs con los reales

  // States for image cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const validateCollectionName = (name: string) => {
    return collections.some((collection: any) => collection.title === name);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormDataColeccion({ ...formDataColeccion, [name]: value });

    if (name === "title") {
      if (validateCollectionName(value)) {
        setNameError(
          "El nombre de la colección ya existe. Por favor, elige otro nombre."
        );
      } else {
        setNameError(null);
      }
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name); // Almacena el nombre del archivo
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMainImageColeccion(result);
        setIsMainImageUploaded(true); // Indicar que una nueva imagen ha sido cargada
        setIsModalOpen(true); // Abrir el modal para recortar
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
    if (!mainImageColeccion) return;

    try {
      const croppedImage = await getCroppedImg(
        mainImageColeccion,
        croppedAreaPixels
      );
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 0.95,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: fileName, // Usa el nombre del archivo almacenado
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      setFormDataColeccion((prevFormData: any) => ({
        ...prevFormData,
        mainImage: imageInfo,
      }));
      setMainImageColeccion(base64);
      setIsModalOpen(false);
      setIsMainImageUploaded(true);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleClearImage = () => {
    setMainImageColeccion(
      formDataColeccion.mainImage.url || formDataColeccion.mainImage.data
    );
    setIsMainImageUploaded(false);
    // Reiniciar el estado
  };

  const handleClearImageMobile = () => {
    setMainImageColeccion(
      formDataColeccion.previewImage.url || formDataColeccion.previewImage.data
    );
    setIsMobileImageUploaded(false);
    // Reiniciar el estado
  };

  const handleProductChange = (selectedOption: any) => {
    if (selectedOption) {
      setSelectedProduct(null);
      setSelectedProducts((prevSelectedProducts) => [
        ...prevSelectedProducts,
        selectedOption,
      ]);
    }
  };

  const handleRemoveProduct = (productToRemove: any) => {
    if (selectedProducts.length > 1) {
      setSelectedProducts((prevSelectedProducts) =>
        prevSelectedProducts.filter(
          (product) => product.value !== productToRemove.value
        )
      );
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCollections();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products?pageNumber=1&pageSize=50&statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setProductos(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError(error as Error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/collections?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCollections(response.data.collections);
      console.log("Colecciones:", response.data.collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const formatOptionLabel = ({ value, label, previewImageUrl }: any) => (
    <div className="flex items-center">
      <img
        src={previewImageUrl}
        alt={label}
        className="w-8 h-8 object-cover rounded mr-2"
      />
      <div>
        <span>{label}</span>
      </div>
    </div>
  );

  const availableProducts = productos.filter(
    (product) =>
      !selectedProducts.some((selected) => selected.value === product.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (nameError) {
      return;
    }
    setLoading(true);

    const data = {
      ...formDataColeccion,
      products: selectedProducts.map((product) => ({
        id: product.value,
      })),
    };

    const token = getCookie("AdminTokenAuth");

    try {
      if (isEditing && editingCollectionId) {
        // Actualizar la colección existente
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/collections/${editingCollectionId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Colección actualizada con éxito!");
      } else {
        // Crear nueva colección
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/collections?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Colección creada con éxito!");
      }

      // Resetear estados después de la creación o actualización
      setFormDataColeccion({
        bannerTitle: nombreTienda,
        bannerText: nombreTienda,
        title: "",
        landingText: nombreTienda,
        mainImage: {
          name: "",
          type: "",
          size: null,
          data: "",
        },
      });
      setMainImageColeccion(null);
      setSelectedProducts([]);
      fetchCollections();
    } catch (error) {
      console.error("Error al enviar datos:", error);
    } finally {
      setIsEditing(false);
      setLoading(false);
      setIsMainImageUploaded(false);
    }
  };

  const handleDelete = async (collectionID: string) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/collections/${collectionID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Colección eliminada:", response.data);
      fetchCollections(); // Vuelve a cargar las colecciones después de eliminar una
    } catch (error) {
      console.error("Error al eliminar la colección:", error);
    }
  };
  const [mobileImageColeccion, setMobileImageColeccion] = useState<
    string | null
  >(null);
  const [isMobileImageUploaded, setIsMobileImageUploaded] = useState(false);

  const handleEdit = async (collectionID: any) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/collections/${collectionID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const collection = response.data.collection;
      console.log("Detalle:", response.data.collection);

      // Convertir la URL de la imagen en base64 y obtener su tamaño
      const { base64String: mainImageBase64, size } = await imageUrlToBase64(
        collection.mainImageUrl
      );

      // Filtrar los productos para incluir solo aquellos con statusCode: ACTIVE
      const selectedProductsFromApi = collection.products
        .filter((product: any) => product.statusCode === "ACTIVE")
        .map((product: any) => ({
          value: product.id,
          label: product.name,
          previewImageUrl: product.mainImageUrl,
        }));

      setFormDataColeccion({
        bannerTitle: collection.bannerTitle,
        bannerText: collection.bannerText,
        title: collection.title,
        landingText: "pixelup",
        mainImage: {
          name: collection.bannerTitle,
          type: "image/jpeg",
          size,
          data: mainImageBase64,
        },
      });

      setMainImageColeccion(mainImageBase64);
      setSelectedProducts(selectedProductsFromApi);
      setEditingCollectionId(collectionID);
      setIsEditing(true);
      setImageModified(false);

      // Desplazarse hacia el formulario de edición
      if (editFormRef.current) {
        editFormRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error editing collection:", error);
    }
  };

  const handleCancelEdit = () => {
    setFormDataColeccion({
      bannerTitle: nombreTienda,
      bannerText: nombreTienda,
      title: "",
      landingText: nombreTienda,
      mainImage: {
        name: "",
        type: "",
        size: null,
        data: "",
      },
    });

    setMainImageColeccion(null);
    setSelectedProducts([]);
    setIsEditing(false);
    setEditingCollectionId(null);
    setImageModified(false); // Resetear la modificación de imagen
  };

  const imageUrlToBase64 = async (
    url: string
  ): Promise<{ base64String: any; size: any }> => {
    // function implementation
    try {
      // Obtener el blob de la imagen
      const response = await axios.get(url, { responseType: "blob" });
      const blob = response.data;

      // Obtener el tamaño del blob
      const size = blob.size;

      // Convertir blob a base64
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return { base64String, size };
    } catch (error) {
      console.error("Error converting image URL to base64:", error);
      return { base64String: null, size: null };
    }
  };

  const formatDateToChileanTime = (isoDateString: string) => {
    const date = new Date(isoDateString);

    // Ajustar la hora a la zona horaria de Chile (GMT-4)
    const timezoneOffset = -4 * 60; // -4 horas en minutos
    const adjustedDate = new Date(date.getTime() + timezoneOffset * 60 * 1000);

    const day = adjustedDate.getDate().toString().padStart(2, "0");
    const month = (adjustedDate.getMonth() + 1).toString().padStart(2, "0"); // Los meses son 0-indexados
    const year = adjustedDate.getFullYear();
    const hours = adjustedDate.getHours().toString().padStart(2, "0");
    const minutes = adjustedDate.getMinutes().toString().padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const SkeletonLoader = () => <Loader />;

  const handleMobileImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name); // Almacena el nombre del archivo
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setMobileImageColeccion(result);
        setIsMobileImageUploaded(true); // Indicar que una nueva imagen ha sido cargada
        setIsModalOpen(true); // Abrir el modal para recortar
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMobileCrop = async () => {
    if (!mobileImageColeccion) return;

    try {
      const croppedImage = await getCroppedImg(
        mobileImageColeccion,
        croppedAreaPixels
      );
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es null");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1900,
        useWebWorker: true,
        initialQuality: 0.95,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      const imageInfo = {
        name: fileName, // Usa el nombre del archivo almacenado
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      setFormDataColeccion((prevFormData: any) => ({
        ...prevFormData,
        previewImage: imageInfo, // Nueva imagen para mobile
      }));
      setMobileImageColeccion(base64);
      setIsModalOpen(false);
      setIsMobileImageUploaded(true);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  return (
    <section>
      <Breadcrumb pageName="Colecciones" />
      <div className="shadow-md rounded-lg p-4 bg-white my-6 overflow-x-auto">
        {loading ? (
          <div className="text-center">
            <SkeletonLoader />
          </div>
        ) : (
          <>
            <h2 className="mb-8 text-center text-2xl font-bold text-dark md:mb-12 lg:text-3xl uppercase">
              Colecciones Creadas
            </h2>

            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Foto
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Colección
                  </th>
                  {/*                   <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                    >
                      Título Colección
                    </th> */}
                  <th
                    scope="col"
                    className="px-6 hidden py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    BannerText
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Fecha Creación
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Editar / Eliminar
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collections.map((collection: any) => (
                  <tr key={collection.id}>
                    <td className="px-6 py-4 md:whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <img
                          src={collection.mainImageUrl}
                          alt=""
                          className="w-20"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 md:whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">
                        {collection.title}
                      </div>
                    </td>
                    {/*                     <td className="px-6 py-4 md:whitespace-nowrap hidden md:table-cell">
                        <div className="text-sm text-gray-900">
                          {collection.bannerTitle}
                        </div>
                      </td> */}
                    <td className="px-6 py-4 md:whitespace-nowrap hidden">
                      <div className="text-sm text-gray-900">
                        {collection.bannerText}
                      </div>
                    </td>
                    <td className="px-6 py-4 md:whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateToChileanTime(collection.creationDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 md:whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleEdit(collection.id)}
                        className="bg-primary hover:bg-secondary text-secondary hover:text-primary font-bold py-2 px-4 rounded"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                          />
                        </svg>
                      </button>
                      {!noEliminarIDs.includes(collection.id) && (
                        <button
                          onClick={() => showDeleteModal(collection)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-4 h-4"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {!loading && (
        <div
          ref={editFormRef}
          className="shadow-md rounded-lg p-4 bg-white my-6"
        >
          <h2 className="mb-8 text-center text-2xl font-bold text-dark md:mb-12 lg:text-3xl uppercase">
            {isEditing ? "Editar Colección" : "Crear Colección"}
          </h2>
          {nameError && (
            <div
              className="shadow flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
              role="alert"
            >
              <svg
                className="flex-shrink-0 inline w-4 h-4 me-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
              </svg>
              <span className="sr-only">Error</span>
              <div>
                <span className="font-medium">{nameError}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <label className="block mt-4">
              <h3 className="font-normal text-primary">
                Nombre Colección <span className="text-primary">*</span>
              </h3>
              <input
                id="title"
                name="title"
                value={formDataColeccion.title}
                onChange={handleChange}
                placeholder="Ingresa nombre de la colección..."
                className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                style={{ borderRadius: "var(--radius)" }}
              />
            </label>
            {/*             <label className="block mt-4">
                <h3 className="font-normal text-primary">
                  Título Banner <span className="text-primary">*</span>
                </h3>
                <input
                  id="bannerTitle"
                  name="bannerTitle"
                  value={formDataColeccion.bannerTitle}
                  onChange={handleChange}
                  placeholder="Ingresa título del banner..."
                  className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </label> 
  
              <label className="block mt-4">
                <h3 className="font-normal text-primary">
                  Texto Banner <span className="text-primary">*</span>
                </h3>
                <input
                  id="bannerText"
                  name="bannerText"
                  value={formDataColeccion.bannerText}
                  onChange={handleChange}
                  placeholder="Ingresa texto del banner..."
                  className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </label>*/}

            <div>
              <input
                type="file"
                accept="image/*"
                id="mainImage"
                className="hidden"
                onChange={handleImageChange}
              />
              {isMainImageUploaded ? (
                <div className="flex flex-col items-center mt-10 ">
                  <h4 className="font-normal text-primary text-center text-slate-600 w-full">
                    Tu fotografía{" "}
                    <span className="text-dark">
                      {" "}
                      {formDataColeccion.mainImage.name}
                    </span>{" "}
                    ya ha sido cargada.
                    <br /> Actualiza para ver los cambios.
                  </h4>
                  <button
                    className="bg-red-500 gap-4 flex item-center justify-center px-4 py-2 hover:bg-red-700 text-white rounded-full   text-xs mt-4 "
                    onClick={handleClearImage}
                  >
                    <span className="self-center">Seleccionar otra Imagen</span>
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
              ) : (
                <div>
                  <h3 className="font-normal text-primary">
                    Foto <span className="text-primary">*</span>
                  </h3>
                  <label
                    htmlFor="mainImage"
                    className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed rounded-lg cursor-pointer w-full z-10"
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
                        <span className="font-semibold">Subir Imagen</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG o Webp (800x800px)
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                id="previewImage"
                className="hidden"
                onChange={handleMobileImageChange}
              />
              {isMobileImageUploaded ? (
                <div className="flex flex-col items-center mt-10 ">
                  <h4 className="font-normal text-primary text-center text-slate-600 w-full">
                    Tu fotografía{" "}
                    <span className="text-dark">
                      {" "}
                      {formDataColeccion.previewImage.name}
                    </span>{" "}
                    ya ha sido cargada.
                    <br /> Actualiza para ver los cambios.
                  </h4>
                  <button
                    className="bg-red-500 gap-4 flex item-center justify-center px-4 py-2 hover:bg-red-700 text-white rounded-full   text-xs mt-4 "
                    onClick={handleClearImageMobile}
                  >
                    <span className="self-center">Seleccionar otra Imagen</span>
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
              ) : (
                <div>
                  <h3 className="font-normal text-primary">
                    Foto Móvil <span className="text-primary">*</span>
                  </h3>
                  <label
                    htmlFor="previewImage"
                    className="border-primary shadow flex mt-3 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed rounded-lg cursor-pointer w-full z-10"
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
                        <span className="font-semibold">
                          Subir Imagen para Móvil
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG o Webp (800x800px)
                      </p>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <div className="mt-8">
              <label
                htmlFor="product"
                className="block"
              >
                <h3 className="font-normal text-primary">Producto:</h3>
                <Select
                  id="product"
                  value={selectedProduct}
                  onChange={handleProductChange}
                  options={availableProducts.map((producto) => ({
                    value: producto.id,
                    label: producto.name,
                    previewImageUrl: producto.mainImageUrl,
                  }))}
                  formatOptionLabel={formatOptionLabel}
                  className="shadow block w-full mt-2"
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: "var(--radius)",
                    }),
                  }}
                  isClearable
                />
              </label>
            </div>

            <div className="mt-8">
              {" "}
              <h3 className="text-primary font-normal">
                Productos seleccionados:
              </h3>
              {selectedProducts.length === 1 && (
                <div
                  style={{ borderRadius: "var(--radius)" }}
                  className="shadow mt-4 flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
                  role="alert"
                >
                  <svg
                    className="flex-shrink-0 inline w-4 h-4 me-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                  </svg>
                  <span className="sr-only">Info</span>
                  <div>
                    {/*                     <span className="font-semibold">
                        Debe haber un producto.
                      </span>{" "} */}
                    La colección <span className="font-semibold"> no </span> se
                    mostrará en tu sitio web hasta que agregues uno o más
                    productos.
                  </div>
                </div>
              )}
              {selectedProducts.length === 0 ? (
                <div
                  style={{ borderRadius: "var(--radius)" }}
                  className="shadow mt-4 flex items-center p-4 mb-4 text-sm text-red-800 border border-red-300 bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800"
                  role="alert"
                >
                  <svg
                    className="flex-shrink-0 inline w-4 h-4 me-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                  </svg>
                  <span className="sr-only">Info</span>
                  <div>
                    <span className="font-semibold">
                      No hay productos seleccionados.
                    </span>{" "}
                    Se debe seleccionar productos para poder mostrarlos en la
                    colección.
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {selectedProducts.map((product) => (
                    <div
                      key={product.value}
                      className="shadow flex items-center space-x-2 mt-2 border p-2"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      <img
                        src={product.previewImageUrl}
                        alt={product.label}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span>{product.label}</span>
                      {selectedProducts.length > 1 && (
                        <button
                          onClick={() => handleRemoveProduct(product)}
                          className="shadow ml-auto bg-primary text-secondary hover:text-primary hover:bg-secondary p-2 flex items-center justify-center"
                          style={{ borderRadius: "var(--radius)" }}
                          title="Eliminar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-6 h-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-between">
              <button
                type="submit"
                className="shadow bg-primary hover:bg-secondary w-full uppercase text-secondary hover:text-primary font-bold py-2 px-4 rounded flex-wrap mt-6"
                style={{ borderRadius: "var(--radius)" }}
              >
                {isEditing ? "Actualizar Colección" : "Crear Colección"}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="shadow bg-gray-300 hover:bg-gray-400 w-full uppercase text-black hover:text-white font-bold py-2 px-4 rounded flex-wrap mt-6 ml-4"
                  style={{ borderRadius: "var(--radius)" }}
                >
                  Cancelar Edición
                </button>
              )}
            </div>
          </form>
        </div>
      )}
      {isModalOpen && (
        <Modal
          showModal={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <div className="relative h-96 w-full">
            <Cropper
              image={mainImageColeccion || ""} // Asegurar que se pasa una cadena no nula
              crop={crop}
              zoom={zoom}
              aspect={19 / 2}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
            <div className="controls"></div>
          </div>
          <div className="flex flex-col  justify-end ">
            <div className="w-full py-6">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.01}
                aria-labelledby="Zoom"
                onChange={(e) => {
                  setZoom(parseFloat(e.target.value));
                }}
                className="zoom-range w-full custom-range "
              />
            </div>

            <div className="flex justify-between w-full ">
              <button
                onClick={handleCrop}
                className="bg-primary hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Recortar y Subir
              </button>
              <button
                onClick={() => {
                  setMainImageColeccion(null);
                  setIsMainImageUploaded(false);
                  setIsModalOpen(false);
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
                    Eliminar Colección
                  </h3>
                  <div className="mt-2">
                    <p>¿Estás seguro de que deseas eliminar esta colección?</p>
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
                  onClick={confirmDeleteCollection}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Colecciones;
