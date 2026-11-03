export interface Accident {
  id: number;
  incident_id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  zone: string;
  corridor: string;
  timestamp: string;
  severity: "Slight" | "Serious" | "Fatal";
  road_type: string;
  weather_condition: string;
  lighting_condition: string;
  road_surface: string;
  speed_limit: number;
  vehicles_involved: number;
  casualties: number;
  fatalities: number;
  primary_cause: string;
  is_peak_hour: boolean;
  is_weekend: boolean;
  risk_score: number;
}

export interface HotspotCluster {
  cluster_id: number;
  center_latitude: number;
  center_longitude: number;
  accident_count: number;
  fatal_count: number;
  serious_count: number;
  slight_count: number;
  primary_corridor: string;
  prominent_cause: string;
  calculated_risk_score: number;
  risk_level: "Low" | "Medium" | "High" | "Critical";
  radius_meters?: number;
}

export interface RoadSegment {
  id: number;
  segment_id: string;
  corridor_name: string;
  segment_name: string;
  zone: string;
  start_lat: number;
  start_lon: number;
  end_lat: number;
  end_lon: number;
  center_lat: number;
  center_lon: number;
  lanes: number;
  speed_limit: number;
  daily_avg_volume: number;
  length_km: number;
  historical_risk_score: number;
  risk_level: string;
}

export interface DashboardSummary {
  total_accidents: number;
  fatalities_count: number;
  casualties_count: number;
  high_risk_zones_count: number;
  critical_hotspots_count: number;
  average_traffic_congestion_pct: number;
  average_traffic_speed_kmh: number;
  monthly_trend_pct: number;
  severity_distribution: Array<{
    severity: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  monthly_trends: Array<{
    period: string;
    accidents: number;
    fatalities: number;
    casualties: number;
  }>;
  high_risk_corridors: Array<{
    corridor: string;
    zone: string;
    accidents: number;
    fatalities: number;
    risk_score: number;
    risk_level: string;
  }>;
  traffic_corridors_overview: Array<{
    corridor: string;
    average_congestion: number;
    average_speed: number;
    status: string;
  }>;
}

export interface ShapFactor {
  factor: string;
  impact: number;
  feature_value: number;
  direction: string;
}

export interface AccidentRiskPredictionResult {
  predicted_category: string;
  predicted_severity: string;
  risk_score: number;
  probabilities: {
    slight_risk: number;
    serious_risk: number;
    fatal_risk: number;
  };
  recommendation: string;
  uncertainty_score: number;
  top_contributing_factors: ShapFactor[];
  model_version: string;
  disclaimer: string;
}

export interface TrafficHourlyTrend {
  hour: string;
  congestion_index: number;
  predicted_speed: number;
  historical_baseline_speed: number;
}

export interface TrafficPredictionResult {
  selected_hour: string;
  predicted_congestion_index: number;
  predicted_speed_kmh: number;
  congestion_level: string;
  congestion_color: string;
  free_flow_speed: number;
  travel_time_delay_multiplier: number;
  hourly_trends: TrafficHourlyTrend[];
  model_metrics: Record<string, number>;
}

export interface AnalyticsData {
  hourly_distribution: Array<{
    hour: string;
    accidents: number;
    fatalities: number;
    is_rush: boolean;
  }>;
  day_of_week_distribution: Array<{
    day: string;
    accidents: number;
  }>;
  weather_impact: Array<{
    weather: string;
    accidents: number;
    fatalities: number;
    avg_risk_score: number;
  }>;
  primary_causes: Array<{
    cause: string;
    accidents: number;
    fatalities: number;
  }>;
  road_type_distribution: Array<{
    road_type: string;
    accidents: number;
    avg_speed_limit: number;
  }>;
  demographic_correlations: Array<{
    zone: string;
    population: number;
    registered_vehicles: number;
    accidents: number;
    rate_per_100k_pop: number;
    transit_accessibility: number;
  }>;
}

export interface DatasetItem {
  id: number;
  name: string;
  dataset_type: string;
  file_path: string;
  row_count: number;
  file_size_bytes: number;
  status: string;
  missing_values_count: number;
  duplicates_count: number;
  summary: string;
  uploaded_at: string;
}

export interface ModelMetricItem {
  model_name: string;
  model_version: string;
  model_type: string;
  target_variable: string;
  metrics: Record<string, number | string>;
  feature_importance: Record<string, number>;
  trained_at: string;
  sample_count: number;
}
