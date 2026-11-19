import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  highlight?: boolean;
  valueColorClass?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon,
  iconBgColor = 'bg-forest-50 text-forest-700',
  highlight = false,
  valueColorClass = 'text-ink-900',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 ${
        highlight
          ? 'border-forest-400 shadow-card-hover ring-1 ring-forest-400/30'
          : 'border-ink-200 shadow-card hover:border-ink-300 hover:shadow-card-hover'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm font-medium text-ink-500 tracking-tight">{label}</span>
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBgColor}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-baseline gap-1 mt-1">
        <span className={`text-2xl sm:text-3xl font-bold tracking-tight font-sans ${valueColorClass}`}>
          {value}
        </span>
        {unit && <span className="text-xs sm:text-sm font-medium text-ink-500">{unit}</span>}
      </div>

      <p className="text-[11px] sm:text-xs text-ink-500 mt-1 leading-snug line-clamp-2">
        {subtext}
      </p>
    </div>
  );
};
