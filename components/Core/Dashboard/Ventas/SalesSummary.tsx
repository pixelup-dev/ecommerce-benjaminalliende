import React, { useEffect, useState } from "react";
import "tailwindcss/tailwind.css";
import ReactECharts from "echarts-for-react";

interface SalesDataItem {
  id: number;
  date: string;
  amount: number;
}

interface SalesSummaryProps {
  salesData: SalesDataItem[] | null;
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

const SalesSummary: React.FC<SalesSummaryProps> = ({
  salesData,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  const [filteredData, setFilteredData] = useState<SalesDataItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      const filtered = salesData.filter((item) => {
        const date = new Date(item.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
      setFilteredData(filtered);

      // Calcular la suma de los montos filtrados
      const total = filtered.reduce((sum, item) => sum + item.amount, 0);
      setTotalAmount(total);
    }
  }, [startDate, endDate, salesData]);

  const chartOptions = {
    backgroundColor: "transparent",
    title: {
      text: "Evolución de Ventas",
      textStyle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#374151",
      },
      left: "0%",
      top: "5%",
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      borderColor: "#d1d5db",
      borderWidth: 1,
      borderRadius: 8,
      padding: [12, 16],
      textStyle: {
        color: "#374151",
        fontSize: 14,
      },
      formatter: function (params: any) {
        const data = params[0];
        return `
          <div style="font-weight: 600; margin-bottom: 8px; color: #111827;">
            ${data.name}
          </div>
          <div style="display: flex; align-items: center;">
            <div style="width: 12px; height: 12px; background: #6b7280; border-radius: 50%; margin-right: 8px;"></div>
            <span style="font-weight: 500;">Ventas: $${data.value.toLocaleString()}</span>
          </div>
        `;
      },
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#9ca3af",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "12%",
      top: "20%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: filteredData.map((item) => {
        const date = new Date(item.date);
        const day = date.getDate().toString().padStart(2, "0");
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        return `${day}/${month}`;
      }),
      axisLine: {
        lineStyle: {
          color: "#d1d5db",
        },
      },
      axisTick: {
        lineStyle: {
          color: "#d1d5db",
        },
      },
      axisLabel: {
        color: "#6b7280",
        fontSize: 12,
        fontWeight: "500",
      },
    },
    yAxis: {
      type: "value",
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      splitLine: {
        lineStyle: {
          color: "#f3f4f6",
          type: "dashed",
        },
      },
      axisLabel: {
        color: "#6b7280",
        fontSize: 12,
        fontWeight: "500",
        formatter: function (value: any) {
          if (value >= 1000000) {
            return `$${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `$${(value / 1000).toFixed(1)}K`;
          } else {
            return `$${value}`;
          }
        },
      },
    },
    series: [
      {
        data: filteredData.map((item) => item.amount),
        type: "line",
        smooth: true,
        symbol: "circle",
        symbolSize: 6,
        lineStyle: {
          width: 3,
          color: "#6b7280",
        },
        itemStyle: {
          color: "#6b7280",
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(107, 114, 128, 0.2)" },
              { offset: 1, color: "rgba(107, 114, 128, 0.05)" },
            ],
          },
        },
        emphasis: {
          itemStyle: {
            color: "#374151",
            borderColor: "#ffffff",
            borderWidth: 3,
            shadowColor: "rgba(107, 114, 128, 0.3)",
            shadowBlur: 8,
          },
        },
      },
    ],
  };

  useEffect(() => {
    if (salesData && salesData.length > 0 && startDate && endDate) {
      const filtered = salesData.filter((item) => {
        const date = new Date(item.date);
        return date >= new Date(startDate) && date <= new Date(endDate);
      });
      setFilteredData(filtered);

      // Calcular la suma de los montos filtrados
      const total = filtered.reduce((sum, item) => sum + item.amount, 0);
      setTotalAmount(total);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Este useEffect se ejecuta solo al montar el componente

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
              Detalle de Ventas
            </h2>
            <p className="text-gray-600 text-sm">
              Análisis por rango de fechas
            </p>
          </div>
        </div>

        {/* Filtros de fecha mejorados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-gray-900 text-sm"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors duration-200 text-gray-900 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {filteredData.length > 0 ? (
          <>
            {/* Métrica total destacada */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total del Período
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {totalAmount.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {filteredData.length}{" "}
                    {filteredData.length === 1 ? "día" : "días"} de ventas
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
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
              </div>
            </div>

            {/* Gráfico mejorado */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <ReactECharts
                option={chartOptions}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </div>
          </>
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-gray-500 text-center text-sm">
              No se encontraron ventas para el rango de fechas seleccionado.
              Intenta ajustar las fechas o verifica que existan ventas en este
              período.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalesSummary;
