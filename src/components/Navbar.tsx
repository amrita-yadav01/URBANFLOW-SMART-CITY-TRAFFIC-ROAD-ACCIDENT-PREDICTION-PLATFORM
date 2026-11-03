import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  RefreshCw,
  Compass,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  collapsed,
  setCollapsed,
  onRefresh,
  isRefreshing = false,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const routeMeta: Record<
    string,
    { section: string; title: string; code: string }
  > = {
    '/': { section: 'OVERVIEW', title: 'Smart City Command Dashboard', code: 'DASH-01' },
    '/dashboard': { section: 'OVERVIEW', title: 'Smart City Command Dashboard', code: 'DASH-01' },
    '/hotspots': { section: 'INTELLIGENCE', title: 'Maharashtra Accident Hotspots GIS', code: 'GIS-HOTSPOTS' },
    '/traffic': { section: 'INTELLIGENCE', title: 'Corridor Traffic & Congestion Prediction', code: 'ML-TRAFFIC' },
    '/traffic-forecast': { section: 'INTELLIGENCE', title: 'Corridor Traffic & Congestion Prediction', code: 'ML-TRAFFIC' },
    '/risk-prediction': { section: 'INTELLIGENCE', title: 'Accident Risk Inference & SHAP Explainability', code: 'XAI-INFERENCE' },
    '/analytics': { section: 'DATA & ANALYTICS', title: 'Multivariate Accident Analytics & Factors', code: 'ANL-INSIGHTS' },
    '/datasets': { section: 'DATA & ANALYTICS', title: 'Urban Datasets & Schema Management', code: 'DAT-CATALOG' },
    '/models': { section: 'SYSTEM', title: 'Machine Learning Model Governance', code: 'MOD-METRICS' },
    '/settings': { section: 'SYSTEM', title: 'System Diagnostics & Configuration', code: 'SYS-DIAG' },
  };

  const current = routeMeta[location.pathname] || {
    section: 'URBANFLOW',
    title: 'Smart City Intelligence',
    code: 'SYS-CORE',
  };

  return (
    <header className="h-16 bg-[#11212D] border-b border-[#253745] px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Collapse Toggle + Breadcrumbs */}
      <div className="flex items-center space-x-3">
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded text-[#9BA8AB] hover:text-[#CCD0CF] hover:bg-[#253745] transition-colors"
            title="Expand Sidebar"
          >
            <Menu className="w-4 h-4 text-[#FF7A00]" />
          </button>
        )}

        <div className="flex items-center space-x-2 text-xs font-mono">
          <span className="text-[#9BA8AB] uppercase tracking-wider">{current.section}</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#4A5C6A]" />
          <span className="text-[#CCD0CF] font-semibold">{current.title}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#06141B] text-[#FF7A00] border border-[#253745]">
            {current.code}
          </span>
        </div>
      </div>

      {/* Right: Geographical Indicator, Live Clock, Sync Button */}
      <div className="flex items-center space-x-3 text-xs font-mono">
        {/* Coverage Status Badge */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#06141B] border border-[#253745] text-[#9BA8AB]">
          <Compass className="w-3.5 h-3.5 text-[#FF7A00]" />
          <span>Maharashtra State Scope</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] inline-block animate-pulse ml-1" />
        </div>

        {/* Live IST Precision Clock */}
        <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#06141B] border border-[#253745] text-[#CCD0CF]">
          <Clock className="w-3.5 h-3.5 text-[#9BA8AB]" />
          <span>{timeStr || 'LIVE IST'}</span>
        </div>

        {/* Theme Toggle (Dark vs Light/Beige) */}
        <button
          onClick={toggleTheme}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded border transition-all text-xs font-mono ${
            theme === 'dark'
              ? 'bg-[#06141B] hover:bg-[#253745] text-[#FF7A00] border-[#253745]'
              : 'bg-[#EDE5D8] hover:bg-[#E2D8C7] text-[#B45309] border-[#C8BEB0] font-bold shadow-xs'
          }`}
          title={`Switch to ${theme === 'dark' ? 'Light / Warm Beige' : 'Dark Mode'}`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span>Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-[#4B5563]" />
              <span>Dark</span>
            </>
          )}
        </button>

        {/* Refresh / Sync Telemetry */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-1.5 px-3 py-1 rounded bg-[#253745] hover:bg-[#324657] text-[#CCD0CF] border border-[#4A5C6A] transition-colors text-xs font-mono"
            title="Refresh Real-time Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#FF7A00]' : 'text-[#9BA8AB]'}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        )}
      </div>
    </header>
  );
};
