"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";

const OrdersList: React.FC<any> = ({ customerId }) => {
  const [orders, setOrders] = useState<any>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const Token = getCookie("ClientTokenAuth");
  const decodeToken = Token ? jwtDecode(Token) : null;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const id = decodeToken?.sub;
        const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}/orders?siteId=${siteId}&pageNumber=1&pageSize=50`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
            },
          }
        );

        if (response.data.code === 0) {
          setOrders(response.data.orders);
        } else {
          setError("Failed to fetch orders. Please try again.");
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Orders</h1>
      <ul>
        {orders.map((order: any) => (
          <li
            key={order.id}
            className="mb-4"
          >
            <div className="border p-4 rounded-md">
              <p>
                <strong>Order ID:</strong> {order.id}
              </p>
              <p>
                <strong>Correlative:</strong> {order.correlative}
              </p>
              <p>
                <strong>Status:</strong> {order.statusCode}
              </p>
              <p>
                <strong>Creation Date:</strong>{" "}
                {new Date(order.creationDate).toLocaleDateString()}
              </p>
              <p>
                <strong>Total Amount:</strong> {order.totals.totalAmount}{" "}
                {order.currencyCode.code}
              </p>
              <button
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() =>
                  router.push(`/tienda/mi-cuenta/ordenes/${order.id}`)
                }
              >
                View Details
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrdersList;
