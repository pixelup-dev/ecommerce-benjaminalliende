import React, { useEffect, useState } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import Loader from "@/components/common/Loader-t";
import CardDataStats from "../../../Core/StatsBox/CardDataStats01";

interface Sale {
  amount: number;
}

const VentasTotalesAnuales: React.FC = () => {
  const token = getCookie("AdminTokenAuth") as string;
  const [totalYearlySales, setTotalYearlySales] = useState<number | null>(null);
  const [currencyCodeId, setCurrencyCodeId] = useState<string | null>(null);

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

  const fetchSalesSummary = async (startDate: string, endDate: string) => {
    try {
      const currentCurrencyCodeId =
        currencyCodeId || (await fetchCurrencyCode(token));
      if (!currentCurrencyCodeId) throw new Error("Currency code ID not found");
      setCurrencyCodeId(currentCurrencyCodeId);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const url = `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/reports/sales-summary?startDate=${startDate}&endDate=${endDate}&statusCode=PAYMENT_COMPLETED&currencyCodeId=${currentCurrencyCodeId}&siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`;
      const response = await axios.get(url, config);

      const sales: Sale[] = response.data.sales;
      return sales;
    } catch (error) {
      console.error("Error fetching sales summary:", error);
      return [];
    }
  };

  const fetchAllSalesData = async () => {
    const today = new Date();
    const currentYear = today.getFullYear();

    const startOfYear = `${currentYear}-01-01`;
    const endOfYear = `${currentYear}-12-31`;

    const yearlySales = await fetchSalesSummary(startOfYear, endOfYear);

    const sumAmounts = (sales: Sale[]): number =>
      sales
        .filter((sale) => sale.amount > 0)
        .reduce((sum, sale) => sum + sale.amount, 0);

    setTotalYearlySales(sumAmounts(yearlySales));
  };

  useEffect(() => {
    fetchAllSalesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currencyCodeId]);

  return (
    <>
      {totalYearlySales !== null ? (
        <div className="transform transition-all duration-300">
          <CardDataStats
            title="Ventas Totales en el Año"
            total={totalYearlySales.toLocaleString("es-CL", {
              style: "currency",
              currency: "CLP",
            })}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </CardDataStats>
        </div>
      ) : (
        <div className="transform transition-all duration-300">
          <Loader />
        </div>
      )}
    </>
  );
};

export default VentasTotalesAnuales;
