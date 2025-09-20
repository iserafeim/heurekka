'use client';

import React from 'react';

interface PriceHistogramProps {
  data?: number[];
  minPrice: number;
  maxPrice: number;
  selectedMin: number;
  selectedMax: number;
  className?: string;
}

/**
 * PriceHistogram component displays a bar chart showing price distribution
 * with visual indicators for the selected price range
 */
export const PriceHistogram: React.FC<PriceHistogramProps> = ({
  data,
  minPrice,
  maxPrice,
  selectedMin,
  selectedMax,
  className = ''
}) => {
  // Mock data for demonstration - replace with real data later
  const mockData = data || [
    2, 4, 6, 8, 12, 15, 18, 22, 25, 28, 32, 35, 38, 40, 42, 45, 48, 50,
    48, 45, 42, 38, 35, 32, 28, 25, 22, 18, 15, 12, 8, 6, 4, 2
  ];

  const maxValue = Math.max(...mockData);
  const dataLength = mockData.length;

  // Calculate which bars should be highlighted based on selected range
  const getBarOpacity = (index: number) => {
    const priceStep = (maxPrice - minPrice) / dataLength;
    const barPrice = minPrice + (index * priceStep);

    if (barPrice >= selectedMin && barPrice <= selectedMax) {
      return 'opacity-100';
    }
    return 'opacity-30';
  };

  return (
    <div className={`w-full h-24 ${className}`}>
      <div className="flex items-end justify-between h-full gap-0.5">
        {mockData.map((value, index) => {
          const height = (value / maxValue) * 100;
          return (
            <div
              key={index}
              className={`bg-gray-300 transition-opacity duration-200 ${getBarOpacity(index)}`}
              style={{
                height: `${height}%`,
                width: `${100 / dataLength}%`,
                minHeight: '2px'
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default PriceHistogram;