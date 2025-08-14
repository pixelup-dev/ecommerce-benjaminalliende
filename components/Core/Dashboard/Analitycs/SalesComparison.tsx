"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import StatsComparison from "./StatsComparison";

const SalesComparison = () => {
  const [currentMonthSales, setCurrentMonthSales] = useState<number>(0);
  const [previousMonthSales, setPreviousMonthSales] = useState<number>(0);
  const [annualSales, setAnnualSales] = useState<number>(0);

  const fetchCurrencyCode = async (token: string) => {
    try {
      const currencyResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/currency-codes?pageNumber=1&pageSize=50&statusCode=ACTIVE`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (
        currencyResponse.data &&
        currencyResponse.data.currencyCodes.length > 0
      ) {
        return currencyResponse.data.currencyCodes[0].id;
      }
    } catch (error) {
      console.error("Error fetching currency code:", error);
    }
    return null;
  };

  const fetchSalesSummary = async (startDate: string, endDate: string) => {
    try {
      const token = getCookie("AdminTokenAuth");

      const currencyCodeId = await fetchCurrencyCode(token as string);

      if (!currencyCodeId) {
        throw new Error("Currency code ID not found");
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const url = `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/reports/sales-summary?statusCode=PAYMENT_COMPLETED&startDate=${startDate}&endDate=${endDate}&currencyCodeId=${currencyCodeId}`;

      const response = await axios.get(url, config);
      return response.data.sales;
    } catch (error) {
      console.error("Error fetching sales summary:", error);
      return [];
    }
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // Meses de 0 a 11, por eso se suma 1
    const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const previousMonthYear =
      currentMonth === 1 ? currentYear - 1 : currentYear;

    const currentMonthStartDate = `${currentYear}-${String(
      currentMonth
    ).padStart(2, "0")}-01`;
    const currentMonthEndDate = `${currentYear}-${String(currentMonth).padStart(
      2,
      "0"
    )}-${new Date(currentYear, currentMonth, 0).getDate()}`;

    const previousMonthStartDate = `${previousMonthYear}-${String(
      previousMonth
    ).padStart(2, "0")}-01`;
    const previousMonthEndDate = `${previousMonthYear}-${String(
      previousMonth
    ).padStart(2, "0")}-${new Date(
      previousMonthYear,
      previousMonth,
      0
    ).getDate()}`;

    const annualStartDate = `${currentYear}-01-01`;
    const annualEndDate = `${currentYear}-12-31`;

    const fetchData = async () => {
      const currentMonthData = await fetchSalesSummary(
        currentMonthStartDate,
        currentMonthEndDate
      );
      const previousMonthData = await fetchSalesSummary(
        previousMonthStartDate,
        previousMonthEndDate
      );
      const annualData = await fetchSalesSummary(
        annualStartDate,
        annualEndDate
      );

      const currentMonthTotal = currentMonthData.reduce(
        (total: any, item: any) => total + item.amount,
        0
      );
      const previousMonthTotal = previousMonthData.reduce(
        (total: any, item: any) => total + item.amount,
        0
      );
      const annualTotal = annualData.reduce(
        (total: any, item: any) => total + item.amount,
        0
      );

      setCurrentMonthSales(currentMonthTotal);
      setPreviousMonthSales(previousMonthTotal);
      setAnnualSales(annualTotal);
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-4 bg-white dark:bg-boxdark-2 shadow rounded-lg">
      <h2 className="text-lg font-medium text-gray-700 dark:text-bodydark mb-4">
        Resumen de Ventas
      </h2>
      <div className="flex flex-wrap justify-between">
        <div className="w-full md:w-1/3 p-2">
          <div className="bg-white dark:bg-boxdark-2 p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-700 dark:text-bodydark">
              Ventas Totales del Año
            </h3>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">
              {annualSales}
            </p>
          </div>
        </div>
        <div className="w-full md:w-1/3 p-2">
          <StatsComparison
            currentMonthValue={currentMonthSales}
            previousMonthValue={previousMonthSales}
            label="Ventas del Mes"
          />
        </div>
      </div>
    </div>
  );
};

export default SalesComparison;
