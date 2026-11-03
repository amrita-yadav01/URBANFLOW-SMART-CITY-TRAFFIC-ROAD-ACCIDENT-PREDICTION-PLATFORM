import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Activity,
  MapPin,
  Car,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Compass,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { LeafletMap } from '../components/LeafletMap';
import { api } from '../services/api';
import type { DashboardSummary, HotspotCluster, RoadSegment } from '../types';

interface DashboardPageProps {
  onNavigateToHotspots: () => void;
  onNavigateToTraffic: () => void;
  onNavigateToPrediction: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToHotspots,
  onNavigateToTraffic,
  onNavigateToPrediction,
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sumRes, hsRes, segRes] = await Promise.all([
          api.getDashboardSummary(),
          api.getHotspots(),
          api.getRoadSegments(),
        ]);
        setSummary(sumRes);
        setHotspots(hsRes.hotspots);
        setRoadSegments(segRes.segments);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize urban telemetry feed.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-3 font-mono">
        <div className="w-8 h-8 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-[#9BA8AB]">Aggregating telemetry from Maharashtra spatial nodes & GIS database...</p>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="p-4 rounded border border-rose-900/60 bg-rose-950/20 text-rose-200 text-xs font-mono space-y-1">
        <div className="flex items-center space-x-2 font-bold text-rose-400">
          <AlertTriangle className="w-4 h-4" />
          <span>TELEMETRY STREAM ERROR</span>
        </div>
        <p className="text-[#CCD0CF]">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. Compact Executive Telemetry Ribbon (6 Dense KPIs) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <div className="p-2.5 rounded border border-[#253745] bg-[#11212D] flex flex-col justify-between">
          <span className="text-[10px] font-mono text-[#9BA8AB] uppercase tracking-wider">Recorded Collisions</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-lg font-bold text-[#CCD0CF]">{summary.total_accidents.toLocaleString()}</span>
            <span className={`text-[10px] font-mono flex items-center ${summary.monthly_trend_pct > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {summary.monthly_trend_pct > 0 ? '+' : ''}{summary.monthly_trend_pct}% MoM
            </span>
          </div>
          <span className="text-[9px] text-[#9BA8AB]/70 font-mono">Verified Police FIRs</span>
        </div>

        <div className="p-2.5 rounded border border-[#253745] bg-[#11212D] flex flex-col justify-between">
          <span className="text-[10px] font-mono text-[#9BA8AB] uppercase tracking-wider">Fatal Casualties</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-lg font-bold text-rose-400">{summary.fatalities_count}</span>
            <span className="text-[10px] text-[#9BA8AB] font-mono">Total deaths</span>
          </div>
          <span className="text-[9px] text-[#9BA8AB]/70 font-mono">1.1% fatality ratio</span>
        </div>

        <div className="p-2.5 rounded border border-[#253745] bg-[#11212D] flex flex-col justify-between">
          <span className="text-[10px] font-mono text-[#9BA8AB] uppercase tracking-wider">Serious Injuries</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-lg font-bold text-amber-400">{summary.casualties_count.toLocaleString()}</span>
            <span className="text-[10px] text-[#9BA8AB] font-mono">Hospitalized</span>
          </div>
          <span className="text-[9px] text-[#9BA8AB]/70 font-mono">Severe trauma cases</span>
        </div>

        <div className="p-2.5 rounded border border-[#253745] bg-[#11212D] flex flex-col justify-between">
          <span className="text-[10px] font-mono text-[#9BA8AB] uppercase tracking-wider">Active Spatial Halos</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-lg font-bold text-[#FF7A00]">{summary.critical_hotspots_count}</span>
            <span className="text-[10px] text-[#9BA8AB] font-mono">DBSCAN ε=0.015</span>
          </div>
          <span className="text-[9px] text-[#9BA8AB]/70 font-mono">Dense incident clusters</span>
        </div>

        <div className="p-2.5 rounded border border-[#253745] bg-[#11212D] flex flex-col justify-between">
          <span className="text-[10px] font-mono text-[#9BA8AB] uppercase tracking-wider">Corridor Congestion</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-lg font-bold text-[#CCD0CF]">{summary.average_traffic_congestion_pct}%</span>
            <span className="text-[10px] text-amber-400 font-mono">Moderate</span>
          </div>
          <span className="text-[9px] text-[#9BA8AB]/70 font-mono">Across 6 arterials</span>
        </div>

        <div className="p-2.5 rounded border border-[#253745] bg-[#11212D] flex flex-col justify-between">
          <span className="text-[10px] font-mono text-[#9BA8AB] uppercase tracking-wider">Mean Arterial Speed</span>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="font-mono text-lg font-bold text-emerald-400">{summary.average_traffic_speed_kmh}</span>
            <span className="text-[10px] text-[#9BA8AB] font-mono">km/h</span>
          </div>
          <span className="text-[9px] text-[#9BA8AB]/70 font-mono">Free-flow base: 65 km/h</span>
        </div>
      </div>

      {/* 2. Main Geospatial Intelligence Console (Map-Dominant 70% Width + Severity Split 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Central GIS Map Viewport */}
        <div className="lg:col-span-8 flex flex-col rounded border border-[#253745] bg-[#11212D] overflow-hidden shadow-sm">
          <div className="h-10 px-3 border-b border-[#253745] bg-[#06141B] flex items-center justify-between font-mono text-xs">
            <div className="flex items-center space-x-2">
              <Compass className="w-3.5 h-3.5 text-[#FF7A00]" />
              <span className="font-semibold text-[#CCD0CF]">Maharashtra State GIS Spatial Envelope</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#253745] text-[#9BA8AB] border border-[#4A5C6A]">
                WGS84 • EPSG:4326
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={onNavigateToHotspots}
                className="text-[11px] text-[#FF7A00] hover:text-[#FF8A00] flex items-center space-x-1"
              >
                <span>Full Hotspot Explorer</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-[460px] relative">
            <LeafletMap
              hotspots={hotspots}
              roadSegments={roadSegments}
              height="460px"
              onHotspotSelect={() => onNavigateToHotspots()}
            />
          </div>

          {/* Map Status Bar */}
          <div className="h-9 px-3 border-t border-[#253745] bg-[#06141B] flex items-center justify-between text-[11px] font-mono text-[#9BA8AB]">
            <div className="flex items-center space-x-3">
              <span>Coverage: <strong className="text-[#CCD0CF]">Maharashtra State</strong></span>
              <span>Active Telemetry: <strong className="text-emerald-400">Mumbai MMR (3,800 records)</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time GIS Stream</span>
            </div>
          </div>
        </div>

        {/* Right Intelligence Dossier: Severity Distribution & Quick Inference */}
        <div className="lg:col-span-4 flex flex-col space-y-4">
          {/* Collision Severity Breakdown */}
          <div className="p-3.5 rounded border border-[#253745] bg-[#11212D] flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CCD0CF] font-mono">
                  Collision Severity Split
                </h3>
                <span className="text-[10px] font-mono text-[#9BA8AB]">Total: {summary.total_accidents}</span>
              </div>

              <div className="h-44 w-full relative mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.severity_distribution}
                      dataKey="count"
                      nameKey="severity"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      stroke="#11212D"
                      strokeWidth={2}
                    >
                      {summary.severity_distribution.map((entry, index) => {
                        const colors = ['#ef4444', '#f59e0b', '#10b981'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#06141B',
                        borderColor: '#4A5C6A',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                      }}
                      itemStyle={{ color: '#CCD0CF' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 mt-2 font-mono text-[11px]">
                {summary.severity_distribution.map((item, idx) => {
                  const colors = ['#ef4444', '#f59e0b', '#10b981'];
                  const color = colors[idx % colors.length];
                  return (
                    <div key={item.severity} className="flex items-center justify-between py-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="text-[#CCD0CF]">{item.severity} Collision</span>
                      </div>
                      <div className="space-x-2">
                        <strong className="text-[#CCD0CF]">{item.count}</strong>
                        <span className="text-[#9BA8AB]">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Direct Model Inference Trigger */}
            <div className="mt-4 pt-3 border-t border-[#253745]">
              <button
                onClick={onNavigateToPrediction}
                className="w-full py-2 px-3 rounded bg-[#253745] hover:bg-[#324657] text-[#CCD0CF] hover:text-[#FF7A00] border border-[#4A5C6A] font-mono text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-xs"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span>Run Accident Risk Inference</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Analytical Deep-Dive: High Risk Corridors & Longitudinal Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* High Risk Corridors Ranking Table */}
        <div className="lg:col-span-6 p-4 rounded border border-[#253745] bg-[#11212D] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#FF7A00]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CCD0CF] font-mono">
                High-Risk Arterial Corridors
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#9BA8AB]">Ranked by Severity Score</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#253745] text-[#9BA8AB] text-[10px] uppercase">
                  <th className="pb-1.5 font-medium">Corridor Name</th>
                  <th className="pb-1.5 font-medium">Zone</th>
                  <th className="pb-1.5 font-medium text-right">Incidents</th>
                  <th className="pb-1.5 font-medium text-right">Fatal</th>
                  <th className="pb-1.5 font-medium text-right">Risk Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253745]/60">
                {summary.high_risk_corridors.slice(0, 5).map((corr, idx) => (
                  <tr key={idx} className="hover:bg-[#253745]/40 transition-colors">
                    <td className="py-2 text-[#CCD0CF] font-semibold">{corr.corridor}</td>
                    <td className="py-2 text-[#9BA8AB]">{corr.zone}</td>
                    <td className="py-2 text-right text-[#CCD0CF]">{corr.accidents}</td>
                    <td className="py-2 text-right text-rose-400 font-bold">{corr.fatalities}</td>
                    <td className="py-2 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          corr.risk_level === 'Critical'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {corr.risk_score}/100
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 12-Month Longitudinal Incident Trend */}
        <div className="lg:col-span-6 p-4 rounded border border-[#253745] bg-[#11212D] space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-[#FF7A00]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#CCD0CF] font-mono">
                12-Month Incident Volume & Fatality Timeline
              </h3>
            </div>
            <div className="flex items-center space-x-3 text-[10px] font-mono">
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-[#FF7A00]" />
                <span className="text-[#9BA8AB]">Collisions</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="w-2.5 h-0.5 bg-rose-500" />
                <span className="text-[#9BA8AB]">Fatalities</span>
              </div>
            </div>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary.monthly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccidents" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF7A00" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" stroke="#4A5C6A" fontSize={10} tickLine={false} />
                <YAxis stroke="#4A5C6A" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#06141B',
                    borderColor: '#4A5C6A',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                  itemStyle={{ color: '#CCD0CF' }}
                />
                <Area
                  type="monotone"
                  dataKey="accidents"
                  name="Collisions"
                  stroke="#FF7A00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAccidents)"
                />
                <Area
                  type="monotone"
                  dataKey="fatalities"
                  name="Fatalities"
                  stroke="#ef4444"
                  strokeWidth={1.5}
                  fillOpacity={0}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
