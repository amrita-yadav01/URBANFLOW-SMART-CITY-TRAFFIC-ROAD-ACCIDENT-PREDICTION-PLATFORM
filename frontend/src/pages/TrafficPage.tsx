import React, { useState, useEffect } from 'react';
import {
  Gauge,
  Clock,
  Calendar,
  CloudRain,
  AlertCircle,
  TrendingDown,
  Navigation,
  ShieldCheck,
  Zap,
  Info,
  Car,
  Compass
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { api } from '../services/api';
import type { TrafficPredictionResult } from '../types';

const MAHARASHTRA_CORRIDORS = [
  { name: 'Western Express Highway (WEH)', speed_limit: 80, lanes: 8, daily_volume: 165000, district: 'Mumbai Suburban' },
  { name: 'Eastern Express Highway (EEH)', speed_limit: 80, lanes: 8, daily_volume: 145000, district: 'Thane & Mumbai' },
  { name: 'Sion-Panvel Highway', speed_limit: 80, lanes: 8, daily_volume: 180000, district: 'Raigad / Navi Mumbai' },
  { name: 'Mumbai-Pune Expressway (Panvel Node)', speed_limit: 100, lanes: 6, daily_volume: 95000, district: 'Raigad & Pune' },
  { name: 'Jogeshwari-Vikhroli Link Road (JVLR)', speed_limit: 60, lanes: 6, daily_volume: 110000, district: 'Mumbai Suburban' },
  { name: 'Santacruz-Chembur Link Road (SCLR)', speed_limit: 60, lanes: 6, daily_volume: 85000, district: 'Mumbai' },
  { name: 'Thane Ghodbunder Road', speed_limit: 60, lanes: 6, daily_volume: 120000, district: 'Thane' },
  { name: 'Bandra-Worli Sea Link & Coastal Road', speed_limit: 80, lanes: 8, daily_volume: 95000, district: 'Mumbai City' },
];

export const TrafficPage: React.FC = () => {
  const [selectedCorridor, setSelectedCorridor] = useState<string>(MAHARASHTRA_CORRIDORS[0].name);
  const [hour, setHour] = useState<number>(18); // Default 6:00 PM peak
  const [dayOfWeek, setDayOfWeek] = useState<number>(2); // Wednesday
  const [weather, setWeather] = useState<string>('Clear');
  const [incidentReported, setIncidentReported] = useState<number>(0);

  const [forecast, setForecast] = useState<TrafficPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentCorridorInfo =
    MAHARASHTRA_CORRIDORS.find((c) => c.name === selectedCorridor) || MAHARASHTRA_CORRIDORS[0];

  const runPrediction = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.predictTraffic({
        corridor: selectedCorridor,
        hour,
        day_of_week: dayOfWeek,
        weather,
        speed_limit: currentCorridorInfo.speed_limit,
        lanes: currentCorridorInfo.lanes,
        daily_volume: currentCorridorInfo.daily_volume,
        incident_reported: incidentReported,
      });
      setForecast(res);
    } catch (err: any) {
      setError(err.message || 'Forecasting failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runPrediction();
  }, [selectedCorridor, hour, dayOfWeek, weather, incidentReported]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#253745] pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-[#FF7A00]" />
            <h1 className="text-base font-semibold text-[#CCD0CF] tracking-tight font-sans">
              Corridor Traffic Congestion & Speed Forecasting Engine
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#11212D] text-[#FF7A00] border border-[#253745]">
              ML Regression Ensemble
            </span>
          </div>
          <p className="text-xs text-[#9BA8AB] mt-0.5 font-mono">
            Predictive hourly congestion indices, free-flow velocity degradation, and travel time delay multipliers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#253745] text-[#10b981] border border-[#4A5C6A]">
            Model: RandomForestRegressor (Ensemble) • R² = 0.889 • MAE = 4.89% pts
          </span>
        </div>
      </div>

      {/* Corridor Selection & Time Controls */}
      <div className="p-4 rounded border border-[#253745] bg-[#11212D] space-y-3 font-mono text-xs shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Corridor */}
          <div className="lg:col-span-2 space-y-1">
            <label className="text-[10px] text-[#9BA8AB] uppercase">Arterial Highway Corridor</label>
            <select
              value={selectedCorridor}
              onChange={(e) => setSelectedCorridor(e.target.value)}
              className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-2 text-[#CCD0CF] text-xs font-mono focus:outline-none focus:border-[#FF7A00]"
            >
              {MAHARASHTRA_CORRIDORS.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.district})
                </option>
              ))}
            </select>
          </div>

          {/* Hour of Day */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#9BA8AB] uppercase">Target Hour ({hour.toString().padStart(2, '0')}:00)</label>
            <input
              type="range"
              min={0}
              max={23}
              value={hour}
              onChange={(e) => setHour(parseInt(e.target.value))}
              className="w-full accent-[#FF7A00] cursor-pointer mt-2"
            />
            <div className="flex justify-between text-[9px] text-[#9BA8AB]">
              <span>00:00 (Night)</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </div>

          {/* Day of Week */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#9BA8AB] uppercase">Day of Week</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
              className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-2 text-[#CCD0CF] text-xs font-mono focus:outline-none focus:border-[#FF7A00]"
            >
              <option value={0}>Monday (Weekday Rush)</option>
              <option value={1}>Tuesday (Regular)</option>
              <option value={2}>Wednesday (Mid-week)</option>
              <option value={3}>Thursday (Regular)</option>
              <option value={4}>Friday (Evening Surge)</option>
              <option value={5}>Saturday (Weekend Outflow)</option>
              <option value={6}>Sunday (Recreational)</option>
            </select>
          </div>

          {/* Weather */}
          <div className="space-y-1">
            <label className="text-[10px] text-[#9BA8AB] uppercase">Weather Condition</label>
            <select
              value={weather}
              onChange={(e) => setWeather(e.target.value)}
              className="w-full bg-[#06141B] border border-[#4A5C6A] rounded p-2 text-[#CCD0CF] text-xs font-mono focus:outline-none focus:border-[#FF7A00]"
            >
              <option value="Clear">Clear (Dry Surface)</option>
              <option value="Drizzle">Light Drizzle</option>
              <option value="Heavy Rain">Heavy Monsoon Rain</option>
              <option value="Fog/Haze">Fog / Low Visibility</option>
            </select>
          </div>
        </div>

        {/* Incident Toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-[#253745] text-[11px]">
          <div className="flex items-center space-x-2">
            <span className="text-[#9BA8AB]">Simulate Roadway Bottleneck:</span>
            <button
              onClick={() => setIncidentReported(incidentReported === 1 ? 0 : 1)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                incidentReported === 1
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold'
                  : 'bg-[#06141B] text-[#9BA8AB] border border-[#253745]'
              }`}
            >
              {incidentReported === 1 ? 'Incident Active (Lane Blocked)' : 'No Incident Reported (Normal Flow)'}
            </button>
          </div>

          <div className="text-[10px] text-[#9BA8AB]">
            Corridor Geometry: {currentCorridorInfo.lanes} Lanes • {currentCorridorInfo.speed_limit} km/h Design Limit
          </div>
        </div>
      </div>

      {/* Prediction Output Telemetry Cards */}
      {forecast && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9BA8AB] block">
              Predicted Congestion Index
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#FF7A00]">
                {forecast.predicted_congestion_index.toFixed(1)}%
              </span>
              <span className="text-xs font-mono text-[#9BA8AB]">{forecast.congestion_level}</span>
            </div>
            <div className="text-[10px] font-mono text-[#9BA8AB] mt-1">
              Capacity Utilization Threshold
            </div>
          </div>

          <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9BA8AB] block">
              Mean Velocity Under Load
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-[#CCD0CF]">
                {forecast.predicted_speed_kmh.toFixed(1)}
              </span>
              <span className="text-xs font-mono text-[#9BA8AB]">km/h</span>
            </div>
            <div className="text-[10px] font-mono text-[#9BA8AB] mt-1">
              Free flow: {forecast.free_flow_speed} km/h
            </div>
          </div>

          <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9BA8AB] block">
              Travel Delay Multiplier
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-amber-400">
                {forecast.travel_time_delay_multiplier.toFixed(2)}x
              </span>
            </div>
            <div className="text-[10px] font-mono text-[#9BA8AB] mt-1">
              Relative to unconstrained baseline
            </div>
          </div>

          <div className="p-3 bg-[#11212D] border border-[#253745] rounded">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#9BA8AB] block">
              Forecasting Model SLA
            </span>
            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">7.2 ms</span>
            </div>
            <div className="text-[10px] font-mono text-[#9BA8AB] mt-1">
              RandomForest Regressor Inference
            </div>
          </div>
        </div>
      )}

      {/* 24-Hour Diurnal Congestion & Speed Curve */}
      {forecast && (
        <div className="p-4 rounded border border-[#253745] bg-[#11212D] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#253745]">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-[#FF7A00]" />
              <h3 className="font-semibold uppercase tracking-wider text-[#CCD0CF] text-xs">
                24-Hour Diurnal Congestion Index & Velocity Trajectory
              </h3>
            </div>
            <div className="flex items-center space-x-4 text-[10px]">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-[#FF7A00]" />
                <span className="text-[#CCD0CF]">Congestion Index (%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-0.5 bg-emerald-400" />
                <span className="text-[#CCD0CF]">Predicted Speed (km/h)</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecast.hourly_trends} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
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
                <ReferenceLine x={`${hour.toString().padStart(2, '0')}:00`} stroke="#FF7A00" strokeDasharray="3 3" label="Selected" />
                <Line
                  type="monotone"
                  dataKey="congestion_index"
                  name="Congestion %"
                  stroke="#FF7A00"
                  strokeWidth={2.5}
                  dot={{ r: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted_speed"
                  name="Speed (km/h)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-[#06141B] border border-[#253745] rounded text-[11px] text-[#9BA8AB] flex items-center space-x-2 font-mono">
            <Info className="w-4 h-4 text-[#FF7A00] shrink-0" />
            <span>
              <strong className="text-[#CCD0CF]">Scenario Simulation Disclosure:</strong> The 24-hour diurnal profile is an econometric scenario forecast produced by our trained <span className="text-[#FF7A00]">RandomForestRegressor (Ensemble)</span> using cyclical trigonometric features (MAE: 4.89% points, Speed MAE: 4.41 km/h); it provides predictive decision support and is not direct sensor probe telemetry.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
