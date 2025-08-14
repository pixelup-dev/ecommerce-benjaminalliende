/* eslint-disable @next/next/no-img-element */

"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import Loader from "@/components/common/Loader";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRef } from "react";

interface Order {
  totals: any;
  id: string;
  correlative: string;
  paymentMethod: string | null;
  statusCode: string;
  creationDate: string;
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2: string;
    commune: {
      name: string;
      region: {
        name: string;
      };
    };
  };
  shippingInfo: {
    addressLine1: string;
    addressLine2: string;
    commune: {
      name: string;
      region: {
        name: string;
      };
    };
  };
  items: {
    id: string;
    unitPrice: number;
    quantity: number;
    sku: {
      id: any;
      mainImageUrl: string;
      previewImageUrl: string;
      product: {
        name: string;
      };
    };
  }[];
  paymentInfo: {
    amount: number;
    authorizationCode: string;
    cardDigits: string;
  };
  deliveryType?: {
    code: string;
  };
}

const OrderReceipt: React.FC = () => {
  const { id } = useParams();
  const [attributesMap, setAttributesMap] = useState<{ [key: string]: any }>(
    {}
  );

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  const imagePath = process.env.NEXT_PUBLIC_LOGO_COLOR;
  const handleDownloadPdf = async () => {
    const buttonElement = document.getElementById("download-button");
    if (buttonElement) {
      buttonElement.style.display = "none"; // Oculta el botón
    }

    if (printRef.current) {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Aumenta la escala para mejorar la resolución
        useCORS: true, // Permite imágenes de origen cruzado
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4", // Tamaño estándar A4
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calcula la escala para ajustar la imagen dentro de la página
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      pdf.addImage(imgData, "PNG", 0, 0, scaledWidth, scaledHeight);
      pdf.save(`Orden_Número_${order?.correlative}.pdf`);
    }

    if (buttonElement) {
      buttonElement.style.display = "block"; // Vuelve a mostrar el botón
    }
  };

  const fetchAttributesForItems = async (items: any) => {
    const attributesData: { [key: string]: any } = {};
    for (const item of items) {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${item.sku.product.id}/skus/${item.sku.id}/attributes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        attributesData[item.sku.id] = response.data.skuAttributes.map(
          (attr: any) => ({
            name: attr.attribute.name,
            value: attr.value,
          })
        );
      } catch (error) {
        console.error(
          `Error al obtener atributos para el SKU ${item.sku.id}:`,
          error
        );
      }
    }
    setAttributesMap(attributesData);
  };

  useEffect(() => {
    if (id) {
      const siteId = process.env.NEXT_PUBLIC_API_URL_SITEID || "";

      axios
        .get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/orders/${id}?siteId=${siteId}`
        )
        .then((response) => {
          const data = response.data;
          if (data.code === 0) {
            setOrder(data.order);
            fetchAttributesForItems(data.order.items); // Llama a la función para obtener atributos
          } else {
            setError(data.message);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setError("No se pudo obtener los detalles de la orden");
          setLoading(false);
        });
    }
  }, [id]);

  function getStatusCodeText(statusCode: string) {
    switch (statusCode) {
      case "PAYMENT_COMPLETED":
        return "Pagado";
      case "PAYMENT_PENDING":
        return "Pendiente de pago";
      case "PAYMENT_FAILED":
        return "Pago fallido";
      default:
        return "Estado desconocido";
    }
  }

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (!order) {
    return <div className="text-center">Orden no encontrada</div>;
  }

  return (
    <>
      <title>Detalle Orden</title>
      <div className="mx-auto flex w-full justify-center items-center bg-gray-100">
        <div
          className="max-w-6xl mx-auto px-10 bg-white shadow-md rounded-md my-20 py-10"
          id="order-receipt"
          ref={printRef}
        >
          <div className="flex justify-end print:hidden">
            <button
              id="download-button" // Añade un id al botón
              onClick={handleDownloadPdf}
              className="px-4 py-2 bg-primary text-white rounded-md mt-4"
            >
              Descargar PDF
            </button>
          </div>
          <div className="text-center mt-6 mb-6">
            <img
              src={imagePath}
              alt="Logo Tavola"
              className="mx-auto max-h-40"
            />
          </div>
          <h1 className="text-3xl font-bold text-center text-primary">
            Detalle de tu Orden
          </h1>
          <p className="text-center mb-12">
            ¡Gracias por comprar con nosotros!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div className="border p-4 rounded-md ">
              <h2 className="text-lg font-semibold mb-4">
                Información de la Orden
              </h2>
              <p>
                <strong>N° Orden:</strong> {order.correlative}
              </p>
              <p>
                <strong>Fecha de Creación:</strong>{" "}
                {new Date(order.creationDate).toLocaleString()}
              </p>
              <p>
                <strong>Estado:</strong> {getStatusCodeText(order.statusCode)}
              </p>

              {order.paymentMethod && (
                <p>
                  <strong>Método de Pago:</strong> {order.paymentMethod}
                </p>
              )}
            </div>
            <div className="border p-4 rounded-md ">
              <h2 className="text-lg font-semibold mb-4">Cliente</h2>
              <p>
                <strong>Nombre:</strong> {order.customer.firstname}{" "}
                {order.customer.lastname}
              </p>
              <p>
                <strong>Email:</strong> {order.customer.email}
              </p>
              <p>
                <strong>Número de Teléfono:</strong>{" "}
                {order.customer.phoneNumber}
              </p>
            </div>
          </div>
          <div className="mb-4">
            <div className="border p-4 rounded-md ">
              <h2 className="text-lg font-semibold mb-4">
                {order.deliveryType?.code === "WITHDRAWAL_FROM_STORE" 
                  ? "Retiro en Tienda" 
                  : "Dirección de Envío"}
              </h2>
              {order.deliveryType?.code === "WITHDRAWAL_FROM_STORE" ? (
                <>
                  <h3 className="text-lg font-medium text-gray-500 mb-2 ">Dirección de Facturación:</h3>
                  <p>
                    <strong>Dirección:</strong> {order.customer.addressLine1}
                    {order.customer.addressLine2 && `, ${order.customer.addressLine2}`}
                  </p>
                  <p>
                    <strong>Comuna:</strong> {order.customer.commune.name},{" "}
                    {order.customer.commune.region.name}
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Dirección:</strong>{" "}
                    {order.shippingInfo.addressLine1}
                    {order.shippingInfo.addressLine2 && `, ${order.shippingInfo.addressLine2}`}
                  </p>
                  <p>
                    <strong>Comuna:</strong> {order.shippingInfo.commune.name},{" "}
                    {order.shippingInfo.commune.region.name}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="border p-4 rounded-md mb-6">
            <h2 className="text-lg font-semibold mb-4">
              Artículos en tu Carrito de Compras
            </h2>
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col rounded-lg sm:flex-row sm:items-center my-4 border border-gray-300 pb-4 p-4"
              >
                {/* Imagen del producto */}
                <div className="sm:w-24 w-full mb-4 sm:mb-0 sm:mr-4 flex justify-center">
                  <img
                    src={item.sku.mainImageUrl}
                    alt={item.sku.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>

                {/* Información del producto */}
                <div className="flex-1">
                  <p className="font-semibold text-lg">
                    {item.sku.product.name}
                  </p>

                  {/* Mostrar atributos si existen */}
                  {attributesMap[item.sku.id]?.length > 0 ? (
                    <ul className="text-gray-500 space-y-1">
                      {attributesMap[item.sku.id].map((attribute: any) => (
                        <li
                          key={attribute.name}
                          className="text-sm"
                        >
                          {attribute.name}:{" "}
                          <span className="font-semibold text-gray-700">
                            {attribute.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">Sin atributos</p>
                  )}
                </div>

                {/* Precio del producto */}
                <div className="mt-4 sm:mt-0 sm:ml-4 text-right">
                  <p className="text-gray-500 mb-2">
                    Cantidad: {item.quantity}
                  </p>
                  <p className="font-semibold text-lg">
                    ${item.unitPrice.toLocaleString("es-CL")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border p-4 rounded-md mb-6">
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-semibold">Subtotal:</p>
              <p className="text-lg">
                ${order.totals.itemsAmount.toLocaleString("es-CL")}
              </p>
            </div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-semibold">Envío:</p>
              <p className="text-lg">
                ${order.totals.shippingAmount.toLocaleString("es-CL")}
              </p>
            </div>
            {/* <div className="flex justify-between items-center mb-2">
            <p className="text-lg font-semibold">Impuestos:</p>
            <p className="text-lg">
              ${order.totals.taxAmount.toLocaleString("es-CL")}
            </p>
          </div> */}
            <div className="flex justify-between items-center mb-2">
              <p className="text-lg font-semibold">Descuento:</p>
              <p className="text-lg">
                ${order.totals.discountAmount.toLocaleString("es-CL")}
              </p>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold">Total:</p>
              <p className="text-xl font-bold ">
                ${order.totals.totalAmount.toLocaleString("es-CL")}
              </p>
            </div>
          </div>

          {/*         <button className="bg-blue-500 hidden text-white p-2 rounded-md shadow-md hover:bg-blue-600 focus:outline-none">
          Descargar PDF
        </button> */}
        </div>
      </div>
    </>
  );
};

export default OrderReceipt;
