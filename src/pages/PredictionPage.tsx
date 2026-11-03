import React, { useState } from 'react';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Compass,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Activity,
  Info
} from 'lucide-react';
import { ShapBarChart } from '../components/ShapBarChart';
import { api } from '../services/api';
import type { AccidentRiskPredictionResult } from '../types';

const LOCATION_PRESETS = [
  {
    name: 'Andheri WEH Flyover',
    district: 'Mumbai Suburban',
    lat: 19.1197,
    lon: 72.8584,
    road_type: 'Expressway',
    speed: 80,
    corridor: 'Western Express Highway',
  },
  {
    name: 'Vashi Toll Plaza & Creek',
    district: 'Raigad / Navi Mumbai',
    lat: 19.0645,
    lon: 72.9770,
    road_type: 'Expressway',
    speed: 80,
    corridor: 'Sion-Panvel Highway',
  },
  {
    name: 'Khandala Ghat Section (Mumbai-Pune Exp)',
    district: 'Raigad & Pune',
    lat: 18.7562,
    lon: 73.4072,
    road_type: 'Expressway',
    speed: 80,
    corridor: 'Mumbai-Pune Expressway',
  },
  {
    name: 'Sion Circle Junction',
    district: 'Mumbai City',
    lat: 19.0435,
    lon: 72.8655,
    road_type: 'Junction',
    speed: 50,
    corridor: 'Eastern Express Highway',
  },
  {
    name: 'Kapurbawdi Flyover Thane',
    district: 'Thane',
    lat: 19.2150,
    lon: 72.9770,
    road_type: 'Arterial',
    speed: 60,
    corridor: 'Ghodbunder Road',
  },
  {
    name: 'Samruddhi Mahamarg Nashik Interchange',
    district: 'Nashik',
    lat: 19.9975,
    lon: 73.7898,
    road_type: 'Expressway',
    speed: 120,
    corridor: 'Samruddhi Mahamarg',
  },
];

