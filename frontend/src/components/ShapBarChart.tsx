import React from 'react';
import type { ShapFactor } from '../types';

interface ShapBarChartProps {
  factors: ShapFactor[];
  maxFactorImpact?: number;
}

export const ShapBarChart: React.FC<ShapBarChartProps> = ({ factors }) => {
  if (!factors || factors.length === 0) {
    return <div className="text-xs text-[#9BA8AB] py-3 font-mono">No attribution factors available.</div>;
  }

  const maxAbs = Math.max(...factors.map((f) => Math.abs(f.impact)), 0.01);

  return (
    <div className="space-y-3 font-mono">
      <div className="flex items-center justify-between text-[11px] text-[#9BA8AB] pb-1 border-b border-[#253745]">
        <span>Input Feature & Marginal Contribution</span>
        <span>TreeSHAP Attribution Value</span>
      </div>

      {factors.map((factor, idx) => {
        const isPositive = factor.impact >= 0;
        const widthPct = Math.min(100, Math.round((Math.abs(factor.impact) / maxAbs) * 100));

        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#CCD0CF] flex items-center space-x-1.5 font-sans">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isPositive ? 'bg-rose-400' : 'bg-emerald-400'
                  }`}
                />
                <span>{factor.factor}</span>
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  isPositive ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {isPositive ? `+${factor.impact.toFixed(4)}` : factor.impact.toFixed(4)} ({factor.direction})
              </span>
            </div>

            {/* Bar Track */}
            <div className="h-1.5 w-full bg-[#06141B] rounded-xs overflow-hidden flex border border-[#253745]">
              <div
                className={`h-full rounded-xs transition-all duration-300 ${
                  isPositive
                    ? 'bg-[#FF7A00]'
                    : 'bg-[#10b981]'
                }`}
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="pt-1 text-[10px] text-[#9BA8AB] flex items-center justify-between">
        <span>Orange: Increases risk probability</span>
        <span>Emerald: Decreases risk probability</span>
      </div>
    </div>
  );
};
