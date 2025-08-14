/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loader from "@/components/common/Loader";

const DetallePago = () => {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;

      try {
        const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/orders/${id}?siteId=${siteId}`
        );

        if (response.data.code === 0) {
          setOrder(response.data.order);
          console.log(response.data.order, "order");
        } else {
          setError("Failed to fetch order. Please try again.");
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <p>{error}</p>;
  if (!order) return <p>No order found.</p>;

  return (
    <div className="flex  justify-center p-4 md:p-8  bg-gray-100">
      <div
        className="w-full max-w-6xl min-h-[600px] bg-white p-6 md:p-8 shadow-md relative my-16"
        style={{ borderRadius: "var(--radius)" }}
      >
        {/* Botón de vuelta atrás */}
        <button
          onClick={() => window.history.back()}
          className="mt-2 absolute top-4 left-4 flex items-center px-4 py-2 bg-secondary text-primary hover:text-secondary hover:bg-primary"
          style={{ borderRadius: "var(--radius)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-6 h-6 mr-2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-12">
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-4">
              Detalle del Pedido
            </h2>
            <div className="mb-4">
              <div className="text-gray-500 text-sm md:text-base">
                Fecha de Orden
              </div>
              <div className="text-base md:text-lg">
                {new Date(order.creationDate).toLocaleDateString()}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-gray-500 text-sm md:text-base">Orden ID</div>
              <div className="text-base md:text-lg">#{order.correlative}</div>
            </div>
            {order.paymentMethod && (
              <div className="mb-4">
                <div className="text-gray-500 text-sm md:text-base">
                  Método de Pago
                </div>
                <div className="text-base md:text-lg">
                  {order.paymentMethod || "No especificado"}
                </div>
              </div>
            )}

            <div className="max-h-[345px] overflow-y-auto">
              {order.items.map((item: any, index: any) => (
                <div
                  key={index}
                  className="bg-gray-100 shadow-md border p-4 mb-4 rounded-lg"
                >
                  <div className="flex items-center">
                    <img
                      src={item.sku.mainImageUrl}
                      alt={item.sku.product.name}
                      className="w-12 h-12 md:w-16 md:h-16 mr-4 rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm md:text-base">
                        {item.sku.product.name}
                      </div>
                    </div>
                    <div className="ml-auto text-sm md:text-lg">
                      ${item.unitPrice.toLocaleString("es-CL")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg md:text-xl font-bold mb-4">
              Dirección de Envío
            </h2>
            <div className="p-4">
              <div className="mb-4">
                <div className="text-gray-500 text-sm md:text-base">Nombre</div>
                <div className="text-base md:text-lg">
                  {order.customer.firstname} {order.customer.lastname}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm md:text-base">Correo</div>
                <div className="text-base md:text-lg">
                  {order.customer.email}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm md:text-base">
                  Número de teléfono
                </div>
                <div className="text-base md:text-lg">
                  {order.customer.phoneNumber}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-gray-500 text-sm md:text-base">
                  Dirección
                </div>
                <div className="text-base md:text-lg">
                  {order.shippingInfo.addressLine1},{" "}
                  {order.shippingInfo.addressLine2}
                </div>
              </div>
            </div>

            <div className="p-4">
              <span className="flex items-center">
                <span className="h-px flex-1 bg-gray-400"></span>
              </span>
            </div>

            <div className="p-4">
              <div className="flex justify-between mb-4">
                <div className="text-gray-500 text-sm md:text-base">
                  Subtotal
                </div>
                <div className="text-base md:text-lg">
                  ${order.totals.itemsAmount.toLocaleString("es-CL")}
                </div>
              </div>
              <div className="flex justify-between mb-4">
                <div className="text-gray-500 text-sm md:text-base">Envío</div>
                <div className="text-base md:text-lg">
                  ${order.totals.shippingAmount.toLocaleString("es-CL")}
                </div>
              </div>
              <div className="flex justify-between mb-4">
                <div className="text-gray-500 text-sm md:text-base">
                  Descuento
                </div>
                <div className="text-base md:text-lg">
                  ${order.totals.discountAmount.toLocaleString("es-CL")}
                </div>
              </div>

              <span className="flex items-center py-4">
                <span className="h-px flex-1 bg-gray-400"></span>
              </span>

              <div className="flex justify-between font-bold">
                <div className="text-base md:text-lg">Total</div>
                <div className="text-base md:text-lg text-primary">
                  ${order.totals.totalAmount.toLocaleString("es-CL")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePago;
