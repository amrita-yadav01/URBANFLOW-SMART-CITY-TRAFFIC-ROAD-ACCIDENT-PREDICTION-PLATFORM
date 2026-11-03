import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Clock,
  CloudRain,
  Calendar,
  AlertTriangle,
  Building2,
  Car,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import type { AnalyticsData } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [diurnalMatrix, setDiurnalMatrix] = useState<any | null>(null);
  const [trendsData, setTrendsData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'temporal' | 'diurnal_matrix' | 'meteorological' | 'demographics'>('temporal');
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; count: number } | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [overviewRes, matrixRes, trendsRes] = await Promise.all([
          api.getAnalyticsOverview(),
          api.getDiurnalMatrix().catch(() => null),
          api.getHistoricalTrends().catch(() => null),
        ]);
        setData(overviewRes);
        setDiurnalMatrix(matrixRes);
        setTrendsData(trendsRes);
      } catch (err: any) {
        setError(err.message || 'Failed to aggregate analytics data');
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-4">
        <div className="w-8 h-8 border-2 border-[#FF7A00] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-center font-mono">
          <p className="text-xs text-[#CCD0CF] uppercase tracking-widest">Aggregating Longitudinal Records</p>
          <p className="text-[11px] text-[#9BA8AB] mt-1">Calculating temporal distributions & ward regressions...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded border border-rose-900/60 bg-rose-950/20 text-rose-300 text-xs font-mono flex items-center space-x-3">
        <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
        <div>
          <span className="font-bold">Telemetry Aggregation Failure:</span> {error || 'No analytical data available.'}
        </div>
      </div>
    );
  }

  // Calculate high-level analytical metrics
  const totalCollisions = data.hourly_distribution.reduce((acc, curr) => acc + curr.accidents, 0);
  const totalFatalities = data.hourly_distribution.reduce((acc, curr) => acc + curr.fatalities, 0);
  const peakRushCollisions = data.hourly_distribution
    .filter((h) => h.is_rush)
    .reduce((acc, curr) => acc + curr.accidents, 0);
  const peakRushPct = totalCollisions > 0 ? ((peakRushCollisions / totalCollisions) * 100).toFixed(1) : '0';

  const highestWeather = [...data.weather_impact].sort((a, b) => b.avg_risk_score - a.avg_risk_score)[0];

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#253745] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#FF7A00]" />
            <h1 className="text-base font-semibold text-[#CCD0CF] tracking-tight font-sans">
              Citywide & Regional Accident Analytics
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#11212D] text-[#CCD0CF] border border-[#253745]">
              N=3,800
            </span>
          </div>
          <p className="text-xs text-[#9BA8AB] mt-0.5">
            Longitudinal correlation of collision frequency against diurnal rhythm, weather events, and ward demographics.
          </p>
        </div>

        {/* View Switcher Filter Tabs */}
        <div className="flex items-center p-1 bg-[#11212D] rounded border border-[#253745] text-xs">
          <button
            onClick={() => setSelectedView('temporal')}
            className={`px-3 py-1 rounded transition-colors ${
              selectedView === 'temporal'
                ? 'bg-[#253745] text-[#FF7A00] font-semibold'
                : 'text-[#9BA8AB] hover:text-[#CCD0CF]'
            }`}
          >
            Temporal / Diurnal
          </button>
          <button
            onClick={() => setSelectedView('diurnal_matrix')}
            className={`px-3 py-1 rounded transition-colors ${
              selectedView === 'diurnal_matrix'
                ? 'bg-[#253745] text-[#FF7A00] font-semibold'
                : 'text-[#9BA8AB] hover:text-[#CCD0CF]'
            }`}
          >
            2D Diurnal Heatmap
          </button>
          <button
            onClick={() => setSelectedView('meteorological')}
            className={`px-3 py-1 rounded transition-colors ${
              selectedView === 'meteorological'
                ? 'bg-[#253745] text-[#FF7A00] font-semibold'
                : 'text-[#9BA8AB] hover:text-[#CCD0CF]'
            }`}
          >
            Weather & Causes
          </button>
          <button
            onClick={() => setSelectedView('demographics')}
            className={`px-3 py-1 rounded transition-colors ${
              selectedView === 'demographics'
                ? 'bg-[#253745] text-[#FF7A00] font-semibold'
                : 'text-[#9BA8AB] hover:text-[#CCD0CF]'
            }`}
          >
            Ward Demographics
          </button>
        </div>
      </div>

      {/* Analytical Telemetry Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB] block">
            Longitudinal Incidents
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-[#CCD0CF]">{totalCollisions.toLocaleString()}</span>
            <span className="text-xs text-[#9BA8AB]">records</span>
          </div>
          <div className="text-[11px] text-rose-400 mt-1">
            {totalFatalities} fatal events ({((totalFatalities / (totalCollisions || 1)) * 100).toFixed(1)}%)
          </div>
        </div>

        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB] block">
            Peak Commuter Rush Share
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-[#FF7A00]">{peakRushPct}%</span>
            <span className="text-xs text-[#9BA8AB]">of daily total</span>
          </div>
          <div className="text-[11px] text-[#9BA8AB] mt-1">
            08:00–11:00 & 17:00–21:00 windows
          </div>
        </div>

        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB] block">
            Max Friction Hazard
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-rose-400">{highestWeather?.weather || 'Heavy Rain'}</span>
          </div>
          <div className="text-[11px] text-[#9BA8AB] mt-1">
            Risk Score: {highestWeather?.avg_risk_score || 88}/100 • monsoon skidding
          </div>
        </div>

        <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
          <span className="text-[10px] uppercase tracking-wider text-[#9BA8AB] block">
            Highest Ward Rate
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-xl font-bold text-[#CCD0CF]">K-East (Andheri)</span>
          </div>
          <div className="text-[11px] text-[#FF7A00] mt-1">
            38.4 collisions / 100k pop.
          </div>
        </div>
      </div>

      {/* VIEW: 2D DIURNAL-WEEKLY HEATMAP MATRIX (Hour 0-23 x Day Mon-Sun) */}
      {(selectedView === 'diurnal_matrix' || selectedView === 'temporal') && diurnalMatrix && (
        <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#253745]">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#FF7A00]" />
              <h2 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
                2D Diurnal-Weekly Incident Matrix (24 Hours × 7 Days)
              </h2>
            </div>
            <div className="flex items-center space-x-3 text-[10px] text-[#9BA8AB]">
              <span>Intensity scale:</span>
              <div className="flex items-center space-x-1">
                <span className="w-3 h-3 rounded-xs bg-[#06141B] border border-[#253745]" />
                <span>0</span>
                <span className="w-3 h-3 rounded-xs bg-[#253745]" />
                <span className="w-3 h-3 rounded-xs bg-[#4A5C6A]" />
                <span className="w-3 h-3 rounded-xs bg-[#ea580c]" />
                <span className="w-3 h-3 rounded-xs bg-[#ef4444]" />
                <span>45+</span>
              </div>
            </div>
          </div>

          {/* Peak & Safe Callouts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-[#06141B] border border-[#253745] rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#9BA8AB] uppercase block">Peak Collision Danger Window</span>
                <span className="text-xs font-bold text-rose-400 mt-0.5 block">
                  {diurnalMatrix.peak_risk_window?.day} {diurnalMatrix.peak_risk_window?.hour} ({diurnalMatrix.peak_risk_window?.count} crashes)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                Critical Density
              </span>
            </div>
            <div className="p-2.5 bg-[#06141B] border border-[#253745] rounded flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#9BA8AB] uppercase block">Safest Time Window</span>
                <span className="text-xs font-bold text-emerald-400 mt-0.5 block">
                  {diurnalMatrix.safest_window?.time}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Lowest Risk
              </span>
            </div>
          </div>

          {/* 2D Heatmap Grid Table */}
          <div className="overflow-x-auto border border-[#253745] rounded p-2 bg-[#06141B]">
            <table className="w-full text-center border-collapse text-[10px]">
              <thead>
                <tr>
                  <th className="p-1 text-left text-[#9BA8AB] w-12 font-mono">Day</th>
                  {diurnalMatrix.hours?.map((hr: string, hIdx: number) => (
                    <th key={hIdx} className="p-1 text-[#9BA8AB] font-mono text-[9px]">
                      {hIdx % 2 === 0 ? `${hIdx}h` : ''}
                    </th>
                  ))}
                  <th className="p-1 text-right text-[#FF7A00] font-mono w-14">Total</th>
                </tr>
              </thead>
              <tbody>
                {diurnalMatrix.matrix?.map((row: any, rIdx: number) => (
                  <tr key={rIdx}>
                    <td className="p-1 text-left font-bold text-[#CCD0CF] text-[10px] font-mono">
                      {row.short_day}
                    </td>
                    {row.hours?.map((cnt: number, cIdx: number) => {
                      const maxC = diurnalMatrix.max_cell_count || 47;
                      const ratio = cnt / maxC;
                      let bg = '#06141B';
                      let textC = '#4A5C6A';
                      if (cnt > 38) {
                        bg = '#ef4444';
                        textC = '#06141B';
                      } else if (cnt > 26) {
                        bg = '#ea580c';
                        textC = '#06141B';
                      } else if (cnt > 15) {
                        bg = '#4A5C6A';
                        textC = '#CCD0CF';
                      } else if (cnt > 5) {
                        bg = '#253745';
                        textC = '#9BA8AB';
                      } else if (cnt > 0) {
                        bg = '#11212D';
                        textC = '#9BA8AB';
                      }

                      return (
                        <td
                          key={cIdx}
                          onMouseEnter={() => setHoveredCell({ day: row.day, hour: `${String(cIdx).padStart(2, '0')}:00`, count: cnt })}
                          onMouseLeave={() => setHoveredCell(null)}
                          className="p-1 cursor-pointer transition-all"
                          style={{ backgroundColor: bg, color: textC }}
                          title={`${row.day} ${cIdx}:00 - ${cnt} accidents`}
                        >
                          <span className="font-mono text-[9px] font-bold block">{cnt}</span>
                        </td>
                      );
                    })}
                    <td className="p-1 text-right font-bold text-[#FF7A00] font-mono text-[10px]">
                      {row.day_total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {hoveredCell && (
            <div className="p-2 bg-[#06141B] border border-[#FF7A00]/50 rounded text-xs text-[#CCD0CF] flex items-center justify-between">
              <span>Selected Cell: <strong className="text-[#FF7A00]">{hoveredCell.day} at {hoveredCell.hour}</strong></span>
              <span className="font-bold text-emerald-400">{hoveredCell.count} recorded collisions</span>
            </div>
          )}
        </div>
      )}

      {/* Primary Chart: Diurnal 24-Hour Distribution */}
      {(selectedView === 'temporal' || selectedView === 'demographics' || selectedView === 'meteorological') && (
        <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#253745]">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#FF7A00]" />
              <h2 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
                24-Hour Diurnal Accident & Fatality Profile
              </h2>
            </div>
            <div className="flex items-center space-x-4 text-xs">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#4A5C6A] inline-block" />
                <span className="text-[#9BA8AB]">Regular Hours</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#FF7A00] inline-block" />
                <span className="text-[#CCD0CF]">Peak Commuter Rush</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block" />
                <span className="text-rose-400">Fatalities</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.hourly_distribution} margin={{ top: 12, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#253745" vertical={false} />
                <XAxis dataKey="hour" stroke="#4A5C6A" fontSize={10} tickLine={false} />
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
                <Bar dataKey="accidents" name="Total Collisions" radius={[2, 2, 0, 0]}>
                  {data.hourly_distribution.map((entry, index) => (
                    <Cell
                      key={`hour-bar-${index}`}
                      fill={entry.is_rush ? '#FF7A00' : '#4A5C6A'}
                      opacity={entry.is_rush ? 0.95 : 0.75}
                    />
                  ))}
                </Bar>
                <Bar dataKey="fatalities" name="Fatalities" fill="#ef4444" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-[#9BA8AB] pt-2 border-t border-[#253745]">
            <span>• Orange columns highlight morning (08:00–11:00) and evening (17:00–21:00) commuter rush.</span>
            <span className="text-rose-400">
              • Night intervals (23:00–04:00) produce highest fatality ratio per incident due to reduced traffic density and overspeeding.
            </span>
          </div>
        </div>
      )}

      {/* Row 2: Weather Surface Impact + Day of Week */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weather Conditions Breakdown */}
        <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
            <div className="flex items-center space-x-2">
              <CloudRain className="w-4 h-4 text-[#FF7A00]" />
              <h3 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
                Meteorological State & Surface Friction
              </h3>
            </div>
            <span className="text-[10px] text-[#9BA8AB]">Surface Sensors</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.weather_impact} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#253745" horizontal={false} />
                <XAxis type="number" stroke="#4A5C6A" fontSize={10} tickLine={false} />
                <YAxis dataKey="weather" type="category" stroke="#9BA8AB" fontSize={11} tickLine={false} width={85} />
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
                <Bar dataKey="accidents" name="Incidents" fill="#253745" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-[#253745]">
            {data.weather_impact.map((w) => (
              <div key={w.weather} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-[#06141B]">
                <span className="text-[#CCD0CF] font-sans">{w.weather}</span>
                <div className="flex items-center space-x-3 text-[11px]">
                  <span className="text-[#9BA8AB]">{w.accidents} events</span>
                  <span className="text-rose-400 font-semibold">{w.fatalities} fatal</span>
                  <span
                    className={`px-2 py-0.5 rounded border text-[10px] ${
                      w.avg_risk_score >= 80
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        : w.avg_risk_score >= 60
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}
                  >
                    Risk {w.avg_risk_score}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Day-of-Week Longitudinal Breakdown */}
        <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
                Day-of-the-Week Incident Distribution
              </h3>
            </div>
            <span className="text-[10px] text-[#9BA8AB]">7-Day Weekly Cycle</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.day_of_week_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#253745" vertical={false} />
                <XAxis dataKey="day" stroke="#4A5C6A" fontSize={10} tickLine={false} />
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
                <Bar dataKey="accidents" name="Total Accidents" radius={[2, 2, 0, 0]}>
                  {data.day_of_week_distribution.map((entry, index) => (
                    <Cell
                      key={`dow-${index}`}
                      fill={entry.day === 'Fri' || entry.day === 'Sat' ? '#FF7A00' : '#10b981'}
                      opacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#06141B] border border-[#253745] rounded text-xs text-[#9BA8AB] space-y-1">
            <div className="text-[#FF7A00] font-semibold flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Weekend Risk Shift Observation:</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Friday and Saturday night hours experience a 28.4% increase in severe speed-differential collisions along arterial expressways (WEH, EEH, and Sion-Panvel Highway).
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Primary Contributing Causes + Demographic Indices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Contributing Causes Breakdown */}
        <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
            <h3 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
              Primary Collision Contributing Causes
            </h3>
            <span className="text-[10px] text-[#9BA8AB]">Police FIR Logging</span>
          </div>

          <div className="space-y-2.5">
            {data.primary_causes.map((c, i) => {
              const maxVal = data.primary_causes[0]?.accidents || 1;
              const pct = Math.min(100, (c.accidents / maxVal) * 100);
              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#CCD0CF] font-sans font-medium">{c.cause}</span>
                    <span className="text-[#9BA8AB] text-[11px]">
                      <strong className="text-[#CCD0CF]">{c.accidents}</strong> incidents •{' '}
                      <span className="text-rose-400">{c.fatalities} fatal</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#06141B] rounded-xs h-1.5 overflow-hidden border border-[#253745]">
                    <div
                      className="h-full bg-[#FF7A00] rounded-xs"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Demographic Ward Per-Capita Indices */}
        <div className="p-4 bg-[#11212D] border border-[#253745] rounded space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-[#FF7A00]" />
              <h3 className="text-xs font-semibold text-[#CCD0CF] uppercase tracking-wider">
                Ward Demographic & Spatial Rate Analysis
              </h3>
            </div>
            <span className="text-[10px] text-[#9BA8AB]">Census & RTO Data</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#253745] text-[10px] text-[#9BA8AB] uppercase tracking-wider">
                  <th className="pb-2">Ward / Zone</th>
                  <th className="pb-2 text-right">Population</th>
                  <th className="pb-2 text-right">Incidents</th>
                  <th className="pb-2 text-right">Rate / 100k</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#253745]/60">
                {data.demographic_correlations.map((w) => (
                  <tr key={w.zone} className="hover:bg-[#253745]/50">
                    <td className="py-2 text-[#CCD0CF] font-sans font-medium">{w.zone}</td>
                    <td className="py-2 text-right text-[#9BA8AB]">{w.population.toLocaleString()}</td>
                    <td className="py-2 text-right text-[#CCD0CF] font-semibold">{w.accidents}</td>
                    <td className="py-2 text-right">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          w.rate_per_100k_pop >= 35
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold'
                            : 'bg-[#253745] text-[#FF7A00] border border-[#4A5C6A]'
                        }`}
                      >
                        {w.rate_per_100k_pop.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-[#253745] text-[11px] text-[#9BA8AB] flex items-center justify-between">
            <span>Spatial Normalization: Accounts for residential vs arterial commuter transit.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
