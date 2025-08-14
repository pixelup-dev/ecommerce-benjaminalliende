"use client";
import React, { useState, useEffect, FormEvent, useRef } from "react";
import { getCookie } from "cookies-next";
import axios from "axios";
import { obtenerCuponesBO } from "@/app/utils/obtenerCuponesBO";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import { toast } from "react-hot-toast";
import { title } from "process";

function CuponForm() {
  const [currencyCode, setCurrencyCode] = useState("");
  const [code, setCode] = useState("");
  const productsRef = useRef<HTMLDivElement>(null);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("FIXED_AMOUNT");
  const [amount, setAmount] = useState<number | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [hasFreeShipping, setHasFreeShipping] = useState(false);
  const [expirationDate, setExpirationDate] = useState("");
  const [cupones, setCupones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [editingCuponId, setEditingCuponId] = useState<string | null>(null);
  const [hasProPlan, setHasProPlan] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<any>(null);

  const showDeleteModal = (coupon: any) => {
    setCouponToDelete(coupon);
    setIsDeleteModalVisible(true);
  };

  const hideDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setCouponToDelete(null);
  };

  const confirmDeleteCoupon = async () => {
    if (couponToDelete) {
      await handleDelete(couponToDelete.id);
      hideDeleteModal();
    }
  };

  const [codeError, setCodeError] = useState<string>("");
  const [amountError, setAmountError] = useState<string>("");
  const [percentageError, setPercentageError] = useState<string>("");
  const [expirationDateError, setExpirationDateError] = useState<string>("");
  const [typeError, setTypeError] = useState<string>("");

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
    // Validar que no tenga espacios y no exceda 40 caracteres
    if (/\s/.test(value)) {
      setCodeError("El código no puede contener espacios.");
    } else if (value.length > 40) {
      setCodeError("El código no puede tener más de 40 caracteres.");
    } else {
      setCodeError("");
      setCode(value);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Filtrar para que solo se permitan números
    const sanitizedValue = value.replace(/[^0-9]/g, "");

    if (sanitizedValue === "") {
      setAmount(null);
      setAmountError("Ingrese un monto válido mayor que cero");
    } else {
      const parsedValue = parseInt(sanitizedValue, 10);

      if (parsedValue <= 0) {
        setAmountError("Ingrese un monto válido mayor que cero");
        setAmount(null);
      } else {
        setAmountError("");
        setAmount(parsedValue);
      }
    }
  };

  const handlePercentageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setPercentage(value);

    if (isNaN(value) || value <= 0 || value > 100) {
      setPercentageError("Ingrese un porcentaje válido entre 0 y 100");
    } else {
      setPercentageError("");
    }
  };

  const handleExpirationDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setExpirationDate(value);

    const today = new Date();
    const selectedDate = new Date(value);

    if (value === "" || selectedDate < today) {
      setExpirationDateError("Seleccione una fecha de expiración válida");
    } else {
      setExpirationDateError("");
    }
  };

  useEffect(() => {
    fetchCupones();
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

      // Buscar una suscripción activa que contenga la palabra "pro"
      const activeSubscription = response.data.subscriptions.find(
        (sub: any) =>
          (sub.statusCode === "ACTIVE" || sub.statusCode === "EXPIRED") &&
          sub.name.toLowerCase().includes("pro")
      );

      setHasProPlan(!!activeSubscription);
    } catch (error) {
      console.error("Error verificando plan de suscripción:", error);
      setHasProPlan(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchCupones = async () => {
    try {
      const PageNumber = 1;
      const PageSize = 50;

      const token = getCookie("AdminTokenAuth");

      const data = await obtenerCuponesBO(PageNumber, PageSize, token);
      setCupones(data.discountCoupons);
      console.log("Cupones:", data.discountCoupons);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error as Error);
    }
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    // Ajustar la fecha para evitar problemas de zona horaria
    const fechaUTC = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );
    const dia = fechaUTC.getDate().toString().padStart(2, "0");
    const mes = (fechaUTC.getMonth() + 1).toString().padStart(2, "0");
    const año = fechaUTC.getFullYear();
    return `${dia}-${mes}-${año}`;
  };

  const formatDateTime = (dateString: any) => {
    const date = new Date(dateString);
    // Ajustar la fecha para evitar problemas de zona horaria
    const fechaUTC = new Date(
      date.getTime() + date.getTimezoneOffset() * 60000
    );
    const dia = fechaUTC.getDate().toString().padStart(2, "0");
    const mes = (fechaUTC.getMonth() + 1).toString().padStart(2, "0");
    const año = fechaUTC.getFullYear();
    const horas = fechaUTC.getHours().toString().padStart(2, "0");
    const minutos = fechaUTC.getMinutes().toString().padStart(2, "0");
    return `${dia}-${mes}-${año} ${horas}:${minutos}`;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (code.trim() === "") {
      setCodeError("El código no puede estar vacío");
      return;
    }

    if (type !== "FIXED_AMOUNT" && type !== "PERCENTAGE") {
      setTypeError("Selecciona un tipo de descuento válido");
      return;
    }

    if (expirationDate.trim() === "") {
      setExpirationDateError("La fecha de vigencia no puede estar vacía");
      return;
    }

    if (
      type === "FIXED_AMOUNT" &&
      (isNaN(Number(amount)) || (Number(amount) <= 0 && !hasFreeShipping))
    ) {
      setAmountError("Ingrese un monto válido mayor que cero");
      return;
    }

    let parsedPercentage: number | null = null;

    if (typeof percentage === "string") {
      parsedPercentage = parseFloat(percentage);
    } else if (typeof percentage === "number") {
      parsedPercentage = percentage;
    }

    if (
      type === "PERCENTAGE" &&
      (parsedPercentage === null ||
        isNaN(parsedPercentage) ||
        parsedPercentage <= 0 ||
        parsedPercentage > 100)
    ) {
      setPercentageError("Ingrese un porcentaje válido entre 0 y 100");
      return;
    }

    try {
      const token = getCookie("AdminTokenAuth");

      let cupon: any = {
        code,
        description: "pixelup cupon",
        type,
        amount: type === "FIXED_AMOUNT" ? amount : null,
        percentage: type === "PERCENTAGE" ? percentage : null,
        hasFreeShipping,
        statusCode: "ACTIVE",
        expirationDate: expirationDate ? expirationDate : null,
      };

      if (type === "FIXED_AMOUNT") {
        const currencyResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/currency-codes?pageNumber=1&pageSize=50&statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        cupon.currencyCodeId = currencyResponse.data.currencyCodes[0].id;
      }

      // Eliminar el campo currencyCodeId si el tipo es "PERCENTAGE"
      if (type === "PERCENTAGE") {
        delete cupon.currencyCodeId;
      }

      if (editingCuponId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/discount-coupons/${editingCuponId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          cupon,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Cupón actualizado con éxito");
      } else {
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/discount-coupons?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          cupon,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Cupón creado con éxito");
      }

      fetchCupones();
      resetForm();
    } catch (error) {
      console.error("Error creando/editando cupón:", error);
      toast.error("Ocurrió un error al crear/editar el cupón");
    }
  };

  const handleEdit = async (cupon: any) => {
    try {
      const token = getCookie("AdminTokenAuth");

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/discount-coupons/${cupon.id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const cuponDetail = response.data.discountCoupon;

      setEditingCuponId(cupon.id);
      setCode(cuponDetail.code);
      setDescription(cuponDetail.description);
      setType(cuponDetail.type);
      setAmount(cuponDetail.amount || 0);
      setPercentage(cuponDetail.percentage || 0);
      setHasFreeShipping(cuponDetail.hasFreeShipping);
      productsRef.current?.scrollIntoView({ behavior: "smooth" });

      const expirationDateISO = cuponDetail.expirationDate;
      const expirationDateOnly = expirationDateISO.split("T")[0];
      setExpirationDate(expirationDateOnly);

      if (cuponDetail.percentage !== 0) {
        setType("PERCENTAGE");
        setPercentage(cuponDetail.percentage);
      } else {
        setType("FIXED_AMOUNT");
        setAmount(cuponDetail.amount || 0);
      }
    } catch (error) {
      console.error("Error obteniendo detalle del cupón:", error);
    }
  };

  const handleDelete = async (couponId: any) => {
    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/discount-coupons/${couponId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Cupón eliminado:", response.data);
      fetchCupones();
    } catch (error) {
      console.error("Error eliminando cupón:", error);
      toast.error("Ocurrió un error al eliminar el cupón");
    }
  };

  const resetForm = () => {
    setEditingCuponId(null);
    setCode("");
    setDescription("");
    setType("FIXED_AMOUNT");
    setAmount(null);
    setPercentage(null);
    setHasFreeShipping(false);
    setExpirationDate("");
  };
  const handleFreeShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setHasFreeShipping(isChecked);

    if (isChecked && (amount === null || amount === undefined)) {
      setAmount(0);
    } else if (!isChecked && amount === 0) {
      setAmount(null); // Elimina el monto solo si es 0
    }
  };

  return (
    <>
      <title>Cupones</title>
      <section className=" mx-4 py-10">
        <Breadcrumb pageName="Cupones" />
        
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
                <p>La función Cupones de Descuento es exclusiva del Plan Pro. Puedes actualizar tu plan en la sección <a href="/dashboard/suscripciones/estado" rel="noopener noreferrer" className="underline"> Suscripción.</a> </p>
              </div>
            </div>
            </div>
          </div>
        )}
        <div
          className={`p-4 bg-white my-6 overflow-x-auto shadow-md ${
            !hasProPlan ? 'opacity-50 pointer-events-none' : ''
          }`}
          style={{ borderRadius: "var(--radius)" }}
        >
          <div className="text-sm flex gap-2 font-medium border-b pb-2 mb-6 ">
            <div>Cupones Activos</div>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Código
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Fecha Vigencia
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Envío Gratis
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
              {cupones?.map((cupon: any) => (
                <tr key={cupon.id}>
                  <td className="px-6 py-4 md:whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cupon.code}</div>
                  </td>
                  <td className="px-6 py-4 md:whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">
                      Inicio: {formatDate(cupon.creationDate)}
                    </div>
                    <div className="text-sm text-gray-900">
                      Fin: {formatDate(cupon.expirationDate)}
                    </div>
                  </td>
                  <td className="px-6 py-4 md:whitespace-nowrap hidden md:table-cell">
                    <div className="text-sm text-gray-900">
                      {cupon.amount === 0 && cupon.percentage === 0
                        ? "Sin descuento"
                        : cupon.percentage > 0
                        ? `${cupon.percentage}%`
                        : `$ ${cupon.amount}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 md:whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {cupon.hasFreeShipping === true ? "Sí" : "No"}
                    </div>
                  </td>

                  <td className="px-6 py-4 md:whitespace-nowrap space-x-2">
                    <button
                      onClick={() => handleEdit(cupon)}
                      disabled={!hasProPlan}
                      className={`font-bold py-2 px-4 rounded ${
                        hasProPlan 
                          ? 'bg-primary hover:bg-dark text-secondary hover:bg-secondary hover:text-primary' 
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      }`}
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
                    <button
                      onClick={() => showDeleteModal(cupon)}
                      disabled={!hasProPlan}
                      className={`font-bold py-2 px-4 rounded ${
                        hasProPlan 
                          ? 'bg-red-500 hover:bg-red-700 text-white' 
                          : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                      }`}
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
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          ref={productsRef}
          className={`p-4 bg-white ${
            !hasProPlan ? 'opacity-50 pointer-events-none' : ''
          }`}
        >
          <form
            onSubmit={(e) => handleSubmit(e)}
            className="space-y-4"
          >
            {/* Fila 1: Tipo de descuento y código */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="type"
                  className="block"
                >
                  <h3 className="font-normal text-primary">Tipo de descuento:</h3>
                  <select
                    id="type"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className={`shadow py-3 block w-full border border-dark/50 p-1 mt-2 ${
                      editingCuponId !== null ? "bg-gray-200 cursor-not-allowed" : "bg-white"
                    }`}
                    style={{ borderRadius: "var(--radius)" }}
                    disabled={editingCuponId !== null}
                  >
                    <option value="FIXED_AMOUNT">Monto Fijo</option>
                    <option value="PERCENTAGE">Porcentaje</option>
                  </select>
                </label>
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="block"
                >
                  <h3 className="font-normal text-primary">Código:</h3>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="Ingresa el código..."
                    className="shadow py-3 block w-full border border-dark/50 p-1 mt-2"
                    style={{ borderRadius: "var(--radius)" }}
                    required
                  />
                </label>
                {codeError && <p className="text-red-500">{codeError}</p>}
              </div>
            </div>

            {/* Fila 2: Monto y Fecha de expiración */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                {type === "FIXED_AMOUNT" && (
                  <div>
                    <label
                      htmlFor="amount"
                      className="block"
                    >
                      <h3 className="font-normal text-primary">Monto:</h3>
                      <input
                        type="number"
                        id="amount"
                        value={amount !== null ? amount.toString() : ""}
                        onChange={handleAmountChange}
                        onInput={(e) => {
                          const input = e.target as HTMLInputElement;
                          input.value = input.value.replace(/[^0-9]/g, "");
                        }}
                        placeholder="Ingrese el monto..."
                        className="shadow py-3 block w-full border border-dark/50 p-1 mt-2"
                        style={{ borderRadius: "var(--radius)" }}
                        required
                      />
                    </label>
                    {amountError && <p className="text-red-500">{amountError}</p>}
                  </div>
                )}

                {type === "PERCENTAGE" && (
                  <div>
                    <label
                      htmlFor="percentage"
                      className="block"
                    >
                      <h3 className="font-normal text-primary">Porcentaje:</h3>
                      <input
                        type="number"
                        id="percentage"
                        value={percentage !== null ? percentage.toString() : ""}
                        onChange={handlePercentageChange}
                        placeholder="Ingrese número de porcentaje..."
                        className="shadow py-3 block w-full border border-dark/50 p-1 mt-2"
                        style={{ borderRadius: "var(--radius)" }}
                        required
                      />
                      {percentageError && (
                        <p className="text-red-500">{percentageError}</p>
                      )}
                    </label>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="expirationDate"
                  className="block"
                >
                  <h3 className="font-normal text-primary">
                    Fecha de expiración:
                  </h3>
                  <input
                    type="date"
                    id="expirationDate"
                    value={expirationDate}
                    onChange={handleExpirationDateChange}
                    className="shadow py-3 block w-full border border-dark/50 p-1 mt-2"
                    style={{ borderRadius: "var(--radius)" }}
                    required
                  />
                  {expirationDateError && (
                    <p className="text-red-500">{expirationDateError}</p>
                  )}
                </label>
              </div>
            </div>

            {/* Fila 3: Envío gratis */}
            <div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  id="hasFreeShipping"
                  checked={hasFreeShipping}
                  onChange={handleFreeShippingChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                <span className="ml-3 text-sm font-medium text-gray-900 uppercase">Envío gratis</span>
              </label>
            </div>

            <div className="flex justify-between gap-4">
              <button
                onClick={handleSubmit}
                disabled={!hasProPlan}
                className={`w-full shadow font-bold py-2 px-4 rounded flex-wrap ${
                  hasProPlan 
                    ? 'bg-primary uppercase text-secondary hover:bg-secondary hover:text-primary' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                {editingCuponId ? "Actualizar Cupón" : "Crear Cupón"}
              </button>

              {editingCuponId ? (
                <button
                  onClick={() => {
                    resetForm();
                  }}
                  disabled={!hasProPlan}
                  className={`w-full shadow font-bold py-2 px-4 rounded flex-wrap ${
                    hasProPlan 
                      ? 'bg-secondary uppercase text-primary hover:bg-primary hover:text-secondary' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Cancelar
                </button>
              ) : null}
            </div>
          </form>
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
                      Eliminar Cupón
                    </h3>
                    <div className="mt-2">
                      <p>¿Estás seguro de que deseas eliminar este cupón?</p>
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
                    onClick={confirmDeleteCoupon}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </>
  );
}

export default CuponForm;
