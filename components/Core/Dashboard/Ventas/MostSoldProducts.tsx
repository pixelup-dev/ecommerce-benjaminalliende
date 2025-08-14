import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";

interface Product {
  productId: string;
  productName: string;
  productImageUrl: string | null;
  amount: number;
  quantity: number;
}

interface MostSoldProductsProps {
  salesData: Product[];
  startDateProducts: string;
  endDateProducts: string;
  setStartDateProducts: (date: string) => void;
  setEndDateProducts: (date: string) => void;
  fetchMostSoldProducts: (
    startDate: string,
    endDate: string,
    orderBy: string
  ) => void;
}

const MostSoldProducts: React.FC<MostSoldProductsProps> = ({
  salesData,
  startDateProducts,
  endDateProducts,
  setStartDateProducts,
  setEndDateProducts,
  fetchMostSoldProducts,
}) => {
  const [orderBy, setOrderBy] = useState<string>("amount");
  const [filteredData, setFilteredData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchMostSoldProducts(startDateProducts, endDateProducts, orderBy);
    setTimeout(() => setLoading(false), 1000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDateProducts, endDateProducts, orderBy]);

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      // Agregamos los datos por productId para evitar duplicados
      const aggregatedData = salesData.reduce((acc: any[], product) => {
        const existingProduct = acc.find(
          (item) => item.productId === product.productId
        );

        if (existingProduct) {
          existingProduct.quantity += product.quantity;
          existingProduct.amount += product.amount;
        } else {
          acc.push({ ...product });
        }

        return acc;
      }, []);

      // Ordenamos según el criterio seleccionado
      const sorted = [...aggregatedData].sort((a: any, b: any) => {
        if (orderBy === "amount") {
          return b.amount - a.amount;
        } else {
          return b.quantity - a.quantity;
        }
      });

      setFilteredData(sorted);
    } else {
      setFilteredData([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [salesData, orderBy]);

  useEffect(() => {
    if (startDateProducts && endDateProducts) {
      fetchMostSoldProducts(startDateProducts, endDateProducts, orderBy);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTotalStats = () => {
    const totalProducts = filteredData.length;
    const totalQuantity = filteredData.reduce(
      (sum, product) => sum + product.quantity,
      0
    );
    const totalAmount = filteredData.reduce(
      (sum, product) => sum + product.amount,
      0
    );

    return { totalProducts, totalQuantity, totalAmount };
  };

  const { totalProducts, totalQuantity, totalAmount } = getTotalStats();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Productos por Período
            </h2>
            <p className="text-gray-600 text-sm">
              Análisis detallado por rango de fechas
            </p>
          </div>
        </div>

        {/* Filtros mejorados */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDateProducts}
              onChange={(e) => setStartDateProducts(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-gray-900 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDateProducts}
              onChange={(e) => setEndDateProducts(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-gray-900 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Ordenar por
            </label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-gray-900 text-sm"
            >
              <option value="amount">💰 Monto de Ventas</option>
              <option value="quantity">📦 Cantidad Vendida</option>
            </select>
          </div>
        </div>

        {/* Resumen de estadísticas */}
        {filteredData.length > 0 && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total Productos</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalProducts}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                  <svg
                    className="w-4 h-4 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.51-1.31c-.562-.649-1.413-1.076-2.353-1.253V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Unidades Vendidas</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {totalQuantity.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                  <svg
                    className="w-4 h-4 text-gray-600"
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
                </div>
                <div>
                  <p className="text-xs text-gray-600">Ingresos Totales</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="animate-pulse flex items-center space-x-3"
              >
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-24 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredData.length > 0 ? (
          <div className="space-y-3">
            {/* Información del período */}
            <div className="bg-gray-50 rounded-md p-3 border border-gray-200 mb-4">
              <p className="text-sm text-gray-600">
                📅 Mostrando resultados del{" "}
                <span className="font-medium">
                  {formatDate(startDateProducts)}
                </span>{" "}
                al{" "}
                <span className="font-medium">
                  {formatDate(endDateProducts)}
                </span>
              </p>
            </div>

            {/* Tabla moderna */}
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <div className="overflow-x-auto max-h-80">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Ingresos
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Participación
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((product, index) => {
                      const participation =
                        (product.amount / totalAmount) * 100;
                      return (
                        <tr
                          key={`${product.productId}-${index}`}
                          className="hover:bg-gray-50 transition-colors duration-200 group"
                        >
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-600 text-white text-xs font-medium rounded-full">
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-2">
                                <svg
                                  className="w-4 h-4 text-gray-500"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 group-hover:text-gray-700 transition-colors duration-200 truncate">
                                  {product.productName}
                                </p>
                                <p className="text-xs text-gray-500">
                                  ID: {product.productId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              {product.quantity.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                              {formatCurrency(product.amount)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                                <div
                                  className="bg-gray-600 h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${Math.min(participation, 100)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-gray-700">
                                {participation.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
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
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No hay productos en este período
            </h3>
            <p className="text-gray-500 text-center text-sm">
              No se encontraron productos vendidos en el rango de fechas
              seleccionado. Intenta ajustar las fechas o verifica que existan ventas en este
              período.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MostSoldProducts;
