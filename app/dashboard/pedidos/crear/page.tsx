"use client";
import React, { useEffect, useState, useMemo } from "react";
import { getCookie, setCookie } from "cookies-next";
import axios from "axios";
import toast from "react-hot-toast";
import Loader from "@/components/common/Loader-t";
import { obtenerProductosBO } from "@/app/utils/obtenerProductosBO";
import { getCurrentStock } from "@/app/utils/HandleStockSku";
import { obtenerPrecioProducto } from "@/app/utils/obtenerPrecioProducto";

interface Product {
  id: string;
  skuId: string;
  name: string;
  hasVariations: boolean;
  description: string;
  statusCode: string;
  previewImageUrl: string;
  mainImageUrl: string;
  enabledForDelivery: boolean;
  enabledForWithdrawal: boolean;
  isFeatured: boolean;
  additionalData1: string | null;
  additionalData2: string | null;
  productTypes: {
    id: string;
    name: string;
    description: string;
    statusCode: string;
    previewImageUrl: string | null;
    mainImageUrl: string | null;
  }[];
  measures: {
    length: number;
    width: number;
    height: number;
    weight: number;
  };
}

interface Variation {
  id: string;
  description: string;
  isBaseSku: boolean;
  attributes: string[];
  formattedAttributes: string;
}

interface Region {
  id: string;
  name: string;
}

interface Commune {
  id: string;
  name: string;
}

interface SelectedItem {
  skuId: string;
  name: string;
  quantity: number;
  price: number;
  productId: string;
}

