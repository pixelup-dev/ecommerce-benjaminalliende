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
import { useRevalidation } from "@/app/Context/RevalidationContext";
import Image from "next/image";

interface ConfigOptions {
  desktop: {
    showTitle: boolean;
    showBannerText: boolean;
    showButton: boolean;
    textAlignment: string;
    bannerText: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
  mobile: {
    showTitle: boolean;
    showBannerText: boolean;
    showButton: boolean;
    textAlignment: string;
    bannerText: string;
    title: string;
    buttonText: string;
    buttonLink: string;
  };
}

// Funciones de utilidad para el manejo de imágenes
const validateImage = (file: File) => {
  // Validar tipo de archivo
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    toast.error("Formato de imagen no válido. Use PNG, JPG o WebP");
    return false;
  }

  // Validar tamaño (máximo 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.error("La imagen es demasiado grande. Máximo 5MB");
    return false;
  }

  return true;
};

const compressImage = async (file: File) => {
  try {
    console.log("🗜️ Iniciando compresión de imagen:", {
      originalSize: file.size,
      originalType: file.type,
    });

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: 0.8,
    };

    const compressedFile = await imageCompression(file, options);

    console.log("✅ Imagen comprimida exitosamente:", {
      finalSize: compressedFile.size,
      finalType: compressedFile.type,
      compressionRatio: (file.size / compressedFile.size).toFixed(2) + "x",
    });

    return compressedFile;
  } catch (error) {
    console.error("❌ Error al comprimir la imagen:", error);
    throw new Error("Error al comprimir la imagen");
  }
};

const ImagePreview = ({
  src,
  alt = "Preview",
}: {
  src: string;
  alt?: string;
}) => {
  return (
    <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error("Error al cargar la imagen");
          e.currentTarget.src = "/placeholder-image.jpg";
        }}
      />
    </div>
  );
};

