/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect, ChangeEvent, useCallback } from "react";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import TabExtra from "@/components/Core/Products/ProductoSimple/TabExtra";
import TabCategory from "@/components/Core/Products/Category/TabCategory";
import CreateAtribute from "@/components/Core/Products/CreateAtribute";
import GalleryUpload from "@/components/Core/Products/ImgUpload/GalleryUpload";
import { useAPI } from "@/app/Context/ProductTypeContext";
import { getCookie } from "cookies-next";
import axios from "axios";
import Select from "react-select";
import { useSearchParams, useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import StarCheckbox from "@/components/Core/Checkbox/StarCheckbox";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import Modal from "@/components/Core/Modals/ModalSeo";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "@/lib/cropImage";
import { handleStockSku } from "@/app/utils/HandleStockSku";
import { HandlePriceSku } from "@/app/utils/HandlePriceSku";
import Link from "next/link";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Import styles

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

import { useRevalidation } from "@/app/Context/RevalidationContext";
import { defaultPreviewImage } from "@/app/config/IMGdefault";
import { slugify } from "@/app/utils/slugify";

const CrearProductoSimple: React.FC = ({}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { productType, setProductType } = useAPI();
  const [openModalId, setOpenModalId] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [precioNormal, setPrecioNormal] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [skuId, setSkuId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const [isMainImageUploaded, setIsMainImageUploaded] = useState(false);
  const [isPreviewImageUploaded, setIsPreviewImageUploaded] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [destacado, setDestacado] = useState(false);
  const [skuImages, setSkuImages] = useState<any[]>([]);
  const [alertStock, setAlertStock] = useState<number | null>(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [originalFileName, setOriginalFileName] = useState<string>("");
  const maxLength = 1000; // Límite de caracteres
  const [charCount, setCharCount] = useState(0); // Contador de caracteres
  const [skuData, setSkuData] = useState({
    description: "",
    hasUnlimitedStock: false,
    hasStockNotifications: false,
    isFeatured: false,
  });
  const [description, setDescription] = useState<string>("");
  const [checkOfferChecked, setCheckOfferChecked] = useState(
    skuData.hasStockNotifications || false
  );
  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setCharCount(value.length);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      description: value,
    }));
  };

  const validateForm = () => {
    let valid = true;
    if (!formData.name) {
      toast.error("El nombre del producto es requerido");
      valid = false;
    }
    if (!formData.description) {
      toast.error("La descripción del producto es requerida");
      valid = false;
    }
    if (precioNormal === null || precioNormal <= 1) {
      toast.error("El precio es requerido");
      valid = false;
    }
    if (!skuData.hasUnlimitedStock && stockQuantity === null) {
      toast.error("La cantidad de stock es requerida");
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
    return valid;
  };

  const handleCheckboxChange = () => {
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      hasFeaturedBaseSku: !prevFormData.hasFeaturedBaseSku,
      isFeatured: !prevFormData.isFeatured,
    }));
    setIsFeatured(!isFeatured);
    setDestacado(!destacado);
  };

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
        setSkuImages(data.skuImages);
      } else {
        console.error(
          "Error al obtener el stock de la variación:",
          data.message
        );
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el stock de la variación:", error);
      return null;
    }
  };

  const handleDeleteForm = () => {
    setFormData(() => ({
      productTypes: [],
      name: "",
      description: "",
      statusCode: "ACTIVE",
      enabledForDelivery: false,
      enabledForWithdrawal: false,
      hasVariations: false,
      hasFeaturedBaseSku: false,
      hasUnlimitedStock: false,
      isFeatured: false,
      measures: {
        length: null,
        width: null,
        height: null,
        weight: null,
      },

      previewImage: defaultPreviewImage,
      mainImage: {
        name: "",
        type: "",
        size: null,
        data: "",
      },
    }));
    setAlertStock(0);
    handleSkuFieldChange("hasUnlimitedStock", false);
    setCheckOfferChecked(false);
    setMainImage(null);
    setPreviewImage(null);
    setPrecioNormal(null);
    setStockQuantity(null);
    setSelectedImages([]);
    setSkuImages([]);
    setIsEditMode(false);
    setIsFeatured(false);
    setIsMainImageUploaded(false);
    setIsPreviewImageUploaded(false);
    window.location.href = `${window.location.pathname}`;
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
      setProductType(productTypeResponse.data.productTypes);
    } catch (error) {
      console.error("Error al obtener los tipos de producto:", error);
    }
  };

  const fetchStock = async (productId: any, skuId: any) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const warehouseId = await getWarehouseId();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/inventories?warehouseId=${warehouseId}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.skuInventories.length > 0) {
        setStockQuantity(data.skuInventories[0].quantity);
        setAlertStock(data.skuInventories[0].minimumQuantity);
        setCheckOfferChecked(data.skuInventories[0].minimumQuantity !== 0);
      } else {
        console.error(
          "Error al obtener el stock de la variación:",
          data.message
        );
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el stock de la variación:", error);
      return null;
    }
  };

  const handleDeleteImage = async (
    productId: any,
    skuId: any,
    imageId: any
  ) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const url = `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/images/${imageId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };
      const response = await axios.delete(url, { headers });
      if (response.status === 200) {
        fetchImages(productId, skuId);
      } else {
        console.error("Error al eliminar la imagen:", response.status);
      }
    } catch (error) {
      console.error("Error al eliminar la imagen:", error);
    }
  };
  const handleAlertStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const currentStock =
      stockQuantity !== null && stockQuantity !== undefined ? stockQuantity : 0;
    // Verifica si el valor de la alerta es mayor o igual al stock actual
    if (value > currentStock) {
      toast.error(
        "El stock mínimo para la alerta debe ser menor que el stock disponible."
      );
      return;
    }

    setAlertStock(value ? value : null);
  };

  const fetchPrice = async (productId: string, skuId: string) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.code === 0) {
        setPrecioNormal(data.skuPricings[0].unitPrice);
      } else {
        console.error(
          "Error al obtener el precio de la variación:",
          data.message
        );
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el precio de la variación:", error);
      return null;
    }
  };

  useEffect(() => {
    fetchProducTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleOpenModal = (modalId: any) => {
    setOpenModalId(modalId);
  };
  const handleCloseModal = () => {
    setOpenModalId(null);
  };

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
        setIsModalOpen(true);
        const imageInfo = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: result,
        };
        setFormData((prevFormData: any) => ({
          ...prevFormData,
          [imageKey]: imageInfo,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = (
    setImage: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    setImage(null);
  };

  const productTypeOptions = productType.map(
    (producto: { id: string; name: string }) => ({
      value: producto.id,
      label: producto.name,
    })
  );

  const handleMeasureChange = (e: any, measure: any) => {
    const value = parseFloat(e.target.value);
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      measures: {
        ...prevFormData.measures,
        [measure]: value > 0 ? value : 0,
      },
    }));
  };

  const handleDeliveryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isDeliveryEnabled = event.target.checked;
    setFormData((prevFormData: any) => ({
      ...prevFormData,
      enabledForDelivery: isDeliveryEnabled,
      measures: isDeliveryEnabled
        ? {
            length: 1,
            width: 1,
            height: 1,
            weight: 0.2,
          }
        : {
            length: null,
            width: null,
            height: null,
            weight: null,
          },
    }));
  };

  const [formData, setFormData]: any = useState({
    productTypes: [],
    name: "",
    description: "",
    statusCode: "ACTIVE",
    enabledForDelivery: false,
    enabledForWithdrawal: false,
    hasVariations: false,
    hasFeaturedBaseSku: false,
    isFeatured: false,
    measures: {
      length: 1,
      width: 1,
      height: 1,
      weight: 0.2,
    },
    previewImage: defaultPreviewImage,
    mainImage: {
      name: "",
      type: "",
      size: null as number | null,
      data: "",
    },
  });

  const getWarehouseId = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/warehouses?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        response.data &&
        response.data.warehouses &&
        response.data.warehouses.length > 0
      ) {
        return response.data.warehouses[0].id;
      } else {
        console.error("No se encontraron almacenes.");
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo almacén:", error);
      return null;
    }
  };

  const fetchSkuData = async (productId: string, skuId: string) => {
    if (productId && skuId) {
      try {
        const token = getCookie("AdminTokenAuth");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const responseData = await response.json();
        if (response.ok && responseData.code === 0) {
          const skuDataResponse = responseData.sku;
          setSkuData({
            description: skuDataResponse.description || "",
            hasUnlimitedStock: skuDataResponse.hasUnlimitedStock || false,
            hasStockNotifications:
              skuDataResponse.hasStockNotifications || false,
            isFeatured: skuDataResponse.isFeatured || false,
          });

          setCheckOfferChecked(skuDataResponse.hasStockNotifications);
        } else {
          console.error(
            "Error al obtener los datos del SKU:",
            responseData.message
          );
          toast.error("Error al obtener los datos del SKU");
        }
      } catch (error) {
        console.error("Error al obtener los datos del SKU:", error);
        toast.error("Error al obtener los datos del SKU");
      }
    }
  };
  const handleSkuFieldChange = (field: keyof typeof skuData, value: any) => {
    if (field === "hasUnlimitedStock" && value === true) {
      setStockQuantity((prevQuantity) =>
        prevQuantity === null || prevQuantity <= 0 ? 9999999 : prevQuantity
      );
    }

    setSkuData((prevSkuData) => ({
      ...prevSkuData,
      [field]: value,
    }));
  };

  const addProductImage = async (id: string, skuId: string, image: string) => {
    try {
      const name = image.substring(image.indexOf("/") + 1, image.indexOf(";"));
      const type = image.substring(
        image.indexOf(":") + 1,
        image.indexOf(";base64")
      );
      const size = Math.round(
        (image.length - image.indexOf("base64") - "base64".length) * 0.75
      );

      const formattedImage = {
        mainImage: {
          name: name,
          type: type,
          size: size,
          data: image,
        },
      };
      const token = getCookie("AdminTokenAuth");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${id}/skus/${skuId}/images?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        formattedImage,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status >= 200 && response.status < 300) {
        console.log("Image added successfully");
      } else {
        console.error("Error adding image:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };
  const handleStockQuantityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);
    setStockQuantity(isNaN(value) ? 0 : value); // Asegúrate de que 0 se trate correctamente
  };

  const handleSkuData = async (
    productId: string,
    skuId: string,
    description: string,
    hasUnlimitedStock: boolean,
    hasStockNotifications: boolean,
    isFeatured: boolean
  ) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const url = `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${skuId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

      const data = {
        description,
        hasUnlimitedStock,
        hasStockNotifications,
        isFeatured,
      };

      console.log("Datos que se envían en la solicitud:", data);

      const response = await axios.put(url, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status >= 200 && response.status < 300) {
        console.log("SKU data updated successfully");
      } else {
        console.error("Error updating SKU data:", response.statusText);
        toast.error("Error al actualizar los datos de la SKU");
      }
    } catch (error) {
      console.error("Error updating SKU data:", error);
      toast.error("Error al actualizar los datos de la SKU");
    }
  };

  const handleUnlimitedStockChange = () => {
    if (skuData.hasUnlimitedStock) {
      handleSkuFieldChange("hasUnlimitedStock", false);
    } else {
      // Desactivar alerta de stock si se activa el stock ilimitado
      handleSkuFieldChange("hasStockNotifications", false);
      handleSkuFieldChange("hasUnlimitedStock", true);
    }
  };

  const handleStockNotificationChange = (checked: boolean) => {
    if (checked) {
      // Si se activa la alerta de stock, se desactiva el stock ilimitado
      handleSkuFieldChange("hasUnlimitedStock", false);
      handleSkuFieldChange("hasStockNotifications", true);
    } else {
      handleSkuFieldChange("hasStockNotifications", false);
    }
  };

  const { triggerRevalidation } = useRevalidation();

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [newProductId, setNewProductId] = useState<string | null>(null);

  const handleSubmit = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    const dataToSend: any = { ...formData };

    if (isEditMode && !isMainImageUploaded) {
      delete dataToSend.mainImage;
    }

    setIsLoading(true);

    if (!isEditMode && !validateForm()) {
      setIsLoading(false);
      toast.error("Por favor, corrige los errores antes de enviar");
      return;
    }

    if (!alertStock) {
      setAlertStock(0);
    }

    try {
      const url = isEditMode
        ? `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        : `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

      const method = isEditMode ? "PUT" : "POST";
      const token = getCookie("AdminTokenAuth");

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        console.error(
          "Error en la respuesta del servidor:",
          response.statusText
        );
        toast.error("Error en la respuesta del servidor");
        setIsLoading(false);
        return;
      }

      const responseData = await response.json();

      if (!isEditMode) {
        if (!responseData || !responseData.product) {
          console.error(
            "La respuesta no contiene el objeto 'product' esperado."
          );
          toast.error("Error al crear el producto");
          setIsLoading(false);
          return;
        }

        const { product } = responseData;
        const { id, skuId: sku } = product;

        if (id && sku) {
          try {
            await handleSkuData(
              id,
              sku,
              "hola",
              skuData.hasUnlimitedStock,
              skuData.hasStockNotifications,
              skuData.isFeatured
            );

            await handleStockSku(id, sku, stockQuantity, alertStock);

            if (precioNormal !== null) {
              await HandlePriceSku(id, sku, precioNormal);
            }

            for (const image of selectedImages) {
              await addProductImage(id, sku, image);
            }

            await triggerRevalidation();
            toast.success("Producto creado correctamente");
            setProductId(product.id);
            setNewProductId(id);
            setShowConfirmationModal(true);
            setIsEditMode(true);
          } catch (error) {
            console.error("Error durante la creación del producto:", error);
            toast.error("Error durante la creación del producto");
          }
        }
      } else {
        if (responseData.code === 0 && responseData.message === "Success") {
          if (precioNormal && productId && skuId !== null) {
            await HandlePriceSku(productId, skuId, precioNormal);
          }
          if (productId && skuId !== null) {
            await handleSkuData(
              productId,
              skuId,
              "hola",
              skuData.hasUnlimitedStock,
              skuData.hasStockNotifications,
              skuData.isFeatured
            );
          }

          await handleStockSku(productId, skuId, stockQuantity, alertStock);

          for (const image of selectedImages) {
            await addProductImage(
              productId !== null ? productId : "",
              skuId !== null ? skuId : "",
              image
            );
          }

          await triggerRevalidation();
          setNewProductId(productId);
          setShowConfirmationModal(true);
          toast.success("Producto actualizado correctamente");
        }
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      toast.error("Error al enviar la solicitud");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueEditing = () => {
    setShowConfirmationModal(false);
    if (newProductId) {
      window.location.href = `${window.location.pathname}?productId=${newProductId}`;
    }
  };

  const handleViewProduct = () => {
    setShowConfirmationModal(false);
    if (newProductId && formData.name) {
      const productSlug = slugify(formData.name);
      window.open(`/tienda/productos/${productSlug}`, "_blank");
    }
  };

  useEffect(() => {
    const id = searchParams.get("productId");
    if (id) {
      setProductId(id);
      setIsEditMode(true);
    }
  }, [searchParams]);

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
        fetchStock(productData.id, productData.skuId);
        fetchPrice(productData.id, productData.skuId);
        fetchImages(productData.id, productData.skuId);
        setSkuId(productData.skuId);
        setIsFeatured(productData.isFeatured);
        fetchSkuData(productData.id, productData.skuId);
        const selectedProductTypes = productData.productTypes.map(
          (productType: any) => ({
            id: productType.id,
            name: productType.name,
          })
        );
        setDescription(productData.description || "");
        setFormData({
          ...formData,
          name: productData.name,
          description: productData.description,
          enabledForDelivery: productData.enabledForDelivery,
          enabledForWithdrawal: productData.enabledForWithdrawal,
          hasVariations: productData.hasVariations,
          productTypes: selectedProductTypes,
          isFeatured: productData.isFeatured,
          mainImage: isMainImageUploaded
            ? formData.mainImage
            : { ...formData.mainImage, data: productData.mainImageUrl },
          previewImage: isPreviewImageUploaded
            ? formData.previewImage
            : { ...formData.previewImage, data: productData.previewImageUrl },
          measures: {
            length: productData.measures?.length || 1,
            width: productData.measures?.width || 1,
            height: productData.measures?.height || 1,
            weight: productData.measures?.weight || 1,
          },
        });
        setMainImage(productData.mainImageUrl);
        setPreviewImage(productData.previewImageUrl);
      } catch (error) {
        console.error("Error al obtener los datos del producto:", error);
        setIsEditMode(false);
        window.location.href = window.location.pathname;
      }
    };

    if (isEditMode && productId) {
      fetchProductData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleImageGalleryChange = (images: any) => {
    setSelectedImages(images);
  };

  const handleImageRemove = (index: number) => {
    const newImages = [...selectedImages];
    newImages.splice(index, 1);
    setSelectedImages(newImages);
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

      // Convert Blob to File
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

        setFormData((prevFormData: any) => ({
          ...prevFormData,
          mainImage: imageInfo,
        }));

        setIsMainImageUploaded(true);
      };

      reader.readAsDataURL(compressedFile);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al recortar o comprimir la imagen:", error);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <div className="relative pb-20 ">
        <div className="w-full mx-auto sticky backdrop-blur-md flex justify-center top-16 py-8 z-50">
          <div className="flex w-full justify-between px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-1 md:gap-4 w-full">
              <div className="w-full  px-4 py-1 h-full  border-dark border rounded text-dark flex items-center gap-2">
                Estado:{" "}
                <span className="text-rosa">
                  {isEditMode ? "Publicado" : "Borrador"}
                </span>
              </div>

              <a
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/productos/crear/producto-simple`}
                className="relative w-full  inline-flex  items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-dark group"
              >
                <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-primary group-hover:h-full" />
                <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                  <svg
                    className="w-5 h-5 text-rosa"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </span>
                <span className="absolute left-0 pl-2.5 -translate-x-12 group-hover:translate-x-0 ease-out duration-200">
                  <svg
                    className="w-5 h-5 text-verde"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                </span>
                <span className="relative w-full font-medium text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                  Nuevo Producto
                </span>
              </a>
              <button
                id="createCategories"
                onClick={() => handleOpenModal("createCategoriesModal")}
                className="relative w-full  inline-flex items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-dark group "
              >
                <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-primary group-hover:h-full" />
                <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="{1.5}"
                    stroke="currentColor"
                    className="size-6"
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
                    className="size-6"
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
                <span className="relative w-full font-medium text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                  Categorías
                </span>
              </button>

              <Link
                href="/dashboard/productos"
                className="relative w-full  inline-flex  items-center justify-start py-3 pl-4 pr-12 overflow-hidden font-semibold text-white transition-all duration-150 ease-in-out rounded hover:pl-10 hover:pr-6 bg-red-700 group"
              >
                <span className="absolute bottom-0 left-0 w-full h-1 transition-all duration-150 ease-in-out bg-red-700 group-hover:h-full" />
                <span className="absolute right-0 pr-4 duration-200 ease-out group-hover:translate-x-12">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="{1.5}"
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m0 0L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
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
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m0 0L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </span>
                <span className="relative w-full font-medium text-left transition-colors duration-200 ease-in-out group-hover:text-white">
                  Cancelar
                </span>
              </Link>
            </div>
          </div>
        </div>
        <div className="w-[95%] md:w-[80%] mx-auto  bg-white  rounded-md p-6">
          <div className=" flex flex-col pb-8 ">
            <div className="grid grid-cols-1 2xl:grid-cols-1 gap-2">
              <div
                className="shadow rounded flex items-center p-4 my-2  text-sm text-blue-800 border border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800"
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
                  La información que cargues en el Título, Descripción y
                  Fotografía Principal, será la que aparecerá en una búsqueda
                  orgánica (SEO).
                </div>
              </div>
              <div>
                <label
                  htmlFor="nombreProducto"
                  className="font-normal "
                >
                  Nombre Producto
                </label>
                <input
                  className="shadow block w-full px-4 rounded py-3 mt-2 mb-4 border border-gray-300"
                  type="text"
                  name="nombreProducto"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({ ...formData, name: event.target.value })
                  }
                />
              </div>
              <div className="">
                <label className="font-normal ">Descripción Producto</label>
                <ReactQuill
                  value={description}
                  onChange={handleDescriptionChange}
                  modules={{
                    toolbar: [
                      [{ header: "1" }, { header: "2" }, { font: [] }],
                      [{ size: [] }],
                      ["bold", "italic", "underline", "strike", "blockquote"],
                      [{ list: "ordered" }, { list: "bullet" }],
                      ["link"],
                    ],
                  }}
                  formats={[
                    "header",
                    "font",
                    "size",
                    "bold",
                    "italic",
                    "underline",
                    "strike",
                    "blockquote",
                    "list",
                    "bullet",
                    "link",
                  ]}
                />

                <div className="flex justify-end items-center mt-2">
                  <div className="text-left text-sm text-gray-500">
                    {charCount}/{maxLength} caracteres
                  </div>
                </div>
              </div>
              <div className="my-2 ">
                <label className="font-normal ">
                  Tipo de Entrega Disponible:
                </label>
                <div className="mt-5 w-full  mb-4 -z-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="relative w-full ">
                    <input
                      className="peer hidden"
                      id="checkbox_delivery"
                      type="checkbox"
                      name="enabledForDelivery"
                      checked={formData.enabledForDelivery}
                      onChange={handleDeliveryChange}
                    />
                    <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                    <label
                      className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded border border-gray-300 p-4"
                      htmlFor="checkbox_delivery"
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
                          d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                        />
                      </svg>
                      <div className="ml-5">
                        <span className="mt-2 font-normal">Delivery</span>
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
                      className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded border border-gray-300 p-4"
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
                      <div className="ml-5">
                        <span className="mt-2 font-normal">
                          Retiro en Tienda
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {formData.enabledForDelivery && (
                <div
                  id="measuresData"
                  className="grid grid-cols-1 md:grid-cols-2 gap-2"
                >
                  <div>
                    <label>Alto (cm):</label>
                    <input
                      type="number"
                      id="height"
                      value={formData.measures.height || 1}
                      onChange={(e) => handleMeasureChange(e, "height")}
                      className="shadow block w-full px-4 rounded py-3 mt-2 mb-4 border border-gray-300"
                      placeholder="Ingrese el alto"
                    />
                  </div>
                  <div>
                    <label>Largo (cm):</label>
                    <input
                      type="number"
                      id="length"
                      value={formData.measures.length || 1}
                      onChange={(e) => handleMeasureChange(e, "length")}
                      className="shadow block w-full px-4 rounded py-3 mt-2 mb-4 border border-gray-300"
                      placeholder="Ingrese el largo"
                    />
                  </div>
                  <div>
                    <label>Ancho (cm):</label>
                    <input
                      type="number"
                      id="width"
                      value={formData.measures.width || 1}
                      onChange={(e) => handleMeasureChange(e, "width")}
                      className="shadow block w-full px-4 rounded py-3 mt-2 mb-4 border border-gray-300"
                      placeholder="Ingrese el ancho"
                    />
                  </div>
                  <div>
                    <label>Peso (kg) :</label>
                    <input
                      type="number"
                      id="weight"
                      step="0.01"
                      value={formData.measures.weight || 0.2}
                      onChange={(e) => handleMeasureChange(e, "weight")}
                      className="shadow block w-full px-4 rounded py-3 mt-2 mb-4 border border-gray-300"
                      placeholder="Ingrese el peso"
                    />
                  </div>
                </div>
              )}
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
                    Pincha la estrella para agregar al carrusel de Destacados de
                    tu Home.
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div>
                <label className="font-normal ">Categoría</label>
                <Select
                  isMulti
                  name="Categorías"
                  options={productTypeOptions}
                  classNamePrefix="Selecciona"
                  className="basic-multi-select block mt-2 w-full text-sm text-dark bg-white focus:ring-primary focus:border-primary"
                  value={formData.productTypes.map((productType: any) => ({
                    value: productType.id,
                    label: productType.name,
                  }))}
                  onChange={(selectedOptions) => {
                    const selectedIds = selectedOptions.map((option: any) => ({
                      id: option.value,
                      name: option.label,
                    }));
                    setFormData({
                      ...formData,
                      productTypes: selectedIds,
                    } as any);
                  }}
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 space-y-8">
              <div
                className="shadow border  p-4"
                style={{ borderRadius: "var(--radius)" }}
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-normal ">Precio</label>
                    <input
                      type="number"
                      className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                      style={{ borderRadius: "var(--radius)" }}
                      value={precioNormal !== null ? precioNormal : ""}
                      onChange={(e) =>
                        setPrecioNormal(parseFloat(e.target.value))
                      }
                      name="precioProducto"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-normal ">Stock</label>
                    <input
                      type="number"
                      onKeyDown={(e) => {
                        const allowedKeys = [
                          "Backspace",
                          "Tab",
                          "ArrowLeft",
                          "ArrowRight",
                          "Delete",
                        ];
                        if (
                          !allowedKeys.includes(e.key) &&
                          !/^[0-9]$/.test(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300 ${
                        skuData.hasUnlimitedStock
                          ? "bg-gray-200 cursor-not-allowed"
                          : ""
                      }`}
                      style={{ borderRadius: "var(--radius)" }}
                      value={stockQuantity !== null ? stockQuantity : ""}
                      onChange={handleStockQuantityChange} // Cambia a este nuevo manejador
                      name="stockProducto"
                      required
                      disabled={skuData.hasUnlimitedStock}
                    />
                  </div>
                </div>
                <div className="flex ">
                  <div className="form-group flex justify-between w-full">
                    <div>
                      {" "}
                      <label className="items-center cursor-pointer inline-flex pl-2">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={skuData.hasStockNotifications}
                          onChange={(e) => {
                            handleStockNotificationChange(e.target.checked);
                            setCheckOfferChecked(e.target.checked);
                          }}
                        />
                        <div className="relative w-8 h-5 bg-secondary peer-focus:outline-none peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                          Activar Alerta
                        </span>
                      </label>
                    </div>

                    <div>
                      <label
                        htmlFor="unlimitedStock"
                        className="mr-2 flex items-center"
                      >
                        <input
                          type="checkbox"
                          id="unlimitedStock"
                          className="sr-only peer"
                          checked={skuData.hasUnlimitedStock}
                          onChange={handleUnlimitedStockChange}
                        />
                        <div className="relative w-8 h-5 bg-secondary rounded-full peer dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:bg-primary peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600" />
                        <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                          Stock Ilimitado
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`mt-4 bg-primary p-4 text-dark shadow border   ${
                  skuData.hasStockNotifications ? "" : " hidden"
                }`}
                style={{ borderRadius: "var(--radius)" }}
              >
                <div>
                  <label className="font-normal text-white">
                    Recibirás una alerta al alcanzar el stock mínimo
                  </label>
                  <input
                    type="number"
                    onKeyDown={(e) => {
                      const allowedKeys = [
                        "Backspace",
                        "Tab",
                        "ArrowLeft",
                        "ArrowRight",
                        "Delete",
                      ];
                      if (
                        !allowedKeys.includes(e.key) &&
                        !/^[0-9]$/.test(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    className="shadow block w-full px-4 py-3 mt-2 mb-4 border border-gray-300"
                    style={{ borderRadius: "var(--radius)" }}
                    name="AlertadeStock"
                    value={alertStock !== null ? alertStock : ""}
                    onChange={handleAlertStockChange} // Cambia a esta función
                    required
                  />
                </div>
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
                    <label className="font-normal ">Imagen Principal</label>
                    <div
                      className="shadow relative mt-2 h-[150px] object-contain overflow-hidden bg-center bg-no-repeat bg-cover"
                      style={{
                        borderRadius: "var(--radius)",
                        backgroundImage: `url(${mainImage})`,
                      }}
                    >
                      <button
                        className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 m-1 text-xs"
                        onClick={() => handleClearImage(setMainImage)}
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
                    <label className="font-normal ">Imagen Principal</label>
                    <label
                      htmlFor="mainImage"
                      className="shadow flex mt-2 flex-col bg-white justify-center items-center pt-5 pb-6 border border-dashed border-gray-600 cursor-pointer w-full z-10"
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
                          <span className="font-semibold">Subir Imagen</span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 px-2">
                          PNG, JPG o Webp (800x800px)
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>
              <div className="col-span-4 md:col-span-3 z-0">
                <label className="font-normal text-primary">
                  Galería de imágenes
                </label>
                <div className="flex space-x-4 overflow-x-auto">
                  {isEditMode ? (
                    <ImageUploader
                      productId={productId}
                      skuId={skuId}
                      skuImages={skuImages}
                      fetchImages={fetchImages}
                    />
                  ) : (
                    <GalleryUpload
                      selectedImages={selectedImages}
                      handleImageGalleryChange={handleImageGalleryChange}
                      handleImageRemove={handleImageRemove}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="shadow bg-primary text-secondary hover:bg-secondary hover:text-primary px-4 py-2 mt-4"
                style={{ borderRadius: "var(--radius)" }}
                onClick={handleSubmit}
              >
                {isEditMode ? "Actualizar Producto" : "Publicar Producto"}
              </button>
              {isEditMode && formData.name && (
                <Link
                  href={`/tienda/productos/${slugify(formData.name)}`}
                  className="shadow bg-secondary text-center text-primary hover:bg-primary hover:text-secondary px-4 py-2 mt-4"
                  style={{ borderRadius: "var(--radius)" }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver Producto
                </Link>
              )}
            </div>
          </div>
        </div>
        <div
          id="createCategoriesModal"
          tabIndex={-1}
          className={`overflow-y-auto overflow-x-hidden px-12 pt-12 fixed top-0 right-0 backdrop-blur-sm bg-[#00000080] left-0 z-50 w-full h-[calc(100%)] ${
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
          className={`overflow-y-auto overflow-x-hidden md:p-32 pt-0 fixed top-0 right-0 backdrop-blur-sm bg-[#00000080] left-0 z-50 w-full h-[calc(100%)] ${
            openModalId === "createAttributeModal" ? "" : "hidden"
          }`}
        >
          <CreateAtribute
            handleCloseModal={handleCloseModal}
            fetchData={fetchProducTypes}
          />
        </div>
        {isModalOpen && (
          <Modal
            showModal={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          >
            <div className="relative h-96 w-full">
              <Cropper
                image={mainImage || ""} // Asegurar que se pasa una cadena no nula
                crop={crop}
                zoom={zoom}
                aspect={4 / 4}
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

              <div className="flex justify-between w-full gap-2">
                <button
                  onClick={handleCrop}
                  className="bg-primary text-[13px] md:text-[16px] hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Recortar y Subir
                </button>
                <button
                  onClick={() => {
                    setMainImage(null);
                    setIsMainImageUploaded(false);
                    setIsModalOpen(false);
                  }}
                  className="bg-red-800 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-[13px] md:text-[16px]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Modal de Confirmación */}
        {/*     {showConfirmationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">
                {isEditMode ? "Producto Actualizado" : "Producto Creado"}
              </h2>
              <p className="mb-6">¿Qué deseas hacer ahora?</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleContinueEditing}
                  className="flex-1 bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                >
                  Seguir Editando
                </button>
                <button
                  onClick={handleViewProduct}
                  className="flex-1 bg-secondary text-primary px-4 py-2 rounded hover:bg-opacity-90 transition-colors"
                >
                  Ver Producto
                </button>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </>
  );
};

export default CrearProductoSimple;
