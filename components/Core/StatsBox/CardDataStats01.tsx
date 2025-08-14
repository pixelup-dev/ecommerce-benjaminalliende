import React, { ReactNode } from "react";

interface CardDataStatsProps {
  title: string;
  total: any;
  rate?: string;
  levelUp?: boolean;
  levelDown?: boolean;
  percentageChange?: any;
  children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  percentageChange,
  children,
}) => {
  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-200 overflow-hidden transition-all duration-200">
      {/* Contenido principal */}
      <div className="relative p-6">
        {/* Icono mejorado */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-200">
            <div className="text-white text-lg">{children}</div>
          </div>

          {/* Indicador de cambio */}
          {percentageChange !== undefined && (
            <div
              className={`px-2 py-1 rounded-md text-xs font-medium ${
                percentageChange > 0
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : percentageChange < 0
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-gray-100 text-gray-700 border border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-1">
                {percentageChange > 0 ? (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : percentageChange < 0 ? (
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : null}
                <span>{Math.abs(percentageChange).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Métricas principales */}
        <div className="space-y-2">
          <h4 className="text-2xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors duration-200">
            {total}
          </h4>
          <p className="text-gray-600 font-medium text-sm">{title}</p>

          {/* Información adicional */}
          {rate && (
            <div className="pt-2">
              <span
                className={`inline-flex items-center text-xs font-medium ${
                  levelUp
                    ? "text-green-600"
                    : levelDown
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {rate}
                {levelUp && (
                  <svg
                    aria-label="increase"
                    className="ml-1 w-3 h-3 fill-current"
                    viewBox="0 0 10 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
                {levelDown && (
                  <svg
                    aria-label="decrease"
                    className="ml-1 w-3 h-3 fill-current"
                    viewBox="0 0 10 11"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.64284 7.69237L9.09102 4.33987L10 5.22362L5 10.0849L-8.98488e-07 5.22362L0.908973 4.33987L4.35716 7.69237L4.35716 0.0848701L5.64284 0.0848704L5.64284 7.69237Z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Línea decorativa inferior */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-300 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
      </div>
    </div>
  );
};

export default CardDataStats;
