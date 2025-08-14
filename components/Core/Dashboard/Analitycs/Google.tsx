// components/PIXELUP/Dashboard/Analitycs/Google.tsx
import { useEffect, useState } from "react";

const GoogleAnalyticsData = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/analytics");
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching Google Analytics data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Renderiza tus datos aquí */}
      {data.map((row, index) => (
        <div key={index}>
          {row[0]}: {row[1]}
        </div>
      ))}
    </div>
  );
};

export default GoogleAnalyticsData;
