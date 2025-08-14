/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import Loader from "@/components/common/Loader-t";
import { useReviewSettings } from "@/hooks/useReviewSettings";

interface Order {
  id: number;
  correlative: string;
  creationDate: string;
  totals: {
    totalAmount: number;
  };
}

interface ProductReview {
  id: string;
  name: string;
  reviewId: string | null;
  score: number | null;
  comments: string | null;
}

interface OrderDataProps {
  orders: Order[];
  error: string;
  loading: boolean;
}

interface OrderDataState {
  orders: Order[];
  error: string;
  loading: boolean;
}

export default function OrderData() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pendingReviewsCount, setPendingReviewsCount] = useState<number>(0);
  const [totalReviewsCount, setTotalReviewsCount] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { isReviewEnabled } = useReviewSettings();

  const token = getCookie("ClientTokenAuth");
  const decodeToken = token ? jwtDecode(token) : null;

  // const formatDateToChileanTime = (isoDateString: string) => {
  //   const date = new Date(isoDateString);

  //   // Ajustar la hora a la zona horaria de Chile (GMT-4)
  //   const timezoneOffset = -4 * 60; // -4 horas en minutos
  //   const adjustedDate = new Date(date.getTime() + timezoneOffset * 60 * 1000);

  //   const day = adjustedDate.getDate().toString().padStart(2, "0");
  //   const month = (adjustedDate.getMonth() + 1).toString().padStart(2, "0"); // Los meses son 0-indexados
  //   const year = adjustedDate.getFullYear();
  //   const hours = adjustedDate.getHours().toString().padStart(2, "0");
  //   const minutes = adjustedDate.getMinutes().toString().padStart(2, "0");

  //   return `${day}-${month}-${year} ${hours}:${minutes}`;
  // };

  useEffect(() => {
    const fetchOrdersAndReviews = async () => {
      try {
        const id = decodeToken?.sub;
        const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

        // Fetch orders
        const responseOrders = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}/orders?siteId=${siteId}&pageNumber=1&pageSize=50`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (responseOrders.data.code === 0) {
          setOrders(responseOrders.data.orders);
        } else {
          setError("Failed to fetch orders. Please try again.");
        }

        // Fetch pending reviews only if reviews are enabled
        if (isReviewEnabled) {
          const responsePendingReviews = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}/products?pageNumber=1&pageSize=50&siteId=${siteId}&hasValorations=false`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (responsePendingReviews.data.code === 0) {
            setPendingReviewsCount(
              responsePendingReviews.data.purchasedProducts.length
            );
          } else {
            setError("Failed to fetch pending reviews. Please try again.");
          }

          // Fetch total reviews
          const responseTotalReviews = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}/products?pageNumber=1&pageSize=50&siteId=${siteId}&hasValorations=true`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (responseTotalReviews.data.code === 0) {
            setTotalReviewsCount(
              responseTotalReviews.data.purchasedProducts.length
            );
          } else {
            setError("Failed to fetch total reviews. Please try again.");
          }
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndReviews();
  }, [decodeToken?.sub]);

  if (loading) return <Loader />;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Nuevo bloque para mostrar la sección de opiniones - solo si reviews están habilitados */}
        {isReviewEnabled && (
          <>
            <div
              className="mx-4 lg:mx-0 border overflow-hidden shadow-md mb-4"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="bg-white p-4 flex justify-between items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 w-full">
                  <div className="flex items-center gap-4 w-full">
                    <svg
                      className="w-6 h-6 text-yellow-500 ml-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049.775a1 1 0 011.902 0l1.823 5.609a1 1 0 00.95.69h5.885a1 1 0 01.592 1.81l-4.75 3.456a1 1 0 00-.364 1.118l1.823 5.608a1 1 0 01-1.541 1.118L10 15.927l-4.751 3.456a1 1 0 01-1.54-1.118l1.823-5.608a1 1 0 00-.364-1.118L.418 8.885a1 1 0 01.592-1.81h5.885a1 1 0 00.95-.69L9.049.775z" />
                    </svg>
                    <p className="text-m text-gray-700">
                      {pendingReviewsCount <= 1 ? (
                        <p className="text-m text-gray-700">
                          {pendingReviewsCount} producto espera tu opinión
                        </p>
                      ) : (
                        <p className="text-m text-gray-700">
                          {pendingReviewsCount} productos esperan tu opinión
                        </p>
                      )}
                    </p>
                  </div>
                  <div className=" flex justify-end ">
                    <Link
                      href="/tienda/mi-cuenta/mis-pedidos/calificaciones"
                      className="px-4 py-2 bg-primary text-secondary w-full md:w-auto mt-4 md:mt-0 hover:bg-secondary hover:text-primary transition duration-300"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      Calificar
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="mx-4 lg:mx-0 border overflow-hidden shadow-md mb-4"
              style={{ borderRadius: "var(--radius)" }}
            >
              <div className="bg-white p-4 flex justify-between items-center">
                <div className="grid grid-cols-1 md:grid-cols-2 w-full">
                  <div className="flex items-center gap-4 w-full">
                    <svg
                      className="w-6 h-6 text-yellow-500 ml-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049.775a1 1 0 011.902 0l1.823 5.609a1 1 0 00.95.69h5.885a1 1 0 01.592 1.81l-4.75 3.456a1 1 0 00-.364 1.118l1.823 5.608a1 1 0 01-1.541 1.118L10 15.927l-4.751 3.456a1 1 0 01-1.54-1.118l1.823-5.608a1 1 0 00-.364-1.118L.418 8.885a1 1 0 01.592-1.81h5.885a1 1 0 00.95-.69L9.049.775z" />
                    </svg>
                    <p className="text-m text-gray-700">
                      Has realizado {totalReviewsCount} calificaciones
                    </p>
                  </div>

                  <div className=" flex justify-end ">
                    <Link
                      href="/tienda/mi-cuenta/mis-pedidos/calificaciones"
                      className="px-4 py-2 bg-primary text-secondary w-full md:w-auto mt-4 md:mt-0 hover:bg-secondary hover:text-primary transition duration-300"
                      style={{ borderRadius: "var(--radius)" }}
                    >
                      Ver Calificaciones
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Iteración sobre los pedidos */}
        {orders.map((order, index) => (
          <div
            key={index}
            className="mx-4 lg:mx-0 border overflow-hidden shadow-md mb-4"
            style={{ borderRadius: "var(--radius)" }}
          >
            <div className="bg-white p-4">
              <p className="text-sm text-gray-700">
                {" "}
                {new Date(order.creationDate).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="bg-secondary p-4 flex items-center">
              <div className="mr-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Zm3.75 11.625a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                  />
                </svg>
              </div>
              <div className="flex flex-col justify-between flex-grow">
                <div>
                  <p className="font-bold text-lg">Orden ID</p>
                  <p className="text-sm">#{order.correlative}</p>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center text-center mr-4">
                <p className="font-semibold">Monto total</p>
                <p className="text-lg font-bold">
                  ${order.totals.totalAmount.toLocaleString("es-CL")}
                </p>
              </div>
              <button
                onClick={() =>
                  router.push(`/tienda/mi-cuenta/mis-pedidos/${order.id}`)
                }
                className="ml-4 px-4 py-2 bg-primary text-secondary hover:bg-secondary hover:text-primary transition duration-300"
                style={{ borderRadius: "var(--radius)" }}
              >
                Ver Detalle
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
