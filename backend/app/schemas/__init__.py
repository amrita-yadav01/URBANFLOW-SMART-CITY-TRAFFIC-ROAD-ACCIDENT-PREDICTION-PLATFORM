from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Common response wrapper
class ApiResponse(BaseModel):
    success: bool = True
    message: str = "Operation successful"
    data: Any = None

# Accident schemas
class AccidentItem(BaseModel):
    id: int
    incident_id: str
    latitude: float
    longitude: float
    location_name: str
    zone: str
    corridor: str
    timestamp: datetime
    severity: str
    road_type: str
    weather_condition: str
    lighting_condition: str
    road_surface: str
    speed_limit: int
    vehicles_involved: int
    casualties: int
    fatalities: int
    primary_cause: str
    is_peak_hour: bool
    is_weekend: bool
    risk_score: float

    class Config:
        from_attributes = True

class HotspotClusterItem(BaseModel):
    cluster_id: int
    center_latitude: float
    center_longitude: float
    accident_count: int
    fatal_count: int
    serious_count: int
    slight_count: int
    primary_corridor: str
    prominent_cause: str
    calculated_risk_score: float
    risk_level: str
    radius_meters: int = 500

class AccidentFilterQuery(BaseModel):
    severity: Optional[str] = None
    zone: Optional[str] = None
    corridor: Optional[str] = None
    weather: Optional[str] = None
    time_of_day: Optional[str] = None # "day", "night", "peak"
    limit: int = 500
    offset: int = 0

# Dashboard schema
class DashboardSummary(BaseModel):
    total_accidents: int
    fatalities_count: int
    casualties_count: int
    high_risk_zones_count: int
    critical_hotspots_count: int
    average_traffic_congestion_pct: float
    average_traffic_speed_kmh: float
    monthly_trend_pct: float
    severity_distribution: List[Dict[str, Any]]
    monthly_trends: List[Dict[str, Any]]
    high_risk_corridors: List[Dict[str, Any]]
    traffic_corridors_overview: List[Dict[str, Any]]

# Prediction schemas
class AccidentRiskRequest(BaseModel):
    latitude: float = Field(..., ge=-90, le=90, example=19.1197)
    longitude: float = Field(..., ge=-180, le=180, example=72.8584)
    road_type: str = Field(default="Expressway", example="Expressway")
    hour: int = Field(default=18, ge=0, le=23, example=18)
    day_of_week: int = Field(default=2, ge=0, le=6, example=2)
    weather_condition: str = Field(default="Clear", example="Clear")
    lighting_condition: str = Field(default="Daylight", example="Daylight")
    road_surface: str = Field(default="Dry", example="Dry")
    speed_limit: int = Field(default=80, ge=20, le=140, example=80)

class TrafficPredictionRequest(BaseModel):
    corridor: str = Field(default="Western Express Highway (WEH)")
    hour: int = Field(default=18, ge=0, le=23)
    day_of_week: int = Field(default=2, ge=0, le=6)
    weather: str = Field(default="Clear")
    speed_limit: int = Field(default=80, ge=20, le=120)
    lanes: int = Field(default=6, ge=2, le=12)
    daily_volume: int = Field(default=160000, ge=10000, le=500000)
    incident_reported: int = Field(default=0, ge=0, le=1)

# Analytics schemas
class AnalyticsOverview(BaseModel):
    severity_analysis: List[Dict[str, Any]]
    hourly_distribution: List[Dict[str, Any]]
    day_of_week_distribution: List[Dict[str, Any]]
    weather_impact: List[Dict[str, Any]]
    road_type_distribution: List[Dict[str, Any]]
    primary_causes: List[Dict[str, Any]]
    demographic_correlations: List[Dict[str, Any]]

