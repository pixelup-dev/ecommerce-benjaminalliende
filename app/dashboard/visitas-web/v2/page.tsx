"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import axios from "axios";
import Loader from "@/components/common/Loader";
import { format } from "date-fns";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AnalyticsRow {
  dimensionValues: { value: string }[];
  metricValues: { value: string }[];
}

interface AnalyticsData {
  rows: AnalyticsRow[];
}

const StatsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/analytics");
        console.log(response.data); // Imprimir los datos en la consola del navegador
        setData(response.data);
      } catch (error: any) {
        setError(error.message);
        console.error("Error fetching analytics data:", error);
      }
    };

    fetchData();
  }, []);

  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!data) return <Loader />;

  const labels = data.rows.map((row) =>
    format(
      new Date(
        row.dimensionValues[0].value.replace(
          /(\d{4})(\d{2})(\d{2})/,
          "$1-$2-$3"
        )
      ),
      "yyyy-MM-dd"
    )
  );

  const sessionsData = data.rows.map((row) =>
    Number(row.metricValues[1]?.value || 0)
  );
  const activeUsersData = data.rows.map((row) =>
    Number(row.metricValues[0]?.value || 0)
  );
  const newUsersData = data.rows.map((row) =>
    Number(row.metricValues[2]?.value || 0)
  );
  const avgSessionDurationData = data.rows.map(
    (row) => Number(row.metricValues[3]?.value || 0) / 60
  ); // Convertimos a minutos
  const bounceRateData = data.rows.map(
    (row) => Number(row.metricValues[4]?.value || 0) * 100
  ); // Convertimos a porcentaje

  const cityData = data.rows.map(
    (row) => row.dimensionValues[1]?.value || "Unknown"
  );
  const deviceData = data.rows.map(
    (row) => row.dimensionValues[2]?.value || "Unknown"
  );
  const browserData = data.rows.map(
    (row) => row.dimensionValues[3]?.value || "Unknown"
  );
  const sourceData = data.rows.map(
    (row) => row.dimensionValues[4]?.value || "Unknown"
  );
  const mediumData = data.rows.map(
    (row) => row.dimensionValues[5]?.value || "Unknown"
  );

  // Calcular total de usuarios activos de la última semana
  const totalActiveUsersWeek = activeUsersData
    .slice(-7)
    .reduce((a, b) => a + b, 0);

  // Calcular promedio de duración de la sesión en minutos para el mes
  const avgSessionDuration = (
    avgSessionDurationData.reduce((a, b) => a + b, 0) /
    avgSessionDurationData.length
  ).toFixed(2);

  const lineChartOptions: ApexOptions = {
    chart: {
      type: "line",
      height: 350,
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      categories: labels,
    },
    tooltip: {
      enabled: true,
    },
  };

  const barChartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    xaxis: {
      categories: labels,
    },
    tooltip: {
      enabled: true,
    },
  };

  const pieChartOptions: ApexOptions = {
    chart: {
      type: "pie",
      height: 350,
      toolbar: {
        show: true,
        tools: {
          download: true,
        },
      },
    },
    labels: ["Bounce Rate", "Other"],
    tooltip: {
      enabled: true,
    },
  };

  const cityCounts = cityData.reduce((acc, city) => {
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const cityChartData = {
    series: Object.values(cityCounts),
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
      },
      xaxis: {
        categories: Object.keys(cityCounts),
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const deviceCounts = deviceData.reduce((acc, device) => {
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const deviceChartData = {
    series: Object.values(deviceCounts),
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
      },
      xaxis: {
        categories: Object.keys(deviceCounts),
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const browserCounts = browserData.reduce((acc, browser) => {
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const browserChartData = {
    series: Object.values(browserCounts),
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
      },
      xaxis: {
        categories: Object.keys(browserCounts),
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const sourceCounts = sourceData.reduce((acc, source) => {
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sourceChartData = {
    series: Object.values(sourceCounts),
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
      },
      xaxis: {
        categories: Object.keys(sourceCounts),
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const mediumCounts = mediumData.reduce((acc, medium) => {
    acc[medium] = (acc[medium] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mediumChartData = {
    series: Object.values(mediumCounts),
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
        zoom: {
          enabled: true,
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
      },
      xaxis: {
        categories: Object.keys(mediumCounts),
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  // Opciones para el gráfico de línea curva con gradiente para "New Users"
  const newUsersChartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      zoom: {
        enabled: true,
      },
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    stroke: {
      curve: "smooth",
    },
    xaxis: {
      categories: labels,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      },
    },
    tooltip: {
      enabled: true,
    },
    colors: ["#546E7A"],
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Statistics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium">Active Users (Last 7 Days)</h3>
          <p className="text-2xl font-bold">{totalActiveUsersWeek}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium">Sessions</h3>
          <p className="text-gray-600 mb-2 text-xs">
            Refleja el número total de sesiones realizadas en tu sitio web el
            día más reciente.
          </p>
          <p className="text-2xl font-bold">
            {sessionsData[sessionsData.length - 1]}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center col-span-1">
          <h3 className="text-lg font-medium">Avg. Session Duration</h3>
          <p className="text-2xl font-bold">{avgSessionDuration} min</p>
          <p className="text-gray-600 mb-2 text-xs">
            Duración promedio de las sesiones en tu sitio web durante el mes.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium">New Users</h3>
          <p className="text-gray-600 mb-2 text-xs">
            Refleja el número total de nuevos usuarios que visitaron tu sitio
            web el día más reciente.
          </p>
          <p className="text-2xl font-bold">
            {newUsersData[newUsersData.length - 1]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">
            Active Users & Sessions
          </h2>
          <Chart
            options={lineChartOptions}
            series={[
              { name: "Sessions", data: sessionsData },
              { name: "Active Users", data: activeUsersData },
            ]}
            type="line"
            height={350}
          />
          <p className="text-gray-600 mt-2 text-xs">
            <strong>Usuarios Activos:</strong> Usuarios que han interactuado con
            tu sitio web.
            <br />
            <strong>Sesiones:</strong> Un período de tiempo en el que un usuario
            interactúa con tu sitio web. Una nueva sesión comienza cuando un
            usuario no ha estado activo en tu sitio durante 30 minutos o más.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">New Users</h2>
          <Chart
            options={newUsersChartOptions}
            series={[{ name: "New Users", data: newUsersData }]}
            type="area"
            height={350}
          />
          <p className="text-gray-600 mt-2 text-xs">
            <strong>Usuarios Nuevos:</strong> Usuarios que visitan tu sitio web
            por primera vez.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow text-center">
          <h3 className="text-lg font-medium">Bounce Rate</h3>
          <Chart
            options={pieChartOptions}
            series={[
              bounceRateData.reduce((a, b) => a + b, 0) / bounceRateData.length,
              100 -
                bounceRateData.reduce((a, b) => a + b, 0) /
                  bounceRateData.length,
            ]}
            type="pie"
            height={350}
          />
          <p className="text-gray-600 mt-2 text-xs">
            <strong>Tasa de Rebote:</strong> Porcentaje de visitantes que
            abandonan tu sitio web después de ver solo una página. Un alto
            porcentaje puede indicar que los usuarios no encuentran lo que
            buscan en tu sitio web.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Users by City</h2>
          <Chart
            options={cityChartData.options}
            series={[{ name: "Users by City", data: cityChartData.series }]}
            type="bar"
            height={350}
          />
          <p className="text-gray-600 mt-2 text-xs">
            Este gráfico muestra la distribución de tus usuarios por ciudad.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Users by Device</h2>
          <Chart
            options={deviceChartData.options}
            series={[{ name: "Users by Device", data: deviceChartData.series }]}
            type="bar"
            height={350}
          />
          <p className="text-gray-600 mt-2 text-xs">
            Este gráfico muestra la distribución de tus usuarios por tipo de
            dispositivo (por ejemplo, escritorio, móvil).
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Users by Browser</h2>
          <Chart
            options={browserChartData.options}
            series={[
              { name: "Users by Browser", data: browserChartData.series },
            ]}
            type="bar"
            height={350}
          />
          <p className="text-gray-600 mt-2 text-xs">
            Este gráfico muestra la distribución de tus usuarios por navegador.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Users by Source</h2>
          <Chart
            options={sourceChartData.options}
            series={[{ name: "Users by Source", data: sourceChartData.series }]}
            type="bar"
            height={350}
          />
          <p className="text-gray-600 mt-2 text-xs">
            Este gráfico muestra la distribución de tus usuarios por fuente de
            tráfico.
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Users by Medium</h2>
          <Chart
            options={mediumChartData.options}
            series={[{ name: "Users by Medium", data: mediumChartData.series }]}
            type="bar"
            height={350}
          />
          <p className="text-gray-600 mt-2 text-xs">
            Este gráfico muestra la distribución de tus usuarios por medio de
            tráfico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
