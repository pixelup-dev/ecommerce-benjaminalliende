"use client";
import React from "react";

interface StatsComparisonProps {
  currentMonthValue: number;
  previousMonthValue: number;
  label: string;
}

const StatsComparison: React.FC<StatsComparisonProps> = ({
  currentMonthValue,
  previousMonthValue,
  label,
}) => {
  const difference = currentMonthValue - previousMonthValue;
  const percentageChange =
    previousMonthValue !== 0
      ? ((difference / previousMonthValue) * 100).toFixed(2)
      : "N/A";
  const isPositive = difference >= 0;

  return (
    <div className="p-4 bg-white dark:bg-boxdark-2 shadow rounded-lg flex items-center justify-between">
      <div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-bodydark">
          {label}
        </h3>
        <p className="text-3xl font-semibold text-gray-900 dark:text-white">
          {currentMonthValue}
        </p>
      </div>
      <div
        className={`flex items-center ${
          isPositive ? "text-green-500" : "text-red-500"
        }`}
      >
        {isPositive ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        )}
        <span className="ml-2 text-xl font-semibold">{percentageChange}%</span>
      </div>
    </div>
  );
};

export default StatsComparison;
