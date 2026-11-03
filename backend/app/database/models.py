import datetime
from sqlalchemy import (
    Column, Integer, Float, String, Boolean, DateTime, Text, Index
)
from app.database.session import Base

class Accident(Base):
    __tablename__ = "accidents"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String(64), unique=True, index=True, nullable=False)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    location_name = Column(String(255), nullable=False)
    zone = Column(String(100), nullable=False, index=True)
    corridor = Column(String(100), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    severity = Column(String(50), nullable=False, index=True) # "Slight", "Serious", "Fatal"
    road_type = Column(String(100), nullable=False) # "Expressway", "Arterial", "Junction", "Flyover", "Secondary"
    weather_condition = Column(String(100), nullable=False) # "Clear", "Heavy Rain", "Drizzle", "Fog/Haze", "Overcast"
    lighting_condition = Column(String(100), nullable=False) # "Daylight", "Dark - Streetlights On", "Dark - Unlit", "Dusk/Dawn"
    road_surface = Column(String(100), nullable=False) # "Dry", "Wet", "Waterlogged", "Uneven/Potholes"
    speed_limit = Column(Integer, default=50)
    vehicles_involved = Column(Integer, default=1)
    casualties = Column(Integer, default=0)
    fatalities = Column(Integer, default=0)
    primary_cause = Column(String(255), default="Unknown")
    is_peak_hour = Column(Boolean, default=False)
    is_weekend = Column(Boolean, default=False)
    cluster_id = Column(Integer, nullable=True, index=True) # DBSCAN spatial cluster
    risk_score = Column(Float, default=0.5) # Computed spatial-temporal risk score
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    __table_args__ = (
        Index("idx_accidents_lat_lon", "latitude", "longitude"),
        Index("idx_accidents_time_sev", "timestamp", "severity"),
    )

class RoadSegment(Base):
    __tablename__ = "road_segments"

    id = Column(Integer, primary_key=True, index=True)
    segment_id = Column(String(64), unique=True, index=True, nullable=False)
    corridor_name = Column(String(100), nullable=False, index=True)
    segment_name = Column(String(255), nullable=False)
    zone = Column(String(100), nullable=False, index=True)
    start_lat = Column(Float, nullable=False)
    start_lon = Column(Float, nullable=False)
    end_lat = Column(Float, nullable=False)
    end_lon = Column(Float, nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    lanes = Column(Integer, default=4)
    speed_limit = Column(Integer, default=60)
    daily_avg_volume = Column(Integer, default=45000)
    length_km = Column(Float, default=2.5)
    historical_risk_score = Column(Float, default=50.0) # 0-100
    risk_level = Column(String(50), default="Medium") # Low, Medium, High, Critical
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TrafficObservation(Base):
    __tablename__ = "traffic_observations"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(64), nullable=False, index=True)
    segment_id = Column(String(64), nullable=False, index=True)
    corridor = Column(String(100), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    vehicle_count = Column(Integer, nullable=False)
    average_speed_kmh = Column(Float, nullable=False)
    congestion_index = Column(Float, nullable=False) # 0.0 to 100.0 %
    congestion_level = Column(String(50), nullable=False) # Free Flow, Moderate, Heavy, Severe Gridlock
    weather = Column(String(50), default="Clear")
    is_peak_hour = Column(Boolean, default=False)
    is_weekend = Column(Boolean, default=False)
    incident_reported = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (
        Index("idx_traffic_corridor_time", "corridor", "timestamp"),
    )

class WeatherObservation(Base):
    __tablename__ = "weather_observations"

    id = Column(Integer, primary_key=True, index=True)
    zone = Column(String(100), nullable=False, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    temperature_c = Column(Float, nullable=False)
    humidity_pct = Column(Float, nullable=False)
    precipitation_mm = Column(Float, default=0.0)
    visibility_km = Column(Float, default=10.0)
    condition = Column(String(50), default="Clear")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DemographicData(Base):
    __tablename__ = "demographic_data"

    id = Column(Integer, primary_key=True, index=True)
    zone = Column(String(100), unique=True, nullable=False)
    ward_code = Column(String(50), nullable=True)
    population = Column(Integer, nullable=False)
    density_per_sqkm = Column(Float, nullable=False)
    registered_vehicles = Column(Integer, nullable=False)
    public_transit_accessibility_score = Column(Float, default=70.0) # 0-100
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class DatasetRecord(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    dataset_type = Column(String(100), nullable=False) # "Accidents", "Traffic", "Infrastructure"
    file_path = Column(String(500), nullable=False)
    row_count = Column(Integer, default=0)
    file_size_bytes = Column(Integer, default=0)
    status = Column(String(50), default="Processed") # "Processed", "Validating", "Failed"
    missing_values_count = Column(Integer, default=0)
    duplicates_count = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)

class PredictionResult(Base):
    __tablename__ = "prediction_results"

    id = Column(Integer, primary_key=True, index=True)
    prediction_type = Column(String(100), nullable=False) # "accident_risk", "traffic_congestion"
    input_features = Column(Text, nullable=False) # JSON encoded
    predicted_value = Column(String(100), nullable=False)
    risk_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.85)
    top_contributing_factors = Column(Text, nullable=True) # JSON encoded
    model_version = Column(String(50), default="v1.0")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ModelMetadata(Base):
    __tablename__ = "model_metadata"

    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), unique=True, nullable=False)
    model_version = Column(String(50), nullable=False)
    model_type = Column(String(100), nullable=False)
    target_variable = Column(String(100), nullable=False)
    metrics = Column(Text, nullable=False) # JSON encoded
    feature_importance = Column(Text, nullable=True) # JSON encoded
    trained_at = Column(DateTime, default=datetime.datetime.utcnow)
    training_sample_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    role = Column(String(50), default="analyst") # "admin", "analyst", "viewer"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

