"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "cookies-next";
import axios from "axios";
import Loader from "@/components/common/Loader"; // Usa tu componente de Loader si es necesario
import Breadcrumb from "@/components/Core/Breadcrumbs/Breadcrumb"; // Usa tu componente de Breadcrumb si es necesario
import Link from "next/link";
import toast from "react-hot-toast";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css"; // Importar los estilos de Quill
import Modal from "@/components/Core/Modals/ModalSeo";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Interfaz del canje (Exchange)
interface ExchangeDetail {
  companyImageUrl: string | undefined;
  product: {
    productPricings: {
      currencyCodeId: string;
      amount: number;
    }[];
  } | null;
  mainImageUrl: any;
  id: string;
  companyName: string;
  name: string;
  description: string;
  extendedDescription: string;
  stock: number;
  creditAmount: number;
}

export default function DetalleCanje() {
  const { id } = useParams(); // Extrae el ID del canje desde la URL
  const [exchange, setExchange] = useState<ExchangeDetail | null>(null);
  const [loadingPurchase, setLoadingPurchase] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "MONEY" | "PIXELCOINS" | null
  >(null);
  const Token = String(getCookie("AdminTokenAuth"));
  const router = useRouter(); // Para redirigir después de la compra
  const searchParams = useSearchParams(); // Para obtener los parámetros de la URL actual
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchExchange = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/exchanges/${id}?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setExchange(response.data.exchange);
      } catch (error) {
        console.error("Error al obtener el detalle del canje:", error);
        toast.error("Error al obtener el detalle del canje.");
      }
    };

    fetchExchange();
  }, [id, Token]);

  const handlePurchase = async () => {
    if (!exchange || loadingPurchase || !paymentMethod) return;

    setLoadingPurchase(true);

    try {
      const body = {
        exchangeId: exchange.id,
        paymentMethodCode: paymentMethod,
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/exchanges/generations?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        body,
        {
          headers: {
            Authorization: `Bearer ${Token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (paymentMethod === "MONEY") {
        const orderId = response.data.exchange.orderId;
        const checkoutUrl = `${process.env.NEXT_PUBLIC_CHECKOUT_URL}/order-checkout?orderId=${orderId}`;
        window.open(checkoutUrl, '_blank');
      } else {
        setShowSuccessModal(true);
      }

      setLoadingPurchase(false);
      setShowModal(false);
    } catch (error: any) {
      console.error("Error en la compra:", error.response?.data || error);
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
      setLoadingPurchase(false);
    }
  };

  const openPurchaseModal = (method: "MONEY" | "PIXELCOINS") => {
    setPaymentMethod(method);
    setShowModal(true);
  };

  // Función para volver a la tienda preservando los parámetros de la URL
  const handleBackToStore = () => {
    // Obtener los parámetros de la URL actual
    const params = new URLSearchParams(searchParams.toString());
    
    // Construir la URL de retorno con los parámetros
    const returnUrl = `/dashboard/tienda-pixelup?${params.toString()}`;
    
    // Navegar a la URL de retorno
    router.push(returnUrl);
  };

  if (!exchange) {
    return <Loader />; // Muestra un loader mientras se obtienen los datos
  }

  return (
    <section className="min-h-screen bg-gray-50">
      {/* Contenido principal mejorado */}
      <div className="px-auto pb-12">
        <div className="w-full bg-white">
          {/* Banner y logo */}
          <div className="relative h-48">
            <img
              src={exchange?.mainImageUrl}
              alt={exchange?.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

            <img
              src={exchange?.companyImageUrl}
              alt={exchange?.companyName}
              className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2
                       w-16 h-16 sm:w-24 sm:h-24 rounded-2xl border-2 border-gray-50 shadow-md 
                       bg-white object-contain p-2"
            />

            {/* Botón volver reubicado */}
            <button
              onClick={handleBackToStore}
              className="absolute top-4 left-4 inline-flex items-center px-3 py-2 
                       bg-black/30 hover:bg-black/40 text-white rounded-lg 
                       transition-colors backdrop-blur-sm text-sm"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Volver a la tienda
            </button>
          </div>

          {/* Contenido */}
          <div className="p-3 pt-10 sm:p-6 sm:pt-14">
            <div className="max-w-4xl mx-auto">
              {/* Header info */}
              <div className="flex flex-col items-center mb-4">
                <h1 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 text-center px-2">
                  {exchange?.name}
                </h1>
              </div>

              {/* Stats y botones en un contenedor */}
              <div className="bg-gray-100 rounded-xl p-3 sm:p-4 mb-6">
                {/* Stats mejorados - más compactos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div className="bg-white p-2 sm:p-3 rounded-lg text-center">
                    <p className="text-base sm:text-lg font-bold text-rosa">
                      {exchange?.creditAmount?.toLocaleString("es-CL")}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">
                      PixelCoins
                    </p>
                  </div>

                  <div className="bg-white p-2 sm:p-3 rounded-lg text-center">
                    <p className="text-base sm:text-lg font-bold text-gray-800">
                      {exchange?.product?.productPricings?.[0]?.amount
                        ? `$${exchange.product.productPricings[0].amount.toLocaleString(
                            "es-CL"
                          )}`
                        : "N/A"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">
                      Precio CLP
                    </p>
                  </div>

                  <div className="bg-white p-2 sm:p-3 rounded-lg text-center">
                    <p className="text-base sm:text-lg font-bold text-gray-800">
                      {exchange?.stock || "Agotado"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600">
                      Stock Disponible
                    </p>
                  </div>
                </div>

                {/* Botones de acción - más compactos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={() => openPurchaseModal("PIXELCOINS")}
                    disabled={!exchange?.stock || loadingPurchase}
                    className="bg-rosa hover:bg-rosa/90 text-white py-2 sm:py-2.5 px-4
                              rounded-lg font-medium transition-all duration-300
                              disabled:opacity-50 disabled:cursor-not-allowed
                              text-xs sm:text-sm hover:shadow-lg hover:scale-[1.02]"
                  >
                    {loadingPurchase
                      ? "Procesando..."
                      : "Canjear con PixelCoins"}
                  </button>

                  <button
                    onClick={() => openPurchaseModal("MONEY")}
                    disabled={!exchange?.stock || loadingPurchase}
                    className="bg-gray-800 hover:bg-gray-900 text-white py-2 sm:py-2.5 px-4
                              rounded-lg font-medium transition-all duration-300
                              disabled:opacity-50 disabled:cursor-not-allowed
                              text-xs sm:text-sm hover:shadow-lg hover:scale-[1.02]"
                  >
                    {loadingPurchase ? "Procesando..." : "Comprar"}
                  </button>
                </div>
              </div>

              {/* Descripción con borde superior sutil */}
              <div className="prose max-w-none pt-4 border-t border-gray-100">
                <ReactQuill
                  value={exchange?.extendedDescription}
                  readOnly={true}
                  theme="bubble"
                  className="text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal mejorado */}
      <Modal
        showModal={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="p-6 max-w-md w-full">
          {/* Encabezado del modal */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden">
              <img 
                src={exchange?.companyImageUrl} 
                alt={exchange?.name}
                className="h-full object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {paymentMethod === "MONEY" ? "Comprar producto" : "Canjear producto"}
              </h2>
              <p className="text-sm text-gray-500">{exchange?.name}</p>
            </div>
          </div>

          {/* Detalles de la transacción */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600">Método de pago:</span>
              <span className="font-medium text-gray-800">
                {paymentMethod === "MONEY" ? "Dinero (CLP)" : "PixelCoins"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold text-lg text-gray-800">
                {paymentMethod === "MONEY" 
                  ? `$${exchange?.product?.productPricings?.[0]?.amount?.toLocaleString("es-CL")}`
                  : `${exchange?.creditAmount?.toLocaleString("es-CL")} PixelCoins`
                }
              </span>
            </div>
          </div>

          {/* Mensaje de confirmación */}
          <p className="text-gray-600 mb-6 text-center">
            ¿Estás seguro de que deseas continuar con esta {paymentMethod === "MONEY" ? "compra" : "canje"}?
          </p>

          {/* Botones de acción */}
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowModal(false)}
              className="px-6 py-2.5 border border-gray-300 rounded-lg
                       text-gray-700 hover:bg-gray-50 transition-all duration-200
                       font-medium text-sm focus:ring-2 focus:ring-gray-200"
            >
              Cancelar
            </button>
            <button
              onClick={handlePurchase}
              disabled={loadingPurchase}
              className="px-6 py-2.5 bg-rosa text-white rounded-lg
                       hover:bg-rosa/90 transition-all duration-200
                       font-medium text-sm focus:ring-2 focus:ring-rosa/50
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center min-w-[120px]"
            >
              {loadingPurchase ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : "Confirmar"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de éxito */}
      <Modal
        showModal={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
      >
        <div className="p-6 max-w-md w-full">
          <div className="text-center">
            {/* Ícono de éxito */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              ¡Canje exitoso!
            </h3>

            {/* Detalles del producto */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <img
                  src={exchange?.companyImageUrl}
                  alt={exchange?.name}
                  className="h-16 rounded-lg object-cover"
                />
                <div className="text-center">
                  <p className="font-medium text-gray-900">{exchange?.name}</p>
                  <p className="text-sm text-gray-500">{exchange?.companyName}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center border-t pt-4">
                <span className="text-gray-600">Costo:</span>
                <span className="font-bold text-rosa">
                  {exchange?.creditAmount?.toLocaleString("es-CL")} PixelCoins
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Recibirás un correo electrónico con la confirmación y los detalles de tu canje.
            </p>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full px-4 py-2 bg-rosa text-white rounded-lg
                       hover:bg-rosa/90 transition-all duration-200
                       font-medium focus:ring-2 focus:ring-rosa/50"
            >
              Entendido
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
