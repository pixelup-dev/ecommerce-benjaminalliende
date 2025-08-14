import React, { useEffect, useState } from "react";

interface LoaderProgressProps {
  message?: string;
}

const LoaderProgress: React.FC<LoaderProgressProps> = ({
  message = "Procesando imágenes y guardando cambios...",
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        // Incrementar el progreso gradualmente hasta 95%
        // El último 5% se completará cuando realmente termine la operación
        if (prevProgress < 95) {
          return prevProgress + (95 - prevProgress) * 0.1;
        }
        return prevProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>

          {/* Mensaje */}
          <p className="text-gray-700 text-center mb-4">{message}</p>

          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Porcentaje */}
          <p className="text-sm text-gray-500 mt-2">{Math.round(progress)}%</p>
        </div>
      </div>
    </div>
  );
};

export default LoaderProgress;
