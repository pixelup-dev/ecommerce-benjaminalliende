import React, { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";

const CompararVentas: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  const defaultStartDate2 = `${currentYear}-${String(currentMonth).padStart(
    2,
    "0"
  )}-01`;
  const defaultEndDate2 = `${currentYear}-${String(currentMonth).padStart(
    2,
    "0"
  )}-${new Date(currentYear, currentMonth, 0).getDate()}`;

  const defaultStartDate1 = `${previousMonthYear}-${String(
    previousMonth
  ).padStart(2, "0")}-01`;
  const defaultEndDate1 = `${previousMonthYear}-${String(
    previousMonth
  ).padStart(2, "0")}-${new Date(
    previousMonthYear,
    previousMonth,
    0
  ).getDate()}`;

  const [startDate1, setStartDate1] = useState<string>(defaultStartDate1);
  const [endDate1, setEndDate1] = useState<string>(defaultEndDate1);
  const [startDate2, setStartDate2] = useState<string>(defaultStartDate2);
  const [endDate2, setEndDate2] = useState<string>(defaultEndDate2);
  const [salesMonth1, setSalesMonth1] = useState<number | null>(null);
  const [salesMonth2, setSalesMonth2] = useState<number | null>(null);
  const [percentageChange, setPercentageChange] = useState<number | null>(null);
  const [currencyCodeId, setCurrencyCodeId] = useState<string | null>(null);

  // Fetch currency code ID once on mount
  useEffect(() => {
    const fetchCurrencyCode = async () => {
      try {
        const token = getCookie("AdminTokenAuth");
        const currencyResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/currency-codes?pageNumber=1&pageSize=50&statusCode=ACTIVE&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (
          currencyResponse.data &&
          currencyResponse.data.currencyCodes &&
          currencyResponse.data.currencyCodes.length > 0
        ) {
          setCurrencyCodeId(currencyResponse.data.currencyCodes[0].id);
        } else {
          console.error("Currency code ID not found.");
        }
      } catch (error) {
        console.error("Error fetching currency code:", error);
      }
    };

    fetchCurrencyCode();
  }, []);

  const fetchSalesData = async (startDate: string, endDate: string) => {
    if (!currencyCodeId) {
      console.error("Currency code ID is required");
      return null;
    }

    if (!startDate || !endDate) {
      console.error("Both start date and end date are required");
      return null;
    }

    try {
      const token = getCookie("AdminTokenAuth");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/reports/sales-summary?statusCode=PAYMENT_COMPLETED&startDate=${startDate}&endDate=${endDate}&currencyCodeId=${currencyCodeId}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Sales Data Response:", response.data);

      // Calcula la suma total de ventas en el periodo
      const totalSales = response.data.sales.reduce(
        (total: number, sale: { amount: number }) => total + sale.amount,
        0
      );

      return totalSales;
    } catch (error) {
      console.error("Error fetching sales data:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      // Solo ejecutar si currencyCodeId está disponible
      if (!currencyCodeId) {
        return;
      }

      const sales1 = await fetchSalesData(startDate1, endDate1);
      const sales2 = await fetchSalesData(startDate2, endDate2);

      setSalesMonth1(sales1);
      setSalesMonth2(sales2);

      if (sales1 !== null && sales2 !== null) {
        if (sales1 === 0) {
          // Maneja el caso donde las ventas del primer mes son 0
          setPercentageChange(sales2 > 0 ? 100 : 0); // Si sales2 es mayor que 0, es un 100% de incremento, sino 0%
        } else {
          const change = ((sales2 - sales1) / sales1) * 100;
          setPercentageChange(change);
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate1, endDate1, startDate2, endDate2, currencyCodeId]);

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Cargando...";
    return amount.toLocaleString("es-CL", {
      style: "currency",
      currency: "CLP",
    });
  };

  const getChangeIcon = () => {
    if (percentageChange === null) return null;
    if (percentageChange > 0) {
      return (
        <svg
          className="w-5 h-5 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-5 h-5 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    }
  };

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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Comparar Períodos
            </h2>
            <p className="text-gray-600 text-sm">
              Análisis comparativo de ventas
            </p>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Configuración de períodos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Período 1 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-2">
                1
              </span>
              Primer Período
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={startDate1}
                  onChange={(e) => setStartDate1(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={endDate1}
                  onChange={(e) => setEndDate1(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-sm"
                />
              </div>
            </div>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total de Ventas</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(salesMonth1)}
              </p>
            </div>
          </div>

          {/* Período 2 */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
              <span className="w-6 h-6 bg-gray-600 text-white rounded-full flex items-center justify-center text-xs font-medium mr-2">
                2
              </span>
              Segundo Período
            </h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Inicio
                </label>
                <input
                  type="date"
                  value={startDate2}
                  onChange={(e) => setStartDate2(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha Fin
                </label>
                <input
                  type="date"
                  value={endDate2}
                  onChange={(e) => setEndDate2(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-sm"
                />
              </div>
            </div>
            <div className="bg-white rounded-md p-3 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Total de Ventas</p>
              <p className="text-xl font-semibold text-gray-900">
                {formatCurrency(salesMonth2)}
              </p>
            </div>
          </div>
        </div>

        {/* Resultados de comparación */}
        {salesMonth1 !== null &&
          salesMonth2 !== null &&
          percentageChange !== null && (
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                Resultado de la Comparación
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Diferencia absoluta */}
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-600 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <p className="text-sm text-gray-600 mb-1">Diferencia</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(Math.abs(salesMonth2 - salesMonth1))}
                  </p>
                </div>

                {/* Porcentaje de cambio */}
                <div className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                      percentageChange >= 0
                        ? "bg-green-100 border border-green-200"
                        : "bg-red-100 border border-red-200"
                    }`}
                  >
                    {getChangeIcon()}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    Cambio Porcentual
                  </p>
                  <p
                    className={`text-xl font-semibold ${
                      percentageChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {percentageChange >= 0 ? "+" : ""}
                    {percentageChange.toFixed(1)}%
                  </p>
                </div>

                {/* Tendencia */}
                <div className="text-center">
                  <div
                    className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                      percentageChange >= 0
                        ? "bg-blue-100 border border-blue-200"
                        : "bg-orange-100 border border-orange-200"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        percentageChange >= 0 ? "text-blue-600" : "text-orange-600"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Tendencia</p>
                  <p
                    className={`text-base font-medium ${
                      percentageChange >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {percentageChange >= 0 ? "Crecimiento" : "Decrecimiento"}
                  </p>
                </div>
              </div>

              {/* Interpretación */}
              <div className="mt-6 p-4 bg-white rounded-md border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">
                  Interpretación
                </h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {percentageChange >= 0 ? (
                    <>
                      <span className="font-medium text-green-600">
                        📈 Tendencia positiva:
                      </span>{" "}
                      Las ventas del segundo período aumentaron en{" "}
                      <span className="font-semibold">
                        {percentageChange.toFixed(1)}%
                      </span>{" "}
                      comparado con el primer período, lo que representa un
                      incremento de{" "}
                      <span className="font-semibold">
                        {formatCurrency(salesMonth2 - salesMonth1)}
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-red-600">
                        📉 Tendencia negativa:
                      </span>{" "}
                      Las ventas del segundo período disminuyeron en{" "}
                      <span className="font-semibold">
                        {Math.abs(percentageChange).toFixed(1)}%
                      </span>{" "}
                      comparado con el primer período, lo que representa una
                      reducción de{" "}
                      <span className="font-semibold">
                        {formatCurrency(Math.abs(salesMonth2 - salesMonth1))}
                      </span>
                      .
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default CompararVentas;
