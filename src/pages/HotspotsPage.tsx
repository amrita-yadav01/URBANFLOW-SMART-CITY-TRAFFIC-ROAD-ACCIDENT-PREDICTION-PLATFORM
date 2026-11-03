import React, { useState, useEffect } from 'react';
import {
  Filter,
  Search,
  MapPin,
  AlertTriangle,
  Layers,
  ChevronRight,
  Info,
  Calendar,
  Clock,
  ShieldCheck,
  Crosshair,
  Car,
  Compass,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { LeafletMap } from '../components/LeafletMap';
import { api } from '../services/api';
import type { Accident, HotspotCluster, RoadSegment } from '../types';
import {
  MAHARASHTRA_DISTRICTS
} from '../data/maharashtraGeo';
import type { MaharashtraDistrict } from '../data/maharashtraGeo';

export const HotspotsPage: React.FC = () => {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [roadSegments, setRoadSegments] = useState<RoadSegment[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotCluster | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<MaharashtraDistrict | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Initial Data Load
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [hsRes, segRes, accRes] = await Promise.all([
          api.getHotspots(),
          api.getRoadSegments(),
          api.getAccidents({ limit: 500 }),
        ]);
        setHotspots(hsRes.hotspots);
        setRoadSegments(segRes.segments);
        setAccidents(accRes.results);

        if (hsRes.hotspots.length > 0) {
          setSelectedHotspot(hsRes.hotspots[0]);
        }
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch accidents on filter change
  useEffect(() => {
    async function fetchFilteredAccidents() {
      try {
        const res = await api.getAccidents({
          severity: severityFilter !== 'all' ? severityFilter : undefined,
          limit: 500,
        });
        setAccidents(res.results);
      } catch (err) {
        console.error('Failed to load filtered accidents:', err);
      }
    }
    fetchFilteredAccidents();
  }, [severityFilter]);

  const handleDistrictChange = (distId: string) => {
    setSelectedDistrictId(distId);
    if (distId === 'all') {
      setSelectedDistrict(null);
    } else {
      const dist = MAHARASHTRA_DISTRICTS.find((d) => d.id === distId);
      if (dist) setSelectedDistrict(dist);
    }
  };

  const handleReset = () => {
    setSelectedDistrictId('all');
    setSelectedDistrict(null);
    setSeverityFilter('all');
    setRiskFilter('all');
    setSearchQuery('');
    if (hotspots.length > 0) setSelectedHotspot(hotspots[0]);
  };

  // Filtered Hotspots list
  const filteredHotspots = hotspots.filter((hs) => {
    if (riskFilter !== 'all' && hs.risk_level.toLowerCase() !== riskFilter.toLowerCase()) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        hs.primary_corridor.toLowerCase().includes(q) ||
        hs.prominent_cause.toLowerCase().includes(q) ||
        hs.cluster_id.toString().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#253745] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[#FF7A00]" />
            <h1 className="text-base font-semibold text-[#CCD0CF] tracking-tight font-sans">
              Maharashtra Statewide Accident Hotspot Intelligence
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#11212D] text-[#FF7A00] border border-[#253745]">
              GIS DBSCAN Clustered
            </span>
          </div>
          <p className="text-xs text-[#9BA8AB] mt-0.5 font-mono">
            Spatial density clustering across Maharashtra districts with active accident telemetry in Mumbai MMR.
          </p>
        </div>

        {/* Global Action / Reset */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-[#11212D] hover:bg-[#253745] text-[#CCD0CF] border border-[#4A5C6A] text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#FF7A00]" />
            <span>Reset Spatial Filters</span>
          </button>
        </div>
      </div>

      {/* Main Map Workspace (Map 67% + Contextual Panel 33%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Map Viewport (Occupies 8 columns on large screens) */}
        <div className="lg:col-span-8 flex flex-col rounded border border-[#253745] bg-[#11212D] overflow-hidden shadow-lg min-h-[580px]">
          <LeafletMap
            hotspots={hotspots}
            roadSegments={roadSegments}
            accidents={accidents}
            selectedDistrictId={selectedDistrictId}
            onDistrictSelect={(dist) => setSelectedDistrict(dist)}
            onHotspotSelect={(hs) => setSelectedHotspot(hs)}
            height="580px"
          />
        </div>

        {/* Right Sidebar Intelligence Panel (Occupies 4 columns) */}
        <div className="lg:col-span-4 flex flex-col space-y-3">
          {/* Geographical & Attribute Filter Console */}
          <div className="p-3.5 rounded border border-[#253745] bg-[#11212D] space-y-3 font-mono text-xs shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
              <div className="flex items-center space-x-1.5">
                <Filter className="w-3.5 h-3.5 text-[#FF7A00]" />
                <span className="font-semibold text-[#CCD0CF] uppercase tracking-wider text-[11px]">
                  Geographical Filters
                </span>
              </div>
              <span className="text-[10px] text-[#9BA8AB]">State: Maharashtra</span>
            </div>

            {/* District Selector */}
            <div className="space-y-1">
              <label className="text-[10px] text-[#9BA8AB] uppercase">Administrative District</label>
              <select
                value={selectedDistrictId}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-2 text-[#CCD0CF] text-xs font-mono focus:outline-none focus:border-[#FF7A00]"
              >
                <option value="all">Maharashtra (All 36 Districts)</option>
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.hasAccidentData ? '• [3,800 Active Recs]' : '• [Ready for Ingestion]'}
                  </option>
                ))}
              </select>
            </div>

            {/* Severity Filter */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs font-mono focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="all">All Severities</option>
                  <option value="Fatal">Fatal Only</option>
                  <option value="Serious">Serious Only</option>
                  <option value="Slight">Slight Only</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Risk Tier</label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs font-mono focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                </select>
              </div>
            </div>

            {/* Search Corridors */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#9BA8AB] absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search corridor or cause..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#06141B] border border-[#4A5C6A] rounded py-1.5 pl-8 pr-2 text-xs font-mono text-[#CCD0CF] placeholder-[#9BA8AB]/60 focus:outline-none focus:border-[#FF7A00]"
              />
            </div>
          </div>

          {/* District Status Card (When District is Selected) */}
          {selectedDistrict && (
            <div className="p-3 rounded border border-[#4A5C6A] bg-[#11212D] text-xs font-mono space-y-1.5 shadow-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#253745]">
                <strong className="text-[#FF7A00] text-sm">{selectedDistrict.name}</strong>
                <span className="text-[10px] text-[#9BA8AB]">{selectedDistrict.marathiName}</span>
              </div>
              <div className="text-[11px] text-[#CCD0CF]">
                Administrative Division: <strong className="text-[#CCD0CF]">{selectedDistrict.division}</strong>
              </div>
              <div className="text-[11px]">
                Status:{' '}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] ${
                    selectedDistrict.hasAccidentData
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold'
                      : 'bg-[#253745] text-[#FF7A00] border border-[#4A5C6A]'
                  }`}
                >
                  {selectedDistrict.statusLabel}
                </span>
              </div>
              <p className="text-[10px] text-[#9BA8AB] leading-relaxed pt-1">
                {selectedDistrict.description}
              </p>
            </div>
          )}

          {/* Selected Hotspot Intelligence Dossier */}
          {selectedHotspot ? (
            <div className="p-3.5 rounded border border-[#253745] bg-[#11212D] space-y-3 font-mono text-xs flex-1 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" />
                  <h3 className="font-semibold text-[#CCD0CF]">
                    Hotspot #{selectedHotspot.cluster_id}: {selectedHotspot.primary_corridor}
                  </h3>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedHotspot.risk_level === 'Critical'
                      ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {selectedHotspot.risk_level}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 rounded bg-[#06141B] border border-[#253745]">
                  <span className="text-[10px] text-[#9BA8AB] uppercase block">Total Collisions</span>
                  <span className="text-base font-bold text-[#CCD0CF]">{selectedHotspot.accident_count}</span>
                </div>
                <div className="p-2 rounded bg-[#06141B] border border-[#253745]">
                  <span className="text-[10px] text-[#9BA8AB] uppercase block">Fatalities</span>
                  <span className="text-base font-bold text-rose-400">{selectedHotspot.fatal_count}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#253745]/60">
                  <span className="text-[#9BA8AB]">Prominent Cause:</span>
                  <span className="text-[#CCD0CF] font-semibold">{selectedHotspot.prominent_cause}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#253745]/60">
                  <span className="text-[#9BA8AB]">Spatial Radius:</span>
                  <span className="text-[#CCD0CF] font-mono">{selectedHotspot.radius_meters || 650} meters</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#253745]/60">
                  <span className="text-[#9BA8AB]">Calculated Risk:</span>
                  <span className="text-[#FF7A00] font-bold">{selectedHotspot.calculated_risk_score}/100</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded border border-[#253745] bg-[#11212D] text-center text-xs font-mono text-[#9BA8AB]">
              Select a hotspot marker on the map to inspect telemetry.
            </div>
          )}

          {/* Directory of Hotspots */}
          <div className="p-3.5 rounded border border-[#253745] bg-[#11212D] space-y-2 font-mono text-xs max-h-56 overflow-y-auto">
            <span className="text-[10px] text-[#9BA8AB] uppercase tracking-wider block font-bold">
              Detected Clusters ({filteredHotspots.length})
            </span>
            <div className="space-y-1">
              {filteredHotspots.map((h) => (
                <button
                  key={h.cluster_id}
                  onClick={() => setSelectedHotspot(h)}
                  className={`w-full text-left p-1.5 rounded transition-colors text-[11px] flex items-center justify-between ${
                    selectedHotspot?.cluster_id === h.cluster_id
                      ? 'bg-[#253745] text-[#FF7A00] border border-[#4A5C6A]'
                      : 'text-[#CCD0CF] hover:bg-[#253745]/50'
                  }`}
                >
                  <span className="truncate">{h.primary_corridor}</span>
                  <span className="text-rose-400 font-bold ml-2 shrink-0">{h.accident_count} collisions</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