export const PredictionPage: React.FC = () => {
  const [latitude, setLatitude] = useState<number>(19.1197);
  const [longitude, setLongitude] = useState<number>(72.8584);
  const [roadType, setRoadType] = useState<string>('Expressway');
  const [speedLimit, setSpeedLimit] = useState<number>(80);
  const [hour, setHour] = useState<number>(19);
  const [dayOfWeek, setDayOfWeek] = useState<number>(4); // Friday
  const [weatherCondition, setWeatherCondition] = useState<string>('Clear');
  const [lightingCondition, setLightingCondition] = useState<string>('Dark - Streetlights On');
  const [roadSurface, setRoadSurface] = useState<string>('Dry');

  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AccidentRiskPredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleApplyPreset = (preset: typeof LOCATION_PRESETS[0]) => {
    setLatitude(preset.lat);
    setLongitude(preset.lon);
    setRoadType(preset.road_type);
    setSpeedLimit(preset.speed);
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        latitude,
        longitude,
        road_type: roadType,
        hour,
        day_of_week: dayOfWeek,
        weather_condition: weatherCondition,
        lighting_condition: lightingCondition,
        road_surface: roadSurface,
        speed_limit: speedLimit,
      };

      const res = await api.predictAccidentRisk(payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Inference execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#253745] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#FF7A00]" />
            <h1 className="text-base font-semibold text-[#CCD0CF] tracking-tight font-sans">
              Accident Risk Inference & Explainable AI (XAI)
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#11212D] text-[#FF7A00] border border-[#253745]">
              TreeSHAP Explainer
            </span>
          </div>
          <p className="text-xs text-[#9BA8AB] mt-0.5 font-mono">
            Spatial-environmental risk evaluation using trained Random Forest Ensemble with additive local feature attributions.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] px-2.5 py-1 rounded bg-[#253745] text-emerald-400 border border-[#4A5C6A]">
            Model: RF Classifier v2.1 (Acc: 84.2%)
          </span>
        </div>
      </div>

      {/* Main Prediction Workspace (Form 45% + Output 55%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Form: Spatial & Environmental Inputs */}
        <div className="lg:col-span-5 p-4 rounded border border-[#253745] bg-[#11212D] space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
            <span className="font-semibold text-[#CCD0CF] uppercase tracking-wider text-xs">
              Simulation Parameters
            </span>
            <span className="text-[10px] text-[#9BA8AB]">Maharashtra GIS Coordinates</span>
          </div>

          {/* Quick Location Presets */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-[#9BA8AB] uppercase block">Maharashtra Highway Presets</span>
            <div className="grid grid-cols-2 gap-1.5">
              {LOCATION_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-1.5 text-left rounded bg-[#06141B] hover:bg-[#253745] text-[#CCD0CF] border border-[#253745] text-[10px] truncate transition-colors"
                  title={`${p.name} (${p.district})`}
                >
                  <span className="text-[#FF7A00] font-bold block truncate">{p.name}</span>
                  <span className="text-[#9BA8AB] text-[9px] block truncate">{p.district}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handlePredict} className="space-y-3">
            {/* Coordinates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Latitude (°N)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value))}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Longitude (°E)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value))}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
                  required
                />
              </div>
            </div>

            {/* Road Type & Speed Limit */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Road Hierarchy</label>
                <select
                  value={roadType}
                  onChange={(e) => setRoadType(e.target.value)}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="Expressway">Expressway / Freeway</option>
                  <option value="Arterial">Primary Arterial</option>
                  <option value="Junction">Grade-Separated Junction</option>
                  <option value="Flyover">Elevated Flyover Ramp</option>
                  <option value="Secondary">Secondary Feeder</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Speed Limit (km/h)</label>
                <input
                  type="number"
                  value={speedLimit}
                  onChange={(e) => setSpeedLimit(parseInt(e.target.value))}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
                  required
                />
              </div>
            </div>

            {/* Temporal Parameters */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Hour ({hour.toString().padStart(2, '0')}:00)</label>
                <select
                  value={hour}
                  onChange={(e) => setHour(parseInt(e.target.value))}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
                >
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, '0')}:00 {i >= 8 && i <= 11 ? '(Morning Rush)' : i >= 17 && i <= 21 ? '(Evening Rush)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value={0}>Monday</option>
                  <option value={1}>Tuesday</option>
                  <option value={2}>Wednesday</option>
                  <option value={3}>Thursday</option>
                  <option value={4}>Friday (Weekend Outflow)</option>
                  <option value={5}>Saturday (Night Traffic)</option>
                  <option value={6}>Sunday</option>
                </select>
              </div>
            </div>

            {/* Environmental Conditions */}
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Weather</label>
                <select
                  value={weatherCondition}
                  onChange={(e) => setWeatherCondition(e.target.value)}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="Clear">Clear</option>
                  <option value="Heavy Rain">Heavy Rain</option>
                  <option value="Drizzle">Drizzle</option>
                  <option value="Fog/Haze">Fog/Haze</option>
                  <option value="Overcast">Overcast</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Lighting</label>
                <select
                  value={lightingCondition}
                  onChange={(e) => setLightingCondition(e.target.value)}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="Daylight">Daylight</option>
                  <option value="Dark - Streetlights On">Lit Night</option>
                  <option value="Dark - Unlit">Unlit Night</option>
                  <option value="Dusk/Dawn">Dusk/Dawn</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-[#9BA8AB] uppercase">Surface</label>
                <select
                  value={roadSurface}
                  onChange={(e) => setRoadSurface(e.target.value)}
                  className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-1.5 text-[#CCD0CF] text-xs focus:outline-none focus:border-[#FF7A00]"
                >
                  <option value="Dry">Dry</option>
                  <option value="Wet">Wet</option>
                  <option value="Waterlogged">Waterlogged</option>
                  <option value="Uneven/Potholes">Potholes</option>
                </select>
              </div>
            </div>

            {/* Run Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-3 rounded bg-[#FF7A00] hover:bg-[#FF8A00] text-[#06141B] font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all mt-4 shadow-sm"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#06141B] border-t-transparent rounded-full animate-spin" />
                  <span>Computing SHAP Attributions...</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>Execute Risk Inference</span>
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="p-2.5 rounded bg-rose-950/20 border border-rose-900/60 text-rose-300 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Right Output: Inference Results & SHAP Waterfall */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <div className="space-y-4">
              {/* Primary Risk Tier Badge & Probabilities */}
              <div className="p-4 rounded border border-[#253745] bg-[#11212D] space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#253745]">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        result.predicted_severity?.includes('Fatal') || result.predicted_category?.includes('High') || result.predicted_category?.includes('Critical')
                          ? 'bg-rose-500'
                          : result.predicted_severity?.includes('Serious') || result.predicted_category?.includes('Medium')
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    <h2 className="text-sm font-bold text-[#CCD0CF]">
                      Predicted Risk Tier: {result.predicted_category}
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] text-[#9BA8AB]">Risk Score:</span>
                    <span className="text-sm font-bold text-[#FF7A00]">
                      {(result.risk_score ?? 0).toFixed(1)} / 100
                    </span>
                  </div>
                </div>

                {/* Severity Class Probabilities */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded bg-[#06141B] border border-[#253745]">
                    <span className="text-[10px] text-[#9BA8AB] uppercase block">Slight Severity</span>
                    <span className="text-base font-bold text-emerald-400">
                      {((result.probabilities?.slight_risk ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#06141B] border border-[#253745]">
                    <span className="text-[10px] text-[#9BA8AB] uppercase block">Serious Severity</span>
                    <span className="text-base font-bold text-amber-400">
                      {((result.probabilities?.serious_risk ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-[#06141B] border border-[#253745]">
                    <span className="text-[10px] text-[#9BA8AB] uppercase block">Fatal Severity</span>
                    <span className="text-base font-bold text-rose-400">
                      {((result.probabilities?.fatal_risk ?? 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Planning Intervention Recommendation */}
                <div className="p-3 rounded bg-[#06141B] border border-[#253745] space-y-1">
                  <span className="text-[10px] text-[#FF7A00] uppercase font-bold tracking-wider block">
                    Municipal & Police Planning Recommendation
                  </span>
                  <p className="text-[11px] text-[#CCD0CF] leading-relaxed">
                    {result.recommendation}
                  </p>
                </div>
              </div>

              {/* TreeSHAP Feature Attributions Bar Chart */}
              <div className="p-4 rounded border border-[#253745] bg-[#11212D] space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-[#FF7A00]" />
                    <h3 className="font-semibold text-[#CCD0CF] text-xs uppercase tracking-wider">
                      TreeSHAP Marginal Feature Attributions
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#9BA8AB]">Additive Local Attribution</span>
                </div>

                <ShapBarChart factors={result.top_contributing_factors} />
              </div>

              {/* Honest Model Limitation Disclaimer */}
              <div className="p-3 rounded border border-[#4A5C6A] bg-[#11212D] text-[10px] text-[#9BA8AB] space-y-1">
                <div className="flex items-center space-x-1.5 text-[#CCD0CF] font-bold">
                  <Info className="w-3.5 h-3.5 text-[#FF7A00]" />
                  <span>Model Operational Boundary & Limitations:</span>
                </div>
                <p className="leading-relaxed">
                  {result.disclaimer ||
                    'UrbanFlow predictive outputs are intended solely for municipal planning, corridor risk auditing, and speed management interventions. Predictions are statistical correlations and do not guarantee collision occurrences.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded border border-[#253745] bg-[#11212D] text-center space-y-3">
              <ShieldAlert className="w-8 h-8 text-[#FF7A00] mx-auto opacity-70" />
              <div>
                <h3 className="text-sm font-semibold text-[#CCD0CF]">Inference Engine Ready</h3>
                <p className="text-xs text-[#9BA8AB] mt-1 max-w-md mx-auto">
                  Configure spatial coordinates and roadway characteristics on the left panel, then click "Execute Risk Inference" to calculate severity probabilities and SHAP explanations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
