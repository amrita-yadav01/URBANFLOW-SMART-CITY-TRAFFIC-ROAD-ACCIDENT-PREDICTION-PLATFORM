import React from 'react';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export const UrbanFlowLogo: React.FC<LogoProps> = ({
  size = 28,
  showText = false,
  className = '',
}) => {
  return (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      {/* Precision Geometric SVG Symbol: Intersecting Urban Corridors and Spatial Node */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Outer Spatial Hex Frame */}
        <polygon
          points="16,2 29,9.5 29,22.5 16,30 3,22.5 3,9.5"
          fill="#161d2a"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* Arterial Highway Network Vectors */}
        <line x1="16" y1="2" x2="16" y2="30" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" />
        <line x1="3" y1="9.5" x2="29" y2="22.5" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="3" y1="22.5" x2="29" y2="9.5" stroke="#cbd5e1" strokeWidth="1.2" strokeDasharray="2 2" strokeLinecap="round" />

        {/* Central Spatial Junction Node */}
        <circle cx="16" cy="16" r="4.5" fill="#0f172a" stroke="#f59e0b" strokeWidth="2" />
        <circle cx="16" cy="16" r="2" fill="#f59e0b" />

        {/* Peripheral Telemetry Nodes */}
        <circle cx="16" cy="6" r="1.5" fill="#38bdf8" />
        <circle cx="16" cy="26" r="1.5" fill="#38bdf8" />
        <circle cx="7" cy="12" r="1.2" fill="#cbd5e1" />
        <circle cx="25" cy="20" r="1.2" fill="#cbd5e1" />
      </svg>

      {showText && (
        <div className="leading-tight select-none">
          <div className="flex items-center space-x-1">
            <span className="font-mono text-sm font-bold tracking-wider text-slate-100">URBAN</span>
            <span className="font-mono text-sm font-bold tracking-wider text-amber-500">FLOW</span>
          </div>
          <div className="text-[9px] font-mono tracking-widest text-slate-400 uppercase">
            Smart City Intelligence
          </div>
        </div>
      )}
    </div>
  );
};