const PreviewBanner = ({ config, image, isMobile = false }: any) => {
  const currentConfig = config[isMobile ? "mobile" : "desktop"];
  const hasContent = image;
  const hasElements =
    currentConfig.showTitle ||
    currentConfig.showBannerText ||
    currentConfig.showButton;

  if (!hasContent) {
    return null;
  }

  const getAlignmentClasses = (alignment: string) => {
    switch (alignment) {
      case "left":
        return "items-start text-left";
      case "right":
        return "items-end text-right";
      default:
        return "items-center text-center";
    }
  };

  return (
    <div className="relative w-full">
      {image && (
        <img
          src={image}
          alt="Preview"
          width={isMobile ? 375 : 1920}
          height={isMobile ? 500 : 600}
          className="w-full object-cover"
        />
      )}
      {hasElements && (
        <div className="absolute inset-0 bg-black bg-opacity-50">
          <div
            className={`flex h-full flex-col ${getAlignmentClasses(
              currentConfig.textAlignment
            )} justify-center p-4`}
          >
            <div className="max-w-[90%]">
              {currentConfig.showTitle && (
                <h2 className="mb-4 text-2xl font-bold text-white">
                  {currentConfig.title}
                </h2>
              )}
              {currentConfig.showBannerText && (
                <p className="mb-4 text-white">{currentConfig.bannerText}</p>
              )}
              {currentConfig.showButton && (
                <div
                  className={`flex ${
                    currentConfig.textAlignment === "center"
                      ? "justify-center"
                      : currentConfig.textAlignment === "right"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <button className="inline-block rounded bg-white px-4 py-2 text-black">
                    {currentConfig.buttonText}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function Colecciones() {
  const { triggerRevalidation } = useRevalidation();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const editFormRef = useRef<HTMLDivElement>(null);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    basicInfo: true,
    desktopConfig: true,
    mobileConfig: true,
  });
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [isPreviewImageModalOpen, setIsPreviewImageModalOpen] = useState(false);

  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [isPreviewImageUploaded, setIsPreviewImageUploaded] = useState(false);
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
  const [mainPreviewColeccion, setPreviewImageColeccion] = useState<
    string | null
  >(null);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(
    null
  );
  const [imageModified, setImageModified] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formDataColeccion, setFormDataColeccion] = useState<any>({
    bannerTitle: nombreTienda,
    bannerText: JSON.stringify({
      desktop: {
        showTitle: false,
        showBannerText: false,
        showButton: false,
        textAlignment: "center",
        bannerText: "",
        title: "",
        buttonText: "Ver más",
        buttonLink: "#",
      },
      mobile: {
        showTitle: false,
        showBannerText: false,
        showButton: false,
        textAlignment: "center",
        bannerText: "",
        title: "",
        buttonText: "Ver más",
        buttonLink: "#",
      },
    }),
    title: "",
    mainImage: {
      name: "",
      type: "",
      size: null,
      data: "",
      url: "", // Agregado para compatibilidad
    },
    previewImage: {
      name: "",
      type: "",
      size: null,
      data: "",
      url: "", // Agregado para compatibilidad
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

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      console.log("🖼️ Iniciando carga de imagen principal:", {
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
      });

      if (!file) {
        console.log("❌ No se seleccionó ningún archivo");
        return;
      }

      if (!validateImage(file)) {
        console.log("❌ La imagen no pasó la validación");
        return;
      }

      setFileName(file.name);
      console.log("📝 Nombre de archivo guardado:", file.name);

      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        console.log("✅ Imagen principal cargada:", {
          resultLength: result.length,
          isBase64: result.startsWith("data:image"),
        });

        // Actualizar el estado de la imagen principal
        setFormDataColeccion((prevState: any) => ({
          ...prevState,
          mainImage: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: result,
          },
        }));

        setMainImageColeccion(result);
        setIsMainImageUploaded(true);
        setIsModalOpen(true);
        toast.success("Imagen cargada correctamente");
      };

      reader.onerror = (error) => {
        console.log("❌ Error al leer el archivo:", error);
        toast.error(
          "Error al cargar la imagen. Por favor, intente nuevamente."
        );
        setIsMainImageUploaded(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("❌ Error en handleImageChange:", error);
      toast.error("Error al procesar la imagen");
      setIsMainImageUploaded(false);
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handlePreviewCrop = async () => {
    try {
      console.log("✂️ Iniciando recorte de imagen mobile");

      if (!mainPreviewColeccion) {
        console.log("❌ No hay imagen mobile para recortar");
        toast.error("No hay imagen mobile para recortar");
        return;
      }

      console.log("📐 Área de recorte mobile:", croppedAreaPixels);

      const croppedImage = await getCroppedImg(
        mainPreviewColeccion,
        croppedAreaPixels
      );

      if (!croppedImage) {
        console.log("❌ Error al recortar la imagen mobile");
        toast.error("Error al recortar la imagen mobile");
        return;
      }

      console.log("✂️ Imagen mobile recortada correctamente:", {
        size: croppedImage.size,
        type: croppedImage.type,
      });

      const compressedFile = await compressImage(croppedImage as File);
      const base64 = await convertToBase64(compressedFile);

      console.log("🔄 Imagen mobile convertida a base64:", {
        finalLength: base64.length,
        isBase64: base64.startsWith("data:image"),
      });

      const imageInfo = {
        name: fileName || "preview-image.jpg",
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      console.log("📊 Estado final de la imagen mobile:", {
        name: imageInfo.name,
        type: imageInfo.type,
        size: imageInfo.size,
        hasData: !!imageInfo.data,
      });

      setFormDataColeccion((prevFormData: any) => {
        console.log(
          "🔄 Actualizando formDataColeccion con nueva imagen mobile"
        );
        return {
          ...prevFormData,
          previewImage: imageInfo,
        };
      });

      setPreviewImageColeccion(base64);
      setIsPreviewImageModalOpen(false);
      setIsPreviewImageUploaded(true);
      toast.success("Imagen mobile recortada con éxito");
    } catch (error) {
      console.error("❌ Error detallado en handlePreviewCrop:", error);
      toast.error("Error al procesar la imagen mobile");
      setIsPreviewImageUploaded(false);
    }
  };

  const handlePreviewImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      console.log("🖼️ Iniciando carga de imagen mobile:", {
        fileName: file?.name,
        fileSize: file?.size,
        fileType: file?.type,
      });

      if (!file) {
        console.log("❌ No se seleccionó ningún archivo para mobile");
        return;
      }

      if (!validateImage(file)) {
        console.log("❌ La imagen mobile no pasó la validación");
        return;
      }

      setFileName(file.name);
      console.log("📝 Nombre de archivo mobile guardado:", file.name);

      const reader = new FileReader();

      reader.onload = () => {
        const result = reader.result as string;
        console.log("✅ Imagen mobile cargada:", {
          resultLength: result.length,
          isBase64: result.startsWith("data:image"),
        });

        // Actualizar el estado de la imagen mobile
        setFormDataColeccion((prevState: any) => ({
          ...prevState,
          previewImage: {
            name: file.name,
            type: file.type,
            size: file.size,
            data: result,
          },
        }));

        setPreviewImageColeccion(result);
        setIsPreviewImageUploaded(true);
        setIsPreviewImageModalOpen(true);
        toast.success("Imagen mobile cargada correctamente");
      };

      reader.onerror = (error) => {
        console.log("❌ Error al leer el archivo mobile:", error);
        toast.error(
          "Error al cargar la imagen mobile. Por favor, intente nuevamente."
        );
        setIsPreviewImageUploaded(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("❌ Error en handlePreviewImageChange:", error);
      toast.error("Error al procesar la imagen mobile");
      setIsPreviewImageUploaded(false);
    }
  };

  const handleCrop = async () => {
    try {
      console.log("✂️ Iniciando recorte de imagen principal");

      if (!mainImageColeccion) {
        console.log("❌ No hay imagen principal para recortar");
        toast.error("No hay imagen para recortar");
        return;
      }

      console.log("📐 Área de recorte:", croppedAreaPixels);

      const croppedImage = await getCroppedImg(
        mainImageColeccion,
        croppedAreaPixels
      );

      if (!croppedImage) {
        console.log("❌ Error al recortar la imagen principal");
        toast.error("Error al recortar la imagen");
        return;
      }

      console.log("✂️ Imagen principal recortada correctamente:", {
        size: croppedImage.size,
        type: croppedImage.type,
      });

      const compressedFile = await compressImage(croppedImage as File);
      const base64 = await convertToBase64(compressedFile);

      console.log("🔄 Imagen principal convertida a base64:", {
        finalLength: base64.length,
        isBase64: base64.startsWith("data:image"),
      });

      const imageInfo = {
        name: fileName || "main-image.jpg",
        type: compressedFile.type,
        size: compressedFile.size,
        data: base64,
      };

      console.log("📊 Estado final de la imagen principal:", {
        name: imageInfo.name,
        type: imageInfo.type,
        size: imageInfo.size,
        hasData: !!imageInfo.data,
      });

      setFormDataColeccion((prevFormData: any) => {
        console.log(
          "🔄 Actualizando formDataColeccion con nueva imagen principal"
        );
        return {
          ...prevFormData,
          mainImage: imageInfo,
        };
      });

      setMainImageColeccion(base64);
      setIsModalOpen(false);
      setIsMainImageUploaded(true);
      toast.success("Imagen recortada con éxito");
    } catch (error) {
      console.error("❌ Error detallado en handleCrop:", error);
      toast.error("Error al procesar la imagen");
      setIsMainImageUploaded(false);
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
    setPreviewImageColeccion(null);
    setIsPreviewImageUploaded(false);
    setFormDataColeccion((prevFormData: any) => ({
      ...prevFormData,
      previewImage: {
        name: "",
        type: "",
        size: null,
        data: "",
      },
    }));
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
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products?pageNumber=1&pageSize=300&statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
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
  const handleSubmit = async (
    e: React.FormEvent,
    section?: "desktop" | "mobile"
  ) => {
    e.preventDefault();

    // Validar que haya al menos un producto seleccionado
    if (selectedProducts.length === 0) {
      toast.error(
        "Debes seleccionar al menos un producto para crear la colección."
      );
      return;
    }

    // Validar productos variables
    try {
      const token = getCookie("AdminTokenAuth");
      let hasInvalidProducts = false;

      // Verificar cada producto seleccionado
      for (const product of selectedProducts) {
        const productInfo = productos.find((p) => p.id === product.value);

        if (productInfo?.hasVariations) {
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productInfo.id}/skus?statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.data.code === 0) {
            // Filtrar solo las variaciones (excluir el SKU base)
            const variationSkus = response.data.skus.filter(
              (sku: any) => !sku.isBaseSku
            );

            if (variationSkus.length === 0) {
              toast.error(
                `El producto "${productInfo.name}" no tiene variaciones creadas. Por favor, crea las variaciones antes de continuar.`
              );
              hasInvalidProducts = true;
              break;
            }
          } else {
            console.error("Error al verificar SKUs:", response.data.message);
            toast.error("Error al verificar las variaciones del producto");
            return;
          }
        }
      }

      if (hasInvalidProducts) {
        return;
      }
    } catch (error) {
      console.error("Error al verificar SKUs:", error);
      toast.error("Error al verificar las variaciones de los productos");
      return;
    }

    if (!formDataColeccion.title.trim()) {
      toast.error("Por favor, ingresa un nombre para la colección.");
      return;
    }

    // Solo validar imágenes si es una nueva colección
    if (!isEditing) {
      console.log("Estado de las imágenes:", {
        isMainImageUploaded,
        isPreviewImageUploaded,
        mainImage: formDataColeccion.mainImage,
        previewImage: formDataColeccion.previewImage,
      });

      // Validación mejorada para la imagen principal
      if (
        !isMainImageUploaded ||
        !formDataColeccion.mainImage?.data ||
        formDataColeccion.mainImage.data === ""
      ) {
        console.log("Error en imagen principal:", {
          isMainImageUploaded,
          mainImageData: formDataColeccion.mainImage?.data,
        });
        toast.error("Por favor, sube una imagen principal antes de continuar.");
        return;
      }

      // Validación mejorada para la imagen de preview
      if (
        !isPreviewImageUploaded ||
        !formDataColeccion.previewImage?.data ||
        formDataColeccion.previewImage.data === ""
      ) {
        console.log("Error en imagen preview:", {
          isPreviewImageUploaded,
          previewImageData: formDataColeccion.previewImage?.data,
        });
        toast.error(
          "Por favor, sube una imagen para móvil antes de continuar."
        );
        return;
      }
    }

    if (nameError) {
      return;
    }
    setLoading(true);

    // Preparar los datos base
    let data: any = {
      title: formDataColeccion.title,
      landingText: nombreTienda,
      bannerText: formDataColeccion.bannerText,
      products: selectedProducts.map((product) => ({
        id: product.value,
      })),
    };

    // Si se está actualizando una sección específica
    if (section) {
      // Mantener la configuración existente de la otra sección
      const currentConfig = JSON.parse(formDataColeccion.bannerText);
      if (section === "desktop") {
        // Mantener la configuración mobile existente
        data.bannerText = JSON.stringify({
          ...currentConfig,
          desktop: currentConfig.desktop,
        });
      } else {
        // Mantener la configuración desktop existente
        data.bannerText = JSON.stringify({
          ...currentConfig,
          mobile: currentConfig.mobile,
        });
      }
    }

    // Solo incluir imágenes si han sido modificadas y tienen el formato correcto
    if (isMainImageUploaded && formDataColeccion.mainImage.data) {
      data.mainImage = {
        name: formDataColeccion.mainImage.name || "main-image.jpg",
        type: formDataColeccion.mainImage.type || "image/jpeg",
        size: formDataColeccion.mainImage.size,
        data: formDataColeccion.mainImage.data,
      };
    }

    if (isPreviewImageUploaded && formDataColeccion.previewImage.data) {
      data.previewImage = {
        name: formDataColeccion.previewImage.name || "preview-image.jpg",
        type: formDataColeccion.previewImage.type || "image/jpeg",
        size: formDataColeccion.previewImage.size,
        data: formDataColeccion.previewImage.data,
      };
    }

    console.log("Datos a enviar:", data);

    const token = getCookie("AdminTokenAuth");

    try {
      if (isEditing && editingCollectionId) {
        // Actualizar colección existente
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

        await triggerRevalidation(["collections"]);
        toast.success(
          section
            ? `Configuración ${section} actualizada con éxito!`
            : "Colección actualizada con éxito!"
        );
      } else {
        // Para nueva colección, asegurarse de que ambas imágenes estén incluidas
        if (!data.mainImage || !data.previewImage) {
          toast.error("Se requieren ambas imágenes para crear una colección");
          setLoading(false);
          return;
        }

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

        await triggerRevalidation(["collections"]);
        toast.success("Colección creada con éxito!");
      }

      // Resetear el estado después de crear/actualizar solo si no es una actualización parcial
      if (!section) {
        setFormDataColeccion({
          bannerTitle: nombreTienda,
          bannerText: JSON.stringify({
            desktop: {
              showTitle: false,
              showBannerText: false,
              showButton: false,
              textAlignment: "center",
              bannerText: "",
              title: "",
              buttonText: "Ver más",
              buttonLink: "#",
            },
            mobile: {
              showTitle: false,
              showBannerText: false,
              showButton: false,
              textAlignment: "center",
              bannerText: "",
              title: "",
              buttonText: "Ver más",
              buttonLink: "#",
            },
          }),
          title: "",
          mainImage: {
            name: "",
            type: "",
            size: null,
            data: "",
          },
          previewImage: {
            name: "",
            type: "",
            size: null,
            data: "",
          },
        });
        setMainImageColeccion(null);
        setPreviewImageColeccion(null);
        setSelectedProducts([]);
        fetchCollections();
      }
    } catch (error) {
      console.error("Error al enviar datos:", error);
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsEditing(false);
      setLoading(false);
      setIsMainImageUploaded(false);
      setIsPreviewImageUploaded(false);
    }
  };

  const handleDelete = async (collectionID: string) => {
    try {
      const token = getCookie("AdminTokenAuth");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/collections/${collectionID}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Usar el contexto para revalidar
      await triggerRevalidation(["collections"]);
      toast.success("Colección eliminada con éxito!");
      fetchCollections();
    } catch (error) {
      console.error("Error al eliminar la colección:", error);
      toast.error("Error al eliminar la colección");
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
      console.log("Detalle:", collection);

      // Convertir las URLs de las imágenes en base64
      const { base64String: mainImageBase64, size: mainImageSize } =
        await imageUrlToBase64(collection.mainImageUrl);
      const { base64String: previewImageBase64, size: previewImageSize } =
        await imageUrlToBase64(collection.previewImageUrl);

      // Intentar parsear el bannerText si existe, si no, usar la configuración por defecto
      let bannerConfig;
      try {
        bannerConfig = JSON.parse(collection.bannerText);
      } catch (e) {
        bannerConfig = {
          desktop: {
            showTitle: true,
            showBannerText: true,
            showButton: true,
            textAlignment: "center",
            bannerText: "",
            title: "",
            buttonText: "Ver más",
            buttonLink: "#",
          },
          mobile: {
            showTitle: true,
            showBannerText: true,
            showButton: true,
            textAlignment: "center",
            bannerText: "",
            title: "",
            buttonText: "Ver más",
            buttonLink: "#",
          },
        };
      }

      // Filtrar los productos activos
      const selectedProductsFromApi = collection.products
        .filter((product: any) => product.statusCode === "ACTIVE")
        .map((product: any) => ({
          value: product.id,
          label: product.name,
          previewImageUrl: product.mainImageUrl,
        }));

      setFormDataColeccion({
        title: collection.title,
        bannerText: JSON.stringify(bannerConfig),
        mainImage: {
          name: collection.title,
          type: "image/jpeg",
          size: mainImageSize,
          data: mainImageBase64,
        },
        previewImage: {
          name: collection.title,
          type: "image/jpeg",
          size: previewImageSize,
          data: previewImageBase64,
        },
      });

      setMainImageColeccion(mainImageBase64);
      setPreviewImageColeccion(previewImageBase64);
      setSelectedProducts(selectedProductsFromApi);
      setEditingCollectionId(collectionID);
      setIsEditing(true);
      setImageModified(false);
      setIsMainImageUploaded(true);
      setIsPreviewImageUploaded(true);

      // Desplazarse hacia el formulario de edición
      if (editFormRef.current) {
        editFormRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error editing collection:", error);
      toast.error("Error al cargar la colección");
    }
  };

  const handleCancelEdit = () => {
    setFormDataColeccion({
      bannerTitle: nombreTienda,
      bannerText: JSON.stringify({
        desktop: {
          showTitle: false,
          showBannerText: false,
          showButton: false,
          textAlignment: "center",
          bannerText: "",
          title: "",
          buttonText: "Ver más",
          buttonLink: "#",
        },
        mobile: {
          showTitle: false,
          showBannerText: false,
          showButton: false,
          textAlignment: "center",
          bannerText: "",
          title: "",
          buttonText: "Ver más",
          buttonLink: "#",
        },
      }),
      title: "",
      mainImage: {
        name: "",
        type: "",
        size: null,
        data: "",
      },
      previewImage: {
        name: "",
        type: "",
        size: null,
        data: "",
      },
    });

    setMainImageColeccion(null);
    setPreviewImageColeccion(null);
    setMobileImageColeccion(null);
    setSelectedProducts([]);
    setIsEditing(false);
    setEditingCollectionId(null);
    setImageModified(false);
    setIsMainImageUploaded(false);
    setIsPreviewImageUploaded(false);
    setIsMobileImageUploaded(false);
    // Cerrar todas las secciones
    setOpenSections({
      basicInfo: false,
      desktopConfig: false,
      mobileConfig: false,
    });
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
        initialQuality: 1,
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

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => {
      const newState = {
        ...prev,
        [sectionId]: !prev[sectionId],
      };

      if (newState[sectionId] && sectionRefs.current[sectionId]) {
        setTimeout(() => {
          sectionRefs.current[sectionId]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }

      return newState;
    });
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <img
                          src={collection.mainImageUrl}
                          alt=""
                          className="w-20"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {collection.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDateToChileanTime(collection.creationDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
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
                      </div>
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
            {/* Sección 1: Información Básica */}
            <div
              ref={(el) => (sectionRefs.current.basicInfo = el)}
              className="rounded-sm border w-full border-stroke bg-white shadow-default dark:border-black dark:bg-black mb-4"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="text-sm font-medium border-b p-4 bg-gray-50">
                <div className="flex gap-2">
                  <div>Información Básica</div>
                </div>
              </div>
              <div className="py-6 px-8">
                <div className="grid grid-cols-1 gap-6">
                  {/* Información Básica */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la Colección{" "}
                        <span className="text-primary">*</span>
                      </label>
                      <input
                        id="title"
                        name="title"
                        value={formDataColeccion.title}
                        onChange={handleChange}
                        placeholder="Ingresa nombre de la colección..."
                        className="shadow block w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Productos
                      </label>
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
                        className="shadow block w-full"
                        styles={{
                          control: (base) => ({
                            ...base,
                            borderRadius: "var(--radius)",
                          }),
                        }}
                        isClearable
                      />
                    </div>

                    {selectedProducts.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Productos Seleccionados
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProducts.map((product) => (
                            <div
                              key={product.value}
                              className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md"
                            >
                              <img
                                src={product.previewImageUrl}
                                alt={product.label}
                                className="w-8 h-8 object-cover rounded"
                              />
                              <span className="text-sm">{product.label}</span>
                              {selectedProducts.length > 1 && (
                                <button
                                  onClick={() => handleRemoveProduct(product)}
                                  className="text-red-500 hover:text-red-700"
                                  title="Eliminar"
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
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Configuración Desktop */}
            <div
              ref={(el) => (sectionRefs.current.desktopConfig = el)}
              className="rounded-sm border w-full border-stroke bg-white shadow-default dark:border-black dark:bg-black mb-4"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div
                className="text-sm flex gap-2 font-medium border-b p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection("desktopConfig")}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-2">
                    <div>Configuración Desktop</div>
                  </div>
                  {openSections.desktopConfig ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 15.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden  ${
                  openSections.desktopConfig ? "py-6 px-8" : "h-0 py-0 px-8"
                }`}
              >
                <div className="space-y-6">
                  {/* Vista Previa Desktop */}
                  <PreviewBanner
                    config={JSON.parse(formDataColeccion.bannerText)}
                    image={mainImageColeccion || ""}
                    isMobile={false}
                  />

                  {/* Grid de 2 columnas para Desktop */}
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
                    {/* Columna 1: Alineación Desktop */}
                    <div className="w-fit flex flex-col justify-center">
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Alineación del Texto
                      </label>
                      <div className="flex space-x-3">
                        {["left", "center", "right"].map((alignment) => (
                          <button
                            key={alignment}
                            type="button"
                            onClick={() => {
                              const config = JSON.parse(
                                formDataColeccion.bannerText
                              );
                              config.desktop.textAlignment = alignment;
                              setFormDataColeccion(
                                (prevData: typeof formDataColeccion) => ({
                                  ...prevData,
                                  bannerText: JSON.stringify(config),
                                })
                              );
                            }}
                            className={`p-4 rounded-lg ${
                              JSON.parse(formDataColeccion.bannerText).desktop
                                .textAlignment === alignment
                                ? "bg-primary text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {alignment === "left" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M4 12h10M4 18h12"
                                />
                              </svg>
                            ) : alignment === "center" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M6 12h12M8 18h8"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M10 12h10M8 18h12"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Columna 2: Imagen Desktop */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen Desktop <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        {isMainImageUploaded ? (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex flex-col space-y-4">
                              <ImagePreview
                                src={mainImageColeccion || ""}
                                alt="Vista previa desktop"
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <svg
                                    className="w-6 h-6 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span className="text-sm text-gray-600">
                                    Imagen Desktop cargada correctamente
                                  </span>
                                </div>
                                <button
                                  onClick={handleClearImage}
                                  className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                                >
                                  Cambiar Imagen
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="mainImage"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-8 h-8 text-gray-400"
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
                              <p className="mb-2 text-sm text-gray-500">
                                PNG, JPG o Webp (1920x200px)
                              </p>
                            </div>
                            <input
                              id="mainImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleImageChange}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Campos de texto con sus switches */}
                  <div className="space-y-4">
                    {/* Título */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Título
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.desktop.showTitle =
                              !config.desktop.showTitle;
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            JSON.parse(formDataColeccion.bannerText).desktop
                              .showTitle
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              JSON.parse(formDataColeccion.bannerText).desktop
                                .showTitle
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={
                          JSON.parse(formDataColeccion.bannerText).desktop.title
                        }
                        onChange={(e) => {
                          const config = JSON.parse(
                            formDataColeccion.bannerText
                          );
                          config.desktop.title = e.target.value;
                          // Activar el switch si se escribe algo
                          if (e.target.value && !config.desktop.showTitle) {
                            config.desktop.showTitle = true;
                          }
                          setFormDataColeccion({
                            ...formDataColeccion,
                            bannerText: JSON.stringify(config),
                          });
                        }}
                        placeholder="Título"
                        className="shadow block w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Texto */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Texto
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.desktop.showBannerText =
                              !config.desktop.showBannerText;
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            JSON.parse(formDataColeccion.bannerText).desktop
                              .showBannerText
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              JSON.parse(formDataColeccion.bannerText).desktop
                                .showBannerText
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <textarea
                        value={
                          JSON.parse(formDataColeccion.bannerText).desktop
                            .bannerText
                        }
                        onChange={(e) => {
                          const config = JSON.parse(
                            formDataColeccion.bannerText
                          );
                          config.desktop.bannerText = e.target.value;
                          // Activar el switch si se escribe algo
                          if (
                            e.target.value &&
                            !config.desktop.showBannerText
                          ) {
                            config.desktop.showBannerText = true;
                          }
                          setFormDataColeccion({
                            ...formDataColeccion,
                            bannerText: JSON.stringify(config),
                          });
                        }}
                        placeholder="Contenido del texto"
                        rows={2}
                        className="shadow block w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Botón */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Botón
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.desktop.showButton =
                              !config.desktop.showButton;
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            JSON.parse(formDataColeccion.bannerText).desktop
                              .showButton
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              JSON.parse(formDataColeccion.bannerText).desktop
                                .showButton
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={
                            JSON.parse(formDataColeccion.bannerText).desktop
                              .buttonText
                          }
                          onChange={(e) => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.desktop.buttonText = e.target.value;
                            // Activar el switch si se escribe algo
                            if (e.target.value && !config.desktop.showButton) {
                              config.desktop.showButton = true;
                            }
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          placeholder="Texto del botón"
                          className="shadow block w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={
                            JSON.parse(formDataColeccion.bannerText).desktop
                              .buttonLink
                          }
                          onChange={(e) => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.desktop.buttonLink = e.target.value;
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          placeholder="Enlace del botón"
                          className="shadow block w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    {/* Botón de acción Desktop */}
                    <div className="mt-6 flex justify-end space-x-4">
                      {isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleSubmit(e, "desktop")}
                            disabled={selectedProducts.length === 0}
                            className={`px-6 py-2 rounded-md transition-colors ${
                              selectedProducts.length === 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-primary hover:bg-secondary text-white"
                            }`}
                          >
                            Actualizar Desktop
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 3: Configuración Mobile */}
            <div
              ref={(el) => (sectionRefs.current.mobileConfig = el)}
              className="rounded-sm border w-full border-stroke bg-white shadow-default dark:border-black dark:bg-black"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div
                className="text-sm flex gap-2 font-medium border-b p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => toggleSection("mobileConfig")}
              >
                <div className="flex justify-between items-center w-full">
                  <div className="flex gap-2">
                    <div>Configuración Mobile</div>
                  </div>
                  {openSections.mobileConfig ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m4.5 15.75 7.5-7.5 7.5 7.5"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openSections.mobileConfig ? "py-6 px-8" : "h-0 py-0 px-8"
                }`}
              >
                <div className="space-y-6">
                  {/* Vista Previa Mobile */}
                  <PreviewBanner
                    config={JSON.parse(formDataColeccion.bannerText)}
                    image={mainPreviewColeccion || ""}
                    isMobile={true}
                  />

                  {/* Grid de 2 columnas para Mobile */}
                  <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-6">
                    {/* Columna 1: Alineación Mobile */}
                    <div className="w-fit flex flex-col justify-center">
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Alineación del Texto
                      </label>
                      <div className="flex space-x-3">
                        {["left", "center", "right"].map((alignment) => (
                          <button
                            key={alignment}
                            type="button"
                            onClick={() => {
                              const config = JSON.parse(
                                formDataColeccion.bannerText
                              );
                              config.mobile.textAlignment = alignment;
                              setFormDataColeccion(
                                (prevData: typeof formDataColeccion) => ({
                                  ...prevData,
                                  bannerText: JSON.stringify(config),
                                })
                              );
                            }}
                            className={`p-4 rounded-lg ${
                              JSON.parse(formDataColeccion.bannerText).mobile
                                .textAlignment === alignment
                                ? "bg-primary text-white"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                          >
                            {alignment === "left" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M4 12h10M4 18h12"
                                />
                              </svg>
                            ) : alignment === "center" ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M6 12h12M8 18h8"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 6h16M10 12h10M8 18h12"
                                />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Columna 2: Imagen Mobile */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Imagen Mobile <span className="text-primary">*</span>
                      </label>
                      <div className="relative">
                        {isPreviewImageUploaded ? (
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex flex-col space-y-4">
                              <ImagePreview
                                src={mainPreviewColeccion || ""}
                                alt="Vista previa mobile"
                              />
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <svg
                                    className="w-6 h-6 text-green-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  <span className="text-sm text-gray-600">
                                    Imagen Mobile cargada correctamente
                                  </span>
                                </div>
                                <button
                                  onClick={handleClearImageMobile}
                                  className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-secondary transition-colors"
                                >
                                  Cambiar Imagen
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <label
                            htmlFor="previewImage"
                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                          >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                              <svg
                                className="w-8 h-8 text-gray-400"
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
                              <p className="mb-2 text-sm text-gray-500">
                                PNG, JPG o Webp (1080x300px)
                              </p>
                            </div>
                            <input
                              id="previewImage"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handlePreviewImageChange}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Campos de texto con sus switches */}
                  <div className="space-y-4">
                    {/* Título */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Título
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.mobile.showTitle = !config.mobile.showTitle;
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            JSON.parse(formDataColeccion.bannerText).mobile
                              .showTitle
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              JSON.parse(formDataColeccion.bannerText).mobile
                                .showTitle
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={
                          JSON.parse(formDataColeccion.bannerText).mobile.title
                        }
                        onChange={(e) => {
                          const config = JSON.parse(
                            formDataColeccion.bannerText
                          );
                          config.mobile.title = e.target.value;
                          // Activar el switch si se escribe algo
                          if (e.target.value && !config.mobile.showTitle) {
                            config.mobile.showTitle = true;
                          }
                          setFormDataColeccion({
                            ...formDataColeccion,
                            bannerText: JSON.stringify(config),
                          });
                        }}
                        placeholder="Título"
                        className="shadow block w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Texto */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Texto
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.mobile.showBannerText =
                              !config.mobile.showBannerText;
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            JSON.parse(formDataColeccion.bannerText).mobile
                              .showBannerText
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              JSON.parse(formDataColeccion.bannerText).mobile
                                .showBannerText
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <textarea
                        value={
                          JSON.parse(formDataColeccion.bannerText).mobile
                            .bannerText
                        }
                        onChange={(e) => {
                          const config = JSON.parse(
                            formDataColeccion.bannerText
                          );
                          config.mobile.bannerText = e.target.value;
                          // Activar el switch si se escribe algo
                          if (e.target.value && !config.mobile.showBannerText) {
                            config.mobile.showBannerText = true;
                          }
                          setFormDataColeccion({
                            ...formDataColeccion,
                            bannerText: JSON.stringify(config),
                          });
                        }}
                        placeholder="Contenido del texto"
                        rows={2}
                        className="shadow block w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>

                    {/* Botón */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">
                          Botón
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.mobile.showButton =
                              !config.mobile.showButton;
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            JSON.parse(formDataColeccion.bannerText).mobile
                              .showButton
                              ? "bg-primary"
                              : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              JSON.parse(formDataColeccion.bannerText).mobile
                                .showButton
                                ? "translate-x-6"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={
                            JSON.parse(formDataColeccion.bannerText).mobile
                              .buttonText
                          }
                          onChange={(e) => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.mobile.buttonText = e.target.value;
                            // Activar el switch si se escribe algo
                            if (e.target.value && !config.mobile.showButton) {
                              config.mobile.showButton = true;
                            }
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          placeholder="Texto del botón"
                          className="shadow block w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                        <input
                          type="text"
                          value={
                            JSON.parse(formDataColeccion.bannerText).mobile
                              .buttonLink
                          }
                          onChange={(e) => {
                            const config = JSON.parse(
                              formDataColeccion.bannerText
                            );
                            config.mobile.buttonLink = e.target.value;
                            setFormDataColeccion({
                              ...formDataColeccion,
                              bannerText: JSON.stringify(config),
                            });
                          }}
                          placeholder="Enlace del botón"
                          className="shadow block w-full px-4 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>

                    {/* Botón de acción Mobile */}
                    <div className="mt-6 flex justify-end space-x-4">
                      {isEditing && (
                        <>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleSubmit(e, "mobile")}
                            disabled={selectedProducts.length === 0}
                            className={`px-6 py-2 rounded-md transition-colors ${
                              selectedProducts.length === 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-primary hover:bg-secondary text-white"
                            }`}
                          >
                            Actualizar Mobile
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eliminar el botón de acción principal */}
            {!isEditing && (
              <div className="mt-4 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    const missingFields = [];

                    if (!formDataColeccion.title.trim()) {
                      missingFields.push("nombre de la colección");
                    }
                    if (selectedProducts.length === 0) {
                      missingFields.push("al menos un producto");
                    }
                    if (
                      !isMainImageUploaded ||
                      !formDataColeccion.mainImage?.data
                    ) {
                      missingFields.push("imagen desktop");
                    }
                    if (
                      !isPreviewImageUploaded ||
                      !formDataColeccion.previewImage?.data
                    ) {
                      missingFields.push("imagen mobile");
                    }

                    if (missingFields.length > 0) {
                      toast.error(
                        `Por favor, complete los siguientes campos obligatorios: ${missingFields.join(
                          ", "
                        )}`
                      );
                      return;
                    }

                    handleSubmit(e);
                  }}
                  className="px-6 py-2 rounded-md transition-colors bg-primary hover:bg-secondary text-white"
                >
                  Crear Colección
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Modal para recorte de imagen Desktop */}
      <Modal
        showModal={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Recortar imagen desktop"
      >
        <div className="relative h-[60vh] w-full">
          <Cropper
            image={mainImageColeccion || ""}
            crop={crop}
            zoom={zoom}
            aspect={1900 / 400}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setIsModalOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
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

      {/* Modal para recorte de imagen Mobile */}
      <Modal
        showModal={isPreviewImageModalOpen}
        onClose={() => setIsPreviewImageModalOpen(false)}
        title="Recortar imagen mobile"
      >
        <div className="relative h-[60vh] w-full">
          <Cropper
            image={mainPreviewColeccion || ""}
            crop={crop}
            zoom={zoom}
            aspect={1080 / 400}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={() => setIsPreviewImageModalOpen(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handlePreviewCrop}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
          >
            Recortar y Guardar
          </button>
        </div>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <Modal
        showModal={isDeleteModalVisible}
        onClose={hideDeleteModal}
        title="Confirmar eliminación"
      >
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            ¿Estás seguro de que deseas eliminar esta colección?
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Esta acción no se puede deshacer.
          </p>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              onClick={hideDeleteModal}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDeleteCollection}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

export default Colecciones;
