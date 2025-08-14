"use client";
import React, { useEffect, useState } from "react";
import { useAPI } from "@/app/Context/ProductTypeContext";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import axios from "axios";
import toast from "react-hot-toast";
import CartList from "@/components/Core/CartCanva/CartList";
import { useRouter } from "next/navigation";
import { Customer, ItemAvailability } from "@/types/types";
import { jwtDecode } from "jwt-decode";
import Loader from "@/components/common/Loader";
import Link from "next/link";

const Checkout: React.FC = () => {
  const [regions, setRegions] = useState<{ id: string; name: string }[]>([]);
  const [communes, setCommunes] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true); //cambiar a false cuando el boton de terminos este habilitado
  const [enabledCommunes, setEnabledCommunes] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedCommune, setSelectedCommune] = useState<string>("");
  const {
    cartItems,
    setCartItems,
    fetchCartData,
    cartData,
    setCartData,
    setTotalItems,
  } = useAPI();

  const router = useRouter();

  const [deliveryType, setDeliveryType] = useState<string>(""); // Valor predeterminado: entrega a domicilio
  const [deliveryTypeID, setDeliveryTypeID] = useState<string>("");
  const [itemAvailability, setItemAvailability] = useState<{
    [key: string]: ItemAvailability;
  }>({});
  const cartId = getCookie("cartId") as string | undefined;

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

  const handleSubmitOrder = async () => {
    if (!termsAccepted) {
      toast.error("Debes aceptar los términos y condiciones para continuar.");
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

    console.log("Submitting order with customer data:", {
      ...customer,
      deliveryTypeId: deliveryTypeID, // Asegurarse de incluir el deliveryTypeID
      addressLine2,
      communeId: communeIdToSend,
    });
    if (
      !isLoggedIn &&
      (!customer.customer?.firstname ||
        !customer.customer?.lastname ||
        !customer.customer?.phoneNumber ||
        !customer.customer?.email ||
        !customer.customer?.addressLine1 ||
        (deliveryType !== "WITHDRAWAL_FROM_STORE" &&
          !customer.customer?.communeId))
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
              email: customer.customer?.email,
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
        setCartItems([]);
        setCartData({});
        setTotalItems(0);
        deleteCookie("cartId");
        setCustomer(initialCustomerState);
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
        const updatedCartItems = [...cartItems];
        updatedCartItems[itemIndex] = {
          ...updatedCartItems[itemIndex],
          quantity: updatedCartItems[itemIndex].quantity + 1,
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
      console.error("Error incrementing quantity:", error);
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

  const fetchRegionsAndCommunes = async (applyShippingZonesFilter: boolean) => {
    setLoading(true); // Iniciar loader
    try {
      const Pais = "CL";
      const regionsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );

      const allRegions = regionsResponse.data.regions;
      const filteredRegions: { id: string; name: string }[] = [];
      const allCommunes: { id: string; name: string; regionId: string }[] = [];

      for (const region of allRegions) {
        const communesResponse = await axios.get(
          `${
            process.env.NEXT_PUBLIC_API_URL_CLIENTE
          }/api/v1/countries/${Pais}/regions/${region.id}/communes?siteId=${
            process.env.NEXT_PUBLIC_API_URL_SITEID
          }${applyShippingZonesFilter ? "&hasDeliveryAvailable=true" : ""}`
        );
        const communesData = communesResponse.data.communes;
        if (communesData.length > 0) {
          filteredRegions.push({ id: region.id, name: region.name });
          allCommunes.push(
            ...communesData.map((commune: any) => ({
              id: commune.id,
              name: commune.name,
              regionId: region.id,
            }))
          );
        }
      }

      setRegions(filteredRegions);
      setCommunes(allCommunes);
      setEnabledCommunes(allCommunes.map((commune: any) => commune.id));
    } catch (error) {
      console.error("Error fetching regions and communes:", error);
    } finally {
      setLoading(false); // Terminar loader
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setSelectedRegion(regionId);
    setSelectedCommune("");
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

  const validateDeliveryOption = (option: string) => {
    const invalidItems = cartItems.filter((item: any) => {
      if (option === "HOME_DELIVERY_WITHOUT_COURIER")
        return !itemAvailability[item.id]?.enabledForDelivery;
      if (option === "WITHDRAWAL_FROM_STORE")
        return !itemAvailability[item.id]?.enabledForWithdrawal;
      return false;
    });

    if (invalidItems.length > 0) {
      toast.error(
        `Los siguientes productos no son elegibles para ${
          option === "HOME_DELIVERY_WITHOUT_COURIER" ? "delivery" : "retiro"
        }: ${invalidItems.map((item: any) => item.sku.product.name).join(", ")}`
      );
      return false;
    }

    return true;
  };

  const handleChangeDeliveryType = async (newValue: string) => {
    if (validateDeliveryOption(newValue)) {
      // Desplazar la ventana a la parte superior de la página
      window.scrollTo({ top: 0, behavior: "smooth" });

      setDeliveryType(newValue);
      setLoading(true); // Iniciar loader

      try {
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
      } catch (error) {
        console.error("Error al obtener los tipos de entrega:", error);
      }

      // Si el usuario no está logueado y selecciona retiro, mostrar todas las comunas
      if (!isLoggedIn && newValue === "WITHDRAWAL_FROM_STORE") {
        await fetchRegionsAndCommunes(false); // false para no aplicar el filtro
      } else {
        await fetchRegionsAndCommunes(true); // true para aplicar el filtro de shipping zones
      }
    }
  };

  useEffect(() => {
    fetchCartData();
    fetchRegionsAndCommunes(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loggedInRegion = isLoggedIn ? customer.customer?.regionName : "";
  const loggedInCommune = isLoggedIn ? customer.customer?.communeName : "";

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
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
                      <span className="font-semibold text-gray-900">
                        Tienda
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
                    <CartList
                      cartItems={cartItems}
                      incrementQuantity={incrementQuantity}
                      decrementQuantity={decrementQuantity}
                      removeItem={removeItem}
                      setItemAvailability={setItemAvailabilityHandler}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-10 bg-gray-100 px-4 pt-8 lg:mt-0">
                <p className="text-xl font-medium">Datos Personales</p>
                <p className="text-gray-400">
                  Completa tus datos de Personales
                </p>
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
                        Email
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
                  </div>

                  {isLoggedIn && (
                    <>
                      <div className="mt-2 grid gap-4 mx-4">
                        <label
                          htmlFor="RegionName"
                          className="block mt-4"
                        >
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
                        <label
                          htmlFor="CommuneName"
                          className="block "
                        >
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

                      <label className="block mt-4 ml-6">
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
                    <div className="mt-5 grid gap-4">
                      <div className="grid grid-cols-2 gap-4 px-4">
                        <label
                          htmlFor="RegionId"
                          className="block"
                        >
                          Región
                          <select
                            id="region"
                            value={selectedRegion}
                            onChange={(event) => {
                              handleRegionChange(event);
                            }}
                            className="block w-full rounded-md text-sm border-dark/50 border p-2 mt-1 bg-white"
                          >
                            <option>Selecciona Región</option>
                            {regions.map((region) => (
                              <option
                                key={region.id}
                                value={region.id}
                              >
                                {region.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label
                          htmlFor="communeId"
                          className="block"
                        >
                          Comuna
                          <select
                            id="commune"
                            value={selectedCommune}
                            onChange={(event) => {
                              handleCommuneChange(event);
                            }}
                            className="block w-full rounded-md text-sm border-dark/50 border p-2 mt-1 bg-white"
                          >
                            <option>Selecciona Comuna</option>
                            {communes
                              .filter(
                                (commune: any) =>
                                  commune.regionId === selectedRegion
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
                      <div className="grid grid-cols-2 gap-4 px-4">
                        <label
                          htmlFor="addressLine1"
                          className="block"
                        >
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

                        <label
                          htmlFor="addressLine2"
                          className="block"
                        >
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
                    </div>
                  )}
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
                    <span className="sr-only">Delivery</span>
                    <div className="flex flex-col">
                      <div>
                        Cuando selecciones <strong>Delivery</strong>, sólo
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
                            Retiro: 0-1 Día
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
                          <span className="mt-2 font-semibold">Delivery</span>
                          <p className="text-slate-500 text-sm leading-6">
                            Delivery: 2-4 Days
                          </p>
                        </div>
                      </label>
                    </div>
                  </form>
                </div>
                {/*                 <label className="block mt-4 ml-6">
  <input
    type="checkbox"
    checked={termsAccepted}
    onChange={() => setTermsAccepted(!termsAccepted)}
  />
  <span className="ml-2">Acepto <span className="font-bold"><Link href="">términos y condiciones</Link></span></span>
</label>
 */}
                <button
                  onClick={handleSubmitOrder}
                  className="mt-4 mb-8 w-full rounded-md bg-gray-900 px-6 py-3 font-medium text-white"
                >
                  Confirmar Compra
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;
