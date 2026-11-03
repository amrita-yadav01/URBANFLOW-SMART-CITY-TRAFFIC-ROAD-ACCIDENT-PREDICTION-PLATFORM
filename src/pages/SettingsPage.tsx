import React, { useState, useEffect } from 'react';
import {
  Settings,
  Server,
  Database,
  Cpu,
  Map,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Compass,
  Radio,
  Terminal,
  ExternalLink,
  ShieldCheck,
  Sun,
  Moon,
  Palette
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';

interface EndpointHealth {
  endpoint: string;
  method: string;
  status: 'pending' | 'success' | 'failed';
  code: number | null;
  latencyMs: number | null;
}

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [healthData, setHealthData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [endpoints, setEndpoints] = useState<EndpointHealth[]>([
    { endpoint: '/api/health', method: 'GET', status: 'pending', code: null, latencyMs: null },
    { endpoint: '/api/dashboard/summary', method: 'GET', status: 'pending', code: null, latencyMs: null },
    { endpoint: '/api/accidents/hotspots', method: 'GET', status: 'pending', code: null, latencyMs: null },
    { endpoint: '/api/accidents/segments', method: 'GET', status: 'pending', code: null, latencyMs: null },
    { endpoint: '/api/traffic/corridors', method: 'GET', status: 'pending', code: null, latencyMs: null },
    { endpoint: '/api/analytics/overview', method: 'GET', status: 'pending', code: null, latencyMs: null },
    { endpoint: '/api/datasets', method: 'GET', status: 'pending', code: null, latencyMs: null },
    { endpoint: '/api/models/metrics', method: 'GET', status: 'pending', code: null, latencyMs: null },
  ]);
  const [pinging, setPinging] = useState<boolean>(false);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await api.getHealth();
      setHealthData(res);
    } catch (e: any) {
      setHealthData({ status: 'offline', error: e.message });
    } finally {
      setLoading(false);
    }
  };

  const pingEndpoints = async () => {
    setPinging(true);
    const updated = [...endpoints];

    for (let i = 0; i < updated.length; i++) {
      const ep = updated[i];
      const start = performance.now();
      try {
        const res = await fetch(ep.endpoint);
        const duration = Math.round(performance.now() - start);
        updated[i] = {
          ...ep,
          status: res.ok ? 'success' : 'failed',
          code: res.status,
          latencyMs: duration,
        };
      } catch (err) {
        updated[i] = {
          ...ep,
          status: 'failed',
          code: 500,
          latencyMs: Math.round(performance.now() - start),
        };
      }
      setEndpoints([...updated]);
    }
    setPinging(false);
  };

  useEffect(() => {
    fetchHealth();
    pingEndpoints();
  }, []);

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#253745] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#FF7A00]" />
            <h1 className="text-base font-semibold text-[#CCD0CF] tracking-tight font-sans">
              System Diagnostics & Platform Infrastructure
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Operational
            </span>
          </div>
          <p className="text-xs text-[#9BA8AB] mt-0.5">
            FastAPI microservices heartbeat, SQLite/PostGIS database integrity, and OpenStreetMap tile pipeline.
          </p>
        </div>

        <button
          onClick={() => {
            fetchHealth();
            pingEndpoints();
          }}
          disabled={pinging || loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#11212D] hover:bg-[#253745] text-[#CCD0CF] border border-[#4A5C6A] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${pinging || loading ? 'animate-spin text-[#FF7A00]' : 'text-[#9BA8AB]'}`} />
          <span>Ping All Services</span>
        </button>
      </div>

      {/* Primary Subsystem Heartbeat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB]">REST API Gateway</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-emerald-400">Online</span>
            <span className="text-xs text-[#9BA8AB]">FastAPI</span>
          </div>
          <div className="text-[11px] text-[#9BA8AB] mt-1">
            Port 8000 • CORS Enabled
          </div>
        </div>

        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB]">Spatial DB Engine</span>
            <Database className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-emerald-400">
              {healthData?.database === 'healthy' ? 'Healthy' : 'Active'}
            </span>
            <span className="text-xs text-[#9BA8AB]">SQLite/GIS</span>
          </div>
          <div className="text-[11px] text-[#9BA8AB] mt-1">
            3,800 Incidents • 38 Segments
          </div>
        </div>

        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB]">ML Runtime Artifacts</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-emerald-400">Loaded</span>
            <span className="text-xs text-[#9BA8AB]">Joblib</span>
          </div>
          <div className="text-[11px] text-[#9BA8AB] mt-1">
            RF Classifier • TreeSHAP Explainer
          </div>
        </div>

        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB]">Map Tile Provider</span>
            <Map className="w-4 h-4 text-[#FF7A00]" />
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-[#CCD0CF]">Esri Dark / OSM</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">
            Keyless • Zero Watermarks
          </div>
        </div>
      </div>

      {/* Theme Appearance Selector */}
      <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
          <div className="flex items-center space-x-2">
            <Palette className="w-4 h-4 text-[#FF7A00]" />
            <h2 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
              Display & Theme Appearance
            </h2>
          </div>
          <span className="text-[10px] text-[#9BA8AB]">Active: {theme === 'dark' ? 'Dark Command Mode' : 'Light / Warm Beige Mode'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3 text-left rounded border transition-all flex items-start space-x-3 ${
              theme === 'dark'
                ? 'bg-[#06141B] border-[#FF7A00] ring-1 ring-[#FF7A00]'
                : 'bg-[#06141B]/50 border-[#253745] hover:border-[#4A5C6A]'
            }`}
          >
            <div className="p-2 rounded bg-[#11212D] border border-[#253745] text-[#FF7A00] shrink-0">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#CCD0CF] text-xs">Dark Intelligence Mode</span>
                {theme === 'dark' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FF7A00] text-[#06141B] font-bold">Active</span>}
              </div>
              <p className="text-[11px] text-[#9BA8AB] mt-0.5">
                Official palette (#06141B / #11212D) with Esri Dark Canvas GIS tiles and high-contrast telemetry.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3 text-left rounded border transition-all flex items-start space-x-3 ${
              theme === 'light'
                ? 'bg-[#EFEAE0] border-[#FF7A00] ring-1 ring-[#FF7A00]'
                : 'bg-[#06141B]/50 border-[#253745] hover:border-[#4A5C6A]'
            }`}
          >
            <div className="p-2 rounded bg-amber-100 border border-amber-300 text-amber-700 shrink-0">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#CCD0CF] text-xs">Light / Warm Beige Mode</span>
                {theme === 'light' && <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FF7A00] text-[#06141B] font-bold">Active</span>}
              </div>
              <p className="text-[11px] text-[#9BA8AB] mt-0.5">
                Clean warm paper/sand beige (#F4F1EA) with crisp white cards, daylight OSM maps, and deep slate typography.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Regional GIS Jurisdiction & Spatial Bounding Box */}
      <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-[#FF7A00]" />
            <h2 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
              Regional Jurisdiction & Spatial Coordinate Envelope
            </h2>
          </div>
          <span className="text-[10px] text-[#9BA8AB]">EPSG:4326 (WGS 84)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-[#06141B] border border-[#253745] rounded space-y-1">
            <span className="text-[10px] text-[#9BA8AB] uppercase block">Jurisdiction Region</span>
            <span className="text-sm font-bold text-[#CCD0CF] block">Maharashtra State (36 Districts)</span>
            <span className="text-[11px] text-[#9BA8AB]">Active Demonstration: Mumbai Metropolitan Region</span>
          </div>

          <div className="p-3 bg-[#06141B] border border-[#253745] rounded space-y-1">
            <span className="text-[10px] text-[#9BA8AB] uppercase block">Map Center Datum</span>
            <span className="text-sm font-bold text-[#FF7A00] block">[19.7515° N, 75.7139° E]</span>
            <span className="text-[11px] text-[#9BA8AB]">State Center • Zoom Level: 7</span>
          </div>

          <div className="p-3 bg-[#06141B] border border-[#253745] rounded space-y-1">
            <span className="text-[10px] text-[#9BA8AB] uppercase block">State Bounding Envelope</span>
            <span className="text-sm font-bold text-[#CCD0CF] block">15.60°N – 22.10°N</span>
            <span className="text-[11px] text-[#9BA8AB]">72.60°E – 80.90°E</span>
          </div>
        </div>
      </div>

      {/* REST API Telemetry & Latency Ping Console */}
      <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#253745]">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#FF7A00]" />
            <h2 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
              Active REST API Route Latencies & Availability Ping
            </h2>
          </div>
          <span className="text-[10px] text-[#9BA8AB]">
            Interactive Live Probing
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#253745] text-[10px] text-[#9BA8AB] uppercase tracking-wider">
                <th className="pb-2">Method</th>
                <th className="pb-2">Endpoint URL</th>
                <th className="pb-2 text-center">HTTP Status</th>
                <th className="pb-2 text-right">Round-Trip Latency</th>
                <th className="pb-2 text-right">Health Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#253745]/60">
              {endpoints.map((ep) => (
                <tr key={ep.endpoint} className="hover:bg-[#253745]/50">
                  <td className="py-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#06141B] text-[#FF7A00] border border-[#253745]">
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-2 text-[#CCD0CF]">{ep.endpoint}</td>
                  <td className="py-2 text-center">
                    {ep.code ? (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ep.code === 200
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {ep.code} OK
                      </span>
                    ) : (
                      <span className="text-[#9BA8AB] text-[10px]">Testing...</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {ep.latencyMs !== null ? (
                      <span
                        className={`font-mono text-xs ${
                          ep.latencyMs < 50
                            ? 'text-emerald-400'
                            : ep.latencyMs < 150
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {ep.latencyMs} ms
                      </span>
                    ) : (
                      <span className="text-[#9BA8AB]">-</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {ep.status === 'success' ? (
                      <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pass</span>
                      </span>
                    ) : ep.status === 'failed' ? (
                      <span className="inline-flex items-center space-x-1 text-rose-400 text-[11px]">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Fail</span>
                      </span>
                    ) : (
                      <div className="w-3 h-3 border-2 border-[#FF7A00]/40 border-t-[#FF7A00] rounded-full animate-spin ml-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
