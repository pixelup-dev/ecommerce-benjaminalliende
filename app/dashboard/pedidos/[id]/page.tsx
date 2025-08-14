"use client";
/* eslint-disable @next/next/no-img-element */
import {
  useEffect,
  useState,
  useRef,
  HTMLAttributes,
  DetailedHTMLProps,
  ImgHTMLAttributes,
} from "react";
import { obtenerOrdenesId } from "@/app/utils/obtenerOrdenesIDBO";
import { getCookie } from "cookies-next";
import { useParams } from "next/navigation";
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import Link from "next/link";
import Loader from "@/components/common/Loader";
import toast from "react-hot-toast";
import axios from "axios";

interface Order {
  id: string;
  correlative: string;
  statusCode: string;
  creationDate: string;
  currencyCode: {
    code: string;
    name: string;
  };
  customer: {
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    addressLine1: string;
    addressLine2?: string;
    commune: {
      name: string;
      region: {
        name: string;
      };
    };
  };
  deliveryType: {
    description: string;
  };
  shippingInfo: {
    addressLine1: string;
    addressLine2?: string;
    commune: {
      name: string;
      region: {
        name: string;
      };
    };
  };
  totals: {
    itemsAmount: number;
    shippingAmount: number;
    discountAmount: number;
    netAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  items: {
    id: string;
    unitPrice: number;
    quantity: number;
    sku: {
      id: any;
      product: {
        mainImageUrl: string;
        name: string;
        description?: string;
      };
      previewImageUrl?: string;
      mainImageUrl?: string;
    };
  }[];
}

interface ImageProps {
  src: string | null | undefined;
  alt: string;
}

const ImageWithFallback = ({ src = "", alt }: ImageProps) => {
  const [error, setError] = useState(false);

  const handleError = () => {
    setError(true);
  };

  const imageClasses = "w-16 h-16 object-cover rounded-lg";
  const fallbackClasses =
    "w-16 h-16 flex items-center justify-center bg-gray-200 rounded-lg";

  if (!src || error) {
    return (
      <div className={fallbackClasses}>
        <svg
          className="w-10 h-10 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={imageClasses}
      onError={handleError}
    />
  );
};

export default function DetalleOrdenes() {
  const { id } = useParams();
  const printRef = useRef<HTMLDivElement>(null);
  const [pedido, setPedido] = useState<Order | null>(null);
  const Token = String(getCookie("AdminTokenAuth"));
  const imagePath = process.env.NEXT_PUBLIC_LOGO_COLOR;
  const [attributesMap, setAttributesMap] = useState<any>({});

  // Estados para verificación de plan PRO
  const [hasProPlan, setHasProPlan] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

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

      // Buscar suscripciones activas
      const activeSubscriptions = response.data.subscriptions.filter(
        (sub: any) => sub.statusCode === "ACTIVE" || sub.statusCode === "EXPIRED"
      );

      // Verificar si tiene plan PRO
      const proSubscription = activeSubscriptions.find((sub: any) =>
        sub.name.toLowerCase().includes("pro")
      );

      setHasProPlan(!!proSubscription);
    } catch (error) {
      console.error("Error verificando plan de suscripción:", error);
      setHasProPlan(false);
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const fetchAttributesForItems = async (items: any) => {
    const attributesData: { [key: string]: any } = {};
    for (const item of items) {
      console.log(
        `Obteniendo atributos para Producto ID: ${item.sku.product.id} y SKU ID: ${item.sku.id}`
      );
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/products/${item.sku.product.id}/skus/${item.sku.id}/attributes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        console.log(
          `Respuesta completa para SKU ${item.sku.id}:`,
          response.data
        ); // Verifica toda la respuesta de la API

        // Mapeamos los atributos dentro de skuAttributes
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
    console.log("Mapa de atributos actualizado:", attributesData); // Verifica que el estado se esté actualizando
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/orders/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
        );
        const data = response.data;
        setPedido(data.order);
        // Llama a fetchAttributesForItems después de obtener los items de la orden
        fetchAttributesForItems(data.order.items);
      } catch (error) {
        console.error("Error al obtener el pedido:", error);
      }
    };

    fetchData();
    checkSubscriptionPlan();
  }, [id]);

  const handleDownloadPdf = async () => {
    if (printRef.current) {
      const canvas = await html2canvas(printRef.current, {
        scale: 2, // Increase the scale to improve resolution
        useCORS: true, // Enable cross-origin images
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4", // Standard A4 size
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Calculate the scale to fit the image within the page
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const scale = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const scaledWidth = imgWidth * scale;
      const scaledHeight = imgHeight * scale;

      pdf.addImage(imgData, "PNG", 0, 0, scaledWidth, scaledHeight);
      pdf.save(`Orden_Número_${pedido?.correlative}.pdf`);
    }
  };

  const handleCopyLink = (orderId: string) => {
    const orderUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/tienda/checkout/pago?orderId=${orderId}`;
    navigator.clipboard
      .writeText(orderUrl)
      .then(() => {
        toast.success("URL de pago copiada al portapapeles");
      })
      .catch((error) => {
        toast.error("Error al copiar la URL de pago");
        console.error("Error al copiar la URL de pago:", error);
      });
  };

  const translateOrderStatus = (status: string) => {
    switch (status) {
      case "PAYMENT_COMPLETED":
        return "Pagado";
      case "CREATED":
        return "Creado";
      case "PAYMENT_PENDING":
        return "Pendiente de pago";
      default:
        return status; // Devuelve el estado original si no coincide
    }
  };

  if (!pedido) {
    return <Loader />;
  }

  return (
    <>
      <title>Detalles de pedido</title>
      <section className="p-10">
        <Breadcrumb pageName="Mis Pedidos" />
        <div className="flex justify-between w-full b ">
          <Link
            href="/dashboard/pedidos"
            className="px-4 py-2 bg-primary text-white rounded-md mt-4"
          >
            Volver
          </Link>
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2 bg-primary text-white rounded-md mt-4"
          >
            Descargar PDF
          </button>
        </div>
        <div className="flex items-center w-full justify-center ">
          <div
            className="mb-6 p-6 w-full max-w-4xl bg-white rounded mt-6"
            ref={printRef}
          >
            <div className="text-center mt-6 mb-6">
              <img
                src={imagePath}
                alt="Logo Tavola"
                className="mx-auto max-h-40"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="border p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Pedido</h3>
                <p><strong>N°:</strong> {pedido.correlative}</p>
                <p>
                  <strong>Fecha:</strong> {new Date(pedido.creationDate).toLocaleDateString()}
                </p>
                <p><strong>Estado:</strong> {translateOrderStatus(pedido.statusCode)}</p>
                <p><strong>Tipo de Envío:</strong> {
                  pedido.deliveryType?.description === "WITHDRAWAL_FROM_STORE" 
                    ? "Retiro en Tienda"
                    : "Delivery"
                }</p>
                {(pedido.statusCode === "CREATED" ||
                  pedido.statusCode === "PAYMENT_PENDING") && hasProPlan && (
                  <button
                    onClick={() => handleCopyLink(pedido.id)}
                    className="text-blue-500 underline mt-2"
                  >
                    Copiar enlace de pago
                  </button>
                )}
              </div>
              <div className="border p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Cliente</h3>
                <p>
                  <strong>Nombre:</strong> {pedido.customer.firstname} {pedido.customer.lastname}
                </p>
                <p className="text-wrap">
                  <strong>Email:</strong> {pedido.customer.email}
                </p>
                <p>
                  <strong>Teléfono:</strong> {pedido.customer.phoneNumber}
                </p>
              </div>
            </div>
            <div className="mb-4">
              <div className="border p-3 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">Dirección</h3>
                <p>
                  {pedido.shippingInfo?.addressLine1 ||
                    "Dirección no disponible"}
                </p>
                <p>{pedido.shippingInfo?.addressLine2 || ""}</p>
                <p>
                  {pedido.shippingInfo?.commune?.name || "Comuna no disponible"}
                </p>
                <p>
                  {pedido.shippingInfo?.commune?.region?.name ||
                    "Región no disponible"}
                </p>
              </div>
            </div>
            <div className="rounded-lg mb-6">
              <h3 className="text-lg font-semibold mb-4">Productos</h3>
              {pedido.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col rounded-lg sm:flex-row sm:items-center my-4 border border-gray-300 pb-4 p-4"
                >
                  {/* Imagen del producto */}
                  <div className="sm:w-24 w-full mb-4 sm:mb-0 sm:mr-4 flex justify-center">
                    <ImageWithFallback
                      src={item.sku.mainImageUrl}
                      alt={item.sku.product.name}
                    />
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {item.sku.product.name}
                    </p>

                    {/* Mostrar atributos si existen */}
                    {attributesMap[item.sku.id]?.length > 0 && (
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

            <div className="border p-4 rounded-lg ">
              <div className="flex justify-between mb-2">
                <p>Subtotal</p>
                <p>${pedido.totals.itemsAmount.toLocaleString("es-CL")}</p>
              </div>
              <div className="flex justify-between mb-2">
                <p>Costo Despacho</p>
                <p>${pedido.totals.shippingAmount.toLocaleString("es-CL")}</p>
              </div>
              <div className="flex justify-between mb-2">
                <p>Descuento</p>
                <p>${pedido.totals.discountAmount.toLocaleString("es-CL")}</p>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>${pedido.totals.totalAmount.toLocaleString("es-CL")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
