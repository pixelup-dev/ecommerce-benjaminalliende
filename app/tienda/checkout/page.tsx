"use client";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useAPI } from "@/app/Context/ProductTypeContext";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Customer, ItemAvailability } from "@/types/types";
import { jwtDecode } from "jwt-decode";
import Loader from "@/components/common/Loader";
import { COURIERS, DELIVERY_TYPES, Courier } from "@/app/config/couriers";

const CartList = React.lazy(() => import("@/components/Core/CartCanva/CartList"));

const Checkout: React.FC = () => {
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
  const [availableDeliveryTypes, setAvailableDeliveryTypes] = useState<any[]>(
    []
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingRegions, setLoadingRegions] = useState<boolean>(false);
  const [loadingCommunes, setLoadingCommunes] = useState<boolean>(false);

  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  const [enabledCommunes, setEnabledCommunes] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true); // Puedes cambiar el valor predeterminado según lo que necesites

  const {
    cartItems,
    setCartItems,
    fetchCartData,
    cartData,
    setCartData,
    setTotalItems,
  } = useAPI();

  const router = useRouter();

  const [deliveryType, setDeliveryType] = useState<string>("");

  const [deliveryTypeID, setDeliveryTypeID] = useState<string>("");
  const [itemAvailability, setItemAvailability] = useState<{
    [key: string]: ItemAvailability;
  }>({});
  const cartId = getCookie("cartId") as string | undefined;
  const [freeShippingAmount, setFreeShippingAmount] = useState<number | null>(null);
  const setItemAvailabilityHandler = (
    itemId: string,
    enabledForDelivery: boolean,
    enabledForWithdrawal: boolean
  ) => {
    setItemAvailability((prevState) => ({
      ...prevState,
      [itemId]: { enabledForDelivery, enabledForWithdrawal },
    }));
  };
  useEffect(() => {
    const fetchDeliveryTypeId = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/delivery-types?statusCode=ACTIVE`
        );
        const deliveryTypes = response.data.deliveryTypes;
        setAvailableDeliveryTypes(deliveryTypes);
      } catch (error) {
        console.error("Error al obtener los tipos de entrega:", error);
        toast.error("Error al cargar los tipos de entrega");
      }
    };

    fetchDeliveryTypeId();
  }, []);

  const isLoggedIn = getCookie("ClientTokenAuth");
  const [useDifferentShippingAddress, setUseDifferentShippingAddress] =
    useState<boolean>(false);

  const initialCustomerState: Customer = {
    cartId: cartId || "",
    deliveryTypeId: "",
    useDifferentShippingAddress: false,
    customer: isLoggedIn
      ? null
      : {
          firstname: "",
          lastname: "",
          phoneNumber: "",
          email: "",
          addressLine1: "",
          addressLine2: "",
          communeId: "",
        },
  };

  const [customer, setCustomer] = useState<Customer>(initialCustomerState);
  const Token = getCookie("ClientTokenAuth");
  const decodeToken = Token ? jwtDecode(Token) : null;

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch customer data if logged in
      const fetchCustomerData = async () => {
        try {
          const id = decodeToken?.sub;
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
            {
              headers: { Authorization: `Bearer ${isLoggedIn}` },
            }
          );
          console.log("Customer data fetched:", response.data);
          const {
            firstname,
            lastname,
            phoneNumber,
            email,
            addressLine1,
            addressLine2,
            commune,
          } = response.data.customer;
          const { id: communeId, name: communeName, region } = commune;
          const { name: regionName } = region;
          setCustomer((prevState) => ({
            ...prevState,
            customer: {
              firstname,
              lastname,
              phoneNumber,
              email,
              addressLine1,
              addressLine2,
              communeId,
              communeName,
              regionName,
            },
          }));
        } catch (error) {
          console.error("Error fetching customer data:", error);
        }
      };

      fetchCustomerData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const fetchRegionsAndCommunes = async (applyShippingZonesFilter: boolean) => {
    setLoadingRegions(true);
    try {
      if (regionsDelivery.length > 0 && regionsPickup.length > 0) {
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
      setLoading(false);
      setLoadingRegions(false);
    }
  };

  const fetchAvailableRegions = async (deliveryType: string) => {
    setLoadingRegions(true);
    try {
      const Pais = "CL";
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      
      // Determinar el endpoint según el tipo de entrega
      const endpoint = deliveryType === "WITHDRAWAL_FROM_STORE"
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
      const endpoint = deliveryType === "WITHDRAWAL_FROM_STORE"
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

  const handleRegionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
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

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validatePhoneNumber = (phoneNumber: string) => {
    const re = /^\+?\d{9,11}$/;
    return re.test(phoneNumber);
  };

  const handleSubmitOrder = async () => {
    // if (!termsAccepted) {
    //   toast.error("Debes aceptar los términos y condiciones para continuar.");
    //   return;
    // }

    const invalidItems = validateItemsForDeliveryType(deliveryType);

    if (invalidItems.length > 0) {
      toast.error(
        `Los siguientes productos no son elegibles para ${
          deliveryType === "HOME_DELIVERY_WITHOUT_COURIER"
            ? "delivery"
            : "retiro"
        }: ${invalidItems.map((item: any) => item.sku.product.name).join(", ")}`
      );
      return;
    }

    const addressLine2 = customer.customer?.addressLine2?.trim()
      ? customer.customer.addressLine2
      : "Sin Comentarios";

    let communeIdToSend: string | undefined;
    if (deliveryType === "WITHDRAWAL_FROM_STORE" && !isLoggedIn) {
      communeIdToSend = selectedCommune; // Enviar comuna seleccionada para retiro en tienda cuando no está logueado
    } else if (useDifferentShippingAddress) {
      communeIdToSend = selectedCommune;
    } else {
      communeIdToSend = customer.customer?.communeId;
    }

    const email = customer.customer?.email?.trim();
    const phoneNumber = customer.customer?.phoneNumber?.trim();

    if (email && !validateEmail(email)) {
      toast.error("Ingrese un mail válido.");
      return;
    }

    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
      toast.error("Ingrese un número de teléfono válido ");
      return;
    }

    console.log("Submitting order with customer data:", {
      ...customer,
      deliveryTypeId: deliveryTypeID, // Asegurarse de incluir el deliveryTypeID
      addressLine2,
      communeId: communeIdToSend,
    });

    if (
      !isLoggedIn &&
      (!customer.customer?.firstname?.trim() ||
        !customer.customer?.lastname?.trim() ||
        !customer.customer?.phoneNumber?.trim() ||
        !email ||
        !customer.customer?.addressLine1?.trim() ||
        !communeIdToSend)
    ) {
      toast.error("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (deliveryType !== "WITHDRAWAL_FROM_STORE") {
      const communeIdToCheck = useDifferentShippingAddress
        ? selectedCommune
        : customer.customer?.communeId;

      if (!enabledCommunes.includes(communeIdToCheck || "")) {
        toast.error(
          "La comuna seleccionada no está habilitada para despacho. Por favor, selecciona otra dirección."
        );
        return;
      }
    }

    const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
    const orderData = {
      cartId: customer.cartId,
      deliveryTypeId: deliveryTypeID,
      useDifferentShippingAddress,
      ...(isLoggedIn && useDifferentShippingAddress
        ? {
            shippingInfo: {
              addressLine1: customer.customer?.addressLine1,
              addressLine2: addressLine2,
              communeId: selectedCommune,
            },
          }
        : !isLoggedIn
        ? {
            customer: {
              firstname: customer.customer?.firstname,
              lastname: customer.customer?.lastname,
              phoneNumber: customer.customer?.phoneNumber,
              email: email,
              addressLine1: customer.customer?.addressLine1,
              addressLine2: addressLine2,
              communeId: communeIdToSend,
            },
          }
        : {}),
    };

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/orders?siteId=${SiteId}`,
        orderData,
        isLoggedIn
          ? {
              headers: { Authorization: `Bearer ${isLoggedIn}` },
            }
          : {}
      );

      if (response.data) {
        const idOrder = response.data.order.id;
        console.log("idOrder", idOrder);
        router.push(`/tienda/checkout/pago?orderId=${idOrder}`);
        setCookie("idOrder", idOrder);

        setCustomer(initialCustomerState);
        setCartData(null);
        setCartItems([]);
        setTotalItems(0);
        deleteCookie("cartId");
      }
      console.log("Order confirmation response:", response.data);
    } catch (error) {
      toast.error("Error al confirmar la compra. Por favor, intenta de nuevo.");
      console.error("Error al confirmar la compra:", error);
    }
  };

  const incrementQuantity = async (itemId: string) => {
    try {
      const itemIndex = cartItems.findIndex((item: any) => item.id === itemId);
      if (itemIndex !== -1) {
        const newQuantity = cartItems[itemIndex].quantity + 1;

        // Actualizar la cantidad en la API primero
        const cartId = getCookie("cartId");
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/carts/${cartId}/items/${itemId}?siteId=${SiteId}`,
          { quantity: newQuantity }
        );

        // Si la API se actualizó con éxito, actualizar el estado
        const updatedCartItems = [...cartItems];
        updatedCartItems[itemIndex] = {
          ...updatedCartItems[itemIndex],
          quantity: newQuantity,
        };
        setCartItems(updatedCartItems);

        // Opcionalmente, puedes volver a obtener los datos del carrito
        fetchCartData();
      }
    } catch (error: any) {
      console.error("Error incrementing quantity:", error);

      // Mostrar el mensaje de error si está disponible
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Error incrementing quantity. Please try again.");
      }
    }
  };

  const decrementQuantity = async (itemId: string) => {
    try {
      const itemIndex = cartItems.findIndex((item: any) => item.id === itemId);
      if (itemIndex !== -1 && cartItems[itemIndex].quantity > 1) {
        const updatedCartItems = [...cartItems];
        updatedCartItems[itemIndex] = {
          ...updatedCartItems[itemIndex],
          quantity: updatedCartItems[itemIndex].quantity - 1,
        };
        setCartItems(updatedCartItems);

        const cartId = getCookie("cartId") as string;
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/carts/${cartId}/items/${itemId}?siteId=${SiteId}`,
          { quantity: updatedCartItems[itemIndex].quantity }
        );
        fetchCartData();
      }
    } catch (error) {
      console.error("Error decrementing quantity:", error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
      const cartId = getCookie("cartId") as string;
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/carts/${cartId}/items/${itemId}?siteId=${SiteId}`
      );
      setCartItems((prevItems: any) =>
        prevItems.filter((item: any) => item.id !== itemId)
      );
      fetchCartData();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  useEffect(() => {
    fetchRegionsAndCommunes(false);
    fetchCartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Memoized values based on the selected delivery type
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
  const validateItemsForDeliveryType = (deliveryType: string) => {
    return cartItems.filter((item: any) => {
      if (deliveryType === "HOME_DELIVERY_WITHOUT_COURIER")
        return !itemAvailability[item.id]?.enabledForDelivery;
      if (deliveryType === "WITHDRAWAL_FROM_STORE")
        return !itemAvailability[item.id]?.enabledForWithdrawal;
      return false;
    });
  };

  const handleChangeDeliveryType = async (newValue: string) => {
    setDeliveryType(newValue);

    // Validar la opción de entrega según la disponibilidad del producto
    const invalidItems = cartItems.filter((item: any) => {
      if (newValue === DELIVERY_TYPES.DELIVERY)
        return !itemAvailability[item.id]?.enabledForDelivery;
      if (newValue === DELIVERY_TYPES.WITHDRAWAL)
        return !itemAvailability[item.id]?.enabledForWithdrawal;
      return false;
    });

    if (invalidItems.length > 0) {
      toast.error(
        `Los siguientes productos no son elegibles para ${
          newValue === DELIVERY_TYPES.WITHDRAWAL ? "retiro" : "delivery"
        }: ${invalidItems.map((item: any) => item.sku.product.name).join(", ")}`
      );
      return;
    }

    const selectedDeliveryType = availableDeliveryTypes.find(
      (type: any) => type.code === newValue
    );

    if (selectedDeliveryType) {
      setDeliveryTypeID(selectedDeliveryType.id);
      console.log(`Estableciendo deliveryTypeId para ${newValue}:`, selectedDeliveryType.id);
    } else {
      console.error("No se encontró el deliveryType seleccionado");
      toast.error("Error al seleccionar el tipo de entrega");
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
  };

  const loggedInRegion = isLoggedIn ? customer.customer?.regionName : "";
  const loggedInCommune = isLoggedIn ? customer.customer?.communeName : "";
  useEffect(() => {
    const fetchFreeShippingAmount = async () => {
      try {
        const contentBlockId = process.env.NEXT_PUBLIC_MONTOENVIOGRATIS_CONTENTBLOCK;
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/content-blocks/${contentBlockId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        const value = response.data.contentBlock.contentText;
        setFreeShippingAmount(Number(value));
      } catch (error) {
        setFreeShippingAmount(null);
      }
    };
    fetchFreeShippingAmount();
  }, []);

  const getAvailableDeliveryTypes = () => {
    const hasDeliveryAvailable = cartItems.every(
      (item: any) => itemAvailability[item.id]?.enabledForDelivery
    );
    const hasWithdrawalAvailable = cartItems.every(
      (item: any) => itemAvailability[item.id]?.enabledForWithdrawal
    );

    return {
      hasDeliveryAvailable,
      hasWithdrawalAvailable,
    };
  };

  return (
    <>
      <div>
        <title>Checkout</title>
        <div className="pb-12">
          <div className="flex flex-col items-center border-b bg-white py-4 sm:flex-row sm:px-10 lg:px-20 xl:px-32">
            <a href="#" className="text-2xl font-bold text-gray-800">
              Checkout
            </a>
            <div className="mt-4 py-2 text-xs sm:mt-0 sm:ml-auto sm:text-base">
              <div className="relative">
                <ul className="relative flex w-full items-center justify-between space-x-2 sm:space-x-4">
                  <li className="flex items-center space-x-3 text-left sm:space-x-4">
                    <a
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-semibold text-emerald-700"
                      href="#"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </a>
                    <span className="font-semibold text-gray-900">Tienda</span>
                  </li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <li className="flex items-center space-x-3 text-left sm:space-x-4">
                    <a
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 text-xs font-semibold text-white ring ring-gray-600 ring-offset-2"
                      href="#"
                    >
                      2
                    </a>
                    <span className="font-semibold text-gray-900">
                      Confirmación
                    </span>
                  </li>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <li className="flex items-center space-x-3 text-left sm:space-x-4">
                    <a
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-xs font-semibold text-white"
                      href="#"
                    >
                      3
                    </a>
                    <span className="font-semibold text-gray-500">Pago</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="grid sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-32">
            <div className="px-4 pt-8">
              <p className="text-xl font-medium">Detalle Orden</p>
              <p className="text-gray-400 mb-4">Listado de tu carrito</p>
                                              {/* Mensaje de cuánto falta para envío gratis */}
                                       {/*        {freeShippingAmount && (
                    <div className="flex items-center gap-4 mt-4 text-md font-bold text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-10"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                      />
                    </svg>
                      {cartData?.totals?.subtotalAmount >= freeShippingAmount ? (
                        "¡Envío gratis!"
                      ) : (
                        `Añade ${new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(freeShippingAmount - (cartData?.totals?.subtotalAmount || 0))} más a tu carrito para envío gratis`
                      )}
                    </div>
                  )} */}
              <div className="w-full bg-white shadow-lg relative ml-auto h-auto">
                <div className="overflow-auto p-6">
                  <Suspense fallback={<Loader />}>
                    <CartList
                      cartItems={cartItems}
                      incrementQuantity={incrementQuantity}
                      decrementQuantity={decrementQuantity}
                      removeItem={removeItem}
                      setItemAvailability={setItemAvailabilityHandler}
                    />
                  </Suspense>
                </div>
              </div>
            </div>
            <div className="md:mt-10 bg-white px-4 pt-8 lg:mt-0">
              <div className="space-y-4">

                              {/* Datos personales */}
                <div className="bg-gray-100 rounded-lg shadow-sm p-6">
                  <p className="text-xl font-medium">Datos Personales</p>
                  <p className="text-gray-400">Completa tus datos personales</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <label htmlFor="firstname" className="block mt-4">
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
                        className={`block w-full rounded-md border-dark/50 border p-1 mt-1 ${
                          isLoggedIn ? "bg-gray-200" : "bg-white"
                        }`}
                        disabled={!!isLoggedIn}
                      />
                    </label>
                    <label htmlFor="lastname" className="block mt-4">
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
                        className={`block w-full rounded-md border-dark/50 border p-1 mt-1 ${
                          isLoggedIn ? "bg-gray-200" : "bg-white"
                        }`}
                        disabled={!!isLoggedIn}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <label htmlFor="phoneNumber" className="block mt-4">
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
                        className={`block w-full rounded-md border-dark/50 border p-1 mt-1 ${
                          isLoggedIn ? "bg-gray-200" : "bg-white"
                        }`}
                        disabled={!!isLoggedIn}
                      />
                    </label>
                    <label htmlFor="email" className="block mt-4">
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
                        className={`block w-full rounded-md border-dark/50 border p-1 mt-1 ${
                          isLoggedIn ? "bg-gray-200" : "bg-white"
                        }`}
                        disabled={!!isLoggedIn}
                      />
                    </label>
                  </div>
                  <label htmlFor="addressLine2" className="block mt-4">
                    Indicaciones extra
                    <input
                      type="text"
                      id="addressLine2"
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
                      className="block w-full rounded-md text-sm border-dark/50 border p-2 mt-1 bg-white"
                    />
                  </label>
                </div>
                {/* Tipo de envío */}
                <div className="bg-gray-100 rounded-lg shadow-sm p-6">
                  <p className="text-xl font-medium">Tipo de envío</p>
                  <p className="text-gray-400">Selecciona el tipo de envío</p>
                  
                  {/* Formulario de tipo de entrega */}
                  <form className={`mt-5 grid gap-4 ${
                    getAvailableDeliveryTypes().hasDeliveryAvailable && getAvailableDeliveryTypes().hasWithdrawalAvailable
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : 'grid-cols-1'
                  }`}>
                    {!getAvailableDeliveryTypes().hasDeliveryAvailable && !getAvailableDeliveryTypes().hasWithdrawalAvailable ? (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-400 mr-2"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-red-700 font-medium">
                            Hay productos con conflictos en sus tipos de envío. Por favor, revisa tu carrito y ajusta los productos para que sean compatibles con al menos un tipo de envío.
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        {getAvailableDeliveryTypes().hasWithdrawalAvailable && (
                          /* Botón para retiro en tienda */
                          <div className="relative">
                            <input
                              className="peer hidden"
                              id="radio_retiroTienda"
                              type="radio"
                              name="radio"
                              value={DELIVERY_TYPES.WITHDRAWAL}
                              checked={deliveryType === DELIVERY_TYPES.WITHDRAWAL}
                              onChange={() => handleChangeDeliveryType(DELIVERY_TYPES.WITHDRAWAL)}
                            />
                            <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                            <label
                              className="bg-white peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                              htmlFor="radio_retiroTienda"
                            >
                              {/* Icono y texto para retiro en tienda */}
                              <div className="flex items-center w-full">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-8 h-8 flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                                  />
                                </svg>
                                <div className="ml-4">
                                  <span className="font-semibold block">
                                    Retiro en Tienda
                                  </span>
                                </div>
                              </div>
                            </label>
                          </div>
                        )}
                        {getAvailableDeliveryTypes().hasDeliveryAvailable && (
                          /* Botón para delivery */
                          <div className="relative">
                            <input
                              className="peer hidden"
                              id="radio_delivery"
                              type="radio"
                              name="radio"
                              value={DELIVERY_TYPES.DELIVERY}
                              checked={deliveryType === DELIVERY_TYPES.DELIVERY}
                              onChange={() => handleChangeDeliveryType(DELIVERY_TYPES.DELIVERY)}
                            />
                            <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                            <label
                              className="bg-white peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                              htmlFor="radio_delivery"
                            >
                              {/* Icono y texto para delivery */}
                              <div className="flex items-center w-full">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-8 h-8 flex-shrink-0"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={1.5}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                                  />
                                </svg>
                                <div className="ml-4">
                                  <span className="font-semibold block">Delivery</span>
                                </div>
                              </div>
                            </label>
                          </div>
                        )}
                      </>
                    )}
                  </form>

                  {/* Campos de dirección, región y comuna */}
                  {(deliveryType === "WITHDRAWAL_FROM_STORE" || deliveryType === "HOME_DELIVERY_WITHOUT_COURIER") && (
                    <div className="mt-5 grid gap-4">
                      {isLoggedIn && (
                        <>
                          <div className="grid gap-4">
                            <label htmlFor="addressLine1" className="block">
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
                                className={`block w-full rounded-md border-dark/50 border p-1 mt-1 ${
                                  isLoggedIn ? "bg-gray-200" : "bg-white"
                                }`}
                                disabled={!!isLoggedIn}
                              />
                            </label>
                          </div>

                          <div className="grid gap-4">
                            <label htmlFor="RegionName" className="block">
                              Región
                              <input
                                type="text"
                                id="RegionName"
                                name="RegionName"
                                value={loggedInRegion || ""}
                                className="block w-full rounded-md border-dark/50 border p-1 mt-1 bg-gray-200"
                                disabled
                              />
                            </label>
                            <label htmlFor="CommuneName" className="block">
                              Comuna
                              <input
                                type="text"
                                id="CommuneName"
                                name="CommuneName"
                                value={loggedInCommune || ""}
                                className="block w-full rounded-md border-dark/50 border p-1 mt-1 bg-gray-200"
                                disabled
                              />
                            </label>
                          </div>

                          <label className="block">
                            <input
                              type="checkbox"
                              checked={useDifferentShippingAddress}
                              onChange={() =>
                                setUseDifferentShippingAddress(
                                  !useDifferentShippingAddress
                                )
                              }
                            />
                            <span className="ml-2">
                              Enviar a una dirección diferente
                            </span>
                          </label>
                        </>
                      )}

                      {(!isLoggedIn || useDifferentShippingAddress) && (
                        <div className="grid gap-4">
                          <div className="grid gap-4">
                            <label htmlFor="addressLine1" className="block">
                              Dirección <span className="text-red-500">*</span>
                              <input
                                type="text"
                                id="addressLine1"
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
                                className="block w-full rounded-md text-sm border-dark/50 border p-2 mt-1 bg-white"
                                required
                              />
                            </label>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <label htmlFor="region" className="block">
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
                                    <option value="">Selecciona Región</option>
                                    {displayedRegions.map((region) => (
                                      <option key={region.id} value={region.id}>
                                        {region.name}
                                      </option>
                                    ))}
                                  </>
                                )}
                              </select>
                            </label>
                            <label htmlFor="commune" className="block">
                              Comuna <span className="text-red-500">*</span>
                              <select
                                id="commune"
                                value={selectedCommune}
                                onChange={handleCommuneChange}
                                className="block w-full rounded-md text-sm border-dark/50 border p-2 mt-1 bg-white"
                                disabled={!selectedRegion || loadingCommunes}
                              >
                                {loadingCommunes ? (
                                  <option>Cargando Comunas...</option>
                                ) : (
                                  <>
                                    <option value="">Selecciona Comuna</option>
                                    {displayedCommunes
                                      .filter(
                                        (commune) => commune.regionId === selectedRegion
                                      )
                                      .map((commune) => (
                                        <option key={commune.id} value={commune.id}>
                                          {commune.name}
                                        </option>
                                      ))}
                                  </>
                                )}
                              </select>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>


              </div>
              <button
                onClick={handleSubmitOrder}
                className="mt-8 mb-8 w-full rounded-md bg-gray-900 px-6 py-3 font-medium text-white"
              >
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(Checkout);
