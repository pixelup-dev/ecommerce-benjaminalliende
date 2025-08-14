"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

const OrderDetail = () => {
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!order) return <p>No order found.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>
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
        <p>
          <strong>Customer:</strong> {order.customer.firstname}{" "}
          {order.customer.lastname}
        </p>
        <p>
          <strong>Shipping Address:</strong> {order.shippingInfo.addressLine1},{" "}
          {order.shippingInfo.commune.name}
        </p>
        {/* Puedes agregar más detalles según lo necesites */}
      </div>
    </div>
  );
};

export default OrderDetail;
