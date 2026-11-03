import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  accentColor?: 'blue' | 'amber' | 'red' | 'emerald';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'blue',
}) => {
  const accentClasses = {
    blue: 'border-slate-800 text-sky-400 bg-sky-950/20',
    amber: 'border-amber-900/40 text-amber-400 bg-amber-950/20',
    red: 'border-red-900/40 text-red-400 bg-red-950/20',
    emerald: 'border-emerald-900/40 text-emerald-400 bg-emerald-950/20',
  };

  const iconBgClasses = {
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };

  return (
    <div className={`p-4 rounded-xl border bg-surface-200/90 shadow-sm hover:border-slate-700 transition-all duration-200 ${accentClasses[accentColor]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg border ${iconBgClasses[accentColor]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono">{value}</div>
        {trend && (
          <div
            className={`text-xs font-medium flex items-center space-x-1 ${
              trend.isPositive ? 'text-red-400' : 'text-emerald-400'
            }`}
          >
            <span>{trend.value}</span>
            {trend.label && <span className="text-slate-500 text-[10px]">{trend.label}</span>}
          </div>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
  );
};