const ManualOrder: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProductName, setModalProductName] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState<
    (() => void) | null
  >(null);
  const [hasProPlan, setHasProPlan] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [currentPlan, setCurrentPlan] = useState<string>("");

  const openModal = (productName: string, confirmCallback: () => void) => {
    setModalProductName(productName);
    setModalConfirmCallback(() => confirmCallback);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalProductName("");
    setModalConfirmCallback(null);
  };

  const [regionsDelivery, setRegionsDelivery] = useState<
    { id: string; name: string }[]
  >([]);
  const [communesDelivery, setCommunesDelivery] = useState<
    { id: string; name: string; regionId: string }[]
  >([]);
  const [regionsPickup, setRegionsPickup] = useState<
    { id: string; name: string }[]
  >([]);
  const [communesPickup, setCommunesPickup] = useState<
    { id: string; name: string; regionId: string }[]
  >([]);
  const [loadingRegions, setLoadingRegions] = useState<boolean>(false);
  const [loadingCommunes, setLoadingCommunes] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingAttributes, setLoadingAttributes] = useState<boolean>(false);
  const [enabledCommunes, setEnabledCommunes] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<string>(""); // Valor predeterminado: entrega a domicilio
  const [deliveryTypeID, setDeliveryTypeID] = useState<string>("");
  const [orderUrl, setOrderUrl] = useState<string>("");
  const [useDifferentShippingAddress, setUseDifferentShippingAddress] =
    useState<boolean>(false);

  const initialCustomerState = {
    deliveryTypeId: "",
    useDifferentShippingAddress: false,
    currencyCodeId: "8ccc1abd-b35b-45ff-b814-b7c78fff3594",
    customer: {
      firstname: "",
      lastname: "",
      phoneNumber: "",
      email: "",
      addressLine1: "",
      addressLine2: "",
      communeId: "",
    },
  };

  const [customer, setCustomer] = useState(initialCustomerState);

  useEffect(() => {
    fetchProducts();
    fetchRegionsAndCommunes(false);
    checkSubscriptionPlan();
  }, []);

  const checkSubscriptionPlan = async () => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/subscriptions?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Buscar suscripciones activas
      const activeSubscriptions = response.data.subscriptions.filter(
        (sub: any) => sub.statusCode === "ACTIVE" || sub.statusCode === "EXPIRED"
      );

      // Verificar si tiene plan PRO
      const proSubscription = activeSubscriptions.find((sub: any) =>
        sub.name.toLowerCase().includes("pro")
      );

      // Determinar el plan actual
      let planName = "Sin suscripción activa";
      if (activeSubscriptions.length > 0) {
        const subscription = activeSubscriptions[0]; // Tomar la primera suscripción activa
        if (subscription.name.toLowerCase().includes("pro")) {
          planName = "Plan PRO";
        } else if (subscription.name.toLowerCase().includes("avanzado")) {
          planName = "Plan Avanzado";
        } else if (subscription.name.toLowerCase().includes("inicia")) {
          planName = "Plan Inicia";
        } else {
          planName = subscription.name;
        }
      }

      setHasProPlan(!!proSubscription);
      setCurrentPlan(planName);
    } catch (error) {
      console.error("Error verificando plan de suscripción:", error);
      setHasProPlan(false);
      setCurrentPlan("Error al verificar plan");
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = getCookie("AdminTokenAuth");
      const data = await obtenerProductosBO(1, 500, token as string);
      setProducts(data.products);
    } catch (error) {
      console.error("Error al cargar productos:", error);
      toast.error("Error al cargar los productos");
    } finally {
      setLoading(false);
    }
  };

  // Función alternativa para obtener precios usando la API del cliente
  const obtenerPrecioCliente = async (productId: string, skuId: string): Promise<number | null> => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${productId}/skus/${skuId}/pricings?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      
      console.log("Respuesta de precios (cliente):", response.data);
      
      if (response.data.code === 0 && response.data.skuPricings && response.data.skuPricings.length > 0) {
        const { unitPrice } = response.data.skuPricings[0];
        console.log("Precio encontrado (cliente):", unitPrice);
        return unitPrice;
      } else {
        console.log("No se encontraron precios para el SKU (cliente):", skuId);
        return null;
      }
    } catch (error) {
      console.error("Error al obtener el precio del producto (cliente):", error);
      return null;
    }
  };

  const fetchRegionsAndCommunes = async (applyShippingZonesFilter: boolean) => {
    setLoadingRegions(true);
    try {
      if (regionsDelivery.length > 0 && regionsPickup.length > 0) {
        setLoadingRegions(false);
        return;
      }

      const Pais = "CL";
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const regionsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions?siteId=${siteId}`
      );

      const allRegions = regionsResponse.data.regions;
      setRegionsDelivery(allRegions);
      setRegionsPickup(allRegions);
    } catch (error) {
      console.error("Error fetching regions:", error);
      toast.error("Error al cargar las regiones");
    } finally {
      setLoadingRegions(false);
    }
  };

  const fetchAvailableRegions = async (deliveryType: string) => {
    setLoadingRegions(true);
    try {
      const Pais = "CL";
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

      // Determinar el endpoint según el tipo de entrega
      const endpoint =
        deliveryType === "WITHDRAWAL_FROM_STORE"
          ? `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions?siteId=${siteId}&hasDeliveryAvailable=false`
          : `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions?siteId=${siteId}&hasDeliveryAvailable=true`;

      const response = await axios.get(endpoint);
      const availableRegions = response.data.regions;

      if (deliveryType === "WITHDRAWAL_FROM_STORE") {
        setRegionsPickup(availableRegions);
      } else {
        setRegionsDelivery(availableRegions);
      }
    } catch (error) {
      console.error("Error fetching available regions:", error);
      toast.error("Error al cargar las regiones disponibles");
    } finally {
      setLoadingRegions(false);
    }
  };

  const fetchCommunesForRegion = async (regionId: string) => {
    setLoadingCommunes(true);
    try {
      const Pais = "CL";
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

      // Determinar qué endpoint usar basado en el tipo de entrega
      const endpoint =
        deliveryType === "WITHDRAWAL_FROM_STORE"
          ? `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions/${regionId}/communes?siteId=${siteId}&hasDeliveryAvailable=false`
          : `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions/${regionId}/communes?siteId=${siteId}&hasDeliveryAvailable=true`;

      const response = await axios.get(endpoint);
      const communes = response.data.communes.map((commune: any) => ({
        id: commune.id,
        name: commune.name,
        regionId: regionId,
      }));

      if (deliveryType === "WITHDRAWAL_FROM_STORE") {
        setCommunesPickup(communes);
      } else {
        setCommunesDelivery(communes);
      }

      // Guardar las comunas habilitadas para delivery
      if (deliveryType !== "WITHDRAWAL_FROM_STORE") {
        setEnabledCommunes(communes.map((commune: any) => commune.id));
      }
    } catch (error) {
      console.error("Error fetching communes:", error);
      toast.error("Error al cargar las comunas");
    } finally {
      setLoadingCommunes(false);
    }
  };

  const handleRegionChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const regionId = e.target.value;
    setSelectedRegion(regionId);
    setSelectedCommune(""); // Reset selected commune
    setCustomer((prevState) => ({
      ...prevState,
      customer: {
        ...prevState.customer,
        communeId: "",
      },
    }));

    // Limpiar las comunas anteriores
    if (deliveryType === "WITHDRAWAL_FROM_STORE") {
      setCommunesPickup([]);
    } else {
      setCommunesDelivery([]);
    }

    if (regionId) {
      try {
        await fetchCommunesForRegion(regionId);
      } catch (error) {
        console.error("Error al cargar las comunas:", error);
        toast.error("Error al cargar las comunas disponibles");
        setSelectedRegion(""); // Reset region selection on error
      }
    }
  };

  const handleProductChange = async (productId: string) => {
    const selected = products.find((p) => p.id === productId) || null;
    setSelectedProduct(selected);
    setSelectedVariation(""); // Reset the selected variation when product changes

    if (selected && selected.hasVariations) {
      setLoadingAttributes(true);
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus?statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      // Filtra las variaciones que no sean isBaseSku
      const filteredVariations = response.data.skus.filter(
        (sku: any) => !sku.isBaseSku
      );

      // Itera sobre las variaciones para obtener y formatear los atributos
      const variationsWithAttributes = await Promise.all(
        filteredVariations.map(async (variation: any) => {
          const attributesResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/products/${productId}/skus/${variation.id}/attributes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          // Toma los primeros dos atributos y los une con un guion
          const attributes = attributesResponse.data.skuAttributes
            .slice(0, 2)
            .map((attr: any) => `${attr.value}`)
            .sort()
            .join(" - ");

          return {
            ...variation,
            formattedAttributes: attributes,
          };
        })
      );

      setVariations(variationsWithAttributes);
      setLoadingAttributes(false);
    } else {
      setVariations([]);
    }
  };

  const handleAddItem = async () => {
    if (!selectedProduct) return;

    let skuId = selectedProduct.skuId;
    let name = selectedProduct.name;

    if (selectedProduct.hasVariations && selectedVariation) {
      const variation = variations.find((v) => v.id === selectedVariation);
      if (variation) {
        skuId = variation.id;
        name = `${selectedProduct.name} - ${variation.formattedAttributes}`;
        console.log("Variación seleccionada:", variation);
      }
    }

    if (!skuId || (selectedProduct.hasVariations && !selectedVariation)) {
      toast.error(
        "Por favor, selecciona una variación antes de agregar el producto."
      );
      return;
    }

    // Obtener el precio del producto
    const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
    console.log("Obteniendo precio para:", { productId: selectedProduct.id, skuId, siteId });
    const price = await obtenerPrecioCliente(selectedProduct.id, skuId) || 0;
    console.log("Precio obtenido:", price);

    // Verificar el stock disponible
    console.log("Verificando stock para SKU:", skuId);
    const availableStock = await getCurrentStock(selectedProduct.id, skuId);
    console.log("Stock disponible:", availableStock);

    if (availableStock === 0) {
      // Abrir modal en lugar de window.confirm
      openModal(name, () => {
        setSelectedItems((prevItems) => {
          const existingItem = prevItems.find((item) => item.skuId === skuId);

          if (existingItem) {
            return prevItems.map((item) =>
              item.skuId === skuId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            return [...prevItems, { skuId, name, quantity: 1, price, productId: selectedProduct.id }];
          }
        });
      });
      return;
    }

    setSelectedItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.skuId === skuId);

      if (existingItem) {
        return prevItems.map((item) =>
          item.skuId === skuId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { skuId, name, quantity: 1, price, productId: selectedProduct.id }];
      }
    });

    // Limpiar los selectores
    setSelectedProduct(null);
    setSelectedVariation("");
  };

  const handleQuantityChange = (skuId: string, quantity: string) => {
    setSelectedItems((prevItems) =>
      prevItems.map((item) =>
        item.skuId === skuId ? { ...item, quantity: Number(quantity) } : item
      )
    );
  };

  const handleRemoveItem = (skuId: string) => {
    setSelectedItems((prevItems) =>
      prevItems.filter((item) => item.skuId !== skuId)
    );
  };

  const displayedRegions = useMemo(() => {
    return deliveryType === "WITHDRAWAL_FROM_STORE"
      ? regionsPickup
      : regionsDelivery;
  }, [deliveryType, regionsPickup, regionsDelivery]);

  const displayedCommunes = useMemo(() => {
    return deliveryType === "WITHDRAWAL_FROM_STORE"
      ? communesPickup
      : communesDelivery;
  }, [deliveryType, communesPickup, communesDelivery]);

  // Calcular el total de la orden
  const orderTotal = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }, [selectedItems]);

  const handleCommuneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const communeId = e.target.value;
    setSelectedCommune(communeId);
    setCustomer({
      ...customer,
      customer: {
        ...customer.customer,
        communeId: communeId,
      },
    });
  };

  const validateDeliveryOption = (option: string) => {
    const invalidItems = selectedItems.filter((item: any) => {
      const product = products.find((p) => p.skuId === item.skuId);
      if (!product) return false;

      if (option === "HOME_DELIVERY_WITHOUT_COURIER")
        return !product.enabledForDelivery;
      if (option === "WITHDRAWAL_FROM_STORE")
        return !product.enabledForWithdrawal;
      return false;
    });

    if (invalidItems.length > 0) {
      toast.error(
        `Los siguientes productos no son elegibles para ${
          option === "HOME_DELIVERY_WITHOUT_COURIER" ? "delivery" : "retiro"
        }: ${invalidItems.map((item: any) => item.name).join(", ")}`
      );
      return false;
    }

    return true;
  };

  const handleChangeDeliveryType = async (newValue: string) => {
    if (validateDeliveryOption(newValue)) {
      setDeliveryType(newValue);
      setLoading(true); // Iniciar loader

      try {
        // Obtener los tipos de entrega
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/delivery-types?statusCode=ACTIVE`
        );
        const deliveryTypes = response.data.deliveryTypes;
        const selectedDeliveryType = deliveryTypes.find(
          (type: any) => type.code === newValue
        );
        if (selectedDeliveryType) {
          setDeliveryTypeID(selectedDeliveryType.id);
        } else {
          console.error(
            "No se encontró el deliveryType seleccionado en la respuesta de la API"
          );
        }

        // Limpiar selecciones anteriores
        setSelectedRegion("");
        setSelectedCommune("");
        setCustomer((prevState) => ({
          ...prevState,
          customer: {
            ...prevState.customer,
            communeId: "",
          },
        }));

        // Cargar las regiones disponibles según el tipo de entrega
        await fetchAvailableRegions(newValue);
      } catch (error) {
        console.error("Error al cambiar tipo de entrega:", error);
        toast.error("Error al cambiar tipo de entrega");
      } finally {
        // Asegurarse que siempre se desactive el loader
        setLoading(false);
      }
    }
  };

  const handleSubmitOrder = async () => {
    // Verificar si no hay productos seleccionados
    if (selectedItems.length === 0) {
      toast.error("Debe agregar un producto antes de crear la orden.");
      return; // Salir de la función si no hay productos
    }

    const addressLine2 = customer.customer?.addressLine2?.trim()
      ? customer.customer.addressLine2
      : "Sin Comentarios";

    let communeIdToSend: string | undefined;
    if (deliveryType === "WITHDRAWAL_FROM_STORE") {
      communeIdToSend = selectedCommune;
    } else if (useDifferentShippingAddress) {
      communeIdToSend = selectedCommune;
    } else {
      communeIdToSend = customer.customer?.communeId;
    }

    console.log("Submitting order with customer data:", {
      ...customer,
      deliveryTypeId: deliveryTypeID,
      addressLine2,
      communeId: communeIdToSend,
      items: selectedItems.map((item) => ({
        skuId: item.skuId,
        quantity: item.quantity,
      })),
    });

    const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
    const orderData = {
      ...customer,
      currencyCodeId: "8ccc1abd-b35b-45ff-b814-b7c78fff3594",
      deliveryTypeId: deliveryTypeID,
      useDifferentShippingAddress,
      items: selectedItems.map((item) => ({
        skuId: item.skuId,
        quantity: item.quantity,
      })),
      customer: {
        firstname: customer.customer?.firstname,
        lastname: customer.customer?.lastname,
        phoneNumber: customer.customer?.phoneNumber,
        email: customer.customer?.email,
        addressLine1: customer.customer?.addressLine1,
        addressLine2: addressLine2,
        communeId: communeIdToSend,
      },
      ...(useDifferentShippingAddress
        ? {
            shippingInfo: {
              addressLine1: customer.customer?.addressLine1,
              addressLine2: addressLine2,
              communeId: selectedCommune,
            },
          }
        : {}),
    };

    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/orders?siteId=${SiteId}`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        const idOrder = response.data.order.id;
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
        const orderPaymentUrl = `${baseUrl}/tienda/checkout/pago?orderId=${idOrder}`;
        console.log("Order Payment URL", orderPaymentUrl);
        await navigator.clipboard.writeText(orderPaymentUrl);
        toast.success(
          "Orden creada correctamente, URL de la orden copiada al portapapeles"
        );

        setOrderUrl(orderPaymentUrl);
        setCookie("idOrder", idOrder);
        setSelectedItems([]);
        setCustomer(initialCustomerState);
      }
      console.log("Order confirmation response:", response.data);
    } catch (error) {
      toast.error(
        "Error al confirmar la orden. Por Favor, Revise los campos del formulario."
      );
      console.error("Error al confirmar la orden:", error);
    }
  };

  return (
    <>
      <div>
        <title>Crear Pedido</title>
        <div className="pb-12">
          <div className="p-10">
            


      {/* Mensaje de restricción para usuarios sin plan PRO */}
      {!subscriptionLoading && !hasProPlan && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <div className=" text-sm text-red-700">
                <p>La función Crear Pedidos Manuales es exclusiva del Plan Pro. Puedes actualizar tu plan en la sección <a href="/dashboard/suscripciones/estado" rel="noopener noreferrer" className="underline"> Suscripción.</a> </p>
              </div>
            </div>
          </div>
        </div>
      )}
            <div className={`mt-10 bg-white rounded p-10 px-4 pt-8 lg:mt-0 ${
              !hasProPlan ? 'opacity-50 pointer-events-none' : ''
            }`}>
              <p className="text-xl font-medium">Datos Personales</p>
              <p className="text-gray-400">Completa tus datos de Personales</p>
              <div className="">
                <div className="mt-10 px-4 pt-2 lg:mt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      htmlFor="firstname"
                      className="block mt-4"
                    >
                      Nombre <span className="text-red-500">*</span>
                      <input
                        type="text"
                        id="firstname"
                        name="firstname"
                        value={customer.customer?.firstname || ""}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            customer: {
                              ...customer.customer,
                              firstname: e.target.value,
                            },
                          })
                        }
                        className="block w-full rounded-md border-dark/50 border p-1 mt-1"
                      />
                    </label>
                    <label
                      htmlFor="lastname"
                      className="block mt-4"
                    >
                      Apellido <span className="text-red-500">*</span>
                      <input
                        type="text"
                        id="lastname"
                        name="lastname"
                        value={customer.customer?.lastname || ""}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            customer: {
                              ...customer.customer,
                              lastname: e.target.value,
                            },
                          })
                        }
                        className="block w-full rounded-md border-dark/50 border p-1 mt-1"
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label
                      htmlFor="phoneNumber"
                      className="block mt-4"
                    >
                      Teléfono <span className="text-red-500">*</span>
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={customer.customer?.phoneNumber || ""}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            customer: {
                              ...customer.customer,
                              phoneNumber: e.target.value,
                            },
                          })
                        }
                        className="block w-full rounded-md border-dark/50 border p-1 mt-1"
                      />
                    </label>
                    <label
                      htmlFor="email"
                      className="block mt-4"
                    >
                      Email <span className="text-red-500">*</span>
                      <input
                        type="text"
                        id="email"
                        name="email"
                        value={customer.customer?.email || ""}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            customer: {
                              ...customer.customer,
                              email: e.target.value,
                            },
                          })
                        }
                        className="block w-full rounded-md border-dark/50 border p-1 mt-1"
                      />
                    </label>
                  </div>
                  <div
                    style={{ borderRadius: "var(--radius)" }}
                    className="shadow  flex items-center p-4 mt-4 my-2  text-sm text-blue-800 border border-blue-300 bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800 mx-4"
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
                    <span className="sr-only">Envío</span>
                    <div className="flex flex-col">
                      <div>
                        Cuando selecciones <strong>Envío</strong>, sólo
                        aparecerán las Regiones/Comunas{" "}
                        <strong>disponible para despacho a domicilio</strong>.
                      </div>
                    </div>
                  </div>
                  <form className="mt-5 grid gap-2 px-4">
                    <div className="relative">
                      <input
                        className="peer hidden"
                        id="radio_retiroTienda"
                        type="radio"
                        name="radio"
                        value="WITHDRAWAL_FROM_STORE"
                        checked={deliveryType === "WITHDRAWAL_FROM_STORE"}
                        onChange={() =>
                          handleChangeDeliveryType("WITHDRAWAL_FROM_STORE")
                        }
                      />
                      <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                      <label
                        className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                        htmlFor="radio_retiroTienda"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                          />
                        </svg>
                        <div className="ml-5">
                          <span className="mt-2 font-semibold">
                            Retiro en Tienda
                          </span>
                          <p className="text-slate-500 text-sm leading-6">
                            Entrega en: 0-1 días
                          </p>
                        </div>
                      </label>
                    </div>
                    <div className="relative">
                      <input
                        className="peer hidden"
                        id="radio_delivery"
                        type="radio"
                        name="radio"
                        value="HOME_DELIVERY_WITHOUT_COURIER"
                        checked={
                          deliveryType === "HOME_DELIVERY_WITHOUT_COURIER"
                        }
                        onChange={() =>
                          handleChangeDeliveryType(
                            "HOME_DELIVERY_WITHOUT_COURIER"
                          )
                        }
                      />
                      <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                      <label
                        className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                        htmlFor="radio_delivery"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-12 h-12"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                          />
                        </svg>
                        <div className="ml-5">
                          <span className="mt-2 font-semibold">Envío</span>
                          <p className="text-slate-500 text-sm leading-6">
                            Envío: 2-4 días
                          </p>
                        </div>
                      </label>
                    </div>
                  </form>
                  <div className="grid grid-cols-1">
                    <label
                      htmlFor="addressLine1"
                      className="block mt-4"
                    >
                      Dirección <span className="text-red-500">*</span>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={customer.customer?.addressLine1 || ""}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            customer: {
                              ...customer.customer,
                              addressLine1: e.target.value,
                            },
                          })
                        }
                        className="block w-full rounded-md border-dark/50 border p-1 mt-1"
                      />
                    </label>
                    <label
                      htmlFor="addressLine2"
                      className="block mt-4"
                    >
                      Indicaciones Extras
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={customer.customer?.addressLine2 || ""}
                        onChange={(e) =>
                          setCustomer({
                            ...customer,
                            customer: {
                              ...customer.customer,
                              addressLine2: e.target.value,
                            },
                          })
                        }
                        className="block w-full rounded-md border-dark/50 border p-1 mt-1"
                      />
                    </label>
                  </div>
                </div>
                <div className="mt-5 grid gap-4 px-4">
                  <label
                    htmlFor="region"
                    className="block"
                  >
                    Región <span className="text-red-500">*</span>
                    <select
                      id="region"
                      value={selectedRegion}
                      onChange={handleRegionChange}
                      className="block w-full rounded-md text-sm border-dark/50 border p-2 mt-1 bg-white"
                    >
                      {loadingRegions ? (
                        <option>Cargando Regiones...</option>
                      ) : (
                        <>
                          <option>Selecciona Región</option>
                          {displayedRegions.map((region) => (
                            <option
                              key={region.id}
                              value={region.id}
                            >
                              {region.name}
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                  </label>
                  <label
                    htmlFor="commune"
                    className="block"
                  >
                    Comuna <span className="text-red-500">*</span>
                    {loadingCommunes ? (
                      <Loader />
                    ) : (
                      <select
                        id="commune"
                        value={selectedCommune}
                        onChange={handleCommuneChange}
                        className="block w-full rounded-md text-sm border-dark/50 border p-2 mt-1 bg-white"
                      >
                        <option>Selecciona Comuna</option>
                        {displayedCommunes
                          .filter(
                            (commune) => commune.regionId === selectedRegion
                          )
                          .map((commune) => (
                            <option
                              key={commune.id}
                              value={commune.id}
                            >
                              {commune.name}
                            </option>
                          ))}
                      </select>
                    )}
                  </label>
                </div>
              </div>

              {orderUrl && (
                <div className="mt-4 text-center">
                  <p className="text-gray-700">
                    URL de la orden:{" "}
                    <a
                      href={orderUrl}
                      className="text-blue-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {orderUrl}
                    </a>
                  </p>
                </div>
              )}
            </div>
            {loading ? (
              <div className="text-center my-8">Cargando Productos</div>
            ) : null}
            {loading ? (
              <Loader />
            ) : (
              <div className={`px-4 pt-8 rounded bg-white mt-6 p-10 ${
                !hasProPlan ? 'opacity-50 pointer-events-none' : ''
              }`}>
                <p className="text-xl font-medium pb-3 border-b border-dark mb-4">
                  Detalle de la Orden
                </p>
                <p className="text-dark mb-4">Agrega productos a la orden:</p>
                <div className="grid grid-cols-2 gap-4">
                  <select
                    className="border rounded p-2 w-full"
                    onChange={(e) => handleProductChange(e.target.value)}
                    value={selectedProduct ? selectedProduct.id : ""}
                  >
                    <option value="">Selecciona un producto</option>
                    {products.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name}
                      </option>
                    ))}
                  </select>

                  {selectedProduct && (
                    <div
                      className={`grid gap-4 ${
                        selectedProduct.hasVariations
                          ? "grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {selectedProduct &&
                        selectedProduct.hasVariations &&
                        (loadingAttributes ? (
                          <p>Cargando atributos...</p>
                        ) : (
                          <select
                            className="border rounded p-2 w-full"
                            onChange={(e) =>
                              setSelectedVariation(e.target.value)
                            }
                            value={selectedVariation}
                          >
                            <option value="">Selecciona una Variación</option>
                            {variations.map((variation) => (
                              <option
                                key={variation.id}
                                value={variation.id}
                              >
                                {variation.formattedAttributes}
                              </option>
                            ))}
                          </select>
                        ))}
                      <button
                        type="button"
                        className={`rounded p-2 w-full ${
                          hasProPlan 
                            ? 'bg-dark text-white hover:bg-gray-800' 
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                        onClick={handleAddItem}
                        disabled={
                          !hasProPlan || (selectedProduct.hasVariations && !selectedVariation)
                        }
                      >
                        Agregar producto
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-full mt-6 border-t pt-4 border-dark">
                  {" "}
                  <h3>Productos seleccionados:</h3>
                </div>
                <div className="space-y-4  py-6">
                  {/* Encabezados de las columnas */}
                  <div className="grid grid-cols-3 items-center space-x-4 justify-between">
                    <div className="flex w-full justify-between space-x-4">
                      <span className="w-full min-w-24 font-semibold text-gray-700 text-sm">Producto</span>
                      <span className="font-semibold text-gray-700 text-sm w-20 text-center">Unidades</span>
                    </div>
                    <span className="font-semibold text-gray-700 text-sm text-center">Precio Unit.</span>
                    <span className="font-semibold text-gray-700 text-sm text-center">Acciones</span>
                  </div>
                  
                  {selectedItems.map((item) => (
                    <div
                      key={item.skuId}
                      className="grid grid-cols-3 items-center space-x-4 justify-between"
                    >
                      <div className="flex w-full justify-between space-x-4">
                        <span className="w-full min-w-24 border p-2">
                          {item.name}
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          className="border rounded p-2 w-20"
                          onChange={(e) =>
                            handleQuantityChange(item.skuId, e.target.value)
                          }
                        />
                      </div>
                      <span className="text-center font-medium">
                        ${item.price.toLocaleString('es-CL')}
                      </span>
                      <button
                        type="button"
                        className={`rounded p-2 ${
                          hasProPlan 
                            ? 'bg-red-500 text-white hover:bg-red-600' 
                            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        }`}
                        onClick={() => handleRemoveItem(item.skuId)}
                        disabled={!hasProPlan}
                      >
                        Eliminar
                      </button>
                    </div>
                  ))}
                  
                  {/* Total de la orden */}
                  {selectedItems.length > 0 && (
                    <div className="border-t pt-4 mt-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total de la Orden:</span>
                        <span className="text-xl font-bold text-green-600">
                          ${orderTotal.toLocaleString('es-CL')}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleSubmitOrder}
                  disabled={!hasProPlan}
                  className={`mt-4 mb-8 w-full rounded-md px-6 py-3 font-medium ${
                    hasProPlan 
                      ? 'bg-gray-900 text-white hover:bg-gray-800' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Crear Orden
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] ">
            <p className="mb-4">
              El stock para <strong>{modalProductName}</strong> es 0.
            </p>
            <p className="mb-4">¿Deseas agregarlo de todas maneras?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modalConfirmCallback) modalConfirmCallback();
                  closeModal();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ManualOrder;
