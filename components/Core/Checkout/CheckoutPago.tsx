/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { getCookie, deleteCookie } from "cookies-next";
import axios from "axios";
import toast from "react-hot-toast";
import AutoSubmitForm from "@/components/Core/Checkout/AutoSubmitForm";
import { obtenerOrdenesId } from "@/app/utils/obtenerOrdenesID";
import { useSearchParams } from "next/navigation";
import Loader from "@/components/common/Loader";

const formatPrice = (price: number) => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

function CheckoutPago() {
  const [orderSubmitted, setOrderSubmitted] = useState(false); // Nuevo estado para controlar si se ha enviado la orden
  const [transactionData, setTransactionData] = useState<{
    url: string;
    token: string;
  } | null>(null);
  const [discountCode, setDiscountCode] = useState(""); // Nuevo estado para el código de descuento
  const [discountApplied, setDiscountApplied] = useState(false); // Estado para controlar si se ha aplicado un descuento

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [orderDetail, setOrderDetail] = useState<any>({});
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const fetchOrders = async () => {
    try {
      const data = await obtenerOrdenesId(orderId);
      setOrderDetail(data.order);
      if (data.order.discountCoupons && data.order.discountCoupons.length > 0) {
        setDiscountCode(data.order.discountCoupons[0].discountCoupon.code); // Establece el primer código de descuento
      }
      setLoading(false); // set loading to false after successful data fetch
    } catch (error) {
      setLoading(false); // set loading to false in case of error
      setError(error as Error); // set error state if an error occurs
    }
  };
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasDiscount =
    orderDetail.discountCoupons && orderDetail.discountCoupons.length > 0;

  const verifyDiscountStatus = async (
    expectedDiscountAmount: number,
    maxAttempts: number = 5
  ): Promise<boolean> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const orderResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/orders/${orderId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        const orderData = await orderResponse.json();

        if (orderData.code === 0) {
          // Si estamos aplicando un descuento, verificamos que exista en discountCoupons
          if (expectedDiscountAmount > 0) {
            if (
              orderData.order.discountCoupons &&
              orderData.order.discountCoupons.length > 0
            ) {
              setOrderDetail(orderData.order);
              return true;
            }
          }
          // Si estamos eliminando un descuento, verificamos que no exista en discountCoupons
          else {
            if (
              !orderData.order.discountCoupons ||
              orderData.order.discountCoupons.length === 0
            ) {
              setOrderDetail(orderData.order);
              return true;
            }
          }
        }

        // Esperar 500ms entre intentos
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error al verificar el estado del descuento:", error);
        return false;
      }
    }
    return false;
  };

  const applyDiscount = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/orders/${orderId}/discount-coupons?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: discountCode,
          }),
        }
      );
      const data = await response.json();

      if (data.code === 0) {
        const discountApplied = await verifyDiscountStatus(
          orderDetail.totals.discountAmount + 1
        );

        if (discountApplied) {
          toast.success("Descuento aplicado con éxito");
          setDiscountApplied(true);
        } else {
          toast.error(
            "No se pudo verificar el descuento. Por favor, intente nuevamente."
          );
          setDiscountApplied(false);
        }
      } else {
        toast.error("Código de descuento inválido");
        setDiscountApplied(false);
      }
    } catch (error) {
      console.error("Error al aplicar el descuento:", error);
      toast.error("Error al aplicar el descuento");
      setDiscountApplied(false);
    } finally {
      setLoading(false);
    }
  };

  const removeDiscount = async () => {
    try {
      setLoading(true);
      const couponId = orderDetail.discountCoupons[0].id;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/orders/${orderId}/discount-coupons/${couponId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();

      if (data.code === 0) {
        const discountRemoved = await verifyDiscountStatus(0);

        if (discountRemoved) {
          toast.success("Descuento eliminado con éxito");
          setDiscountApplied(false);
        } else {
          toast.error(
            "No se pudo verificar la eliminación del descuento. Por favor, intente nuevamente."
          );
        }
      } else {
        toast.error("Error al eliminar el descuento");
      }
    } catch (error) {
      console.error("Error al eliminar el descuento:", error);
      toast.error("Error al eliminar el descuento");
    } finally {
      setLoading(false);
    }
  };
  const hasFreeShipping = orderDetail.discountCoupons?.some(
    (coupon: any) => coupon.discountCoupon?.hasFreeShipping
  );

  const discountPercentage = orderDetail.discountCoupons?.find(
    (coupon: any) => coupon.discountCoupon?.percentage > 0
  )?.discountCoupon.percentage;

  const handleSubmitOrder = async () => {
    try {
      const paymentGatewayResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/payment-gateways?statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      const paymentGatewayData = await paymentGatewayResponse.json();
      const paymentGateways = paymentGatewayData.paymentGateways;
      const activePaymentGatewayId = paymentGateways[0].id;

      const updateOrderResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/orders/${orderId}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            statusCode: "PAYMENT_PENDING",
            initTransactionInfo: {
              paymentGatewayId: activePaymentGatewayId,
              errorUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/tienda/checkout/error?orderId=${orderId}`,
              returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/tienda/checkout/validate?orderId=${orderId}`,
            },
          }),
        }
      );
      const updateOrderData = await updateOrderResponse.json();

      if (updateOrderData.code === 0) {
        toast(
          "¡Datos enviados correctamente y orden actualizada con medio de pago!"
        );

        setTransactionData({
          token: updateOrderData.transaction.token,
          url: updateOrderData.transaction.url,
        });

        ////////////////////////////////////////////////////
        ////////////////TRANSBANK////////////////////////////
        ////////////////////////////////////////////////////

          alert(updateOrderData.transaction.token);  

        // Marca la orden como enviada
        setOrderSubmitted(true);
      } else {
        console.error(
          "Error al actualizar la orden con el medio de pago:",
          updateOrderData
        );
        toast.error("Error al actualizar la orden con el medio de pago");
        window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/tienda/checkout/error?orderId=${orderId}`;
      }
    } catch (error) {
      console.error("Error al enviar la orden:", error);
      window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/tienda/checkout/error?orderId=${orderId}`;
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!orderDetail) {
    return <div>No se encontraron detalles de la orden.</div>;
  }
  return (
    <div className="pb-12">
      <>
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
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-semibold text-emerald-700">
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
                  </span>
                  <span className="font-semibold text-gray-900">Tienda</span>
                </li>
                <li className="flex items-center space-x-3 text-left sm:space-x-4">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-semibold text-emerald-700">
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
                  </span>
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
                    className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-600 text-xs font-semibold text-white ring ring-gray-600 ring-offset-2"
                    href="#"
                  >
                    3
                  </a>
                  <span className="font-semibold text-gray-900">Pago</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="grid sm:px-10 lg:grid-cols-2 lg:px-20 xl:px-32">
          <div className="px-4 pt-8">
            <div className="w-full  bg-white shadow-lg relative ml-auto h-auto border">
              <div className="overflow-auto p-6 ">
                <section>
                  <div className="py-2">
                    <div className="container px-4 mx-auto">
                      <div className="p-2">
                        <p className="mb-4  text-gray-700 font-medium border-b border-black border-opacity-5 pb-2">
                          Productos
                        </p>
                        <div className="flex flex-col pb-7 border-b border-black border-opacity-5">
                          {orderDetail.items.map((order: any) => (
                            <div
                              className="w-full "
                              key={order.sku.name}
                            >
                              <div className="flex items-center mb-6 lg:mb-0 gap-4">
                                <div className="w-full max-w-24 ">
                                  <img
                                    src={order.sku.mainImageUrl}
                                    alt={order.sku.product.name}
                                    className="mx-auto rounded-xl p-2 border border-gray-200"
                                  />
                                </div>

                                <div>
                                  <span className="inline-block  text-lg font-heading font-medium ">
                                    {order.sku.product.name}
                                  </span>
                                  <div>
                                    {order.sku.attributes &&
                                      order.sku.attributes.length > 0 && (
                                        <div className="item-attributes">
                                          <small className="font-bold">
                                            {order.sku.attributes
                                              .slice(0, 4)
                                              .map(
                                                (attribute: any) =>
                                                  attribute.value
                                              )
                                              .join(", ")}
                                          </small>
                                        </div>
                                      )}
                                  </div>

                                  <div className="flex flex-wrap">
                                    <p className="mr-4 text-sm font-heading font-medium">
                                      <span>Cantidad:</span>
                                      <span className="ml-2 text-gray-400 font-body">
                                        {order.quantity}
                                      </span>
                                    </p>
                                    <p className="mr-4 text-sm font-heading font-medium">
                                      <span className="">Precio:</span>
                                      <span className="ml-2 text-gray-500 font-body">
                                        ${formatPrice(order.unitPrice)}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
          <div className="mt-10 bg-gray-50 px-4 pt-8 lg:mt-0">
            <p className=" text-xl font-medium">Datos de Facturación</p>
            <div className="">
              <div className="mt-10 px-4 pt-2 lg:mt-0">
                <div className="grid grid-cols-2 gap-4">
                  <label
                    htmlFor="firstname"
                    className="block mt-4"
                  >
                    Nombre
                    <input
                      type="text"
                      id="firstname"
                      name="firstname"
                      value={orderDetail.customer.firstname}
                      className="block bg-gray-100 w-full rounded-md border-dark/50 border p-1 mt-1"
                      disabled
                    />
                  </label>
                  <label
                    htmlFor="lastname"
                    className="block mt-4"
                  >
                    Apellido
                    <input
                      type="text"
                      id="lastname"
                      name="lastname"
                      value={orderDetail.customer.lastname}
                      className="block bg-gray-100 w-full rounded-md border-dark/50 border p-1 mt-1"
                      disabled
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    htmlFor="phoneNumber"
                    className="block mt-4"
                  >
                    Teléfono
                    <input
                      type="text"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={orderDetail.customer.phoneNumber}
                      className="block bg-gray-100 w-full rounded-md border-dark/50 border p-1 mt-1"
                      disabled
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
                      value={orderDetail.customer.email}
                      className="block bg-gray-100 w-full rounded-md border-dark/50 border p-1 mt-1"
                      disabled
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    htmlFor="addressLine1"
                    className="block mt-4"
                  >
                    Región
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={orderDetail.shippingInfo.commune.region.name}
                      className="block bg-gray-100 w-full rounded-md border-dark/50 border p-1 mt-1"
                      disabled
                    />
                  </label>
                  <label
                    htmlFor="addressLine2"
                    className="block mt-4"
                  >
                    Comuna
                    <input
                      type="text"
                      id="addressLine2"
                      name="addressLine2"
                      value={orderDetail.shippingInfo.commune.name}
                      className="block bg-gray-100 w-full rounded-md border-dark/50 border p-1 mt-1"
                      disabled
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    htmlFor="addressLine1"
                    className="block mt-4"
                  >
                    Dirección
                    <input
                      type="text"
                      id="addressLine1"
                      name="addressLine1"
                      value={orderDetail.shippingInfo.addressLine1}
                      className="block bg-gray-100 w-full rounded-md border-dark/50 border p-1 mt-1"
                      disabled
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
                      value={orderDetail.shippingInfo.addressLine2}
                      className="block bg-gray-100 w-full rounded-md border-dark/50 border p-1 mt-1"
                      disabled
                    />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="addressLine2"
                      className="block mt-4"
                    >
                      Código Descuento
                      <input
                        type="text"
                        id="codeDiscount"
                        value={discountCode}
                        name="codeDiscount"
                        onChange={(e) => setDiscountCode(e.target.value)}
                        className={`block w-full rounded-md border-dark/50 border p-2 mt-1 ${
                          hasDiscount
                            ? "bg-gray-200 cursor-not-allowed"
                            : "bg-white"
                        }`}
                        disabled={hasDiscount}
                      />
                    </label>
                  </div>
                  <div>
                    <label
                      htmlFor="addressLine2"
                      className="block mt-4"
                    >
                      <button
                        onClick={hasDiscount ? removeDiscount : applyDiscount}
                        disabled={loading}
                        id="botonDescuento"
                        className={`mt-7 mb-8 w-full rounded-md px-6 py-2 font-medium text-white ${
                          loading ? "bg-gray-500" : "bg-gray-900"
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center">
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Procesando...
                          </span>
                        ) : hasDiscount ? (
                          "Eliminar descuento"
                        ) : (
                          "Agregar cupón"
                        )}
                      </button>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tipo de Envío */}
              <div className="mt-6 border-t py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    Tipo de Entrega
                  </p>
                  <p className="font-semibold text-gray-900">
                    {orderDetail.deliveryType?.code === "WITHDRAWAL_FROM_STORE"
                      ? "Retiro en Tienda"
                      : "Delivery"}
                  </p>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-b py-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Subtotal</p>
                  <p className="font-semibold text-gray-900">
                    $ {formatPrice(orderDetail.totals.itemsAmount)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Despacho</p>
                  <p className="font-semibold text-gray-900">
                    {hasFreeShipping ||
                    orderDetail.totals.shippingAmount === 0 ? (
                      <span>
                        {orderDetail.totals.shippingAmount > 0 && (
                          <span className="line-through">
                            ${formatPrice(orderDetail.totals.shippingAmount)}
                          </span>
                        )}
                        <span
                          className={`${
                            orderDetail.totals.shippingAmount > 0 ? "ml-2" : ""
                          } text-green-600`}
                        >
                          Envío Gratis
                        </span>
                      </span>
                    ) : (
                      `$ ${formatPrice(orderDetail.totals.shippingAmount)}`
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">Descuento</p>
                  <p className="font-semibold text-gray-900">
                    {discountPercentage ? (
                      <span>
                        ${formatPrice(orderDetail.totals.discountAmount)}
                        <span className="ml-2 text-dark">
                          ({discountPercentage}%)
                        </span>
                      </span>
                    ) : (
                      `$ ${formatPrice(orderDetail.totals.discountAmount)}`
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">Total</p>
                <p className="text-2xl font-semibold text-gray-900">
                  $ {formatPrice(orderDetail.totals.totalAmount)}
                </p>
              </div>
            </div>
            <button
              onClick={handleSubmitOrder}
              className="mt-4 mb-8 w-full rounded-md bg-gray-900 px-6 py-3 font-medium text-white"
            >
              Pagar
            </button>
          </div>
        </div>
      </>
      {orderSubmitted && transactionData && (
        <AutoSubmitForm
          action={transactionData.url}
          method="post"
          token={transactionData.token}
        />
      )}
    </div>
  );
}

export default CheckoutPago;
