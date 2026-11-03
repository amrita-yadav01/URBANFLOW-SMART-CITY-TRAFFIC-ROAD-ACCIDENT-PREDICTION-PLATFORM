import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Gauge,
  ShieldAlert,
  BarChart3,
  Database,
  Cpu,
  Settings,
  ChevronLeft,
  ChevronRight,
  Compass
} from 'lucide-react';
import { UrbanFlowBrand } from './UrbanFlowBrand';

export type RoutePath =
  | '/dashboard'
  | '/hotspots'
  | '/traffic'
  | '/risk-prediction'
  | '/analytics'
  | '/datasets'
  | '/models'
  | '/settings';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

interface NavSection {
  title: string;
  items: Array<{
    path: RoutePath;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    tag?: string;
  }>;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // Expected navigation structure specified in Phase 3
  const sections: NavSection[] = [
    {
      title: 'OVERVIEW',
      items: [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { path: '/hotspots', label: 'Accident Hotspots', icon: MapPin, tag: 'GIS' },
        { path: '/traffic', label: 'Traffic Prediction', icon: Gauge, tag: 'ML' },
        { path: '/risk-prediction', label: 'Accident Risk Prediction', icon: ShieldAlert, tag: 'XAI' },
      ],
    },
    {
      title: 'DATA & ANALYTICS',
      items: [
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/datasets', label: 'Datasets', icon: Database, tag: 'SQL' },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { path: '/models', label: 'Model Performance', icon: Cpu },
        { path: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 bg-[#11212D] border-r border-[#253745] transition-all duration-250 flex flex-col select-none ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Official Brand Header */}
      <div className="h-16 flex items-center justify-between px-3 border-b border-[#253745] bg-[#06141B]">
        <div className="overflow-hidden">
          <UrbanFlowBrand collapsed={collapsed} height={34} />
        </div>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded text-[#9BA8AB] hover:text-[#CCD0CF] hover:bg-[#253745] transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Maharashtra Geographic Coverage Banner */}
      {!collapsed ? (
        <div className="px-4 py-2.5 border-b border-[#253745] bg-[#11212D] flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center space-x-1.5 text-[#9BA8AB]">
            <Compass className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>State GIS Scope</span>
          </div>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#253745] text-[#FF7A00] border border-[#4A5C6A] font-semibold">
            Maharashtra
          </span>
        </div>
      ) : (
        <div className="py-2 border-b border-[#253745] flex justify-center">
          <button
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded text-[#9BA8AB] hover:text-[#CCD0CF] hover:bg-[#253745] transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4 text-[#FF7A00]" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 py-3 overflow-y-auto space-y-5 px-2">
        {sections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-widest text-[#9BA8AB]/70 uppercase">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                currentPath === item.path ||
                (item.path === '/dashboard' && currentPath === '/') ||
                (item.path === '/traffic' && currentPath === '/traffic-forecast');

              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center rounded transition-all duration-150 text-xs group relative ${
                    collapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-3'
                  } ${
                    isActive
                      ? 'bg-[#253745] text-[#CCD0CF] font-semibold border-l-2 border-[#FF7A00]'
                      : 'text-[#9BA8AB] hover:bg-[#253745]/60 hover:text-[#CCD0CF]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-[#FF7A00]' : 'text-[#9BA8AB] group-hover:text-[#CCD0CF]'
                    }`}
                  />

                  {!collapsed && (
                    <span className="truncate flex-1 text-left font-sans">{item.label}</span>
                  )}

                  {!collapsed && item.tag && (
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ${
                        isActive
                          ? 'bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/40'
                          : 'bg-[#06141B] text-[#9BA8AB] border border-[#4A5C6A]'
                      }`}
                    >
                      {item.tag}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* System Status Footnote in Sidebar */}
      {!collapsed && (
        <div className="p-3 border-t border-[#253745] bg-[#06141B] text-[10px] font-mono text-[#9BA8AB] space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block animate-pulse" />
              <span className="text-[#CCD0CF]">System Online</span>
            </span>
            <span className="text-[#FF7A00]">v2.1</span>
          </div>
          <div className="text-[9px] text-[#9BA8AB]/80 truncate">
            Demo: Mumbai MMR (3,800 Recs)
          </div>
        </div>
      )}
    </aside>
  );
};
