"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import Loader from "@/components/common/Loader";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Registra los componentes de gráficos
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnalyticsRow {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface AnalyticsData {
  rows: AnalyticsRow[];
}

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

const StatsPage: React.FC = () => {
  const [realtimeData, setRealtimeData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRealtimeData = async () => {
      try {
        const response = await axios.get("/api/analytics");
        setRealtimeData(response.data);
      } catch (error: any) {
        setError(error.message);
      }
    };

    fetchRealtimeData();
  }, []);

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!realtimeData) return <Loader />;

  // Agrupar los datos por dispositivo, ciudad y vistas por página
  let uniqueActiveUsers = new Set();
  let pageViews: Record<string, number> = {};
  let cityData: Record<string, number> = {};
  let deviceData: Record<string, number> = {};

  realtimeData.rows.forEach((row) => {
    const pageTitle = row.dimensionValues[0]?.value || "Sin título";
    const country = row.dimensionValues[1]?.value || "Desconocido";
    const city = row.dimensionValues[2]?.value || "Desconocido";
    const deviceCategory = row.dimensionValues[3]?.value || "Desconocido";
    const activeUsers = Number(row.metricValues[0]?.value || 0);
    const screenPageViews = Number(row.metricValues[1]?.value || 0);

    // Añadir usuarios únicos
    uniqueActiveUsers.add(`${country}-${city}-${deviceCategory}`);

    // Agrupación de vistas por página
    if (!pageViews[pageTitle]) {
      pageViews[pageTitle] = screenPageViews;
    } else {
      pageViews[pageTitle] += screenPageViews;
    }

    // Agrupación de datos por ciudad
    if (!cityData[city]) {
      cityData[city] = activeUsers;
    } else {
      cityData[city] += activeUsers;
    }

    // Agrupación de datos por dispositivo
    if (!deviceData[deviceCategory]) {
      deviceData[deviceCategory] = activeUsers;
    } else {
      deviceData[deviceCategory] += activeUsers;
    }
  });

  // Preparar datos para gráficos
  const pageLabels = Object.keys(pageViews);
  const pageData = Object.values(pageViews);

  const cityLabels = Object.keys(cityData);
  const cityActiveUsers = Object.values(cityData);

  const deviceLabels = Object.keys(deviceData);
  const deviceActiveUsers = Object.values(deviceData);

  return (
    <>
      <title>Dashboard - Visitas Web</title>
      <div className="max-w-7xl mx-auto p-6 pt-10 pb-20">
        <h1 className="text-3xl font-bold mb-6 text-center">Visitas Web</h1>
        <div className="flex items-center justify-center">
          <p className="mb-6 text-center max-w-xl">
            Esta sección muestra estadísticas de los{" "}
            <strong>últimos 5 a 10 minutos</strong> aprox. de las visitas a tu
            sitio web.
          </p>
        </div>

        {/* Mostrar número único de usuarios activos */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold my-4 text-center">
            <small>Usuarios Activos:</small> {uniqueActiveUsers.size}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
          {/* Gráfico de Torta de Usuarios Activos por Ciudad */}
          <div className=" p-4 ">
            <h2 className="text-xl font-semibold mb-4">
              Usuarios Activos por Ciudad
            </h2>

            <Pie
              className="bg-white p-4 rounded-lg shadow-md max-h-[400px]"
              data={{
                labels: cityLabels,
                datasets: [
                  {
                    label: "Usuarios Activos",
                    data: cityActiveUsers,
                    backgroundColor: [
                      "rgba(75, 192, 192, 0.2)",
                      "rgba(153, 102, 255, 0.2)",
                      "rgba(255, 206, 86, 0.2)",
                    ],
                    borderColor: [
                      "rgba(75, 192, 192, 1)",
                      "rgba(153, 102, 255, 1)",
                      "rgba(255, 206, 86, 1)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        let total = context.dataset.data.reduce(
                          (a: number, b: number) => a + b,
                          0
                        );
                        let percentage =
                          ((context.raw as number) / total) * 100 || 0;
                        return `${context.label}: ${percentage.toFixed(2)}%`;
                      },
                    },
                  },
                },
              }}
            />
          </div>

          {/* Gráfico de Torta de Usuarios Activos por Dispositivo */}
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-4">
              Usuarios Activos por Dispositivo
            </h2>

            <Pie
              className="bg-white p-4 rounded-lg shadow-md max-h-[400px]"
              data={{
                labels: deviceLabels,
                datasets: [
                  {
                    label: "Usuarios Activos",
                    data: deviceActiveUsers,
                    backgroundColor: [
                      "rgba(54, 162, 235, 0.2)",
                      "rgba(255, 159, 64, 0.2)",
                    ],
                    borderColor: [
                      "rgba(54, 162, 235, 1)",
                      "rgba(255, 159, 64, 1)",
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function (context) {
                        let total = context.dataset.data.reduce(
                          (a: number, b: number) => a + b,
                          0
                        );
                        let percentage =
                          ((context.raw as number) / total) * 100 || 0;
                        return `${context.label}: ${percentage.toFixed(2)}%`;
                      },
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Formato de tarjetas para mobile */}
        <div className="md:hidden mb-6 p-4">
          <h2 className="text-xl font-semibold mb-4">
            Vistas por Título de Página
          </h2>
          {pageLabels.map((pageTitle, index) => (
            <div
              key={index}
              className="mb-4 p-4 bg-white rounded-lg shadow-md"
            >
              <h2 className="text-lg font-semibold mb-2">
                {truncateText(pageTitle, 20)}
              </h2>
              <p>Vistas: {pageData[index]}</p>
            </div>
          ))}
        </div>

        {/* Gráfico de Barras en desktop */}
        <div
          className="hidden md:block mb-24 p-4"
          style={{ height: "350px" }}
        >
          <h2 className="text-xl font-semibold mb-4">
            Vistas por Título de Página
          </h2>
          <p className="mb-4">
            Este gráfico de barras presenta las páginas más vistas en el sitio
            web.{" "}
            <strong>
              Sirve para identificar qué contenido es más relevante y popular
              entre los usuarios.
            </strong>
          </p>
          <Bar
            className="bg-white p-4 rounded-lg shadow-md "
            data={{
              labels: pageLabels.map((title) => truncateText(title, 20)),
              datasets: [
                {
                  label: "Vistas",
                  data: pageData,
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  borderColor: "rgba(75, 192, 192, 1)",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              indexAxis: "y",
              maintainAspectRatio: false,
              scales: {
                x: { beginAtZero: true },
                y: {
                  ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                  },
                },
              },
            }}
          />
        </div>
        <div className="flex items-center justify-center py-8 ">
          <p className="mb-6 text-center max-w-xl">
            Estadísticas Históricas <strong>Próximamente....</strong>
          </p>
        </div>
      </div>
    </>
  );
};

export default StatsPage;
