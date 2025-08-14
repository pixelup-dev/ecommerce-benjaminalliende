"use client";
import React, {
  useEffect,
  useState,
  useMemo,
  Suspense,
  useCallback,
} from "react";
import { useAPI } from "@/app/Context/ProductTypeContext";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Customer, ItemAvailability } from "@/types/types";
import { jwtDecode } from "jwt-decode";
import Loader from "@/components/common/Loader";
import { COURIERS, DELIVERY_TYPES, Courier } from "@/app/config/couriers";
import LoaderProgress from "@/components/common/LoaderProgress";
const CartList = React.lazy(
  () => import("@/components/Core/CartCanva/CartList")
);

interface Region {
  id: string;
  name: string;
  hasDeliveryAvailable: boolean;
  hasCourierAvailable: boolean;
}

interface Commune {
  id: string;
  name: string;
  regionId: string;
}

interface CommuneResponse {
  delivery: Commune[];
  pickup: Commune[];
}

interface CommunesByRegion {
  [key: string]: {
    pickup?: Commune[];
    delivery?: Commune[];
  };
}

const Checkout: React.FC = () => {
  const [regionsDelivery, setRegionsDelivery] = useState<Region[]>([]);
  const [communesDelivery, setCommunesDelivery] = useState<Commune[]>([]);
  const [regionsPickup, setRegionsPickup] = useState<Region[]>([]);
  const [communesPickup, setCommunesPickup] = useState<Commune[]>([]);
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
    /* ************************ */
  /* PREDETERMINADO */
  /* ************************ */

/*   const [deliveryType, setDeliveryType] = useState<string>(
    DELIVERY_TYPES.WITHDRAWAL
  ); */
  const [deliveryType, setDeliveryType] = useState<string>("");
  const [deliveryTypeID, setDeliveryTypeID] = useState<string>("");
  const [itemAvailability, setItemAvailability] = useState<{
    [key: string]: ItemAvailability;
  }>({});
  const cartId = getCookie("cartId") as string | undefined;
  const [allRegions, setAllRegions] = useState<Region[]>([]);
  const [regionsForWithdrawal, setRegionsForWithdrawal] = useState<Region[]>(
    []
  );
  const [regionsForDelivery, setRegionsForDelivery] = useState<Region[]>([]);
  const [regionsForCourier, setRegionsForCourier] = useState<Region[]>([]);
  const [communesByRegion, setCommunesByRegion] = useState<CommunesByRegion>(
    {}
  );
  const [showLoader, setShowLoader] = useState(false);
  const [loaderMessage, setLoaderMessage] = useState("Calculando valor de despacho...");

  useEffect(() => {
    const fetchDeliveryTypeId = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/delivery-types?statusCode=ACTIVE`
        );
        const deliveryTypes = response.data.deliveryTypes;
        setAvailableDeliveryTypes(deliveryTypes);

        // Establecer el deliveryTypeId por defecto para retiro en tienda
        const withdrawalType = deliveryTypes.find(
          (type: any) => type.code === DELIVERY_TYPES.WITHDRAWAL
        );
        if (withdrawalType) {
          setDeliveryTypeID(withdrawalType.id);
        } else {
          console.error("No se encontró el deliveryType para retiro en tienda");
        }
      } catch (error) {
        console.error("Error al obtener los tipos de entrega:", error);
        toast.error("Error al cargar los tipos de entrega");
      }
    };

    fetchDeliveryTypeId();
  }, []);

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
    const fetchAllRegions = async () => {
      setLoadingRegions(true);
      try {
        // Fetch para retiro en tienda (sin filtros)
        const withdrawalUrl = `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/CL/regions?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;
        const withdrawalResponse = await axios.get(withdrawalUrl);
        setRegionsForWithdrawal(withdrawalResponse.data.regions);
        console.log("Regiones para retiro:", withdrawalResponse.data.regions);

        // Fetch para delivery (con hasDeliveryAvailable)
        const deliveryUrl = `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/CL/regions?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&hasDeliveryAvailable=true`;
        const deliveryResponse = await axios.get(deliveryUrl);
        setRegionsForDelivery(deliveryResponse.data.regions);
        console.log("Regiones para delivery:", deliveryResponse.data.regions);

        // Fetch para Starken (con hasDeliveryAvailable y courierId)
        const starkenUrl = `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/CL/regions?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}&hasDeliveryAvailable=true&courierId=${COURIERS.STARKEN.id}`;
        const starkenResponse = await axios.get(starkenUrl);
        setRegionsForCourier(starkenResponse.data.regions);
        console.log("Regiones para Starken:", starkenResponse.data.regions);
      } catch (error) {
        console.error("Error al cargar las regiones:", error);
        toast.error("Error al cargar las regiones");
      } finally {
        setLoadingRegions(false);
      }
    };

    fetchAllRegions();
  }, []);

  const getCommunesUrl = (
    regionId: string,
    deliveryType: string,
    isDelivery: boolean
  ) => {
    // URL base solo con siteId
    const baseUrl = `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/CL/regions/${regionId}/communes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

    switch (deliveryType) {
      case DELIVERY_TYPES.WITHDRAWAL:
        return baseUrl; // Solo siteId para retiro en tienda
      case DELIVERY_TYPES.DELIVERY:
        return `${baseUrl}&hasDeliveryAvailable=true`; // siteId + hasDeliveryAvailable para delivery
      case DELIVERY_TYPES.COURIER:
        return `${baseUrl}&hasDeliveryAvailable=true&courierId=${COURIERS.STARKEN.id}`; // siteId + hasDeliveryAvailable + courierId para Starken
      default:
        return baseUrl;
    }
  };

  const fetchRegionsAndCommunes = async (applyShippingZonesFilter: boolean) => {
    setLoadingRegions(true);
    try {
      // Obtener regiones según el tipo de entrega
      let regionsUrl = `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/CL/regions?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

      if (deliveryType === DELIVERY_TYPES.DELIVERY) {
        regionsUrl += "&hasDeliveryAvailable=true";
      } else if (deliveryType === DELIVERY_TYPES.COURIER) {
        regionsUrl += `&hasDeliveryAvailable=true&courierId=${COURIERS.STARKEN.id}`;
      }

      const regionsResponse = await axios.get(regionsUrl);
      const allRegions: Region[] = regionsResponse.data.regions;

      // Fetch communes para las regiones obtenidas
      const fetchCommunesForRegion = async (
        regionId: string
      ): Promise<CommuneResponse> => {
        const url = getCommunesUrl(regionId, deliveryType, true);
        const response = await axios.get(url);
        return {
          delivery: response.data.communes.map((commune: any) => ({
            id: commune.id,
            name: commune.name,
            regionId: regionId,
          })),
          pickup: response.data.communes.map((commune: any) => ({
            id: commune.id,
            name: commune.name,
            regionId: regionId,
          })),
        };
      };

      // Fetch communes para todas las regiones obtenidas
      const communesPromises = allRegions.map((region) =>
        fetchCommunesForRegion(region.id)
      );
      const communesResults = await Promise.all(communesPromises);

      // Asignar regiones y comunas según el tipo de entrega
      switch (deliveryType) {
        case DELIVERY_TYPES.WITHDRAWAL:
          setRegionsPickup(allRegions);
          setCommunesPickup(communesResults.flatMap((result) => result.pickup));
          break;

        case DELIVERY_TYPES.DELIVERY:
          const regionsWithDelivery = allRegions.filter((region) => {
            const communesForRegion = communesResults.find(
              (result, index) => allRegions[index].id === region.id
            );
            return (communesForRegion?.delivery?.length ?? 0) > 0;
          });
          setRegionsDelivery(regionsWithDelivery);
          setCommunesDelivery(
            communesResults.flatMap((result) => result.delivery)
          );
          break;

        case DELIVERY_TYPES.COURIER:
          const regionsWithCourier = allRegions.filter((region) => {
            const communesForRegion = communesResults.find(
              (result, index) => allRegions[index].id === region.id
            );
            return (communesForRegion?.delivery?.length ?? 0) > 0;
          });
          setRegionsDelivery(regionsWithCourier);
          setCommunesDelivery(
            communesResults.flatMap((result) => result.delivery)
          );
          break;
      }

      // Actualizar las comunas habilitadas
      const enabledCommunesList = communesResults.flatMap((result) =>
        result.delivery.map((commune) => commune.id)
      );
      setEnabledCommunes(enabledCommunesList);
    } catch (error) {
      console.error("Error fetching regions and communes:", error);
      toast.error("Error al cargar las regiones y comunas");
    } finally {
      setLoading(false);
      setLoadingRegions(false);
    }
  };
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
          deliveryType === DELIVERY_TYPES.DELIVERY ? "delivery" : "retiro"
        }: ${invalidItems.map((item: any) => item.sku.product.name).join(", ")}`
      );
      return;
    }
    const addressLine2 = customer.customer?.addressLine2?.trim()
      ? customer.customer.addressLine2
      : "Sin Comentarios";
    let communeIdToSend: string | undefined;
    if (deliveryType === DELIVERY_TYPES.WITHDRAWAL && !isLoggedIn) {
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
    if (
      deliveryType !== DELIVERY_TYPES.WITHDRAWAL &&
      deliveryType !== DELIVERY_TYPES.COURIER
    ) {
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
      // Agregar courierId solo si es Starken, usando el ID correcto del courier
      ...(deliveryType === DELIVERY_TYPES.COURIER && {
        courierId: COURIERS.STARKEN.id,
      }),
    };
    try {
      setShowLoader(true);
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
        setLoaderMessage("Redirigiendo a la página de pago...");
        router.push(`/tienda/checkout/pago?orderId=${idOrder}`);
        setCookie("idOrder", idOrder);
        setCustomer(initialCustomerState);
        setCartData(null);
        setCartItems([]);
        setTotalItems(0);
        deleteCookie("cartId");
      }
      console.log("Order confirmation response:", response.data);
    } catch (error: any) {
      setShowLoader(false);
      if (error.response?.data?.message?.toLowerCase().includes("comuna de destino no disponible para despacho")) {
        toast.error("Comuna de destino no disponible para despacho");
      } else {
        toast.error("Error al confirmar la compra. Por favor, intenta de nuevo.");
      }
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
  const getCachedCommunes = useMemo(() => {
    if (!selectedRegion) return [];
    const cachedData = communesByRegion[selectedRegion];

    if (deliveryType === DELIVERY_TYPES.WITHDRAWAL) {
      return cachedData?.pickup || [];
    } else {
      return cachedData?.delivery || [];
    }
  }, [selectedRegion, deliveryType, communesByRegion]);
  const fetchCommunesForRegion = async (regionId: string) => {
    // Si ya tenemos las comunas en caché para este tipo de entrega, las usamos
    const cachedData = communesByRegion[regionId];
    const needsPickupData =
      deliveryType === DELIVERY_TYPES.WITHDRAWAL && !cachedData?.pickup;
    const needsDeliveryData =
      (deliveryType === DELIVERY_TYPES.DELIVERY ||
        deliveryType === DELIVERY_TYPES.COURIER) &&
      !cachedData?.delivery;

    if (!needsPickupData && !needsDeliveryData) {
      console.log("Usando comunas en caché para la región:", regionId);
      if (deliveryType === DELIVERY_TYPES.WITHDRAWAL) {
        setCommunesPickup(cachedData.pickup || []);
      } else {
        setCommunesDelivery(cachedData.delivery || []);
      }
      return;
    }

    setLoadingCommunes(true);
    try {
      const url = getCommunesUrl(regionId, deliveryType, true);
      const response = await axios.get(url);
      
      // Verificar si la respuesta contiene el mensaje de error específico
      if (response.data.message && response.data.message.toLowerCase().includes("comuna de destino no disponible para despacho")) {
        toast.error("La comuna seleccionada no está disponible para despacho");
        return;
      }

      const communes = response.data.communes.map((commune: any) => ({
        id: commune.id,
        name: commune.name,
        regionId: regionId,
      }));

      // Actualizar el caché y el estado correspondiente
      setCommunesByRegion((prev) => ({
        ...prev,
        [regionId]: {
          ...prev[regionId],
          [deliveryType === DELIVERY_TYPES.WITHDRAWAL ? "pickup" : "delivery"]:
            communes,
        },
      }));

      if (deliveryType === DELIVERY_TYPES.WITHDRAWAL) {
        setCommunesPickup(communes);
      } else {
        setCommunesDelivery(communes);
      }

      console.log(
        `Comunas cargadas para la región ${regionId} (${deliveryType}):`,
        communes
      );
    } catch (error) {
      console.error("Error fetching communes:", error);
      toast.error("Error al cargar las comunas");
    } finally {
      setLoadingCommunes(false);
    }
  };

  const displayedRegions = useMemo(() => {
    switch (deliveryType) {
      case DELIVERY_TYPES.WITHDRAWAL:
        return regionsForWithdrawal;
      case DELIVERY_TYPES.DELIVERY:
        return regionsForDelivery;
      case DELIVERY_TYPES.COURIER:
        return regionsForCourier;
      default:
        return [];
    }
  }, [
    deliveryType,
    regionsForWithdrawal,
    regionsForDelivery,
    regionsForCourier,
  ]);

  const displayedCommunes = useMemo(() => {
    return getCachedCommunes;
  }, [getCachedCommunes]);
  const handleRegionChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newRegionId = e.target.value;
    setSelectedRegion(newRegionId);
    setSelectedCommune("");
    setCustomer((prevState) => ({
      ...prevState,
      customer: {
        ...prevState.customer,
        communeId: "",
      },
    }));

    if (newRegionId) {
      await fetchCommunesForRegion(newRegionId);
    }
  };
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
      if (
        deliveryType === DELIVERY_TYPES.DELIVERY ||
        deliveryType === DELIVERY_TYPES.COURIER
      )
        return !itemAvailability[item.id]?.enabledForDelivery;
      if (deliveryType === DELIVERY_TYPES.WITHDRAWAL)
        return !itemAvailability[item.id]?.enabledForWithdrawal;
      return false;
    });
  };
  const handleChangeDeliveryType = async (newValue: string) => {
    setDeliveryType(newValue);
    // Validar la opción de entrega según la disponibilidad del producto
    const invalidItems = cartItems.filter((item: any) => {
      if (
        newValue === DELIVERY_TYPES.DELIVERY ||
        newValue === DELIVERY_TYPES.COURIER
      )
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

    // Asignar el ID correcto según el tipo de entrega
    if (newValue === DELIVERY_TYPES.COURIER) {
      const courier = Object.values(COURIERS).find(
        (c) => c.code === DELIVERY_TYPES.COURIER
      );
      if (courier) {
        setDeliveryTypeID(courier.deliveryTypeId);
        console.log(
          "Estableciendo deliveryTypeId para Starken:",
          courier.deliveryTypeId
        );
      }
    } else {
      const selectedDeliveryType = availableDeliveryTypes.find(
        (type: any) => type.code === newValue
      );
      if (selectedDeliveryType) {
        setDeliveryTypeID(selectedDeliveryType.id);
        console.log(
          `Estableciendo deliveryTypeId para ${newValue}:`,
          selectedDeliveryType.id
        );
      } else {
        console.error("No se encontró el deliveryType seleccionado");
        toast.error("Error al seleccionar el tipo de entrega");
      }
    }

    // Resetear la selección de región y comuna
    setSelectedRegion("");
    setSelectedCommune("");

    // Actualizar las comunas habilitadas según el tipo de entrega
    let enabledCommunesList: string[] = [];
    switch (newValue) {
      case DELIVERY_TYPES.WITHDRAWAL:
        // Para retiro, todas las comunas están habilitadas
        enabledCommunesList = communesPickup.map((commune) => commune.id);
        break;
      case DELIVERY_TYPES.DELIVERY:
      case DELIVERY_TYPES.COURIER:
        // Para delivery y courier, solo las comunas con delivery disponible
        enabledCommunesList = communesDelivery.map((commune) => commune.id);
        break;
    }
    setEnabledCommunes(enabledCommunesList);

    console.log(`Cambiando a tipo de entrega: ${newValue}`);
  };
  const loggedInRegion = isLoggedIn ? customer.customer?.regionName : "";
  const loggedInCommune = isLoggedIn ? customer.customer?.communeName : "";

  useEffect(() => {
    const fetchAllRegions = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/CL/regions?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        setAllRegions(response.data.regions);
      } catch (error) {
        console.error("Error fetching all regions:", error);
        toast.error("Error al cargar las regiones");
      }
    };
    fetchAllRegions();
  }, []);

  return (
    <>
      {showLoader && <LoaderProgress message={loaderMessage} />}
      <div>
        <title>Checkout</title>
        <div className="pb-12">
          <div className="flex flex-col items-center border-b bg-white py-4 sm:flex-row sm:px-10 lg:px-20 xl:px-32">
            <a
              href="#"
              className="text-2xl font-bold text-gray-800"
            >
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
                        className={`block w-full rounded-md border-dark/50 border p-1 mt-1 ${
                          isLoggedIn ? "bg-gray-200" : "bg-white"
                        }`}
                        disabled={!!isLoggedIn}
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
                        className={`block w-full rounded-md border-dark/50 border p-1 mt-1 ${
                          isLoggedIn ? "bg-gray-200" : "bg-white"
                        }`}
                        disabled={!!isLoggedIn}
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
                        className={`block w-full rounded-md border-dark/50 border p-1 mt-1 ${
                          isLoggedIn ? "bg-gray-200" : "bg-white"
                        }`}
                        disabled={!!isLoggedIn}
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
                  <form className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Botón para retiro en tienda */}
                    <div className="relative">
                      <input
                        className="peer hidden"
                        id="radio_retiroTienda"
                        type="radio"
                        name="radio"
                        value="WITHDRAWAL_FROM_STORE"
                        checked={deliveryType === DELIVERY_TYPES.WITHDRAWAL}
                        onChange={() =>
                          handleChangeDeliveryType(DELIVERY_TYPES.WITHDRAWAL)
                        }
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
                    {/* Botón para Starken */}
                    <div className="relative">
                      <input
                        className="peer hidden"
                        id="radio_starken"
                        type="radio"
                        name="radio"
                        value="HOME_DELIVERY_WITH_COURIER"
                        checked={deliveryType === DELIVERY_TYPES.COURIER}
                        onChange={() =>
                          handleChangeDeliveryType(DELIVERY_TYPES.COURIER)
                        }
                      />
                      <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                      <label
                        className="bg-white peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                        htmlFor="radio_starken"
                      >
                        {/* Icono y texto para Starken */}
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
                            <span className="font-semibold block">Starken</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  </form>

                  {/* Campos de dirección, región y comuna */}
                  {(deliveryType === DELIVERY_TYPES.WITHDRAWAL || deliveryType === DELIVERY_TYPES.COURIER) && (
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
                                    {deliveryType === DELIVERY_TYPES.WITHDRAWAL &&
                                      regionsForWithdrawal.map((region) => (
                                        <option
                                          key={region.id}
                                          value={region.id}
                                        >
                                          {region.name}
                                        </option>
                                      ))}
                                    {deliveryType === DELIVERY_TYPES.COURIER &&
                                      regionsForCourier.map((region) => (
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
                            <label htmlFor="commune" className="block">
                              Comuna <span className="text-red-500">*</span>
                              <select
                                id="commune"
                                value={selectedCommune}
                                onChange={handleCommuneChange}
                                className="block w-full rounded-md text-sm border-dark/50 border p-2 mt-1 bg-white"
                                disabled={!selectedRegion || loadingCommunes}
                              >
                                <option value="">Selecciona Comuna</option>
                                {deliveryType === DELIVERY_TYPES.WITHDRAWAL &&
                                  communesPickup
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
                                {deliveryType === DELIVERY_TYPES.COURIER &&
                                  communesDelivery
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
