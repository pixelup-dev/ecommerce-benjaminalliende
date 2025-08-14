/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader";

interface SubscriptionData {
  id: string;
  name: string;
  description: string;
  statusCode: string;
  startDate: Date;
  endDate: Date;
}

interface SubscriptionResponse {
  subscriptions: SubscriptionData[];
  totalRecords: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  productType: {
    id: string;
    code: string;
    name: string;
  };
  productPricings: Array<{
    amount: number;
  }>;
  projectType: {
    id: string;
    name: string;
    description: string | null;
  };
}

const RenovarSuscripcion = () => {
  const [subscriptionData, setSubscriptionData] =
    useState<SubscriptionData | null>(null);
  const [renewalOptions, setRenewalOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const token = getCookie("AdminTokenAuth");

  // Función para obtener la suscripción
  const fetchSubscription = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/subscriptions?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Respuesta de suscripciones:", response.data);

      // Buscamos la primera suscripción que sea ACTIVE o EXPIRED
      const validSubscription = response.data.subscriptions.find(
        (sub: SubscriptionData) =>
          sub.statusCode === "ACTIVE" || sub.statusCode === "EXPIRED"
      );

      if (validSubscription) {
        setSubscriptionData(validSubscription);
        console.log("ID de suscripción para renovación:", validSubscription.id);
      }
    } catch (err) {
      console.error("Error fetching subscription data:", err);
      setError("Error al obtener la suscripción.");
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener las opciones de renovación
  const fetchRenewalOptions = async () => {
    if (!subscriptionData?.id) return;

    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/subscriptions/${subscriptionData.id}/renewals/products?pageNumber=1&pageSize=50&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Verificar si el producto individual existe y no está en el array de productos
      const productsArray: Product[] = response.data.products || [];
      const singleProduct: Product | null = response.data.product || null;

      const allProducts =
        singleProduct &&
        !productsArray.some((p: Product) => p.id === singleProduct.id)
          ? [singleProduct, ...productsArray]
          : productsArray;

      setRenewalOptions(allProducts);
      console.log(allProducts, "renewalOptions");
    } catch (err) {
      console.error("Error fetching renewal options:", err);
      setError("Error al obtener las opciones de renovación.");
    } finally {
      setLoading(false);
    }
  };

  // Función para filtrar productos por categoría y ordenar por precio
  const filterProductsByCategory = (products: Product[], category: string) => {
    const filteredProducts = products.filter((product: Product) =>
      product.name.toLowerCase().includes(category.toLowerCase())
    );
    
    // Ordenar por precio de menor a mayor
    return filteredProducts.sort((a: Product, b: Product) => {
      const priceA = a.productPricings[0]?.amount || 0;
      const priceB = b.productPricings[0]?.amount || 0;
      return priceA - priceB;
    });
  };

  // Función para manejar la selección de un producto
  const handleSelectProduct = (productId: string) => {
    setSelectedProduct(productId);
  };

  // Función para generar la renovación
  const handleRenewSubscription = async () => {
    if (!selectedProduct || !subscriptionData?.id) {
      alert("Por favor selecciona una opción de renovación.");
      return;
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/subscriptions/${subscriptionData.id}/renewals`,
        {
          productId: selectedProduct,
          currencyCodeId: "8ccc1abd-b35b-45ff-b814-b7c78fff3594",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Obtener el ID de la orden de la respuesta
      const orderId = response.data.subscription.orderId;

      // Construir la URL de redirección según el entorno
      const orderUrl = `${process.env.NEXT_PUBLIC_PIXELUP_URL}/order-checkout?orderId=${orderId}`;

      // Redirigir al usuario a la página de pago
      window.location.href = orderUrl;
    } catch (error) {
      console.error("Error al renovar la suscripción:", error);
    }
  };

  useEffect(() => {
    fetchSubscription();
    // Solo llamar a fetchRenewalOptions cuando tengamos el subscriptionData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (subscriptionData?.id) {
      fetchRenewalOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptionData]);

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white py-8">
        <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:16px_16px]"></div>
        <div className="relative mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100 animate-fade-in">
              Renueva Tu Suscripción
            </h1>
            <p className="text-base text-gray-100 max-w-2xl mx-auto leading-relaxed opacity-90 animate-fade-in-up">
              Mantén activos todos los beneficios de tu suscripción PixelUp
            </p>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center   bg-gray-100">
        <div className="p-6 mt-10">
          <h1 className="text-xl font-bold mb-4">Suscripción Actual</h1>
          {subscriptionData ? (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-gray-600 text-sm font-medium w-24">Nombre:</span>
                  <span className="text-gray-900 font-semibold">{subscriptionData.name}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 text-sm font-medium w-16">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      subscriptionData.statusCode === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriptionData.statusCode}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 text-sm font-medium w-16">Inicio:</span>
                    <span className="text-gray-900 font-semibold">
                      {new Date(subscriptionData.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 text-sm font-medium w-16">Fin:</span>
                    <span className="text-gray-900 font-semibold">
                      {new Date(subscriptionData.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto text-center">
              <p className="text-gray-500">No se encontró información de la suscripción.</p>
            </div>
          )}
                      <h1 className="text-sm text-center mt-3">
              *Si mejoras tu suscripción, las nuevas herramientas se activarán al finalizar el periodo establecido en tu plan actual.
            </h1>

          <h1 className="text-xl font-bold mt-10">Opciones de Renovación</h1>
            <h2 className="text-sm  ">
              Elige la opción que mejor se ajuste a tus necesidades de tu negocio.
            </h2>
            <h3 className="text-sm mb-4">         Si no conoces el detalle de cada plan, te recomendamos visitar <a href="https://pixelup.cl/planes" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"> Pixel Up Planes</a> 
            </h3>
          {renewalOptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
              {/* Columna 1 - Inicia */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-center mb-4 text-blue-600 border-b pb-2">
                  Plan Inicia
                </h3>
                <div className="space-y-4">
                  {filterProductsByCategory(renewalOptions, "inicia").map((product: any) => (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedProduct === product.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">
                          <p className="font-semibold text-sm">{product.name}</p>
                     {/*      <p className="text-xs text-gray-600 mt-1">
                            {product.description}
                          </p> */}
                          <p className="font-bold text-blue-600 mt-2">
                            {product.productPricings[0]?.amount
                              ? product.productPricings[0].amount.toLocaleString(
                                  "es-CL",
                                  { style: "currency", currency: "CLP" }
                                )
                              : "N/A"}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="renewalOption"
                          className="w-5 h-5 text-blue-600"
                          value={product.id}
                          checked={selectedProduct === product.id}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                      </div>
                    </div>
                  ))}
                  {filterProductsByCategory(renewalOptions, "inicia").length === 0 && (
                    <p className="text-gray-500 text-center text-sm py-4">
                      No hay opciones disponibles
                    </p>
                  )}
                </div>
              </div>

              {/* Columna 2 - Avanzado */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-center mb-4 border-b pb-2" style={{ color: '#FF3366' }}>
                  Plan Avanzado
                </h3>
                <div className="space-y-4">
                  {filterProductsByCategory(renewalOptions, "avanzado").map((product: any) => (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedProduct === product.id
                          ? "border-gray-200"
                          : "border-gray-200"
                      }`}
                      style={{
                        borderColor: selectedProduct === product.id ? '#FF3366' : undefined,
                        backgroundColor: selectedProduct === product.id ? '#FFF5F7' : undefined,
                      }}
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">
                          <p className="font-semibold text-sm">{product.name}</p>
                              {/* <p className="text-xs text-gray-600 mt-1">
                                {product.description}
                              </p> */}
                          <p className="font-bold mt-2" style={{ color: '#FF3366' }}>
                            {product.productPricings[0]?.amount
                              ? product.productPricings[0].amount.toLocaleString(
                                  "es-CL",
                                  { style: "currency", currency: "CLP" }
                                )
                              : "N/A"}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="renewalOption"
                          className="w-5 h-5"
                          style={{ accentColor: '#FF3366' }}
                          value={product.id}
                          checked={selectedProduct === product.id}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                      </div>
                    </div>
                  ))}
                  {filterProductsByCategory(renewalOptions, "avanzado").length === 0 && (
                    <p className="text-gray-500 text-center text-sm py-4">
                      No hay opciones disponibles
                    </p>
                  )}
                </div>
              </div>

              {/* Columna 3 - Pro */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-center mb-4 text-green-600 border-b pb-2">
                  Plan Pro
                </h3>
                <div className="space-y-4">
                  {filterProductsByCategory(renewalOptions, "pro").map((product: any) => (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedProduct === product.id
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-green-300"
                      }`}
                      onClick={() => handleSelectProduct(product.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-grow">
                          <p className="font-semibold text-sm">{product.name}</p>
                     {/*      <p className="text-xs text-gray-600 mt-1">
                            {product.description}
                          </p> */}
                          <p className="font-bold text-green-600 mt-2">
                            {product.productPricings[0]?.amount
                              ? product.productPricings[0].amount.toLocaleString(
                                  "es-CL",
                                  { style: "currency", currency: "CLP" }
                                )
                              : "N/A"}
                          </p>
                        </div>
                        <input
                          type="radio"
                          name="renewalOption"
                          className="w-5 h-5 text-green-600"
                          value={product.id}
                          checked={selectedProduct === product.id}
                          onChange={() => handleSelectProduct(product.id)}
                        />
                      </div>
                    </div>
                  ))}
                  {filterProductsByCategory(renewalOptions, "pro").length === 0 && (
                    <p className="text-gray-500 text-center text-sm py-4">
                      No hay opciones disponibles
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p>No hay opciones de renovación disponibles.</p>
          )}

          <div className="flex justify-center mb-10">
            <button
              onClick={handleRenewSubscription}
              className="mt-4 bg-dark px-4 py-2 text-white p-2 rounded hover:scale-105 transition-all"
            >
              Confirmar Renovación
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default RenovarSuscripcion;
