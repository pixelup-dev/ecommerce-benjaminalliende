import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

interface Product {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  amount: number;
  quantity: number;
}

const ProductosMasVendidos: React.FC = () => {
  const token = getCookie("AdminTokenAuth") as string;
  const [currencyCodeId, setCurrencyCodeId] = useState<string | null>(null);
  const [mostSoldProducts, setMostSoldProducts] = useState<Product[] | null>(
    null
  );
  const [sortOrder, setSortOrder] = useState<"amount" | "quantity">("amount");
  const [loading, setLoading] = useState(true);

  const fetchCurrencyCode = async (token: string): Promise<string | null> => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/currency-codes?pageNumber=1&pageSize=50&statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const currencyCodes = response.data.currencyCodes;
      const clpCode = currencyCodes.find((code: any) => code.code === "CLP");
      return clpCode ? clpCode.id : null;
    } catch (error) {
      console.error("Error fetching currency code:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchMostSoldProducts = async (
      startDate: string,
      endDate: string,
      orderBy: "amount" | "quantity"
    ) => {
      try {
        setLoading(true);
        const currentCurrencyCodeId =
          currencyCodeId || (await fetchCurrencyCode(token));
        if (!currentCurrencyCodeId)
          throw new Error("Currency code ID not found");
        setCurrencyCodeId(currentCurrencyCodeId);

        // Configuración de la solicitud
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        };

        // Construye la URL con las fechas, orden Y statusCode para consistencia
        const url = `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/reports/most-selled-products?statusCode=PAYMENT_COMPLETED&startDate=${startDate}&endDate=${endDate}&currencyCodeId=${currentCurrencyCodeId}&orderBy=${orderBy}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;

        // Realiza la solicitud GET
        const response = await axios.get(url, config);

        const products = response.data.products;

        // Agrupar productos por productId y sumar cantidad y montos
        const groupedProducts: { [key: string]: Product } = {};
        products.forEach((product: Product) => {
          if (groupedProducts[product.productId]) {
            groupedProducts[product.productId].amount += product.amount;
            groupedProducts[product.productId].quantity += product.quantity;
          } else {
            groupedProducts[product.productId] = { ...product };
          }
        });

        const aggregatedProducts = Object.values(groupedProducts);

        // Ordenar los productos según el criterio seleccionado (amount o quantity)
        const sortedProducts = aggregatedProducts.sort(
          (a: Product, b: Product) =>
            orderBy === "amount" ? b.amount - a.amount : b.quantity - a.quantity
        );

        setMostSoldProducts(sortedProducts.slice(0, 10));
      } catch (error) {
        console.error("Error fetching most sold products:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllSalesData = async () => {
      const today = new Date();
      const currentYear = today.getFullYear();

      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      await fetchMostSoldProducts(startOfYear, endOfYear, sortOrder);
    };

    fetchAllSalesData();
  }, [token, sortOrder, currencyCodeId]);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `${index + 1}`;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-amber-100 border-amber-200 text-amber-700";
      case 1:
        return "bg-gray-100 border-gray-200 text-gray-700";
      case 2:
        return "bg-orange-100 border-orange-200 text-orange-700";
      default:
        return "bg-blue-100 border-blue-200 text-blue-700";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Top Productos</h2>
            <p className="text-gray-600 text-sm">
              Los más vendidos del año {new Date().getFullYear()}
            </p>
          </div>
        </div>

        {/* Controles de ordenamiento */}
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
              sortOrder === "amount"
                ? "bg-gray-700 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setSortOrder("amount")}
          >
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              Por Monto
            </span>
          </button>
          <button
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors duration-200 ${
              sortOrder === "quantity"
                ? "bg-gray-700 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => setSortOrder("quantity")}
          >
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z"
                  clipRule="evenodd"
                />
              </svg>
              Por Cantidad
            </span>
          </button>
        </div>
      </div>

      {/* Lista de productos */}
      <div className="p-6">
        {mostSoldProducts && mostSoldProducts.length > 0 ? (
          <div className="space-y-3 max-h-[550px] overflow-y-auto">
            {mostSoldProducts.map((product, index) => (
              <div
                key={product.productId}
                className="group relative bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center space-x-3">
                  {/* Ranking Badge - Más pequeño y simple */}
                  <div
                    className={`w-8 h-8 ${getRankColor(
                      index
                    )} rounded-full flex items-center justify-center font-bold text-xs border-2 flex-shrink-0`}
                  >
                    {getRankIcon(index)}
                  </div>

                  {/* Product Info - Simplificado */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-gray-700 transition-colors duration-200">
                      {product.productName}
                    </h3>
                    <div className="mt-2 flex space-x-4">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Cant:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {product.quantity.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Total:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(product.amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-500 text-center text-sm">
              No se encontraron productos vendidos en el período actual.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductosMasVendidos;
