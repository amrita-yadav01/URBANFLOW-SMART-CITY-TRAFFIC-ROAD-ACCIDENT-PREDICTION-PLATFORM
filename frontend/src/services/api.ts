import type {
  DashboardSummary,
  Accident,
  HotspotCluster,
  RoadSegment,
  AccidentRiskPredictionResult,
  TrafficPredictionResult,
  AnalyticsData,
  DatasetItem,
  ModelMetricItem
} from '../types';

const API_BASE = '/api';

export const api = {
  // System Health
  async getHealth(): Promise<{ status: string; service: string; ml_models_loaded: boolean; target_region: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  },

  // Dashboard
  async getDashboardSummary(): Promise<DashboardSummary> {
    const res = await fetch(`${API_BASE}/dashboard/summary`);
    if (!res.ok) throw new Error('Failed to load dashboard summary');
    return res.json();
  },

  // Accidents
  async getAccidents(params?: {
    severity?: string;
    zone?: string;
    corridor?: string;
    weather?: string;
    time_of_day?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ total: number; limit: number; offset: number; results: Accident[] }> {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.zone) query.append('zone', params.zone);
    if (params?.corridor) query.append('corridor', params.corridor);
    if (params?.weather) query.append('weather', params.weather);
    if (params?.time_of_day) query.append('time_of_day', params.time_of_day);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const res = await fetch(`${API_BASE}/accidents?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch accidents');
    return res.json();
  },

  async getHotspots(): Promise<{ algorithm: string; cluster_count: number; hotspots: HotspotCluster[] }> {
    const res = await fetch(`${API_BASE}/accidents/hotspots`);
    if (!res.ok) throw new Error('Failed to fetch hotspots');
    return res.json();
  },

  async getRoadSegments(): Promise<{ total: number; segments: RoadSegment[] }> {
    const res = await fetch(`${API_BASE}/accidents/segments`);
    if (!res.ok) throw new Error('Failed to fetch road segments');
    return res.json();
  },

  async getFilters(): Promise<{
    corridors: string[];
    zones: string[];
    severities: string[];
    weathers: string[];
    road_types: string[];
  }> {
    const res = await fetch(`${API_BASE}/accidents/filters`);
    if (!res.ok) throw new Error('Failed to fetch filters');
    return res.json();
  },

  // ML Predictions
  async predictAccidentRisk(payload: {
    latitude: number;
    longitude: number;
    road_type: string;
    hour: number;
    day_of_week: number;
    weather_condition: string;
    lighting_condition: string;
    road_surface: string;
    speed_limit: number;
  }): Promise<AccidentRiskPredictionResult> {
    const res = await fetch(`${API_BASE}/predictions/accident-risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Prediction failed');
    }
    return res.json();
  },

  async predictTraffic(payload: {
    corridor: string;
    hour: number;
    day_of_week: number;
    weather: string;
    speed_limit: number;
    lanes: number;
    daily_volume: number;
    incident_reported: number;
  }): Promise<TrafficPredictionResult> {
    const res = await fetch(`${API_BASE}/predictions/traffic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Traffic forecasting failed');
    }
    return res.json();
  },

  // Traffic Corridors
  async getTrafficCorridors(): Promise<{
    count: number;
    corridors: Array<{
      corridor: string;
      average_congestion: number;
      average_speed: number;
      sample_points: number;
      status: string;
      badge_color: string;
    }>;
  }> {
    const res = await fetch(`${API_BASE}/traffic/corridors`);
    if (!res.ok) throw new Error('Failed to load traffic corridors');
    return res.json();
  },

  // Analytics
  async getAnalyticsOverview(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE}/analytics/overview`);
    if (!res.ok) throw new Error('Failed to load analytics overview');
    return res.json();
  },

  async getDiurnalMatrix(): Promise<{
    days: string[];
    short_days: string[];
    hours: string[];
    matrix: Array<{ day: string; short_day: string; hours: number[]; day_total: number }>;
    max_cell_count: number;
    peak_risk_window: { day: string; hour: string; count: number };
    safest_window: { time: string; description: string };
  }> {
    const res = await fetch(`${API_BASE}/analytics/diurnal-matrix`);
    if (!res.ok) throw new Error('Failed to load diurnal collision matrix');
    return res.json();
  },

  async getHistoricalTrends(): Promise<{
    yearly_trends: Array<{ year: string; total_accidents: number; fatalities: number; casualties: number }>;
    monthly_severity_trends: Array<{ month: string; Slight: number; Serious: number; Fatal: number; total: number }>;
  }> {
    const res = await fetch(`${API_BASE}/analytics/trends`);
    if (!res.ok) throw new Error('Failed to load historical trends');
    return res.json();
  },

  // Datasets
  async getDatasets(): Promise<{ count: number; datasets: DatasetItem[] }> {
    const res = await fetch(`${API_BASE}/datasets`);
    if (!res.ok) throw new Error('Failed to load datasets');
    return res.json();
  },

  async getDatasetPreview(datasetId: number): Promise<{
    dataset_id: number;
    name: string;
    dataset_type: string;
    row_count: number;
    column_count: number;
    duplicates_count: number;
    total_missing_values: number;
    schema: Array<{
      column_name: string;
      data_type: string;
      non_null_count: number;
      null_count: number;
      null_pct: number;
      sample_value: string | null;
    }>;
    spatial_analysis: {
      has_spatial_coordinates: boolean;
      crs: string;
      latitude_column: string;
      longitude_column: string;
      bounding_box: { min_latitude: number; max_latitude: number; min_longitude: number; max_longitude: number };
      within_maharashtra_envelope: boolean;
      within_mumbai_mmr: boolean;
      spatial_extent_label: string;
    } | null;
    preview_rows: any[];
    file_size_bytes: number;
    uploaded_at: string;
  }> {
    const res = await fetch(`${API_BASE}/datasets/${datasetId}/preview`);
    if (!res.ok) throw new Error('Failed to fetch dataset schema preview');
    return res.json();
  },

  async uploadDataset(file: File, datasetType: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('dataset_type', datasetType);

    const res = await fetch(`${API_BASE}/datasets/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  },

  // Models
  async getModelMetrics(): Promise<{ count: number; models: ModelMetricItem[] }> {
    const res = await fetch(`${API_BASE}/models/metrics`);
    if (!res.ok) throw new Error('Failed to fetch model metrics');
    return res.json();
  },
};
