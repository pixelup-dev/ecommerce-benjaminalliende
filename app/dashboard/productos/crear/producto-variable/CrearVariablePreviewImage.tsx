/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import { useAPI } from "@/app/Context/ProductTypeContext";
import Select from "react-select";
import GalleryUpload from "@/components/Core/Products/ImgUpload/GalleryUploadV2";
import { getCookie } from "cookies-next";
import axios from "axios";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import VariablesPage from "./VariablesSection";
import ImageUploader from "../producto-simple/ImageUploader";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import TabCategory from "@/components/Core/Products/Category/TabCategory";
import CreateAtribute from "@/components/Core/Products/CreateAtribute";
import toast from "react-hot-toast";
import StarCheckbox from "@/components/Core/Checkbox/StarCheckbox";
import Loader from "@/components/common/Loader";
import LoaderProgress from "@/components/common/LoaderProgress";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";
import Link from "next/link";
import { defaultPreviewImage } from "@/app/config/IMGdefault";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import styles
import { useRevalidation } from "@/app/Context/RevalidationContext";
import { slugify } from "@/app/utils/slugify";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface ImageData {
  name: string;
  type: string;
  size: number;
  data: string;
}

const CrearVariable: React.FC = () => {
  const [isFeatured, setIsFeatured] = useState(false);
  const [skuImages, setSkuImages] = useState<any[]>([]);
  const { triggerRevalidation } = useRevalidation();
  /* PARA SUBBIR AL TOP PAGE */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  /* PARA SUBBIR AL TOP PAGE */
  const fetchImages = async (productId: any, skuId: any) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.code === 0) {
        // Extracción del stock de la primera skuInventory, si existe
        setSkuImages(data.skuImages);
      } else {
        console.error(
          "Error al obtener el stock de la variación:",
          data.message
        );
        return null; // En caso de error, devuelve null
      }
    } catch (error) {
      console.error("Error al obtener el stock de la variación:", error);
      return null; // En caso de error, devuelve null
    }
  };
  const handleCheckboxChange = () => {
    setIsFeatured(!isFeatured);
    setFormData((prevFormData) => ({
      ...prevFormData,
      isFeatured: !prevFormData.isFeatured,
    }));
  };
  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!mainImage) return;

    try {
      const croppedImage = await getCroppedImg(mainImage, croppedAreaPixels);
      if (!croppedImage) {
        console.error("Error al recortar la imagen: croppedImage es nulo");
        return;
      }

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        initialQuality: 1,
      };

      const file = new File([croppedImage], originalFileName, {
        type: croppedImage.type,
        lastModified: Date.now(),
      });

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result as string;
        setMainImage(base64data);
        const imageInfo = {
          name: originalFileName,
          type: compressedFile.type,
          size: compressedFile.size,
          data: base64data,
        };

        setFormData((prevFormData) => ({
          ...prevFormData,
          mainImage: imageInfo,
        }));

        setIsMainImageUploaded(true);
        setIsModalOpen(false);
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error al recortar o comprimir la imagen:", error);
      toast.error("Error al procesar la imagen");
    }
  };

  const fetchProducTypes = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const PageNumber = 1;
      const PageSize = 100;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types?pageNumber=${PageNumber}&pageSize=${PageSize}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(productTypeResponse.data.productTypes, "tiposde ");

      setProductType(productTypeResponse.data.productTypes);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    }
  };
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [initialMainImage, setInitialMainImage] = useState(null);
  const [initialPreviewImage, setInitialPreviewImage] = useState(null);
  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [isPreviewImageUploaded, setIsPreviewImageUploaded] = useState(false);
  const [showBaseProductInfo, setShowBaseProductInfo] = useState(true);

  const [isEditMode, setIsEditMode] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [skuIdBase, setSkuIdBase] = useState(null);
  const { productType, setProductType } = useAPI();
  const [selectedProductTypes, setSelectedProductTypes] = useState([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const [hasFeaturedBaseSku, setHasFeaturedBaseSku] = useState(false);
  const [variations, setVariations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    productTypes: [],
    name: "",
    description: "",
    statusCode: "ACTIVE",
    enabledForDelivery: false,
    enabledForWithdrawal: false,
    hasVariations: true,
    hasFeaturedBaseSku: false,
    isFeatured: false,
    measures: {
      length: 0,
      width: 0,
      height: 0,
      weight: 0,
    },
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
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [thumbnails, setThumbnails] = useState([]);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [showForm, setShowForm] = useState(true);
  const [measures, setMeasures] = useState<Measures>({
    length: 1,
    width: 1,
    height: 1,
    weight: 1,
  });
  const productTypeOptions = productType.map(
    (producto: { id: string; name: string }) => ({
      value: producto.id,
      label: producto.name,
    })
  );

  interface Measures {
    length: number | null;
    width: number | null;
    height: number | null;
    weight: number | null;
  }
  const [openModalId, setOpenModalId] = useState(null);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const maxDescriptionLength = 1000;
  const validateForm = () => {
    let valid = true;

    if (!formData.name) {
      toast.error("El nombre del producto es requerido");
      valid = false;
    }
    if (nameError) {
      toast.error("No se puede publicar el producto con un nombre que ya existe");
      valid = false;
    }
    if (!formData.description) {
      toast.error("La descripción del producto es requerida");
      valid = false;
    }

    if (formData.productTypes.length === 0) {
      toast.error("La categoría es requerida");
      valid = false;
    }
    if (!formData.enabledForDelivery && !formData.enabledForWithdrawal) {
      toast.error("Debe seleccionar al menos una opción: Delivery o Retiro");
      valid = false;
    }
    if (!formData.mainImage.data) {
      toast.error("La imagen principal es requerida");
      valid = false;
    }
    if (!formData.previewImage.data) {
      toast.error("La imagen de vista previa es requerida");
      valid = false;
    }
    return valid;
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const token = getCookie("AdminTokenAuth");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const productData = response.data.product;
        console.log(productData, "productData");
        const selectedProductTypes = productData.productTypes.map(
          (productType: any) => ({
            value: productType.id,
            label: productType.name,
          })
        );

        setSelectedProductTypes(selectedProductTypes);

        setFormData({
          ...formData,
          name: productData.name,
          description: productData.description,
          enabledForDelivery: productData.enabledForDelivery,
          enabledForWithdrawal: productData.enabledForWithdrawal,
          hasVariations: true,
          productTypes: selectedProductTypes,
          isFeatured: productData.isFeatured,
          previewImage: {
            ...formData.previewImage,
            data: productData.previewImageUrl,
          },
          mainImage: {
            ...formData.mainImage,
            data: productData.mainImageUrl,
          },
          measures: productData.measures || {
            length: null,
            width: null,
            height: null,
            weight: null,
          },
        });
        setMeasures({
          length: productData.measures ? productData.measures.length : null,
          width: productData.measures ? productData.measures.width : null,
          height: productData.measures ? productData.measures.height : null,
          weight: productData.measures ? productData.measures.weight : null,
        });

        setMainImage(productData.mainImageUrl);
        setPreviewImage(productData.previewImageUrl);
        setInitialMainImage(productData.mainImageUrl);
        setInitialPreviewImage(productData.previewImageUrl);
        setIsFeatured(productData.isFeatured);

        // Cargar imágenes de la galería inmediatamente
        if (productData.skuId) {
          await fetchImages(productId, productData.skuId);
        }
      } catch (error) {
        console.error("Error al obtener los datos del producto:", error);
        setIsEditMode(false);
        const newURL = window.location.pathname;
        router.replace(newURL);
      }
    };

    if (isEditMode && productId) {
      fetchProductData();
    }
  }, [productId]);

  const fetchData = async () => {
    try {
      const token = getCookie("AdminTokenAuth");

      const PageNumber = 1;
      const PageSize = 100;

      const productTypeResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/product-types?pageNumber=${PageNumber}&pageSize=${PageSize}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setProductType(productTypeResponse.data.productTypes);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    }
  };

  type FormDataKeys = keyof typeof formData;

  const handleImageChange = (
    e: ChangeEvent<HTMLInputElement>,
    setImage: React.Dispatch<React.SetStateAction<string | null>>,
    imageKey: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImage(result);
        
        if (imageKey === "mainImage") {
          setIsModalOpen(true);
        } else if (imageKey === "previewImage") {
          setIsPreviewModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null);
  };

  const [pendingImageChanges, setPendingImageChanges] = useState<{
    pendingImages: any[];
    pendingDeletions: string[];
    currentImages: any[];
  }>({
    pendingImages: [],
    pendingDeletions: [],
    currentImages: [],
  });

  const handleImageGalleryChange = (changes: {
    pendingImages: any[];
    pendingDeletions: string[];
    currentImages: any[];
  }) => {
    setPendingImageChanges(changes);
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
  };

  const handleInputMeasuresChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;
    setMeasures((prevMeasures) => ({
      ...prevMeasures,
      [name]: parseFloat(value) || null,
    }));
  };
  const handleDescriptionChange = (value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      description: value,
    }));
    setDescriptionLength(value.length);
  };

  const handleCancel = () => {
    handleClearImage(setMainImage);
    setVariations([]);
    setShowBaseProductInfo(true);
    handleClearImage(setPreviewImage);
    setProductId(null);
    setThumbnails([]);
    setSelectedImages([]);
    setIsFeatured(false);
    setIsEditMode(false);
    setFormData({
      productTypes: [],
      name: "",
      description: "",
      statusCode: "ACTIVE",
      enabledForDelivery: false,
      enabledForWithdrawal: false,
      hasVariations: true,
      hasFeaturedBaseSku: false,
      isFeatured: false,
      measures: {
        length: 1,
        width: 1,
        height: 1,
        weight: 1,
      },
      previewImage: defaultPreviewImage,
      mainImage: {
        name: "",
        type: "",
        size: 0,
        data: "",
      },
    });
    router.replace("/dashboard/productos/crear/producto-variable");
  };
  const handleExitEditMode = () => {
    // Limpieza de todos los estados relacionados con la edición
    setIsEditMode(false);
    setFormData({
      productTypes: [],
      name: "",
      description: "",
      statusCode: "ACTIVE",
      enabledForDelivery: false,
      enabledForWithdrawal: false,
      hasVariations: true,
      hasFeaturedBaseSku: false,
      isFeatured: false,
      measures: {
        length: 1,
        width: 1,
        height: 1,
        weight: 1,
      },
      previewImage: defaultPreviewImage,
      mainImage: {
        name: "",
        type: "",
        size: 0,
        data: "",
      },
    });
    setMainImage(null);
    setPreviewImage(null);
    setVariations([]);
    setSkuImages([]);
    setSelectedProductTypes([]);
    setProductId(null);
    setSkuIdBase(null);
    setShowBaseProductInfo(true);
    setIsFeatured(false);

    // Navegar a la página de creación de productos variables sin recargar

    // Si aún necesitas forzar una recarga completa (aunque no es lo ideal)
    const basePath = "/dashboard/productos/crear/producto-variable";
    router.replace(basePath);
    window.location.reload();
  };

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const token = getCookie("AdminTokenAuth");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const responseData = await response.json();
        if (responseData.code === 0) {
          setSkuIdBase(responseData.product.skuId);
        } else {
          console.error(
            "Error fetching product details:",
            responseData.message
          );
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      }
    };

    fetchProductDetails();
  }, [productId]);

  const uploadImage = async (
    name: string,
    type: string,
    size: number,
    data: string,
    productId: string,
    skuId: string
  ) => {
    const token = getCookie("AdminTokenAuth");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          mainImage: {
            name,
            type,
            size,
            data,
          },
          previewImage: {
            name,
            type,
            size,
            data,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }
    return response.json();
  };
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    if (!isEditMode && !validateForm()) {
      toast.error("Por favor, corrige los errores antes de enviar");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const token = getCookie("AdminTokenAuth");

      const dataToSubmit = {
        ...formData,
        productTypes: selectedProductTypes.map((type: any) => ({
          id: type.value,
          name: type.label,
        })),
        isFeatured: isFeatured,
        measures: formData.enabledForDelivery ? measures : undefined,
        mainImage: isMainImageUploaded ? formData.mainImage : undefined,
        previewImage: isPreviewImageUploaded
          ? formData.previewImage
          : undefined,
      };
      dataToSubmit.hasFeaturedBaseSku = false;

      if (!formData.enabledForDelivery) {
        delete dataToSubmit.measures;
      }

      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        : `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }

      const responseData = await response.json();

      if (!isEditMode) {
        if (!responseData || !responseData.product) {
          throw new Error(
            "La respuesta no contiene el objeto 'product' esperado"
          );
        }

        const { product } = responseData;
        const { id } = product;

        // Procesar las imágenes pendientes después de crear el producto
        if (pendingImageChanges.pendingImages.length > 0) {
          await Promise.all(
            pendingImageChanges.pendingImages.map((newImage) =>
              fetch(
                `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${product.skuId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ 
                    mainImage: newImage,
                    previewImage: newImage 
                  }),
                }
              )
            )
          );
        }

        await triggerRevalidation();
        setShowBaseProductInfo(false);
        toast.success("Producto base creado correctamente");
        setProductId(id);
        setIsEditMode(true);
        window.location.href = `${window.location.pathname}?productVariableId=${id}`;
      } else {
        // Procesar las imágenes en modo edición
        if (pendingImageChanges.pendingDeletions.length > 0) {
          await Promise.all(
            pendingImageChanges.pendingDeletions.map((imageId) =>
              fetch(
                `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuIdBase}/images/${imageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
                {
                  method: "DELETE",
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
            )
          );
        }

        if (pendingImageChanges.pendingImages.length > 0) {
          await Promise.all(
            pendingImageChanges.pendingImages.map((newImage) =>
              fetch(
                `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuIdBase}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ 
                    mainImage: newImage,
                    previewImage: newImage 
                  }),
                }
              )
            )
          );
        }

        await triggerRevalidation();
        toast.success("Producto base actualizado correctamente");
      }

      // Limpiar los cambios pendientes después de procesar
      setPendingImageChanges({
        pendingImages: [],
        pendingDeletions: [],
        currentImages: [],
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const id = searchParams.get("productVariableId");
    if (id) {
      setProductId(id);
      console.log(`El ID del producto es: ${id}`);
      setIsEditMode(true);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Si estamos en modo edición y hay un ID en la URL, ocultamos el formulario base
    const id = searchParams.get("productVariableId");
    if (id) {
      setShowBaseProductInfo(false);
    } else {
      // Si no estamos en modo edición, mostramos el formulario base
      setShowBaseProductInfo(true);
    }
  }, [searchParams]);

  const customStyles = {
    control: (base: any) => ({
      ...base,
      height: 45,
      minHeight: 45,
    }),
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.keyCode === 27) {
        setOpenModalId(null);
      }
    };

    if (openModalId) {
      document.addEventListener("keydown", handleEscape);
    } else {
      document.removeEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openModalId]);
  function handleOpenModal(modalId: any) {
    setOpenModalId(modalId);
  }
  const handleCloseModal = () => {
    setOpenModalId(null);
  };

  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);

  const checkProductNameExists = async (name: string) => {
    if (!name || isEditMode) return;
    
    try {
      setIsCheckingName(true);
      setNameError(null);
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products?pageNumber=1&pageSize=100&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (data.code === 0) {
        const existingProduct = data.products.find(
          (product: any) => product.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingProduct) {
          setNameError("Ya existe un producto con este nombre");
        }
      }
    } catch (error) {
      console.error("Error al verificar el nombre del producto:", error);
      setNameError("Error al verificar el nombre del producto");
    } finally {
      setIsCheckingName(false);
    }
  };

  if (isLoading) {
    return <LoaderProgress />;
  }

  return (
    <div>
      <div className="w-full mx-auto sticky backdrop-blur-md flex justify-center top-0 py-2 z-50 -mt-6">
        <div className="flex w-full justify-between px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-5 gap-1 md:gap-4 w-full">
            <div className="w-full px-4 py-1 h-full border-dark border rounded text-dark flex items-center gap-2">
              <span className="text-[13px]">Estado: </span>
              <span className="text-rosa font-medium text-[13px]">
                {variations.length > 0 ? "Publicado" : "Borrador"}
              </span>
            </div>

            <button
              onClick={() =>
                (window.location.href =
                  "/dashboard/productos/crear/producto-variable")
              }
              className="relative w-full inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-dark group"
            >
              <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-primary group-hover:h-full" />
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </span>
              <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </span>
              <span className="relative w-full font-medium text-left transition-colors duration-200 ease-in-out group-hover:text-white text-[13px]">
                Nuevo
              </span>
            </button>

            <button
              onClick={() => handleOpenModal("createCategoriesModal")}
              className="relative w-full inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-dark group"
            >
              <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-primary group-hover:h-full" />
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
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
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </span>
              <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="white"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </span>
              <span className="relative w-full font-medium text-left transition-colors duration-200 ease-in-out group-hover:text-white text-[13px]">
                Categorías
              </span>
            </button>

            <button
              onClick={() => handleOpenModal("createAttributeModal")}
              className="relative w-full inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-dark group"
            >
              <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-primary group-hover:h-full" />
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
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
                    d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6h.008v.008H6V6Z"
                  />
                </svg>
              </span>
              <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="white"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6h.008v.008H6V6Z"
                  />
                </svg>
              </span>
              <span className="relative w-full font-medium text-left transition-colors duration-200 ease-in-out group-hover:text-white text-[13px]">
                Atributos
              </span>
            </button>

            <button
              onClick={handleCancel}
              className="relative w-full inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-red-700 group"
            >
              <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-red-600 group-hover:h-full" />
              <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
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
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </span>
              <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="white"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </span>
              <span className="relative w-full font-medium text-left transition-colors duration-200 ease-in-out group-hover:text-white text-[13px]">
                Cancelar
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto bg-white rounded-md mt-4 p-6">
        <div className="bg-white  mx-auto">
          {/* Columna principal */}
          {showBaseProductInfo === false && variations.length === 0 && (
            <div
              style={{ borderRadius: "var(--radius)" }}
              className="shadow w-full flex items-center p-4 mb-4 text-sm text-yellow-800 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 border-yellow-400 border "
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
                Tu producto base ya ha sido creado, pero no se mostrará en tu
                sitio hasta que no agregues una o más variaciones.
              </div>
            </div>
          )}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col pb-8 ">
            {isEditMode ? (
              <button
                className="bg-dark text-white px-4 py-2 mt-4"
                onClick={() => setShowBaseProductInfo(!showBaseProductInfo)}
              >
                {showBaseProductInfo ? "Minimizar" : "Expandir"} Información del
                Producto Base
              </button>
            ) : null}
            {showBaseProductInfo && (
              <div>
                {variations.length === 0 && (
                  <div
                    style={{ borderRadius: "var(--radius)" }}
                    className="shadow w-full flex items-center p-4 my-4  text-sm text-blue-800 border border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
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
                    <div className="text-[12px]">
                      Para crear un producto variable, primero debes crear un
                      producto base. Al crear el producto base se activará una
                      nueva sección en el menú que te permitirá crear las
                      diferentes variaciones.
                    </div>
                  </div>
                )}

                <div
                  style={{ borderRadius: "var(--radius)" }}
                  className="shadow  flex items-center p-4 my-2  text-sm text-blue-800 border border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
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
                  <div className="text-[12px]">
                    La información que cargues en el Título, Descripción y
                    Fotografía Principal, será la que aparecerá en una búsqueda
                    orgánica (SEO).
                  </div>
                </div>
                <div className="grid grid-cols-1 pt-2">
                  <div>
                    <label
                      htmlFor="nombreProducto"
                      className="font-normal text-primary"
                    >
                      Nombre Producto Base
                    </label>
                    <input
                      className={`shadow py-3 block p-2 mt-2 w-full text-sm text-dark bg-white rounded-md border ${
                        nameError ? 'border-red-500' : 'border-dark/30'
                      } focus:ring-primary focus:border-primary`}
                      type="text"
                      name="nombreProducto"
                      id="nombreProducto"
                      value={formData.name}
                      onChange={(event) => {
                        setFormData({ ...formData, name: event.target.value });
                        setNameError(null);
                      }}
                      onBlur={(event) => checkProductNameExists(event.target.value)}
                      disabled={isCheckingName}
                    />
                    {isCheckingName && (
                      <div className="text-sm text-gray-500 mt-1">
                        Verificando nombre del producto...
                      </div>
                    )}
                    {nameError && (
                      <div className="text-sm text-red-500 mt-1">
                        {nameError}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8">
                  <label
                    htmlFor="descripcion"
                    className="font-normal text-primary"
                  >
                    Descripción Producto Base
                  </label>
                  <ReactQuill
                    value={formData.description}
                    onChange={handleDescriptionChange}
                    modules={{
                      toolbar: [
                        [{ header: "1" }, { header: "2" }, { font: [] }],
                        [{ list: "ordered" }, { list: "bullet" }],
                        ["bold", "italic", "underline", "strike"],
                        ["link"],
                      ],
                    }}
                    formats={[
                      "header",
                      "font",
                      "list",
                      "bullet",
                      "bold",
                      "italic",
                      "underline",
                      "strike",
                      "link",
                    ]}
                  />
                  <div className="flex justify-end items-center mt-2">
                    <div className="text-left text-sm text-gray-500">
                      {descriptionLength}/{maxDescriptionLength} caracteres
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <label className="font-normal text-primary">
                    Tipo de entrega
                  </label>
                  <div className="mt-5 w-full flex flex-col sm:flex-row gap-2 mb-4">
                    <div className="relative w-full">
                      <input
                        className="peer hidden"
                        id="checkbox_delivery"
                        type="checkbox"
                        name="enabledForDelivery"
                        checked={formData.enabledForDelivery}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            [event.target.name]: event.target.checked,
                          })
                        }
                      />
                      <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                      <label
                        className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded border border-gray-300 p-3 sm:p-4"
                        htmlFor="checkbox_delivery"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                          />
                        </svg>
                        <div className="ml-3 sm:ml-5">
                          <span className="text-sm sm:text-base font-normal">
                            Delivery
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="relative w-full">
                      <input
                        className="peer hidden"
                        id="checkbox_withdrawal"
                        type="checkbox"
                        name="enabledForWithdrawal"
                        checked={formData.enabledForWithdrawal}
                        onChange={(event) =>
                          setFormData({
                            ...formData,
                            [event.target.name]: event.target.checked,
                          })
                        }
                      />
                      <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                      <label
                        className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded border border-gray-300 p-3 sm:p-4"
                        htmlFor="checkbox_withdrawal"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 sm:w-6 sm:h-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                          />
                        </svg>
                        <div className="ml-3 sm:ml-5">
                          <span className="text-sm sm:text-base font-normal">
                            Retiro en Tienda
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex w-full">
                  <div className="self-center mx-6">
                    <StarCheckbox
                      isChecked={isFeatured}
                      onChange={handleCheckboxChange}
                    />
                  </div>
                  <div
                    style={{ borderRadius: "var(--radius)" }}
                    className="shadow w-full flex items-center p-4 my-2  text-sm text-blue-800 border border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
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
                      Pincha la estrella para agregar al carrusel de Destacados
                      de tu Home.
                    </div>
                  </div>
                </div>
                <div className="mt-8">
                  <div>
                    <label className="font-normal text-primary">
                      Categoría de Producto Base
                    </label>

                    <Select
                      options={productTypeOptions}
                      isMulti
                      value={formData.productTypes}
                      onChange={(selectedOptions: any) => {
                        setFormData({
                          ...formData,
                          productTypes: selectedOptions,
                        });
                        setSelectedProductTypes(selectedOptions);
                      }}
                      className="mt-2"
                      styles={customStyles}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 mt-8 gap-4">
                  <div className="col-span-4 md:col-span-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="mainImage"
                      className="hidden"
                      onChange={(e) =>
                        handleImageChange(e, setMainImage, "mainImage")
                      }
                    />
                    {mainImage ? (
                      <div>
                        <label className="font-normal">Imagen Principal</label>
                        <div
                          className="shadow relative mt-2 h-[150px] object-contain overflow-hidden bg-center bg-no-repeat bg-cover"
                          style={{
                            borderRadius: "var(--radius)",
                            backgroundImage: `url(${mainImage})`,
                          }}
                        >
                          <button
                            className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 m-1 text-[13px]"
                            onClick={() => {
                              handleClearImage(setMainImage);
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                mainImage: {
                                  name: "",
                                  type: "",
                                  size: 0,
                                  data: "",
                                },
                              }));
                              setIsMainImageUploaded(false);
                            }}
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
                      </div>
                    ) : (
                      <div>
                        <label className="font-normal">Imagen Principal</label>
                        <label
                          htmlFor="mainImage"
                          className="shadow flex mt-2 h-[150px] flex-col bg-white justify-center items-center border border-dashed border-gray-600 cursor-pointer w-full z-10"
                          style={{ borderRadius: "var(--radius)" }}
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
                                Subir Imagen
                              </span>
                            </p>
                            <p className="text-[13px] text-gray-500 dark:text-gray-400 px-2">
                              PNG, JPG o Webp
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-1">
                    <input
                      type="file"
                      accept="image/*"
                      id="previewImage"
                      className="hidden"
                      onChange={(e) =>
                        handleImageChange(e, setPreviewImage, "previewImage")
                      }
                    />
                    {previewImage ? (
                      <div>
                        <label className="font-normal">Imagen Preview</label>
                        <div
                          className="shadow relative mt-2 h-[150px] object-contain overflow-hidden bg-center bg-no-repeat bg-cover"
                          style={{
                            borderRadius: "var(--radius)",
                            backgroundImage: `url(${previewImage})`,
                          }}
                        >
                          <button
                            className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 m-1 text-[13px]"
                            onClick={() => {
                              handleClearImage(setPreviewImage);
                              setFormData((prevFormData) => ({
                                ...prevFormData,
                                previewImage: {
                                  name: "",
                                  type: "",
                                  size: 0,
                                  data: "",
                                },
                              }));
                              setIsPreviewImageUploaded(false);
                            }}
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
                      </div>
                    ) : (
                      <div>
                        <label className="font-normal">Imagen Preview</label>
                        <label
                          htmlFor="previewImage"
                          className="shadow flex mt-2 h-[150px] flex-col bg-white justify-center items-center border border-dashed border-gray-600 cursor-pointer w-full z-10"
                          style={{ borderRadius: "var(--radius)" }}
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
                                Subir Imagen
                              </span>
                            </p>
                            <p className="text-[13px] text-gray-500 dark:text-gray-400 px-2">
                              PNG, JPG o Webp
                            </p>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="font-normal">Galería de imágenes</label>
                    <div className="h-[150px] mt-2">
                      <ImageUploader
                        productId={productId}
                        skuId={skuIdBase}
                        skuImages={skuImages}
                        fetchImages={fetchImages}
                        onImagesChange={handleImageGalleryChange}
                      />
                    </div>
                  </div>
                </div>
                <button
                  className="shadow bg-primary text-secondary hover:bg-secondary hover:text-primary px-4 py-2 mt-4"
                  style={{ borderRadius: "var(--radius)" }}
                  onClick={handleSubmit}
                >
                  {isEditMode ? "Guardar Cambios" : "Crear Producto Base"}
                </button>
                {isEditMode ? (
                  <Link
                    /* onClick={handleCancel} */
                    href="/dashboard/productos"
                    className="bg-red-700 text-white px-4 py-2 rounded mt-4 ml-4"
                  >
                    Cancelar
                  </Link>
                ) : null}
              </div>
            )}
            <VariablesPage
              isEditMode={isEditMode}
              setIsEditMode={setIsEditMode}
              productId={productId}
              skuId={skuIdBase}
              skuImages={skuImages}
              fetchImages={fetchImages}
              selectedImages={selectedImages}
              handleImageGalleryChange={handleImageGalleryChange}
              handleImageRemove={handleImageRemove}
              variations={variations}
              setVariations={setVariations}
              baseProductDescription={formData.description}
            />
          </div>
          {/* FIN COL PRINCIPAL */}
        </div>

        {/* MODALS */}

        <div
          id="createCategoriesModal"
          tabIndex={-1}
          className={`overflow-y-auto overflow-x-hidden pt-0 fixed top-0 right-0 backdrop-blur-sm bg-[#00000080] left-0 z-50 w-full h-[calc(100%)] ${
            openModalId === "createCategoriesModal" ? "" : "hidden"
          }`}
        >
          <TabCategory
            handleCloseModal={handleCloseModal}
            fetchData={fetchProducTypes}
          />
        </div>

        <div
          id="createAttributeModal"
          tabIndex={-1}
          className={`overflow-y-auto overflow-x-hidden pt-0 fixed top-0 right-0 backdrop-blur-sm bg-[#00000080] left-0 z-50 w-full h-[calc(100%)] ${
            openModalId === "createAttributeModal" ? "" : "hidden"
          }`}
        >
          <CreateAtribute
            handleCloseModal={handleCloseModal}
            fetchData={fetchProducTypes}
          />
        </div>
        {/* MODALS */}
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Recortar Imagen
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="relative h-96 w-full">
                <Cropper
                  image={mainImage || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 4}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom
                  </label>
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={handleCrop}
                    className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recortar y Subir
                  </button>
                  <button
                    onClick={() => {
                      setMainImage(null);
                      setIsMainImageUploaded(false);
                      setIsModalOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999]">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
          <div className="relative w-[95%] md:w-[80%] max-w-3xl bg-white rounded-lg shadow-xl overflow-hidden">
            <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Recortar Imagen de Vista Previa
                </h2>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="relative h-96 w-full">
                <Cropper
                  image={previewImage || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={4 / 4}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zoom
                  </label>
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
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={async () => {
                      if (!previewImage) return;
                      try {
                        const croppedImage = await getCroppedImg(previewImage, croppedAreaPixels);
                        if (!croppedImage) {
                          console.error("Error al recortar la imagen: croppedImage es nulo");
                          return;
                        }

                        const options = {
                          maxSizeMB: 1,
                          maxWidthOrHeight: 1600,
                          useWebWorker: true,
                          initialQuality: 1,
                        };

                        const file = new File([croppedImage], originalFileName, {
                          type: croppedImage.type,
                          lastModified: Date.now(),
                        });

                        const compressedFile = await imageCompression(file, options);
                        const reader = new FileReader();

                        reader.onloadend = () => {
                          const base64data = reader.result as string;
                          setPreviewImage(base64data);
                          const imageInfo = {
                            name: originalFileName,
                            type: compressedFile.type,
                            size: compressedFile.size,
                            data: base64data,
                          };

                          setFormData((prevFormData) => ({
                            ...prevFormData,
                            previewImage: imageInfo,
                          }));

                          setIsPreviewImageUploaded(true);
                          setIsPreviewModalOpen(false);
                        };

                        reader.readAsDataURL(compressedFile);
                      } catch (error) {
                        console.error("Error al recortar o comprimir la imagen:", error);
                        toast.error("Error al procesar la imagen");
                      }
                    }}
                    className="bg-primary hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Recortar y Subir
                  </button>
                  <button
                    onClick={() => {
                      setPreviewImage(null);
                      setIsPreviewImageUploaded(false);
                      setIsPreviewModalOpen(false);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearVariable;
