// src/components/BudgetMeter.tsx
import React from 'react';

interface BudgetMeterProps {
  spent: number;
  limit: number;
  currency: string;
}

export const BudgetMeter: React.FC<BudgetMeterProps> = ({ spent, limit, currency }) => {
  const percentage = Math.min(Math.round((spent / limit) * 100), 100);
  const isOver = spent > limit;
  const isClose = !isOver && percentage >= 85;

  // SVG parameters
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Determine stroke color
  const getStrokeColor = () => {
    if (isOver) return 'stroke-brand-danger';
    if (isClose) return 'stroke-brand-warning';
    return 'stroke-brand-primary';
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white p-5 border border-brand-muted/10 rounded-card shadow-sm w-full">
      <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-4">Total Spending Meter</h4>
      
      <div className="relative h-36 w-36 flex items-center justify-center">
        {/* SVG Circular Meter */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Base Ring */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className="stroke-brand-bg fill-transparent"
            strokeWidth={strokeWidth}
          />
          {/* Active Ring */}
          <circle
            cx="72"
            cy="72"
            r={radius}
            className={`fill-transparent transition-all duration-1000 ease-out ${getStrokeColor()}`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Labels */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Spent</span>
          <span className="text-xl font-extrabold text-brand-dark leading-tight mt-0.5">
            {currency} {spent.toLocaleString()}
          </span>
          <span className="text-[10px] text-brand-muted mt-0.5">
            of {currency} {limit.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Footer statistics message */}
      <div className="mt-4 text-center">
        {isOver ? (
          <span className="inline-block px-2.5 py-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 rounded-full animate-pulse">
            ⚠️ Exceeded by {currency} {(spent - limit).toLocaleString()}!
          </span>
        ) : (
          <span className="text-xs text-brand-muted font-medium">
            You have <strong className="text-brand-dark">{percentage}%</strong> of your budget allocated.
          </span>
        )}
      </div>
    </div>
  );
};
