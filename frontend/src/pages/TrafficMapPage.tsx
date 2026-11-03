import React, { useState, useEffect } from 'react';
import {
  Activity,
  Gauge,
  MapPin,
  Car,
  Clock,
  Compass,
  AlertCircle,
  TrendingDown,
  ExternalLink
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { api } from '../services/api';
import type { RoadSegment } from '../types';

interface TrafficMapPageProps {
  onNavigateToForecast: () => void;
}

export const TrafficMapPage: React.FC<TrafficMapPageProps> = ({ onNavigateToForecast }) => {
  const [segments, setSegments] = useState<RoadSegment[]>([]);
  const [corridorSummaries, setCorridorSummaries] = useState<any[]>([]);
  const [selectedCorridor, setSelectedCorridor] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadTrafficNetwork() {
      try {
        setLoading(true);
        const [segRes, trafRes] = await Promise.all([
          api.getRoadSegments(),
          api.getTrafficCorridors(),
        ]);
        setSegments(segRes.segments);
        setCorridorSummaries(trafRes.corridors);

        if (trafRes.corridors.length > 0) {
          setSelectedCorridor(trafRes.corridors[0]);
        }
      } catch (err) {
        console.error('Failed to load traffic network:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTrafficNetwork();
  }, []);

  return (
    <div className="space-y-3 font-sans text-xs">
      {/* Top Telemetry Strip */}
      <div className="p-2.5 rounded border border-[#1e2838] bg-[#111622] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-amber-500" />
          <span className="font-semibold text-slate-100 text-xs">Live Arterial Highway Flow Network</span>
          <span className="text-[10px] font-mono text-slate-400">&bull; Mumbai & Navi Mumbai Corridors</span>
        </div>

        <button
          onClick={onNavigateToForecast}
          className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1 transition-colors"
        >
          <span>Open Forecasting Simulation</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Main Grid: Left GIS Map (70%), Right Corridor Monitor (30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-8 space-y-2">
          <LeafletMap
            roadSegments={segments}
            height="620px"
          />

          <div className="p-2 rounded border border-[#1e2838] bg-[#111622] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Color key: <strong className="text-emerald-400">Green</strong> (Free Flow &gt; 45 km/h) &bull; <strong className="text-amber-400">Amber</strong> (Moderate 25-45 km/h) &bull; <strong className="text-red-400">Red</strong> (Gridlock &lt; 25 km/h)</span>
            <span className="text-slate-500">Live Traffic Telemetry Feed</span>
          </div>
        </div>

        {/* Right: Monitored Corridors List & Detail */}
        <div className="lg:col-span-4 space-y-3 flex flex-col h-[660px]">
          {/* Selected Corridor Dossier */}
          {selectedCorridor && (
            <div className="p-3.5 rounded border border-amber-500/40 bg-[#111622] space-y-2.5 font-mono">
              <div className="flex items-start justify-between pb-2 border-b border-[#1e2838]">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 block">Monitored Corridor</span>
                  <h4 className="font-sans font-bold text-sm text-slate-100">{selectedCorridor.corridor}</h4>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                    selectedCorridor.status === 'Congested'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : selectedCorridor.status === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {selectedCorridor.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-[#161d2a] border border-[#1e2838]">
                  <span className="text-[10px] text-slate-400 block">Congestion Index</span>
                  <span className="text-lg font-bold text-amber-400">{selectedCorridor.average_congestion}%</span>
                </div>
                <div className="p-2 rounded bg-[#161d2a] border border-[#1e2838]">
                  <span className="text-[10px] text-slate-400 block">Average Velocity</span>
                  <span className="text-lg font-bold text-sky-400">{selectedCorridor.average_speed} <span className="text-xs font-normal text-slate-400">km/h</span></span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 space-y-1 bg-[#161d2a] p-2 rounded border border-[#1e2838]">
                <div>Active Sensors: <strong className="text-slate-200">{selectedCorridor.sample_points} telemetry stations</strong></div>
                <div>Surveillance: <strong className="text-emerald-400">Continuous 10-sec Polling</strong></div>
              </div>
            </div>
          )}

          {/* All Corridors List */}
          <div className="p-3 rounded border border-[#1e2838] bg-[#111622] flex-1 flex flex-col overflow-hidden font-mono text-[11px]">
            <div className="pb-2 border-b border-[#1e2838] flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Corridor Registry ({corridorSummaries.length})
              </span>
              <span className="text-[10px] text-slate-500">Live Speeds</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 mt-2 pr-1">
              {corridorSummaries.map((c, i) => {
                const isSelected = selectedCorridor?.corridor === c.corridor;
                return (
                  <div
                    key={i}
                    onClick={() => setSelectedCorridor(c)}
                    className={`p-2.5 rounded border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-amber-500 bg-[#1e2636] text-white'
                        : 'border-[#1e2838] bg-[#161d2a] hover:bg-[#1a2230] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between font-sans">
                      <span className="font-semibold text-xs truncate max-w-[180px]">{c.corridor}</span>
                      <span className="font-mono text-[10px] text-amber-400 font-bold">{c.average_congestion}%</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Flow: {c.average_speed} km/h</span>
                      <span
                        className={`font-semibold uppercase text-[9px] ${
                          c.status === 'Congested' ? 'text-red-400' : c.status === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

