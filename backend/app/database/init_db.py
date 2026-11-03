import sys
from pathlib import Path

# Add backend directory to path
BASE_BACKEND = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_BACKEND))

import json
import datetime
import pandas as pd
from app.config import settings
from app.database.session import engine, Base, SessionLocal
from app.database.models import (
    Accident, RoadSegment, TrafficObservation, DemographicData,
    DatasetRecord, ModelMetadata, User
)

def init_database(populate_data: bool = True):
    print("=" * 70)
    print("INITIALIZING URBANFLOW DATABASE SCHEMA...")
    print("=" * 70)

    # 1. Create tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

    if not populate_data:
        return

    db = SessionLocal()
    try:
        # Check if already populated
        existing_count = db.query(Accident).count()
        if existing_count > 0:
            print(f"Database already populated with {existing_count} accident records.")
            return

        print("\n[Database Seeding] Loading CSV datasets into relational tables...")

        # 1. Seed Road Segments
        segments_path = settings.DATASETS_DIR / "mumbai_road_segments.csv"
        if segments_path.exists():
            df_seg = pd.read_csv(segments_path)
            for _, r in df_seg.iterrows():
                db.add(RoadSegment(
                    segment_id=str(r["segment_id"]),
                    corridor_name=str(r["corridor_name"]),
                    segment_name=str(r["segment_name"]),
                    zone=str(r["zone"]),
                    start_lat=float(r["start_lat"]),
                    start_lon=float(r["start_lon"]),
                    end_lat=float(r["end_lat"]),
                    end_lon=float(r["end_lon"]),
                    center_lat=float(r["center_lat"]),
                    center_lon=float(r["center_lon"]),
                    lanes=int(r["lanes"]),
                    speed_limit=int(r["speed_limit"]),
                    daily_avg_volume=int(r["daily_avg_volume"]),
                    length_km=float(r["length_km"]),
                    historical_risk_score=float(r["historical_risk_score"]),
                    risk_level=str(r["risk_level"])
                ))
            db.commit()
            print(f"-> Inserted {len(df_seg)} road segments.")

        # 2. Seed Accidents
        accidents_path = settings.DATASETS_DIR / "mumbai_accidents_historical.csv"
        if accidents_path.exists():
            df_acc = pd.read_csv(accidents_path)
            batch = []
            for _, r in df_acc.iterrows():
                batch.append(Accident(
                    incident_id=str(r["incident_id"]),
                    latitude=float(r["latitude"]),
                    longitude=float(r["longitude"]),
                    location_name=str(r["location_name"]),
                    zone=str(r["zone"]),
                    corridor=str(r["corridor"]),
                    timestamp=pd.to_datetime(r["timestamp"]),
                    severity=str(r["severity"]),
                    road_type=str(r["road_type"]),
                    weather_condition=str(r["weather_condition"]),
                    lighting_condition=str(r["lighting_condition"]),
                    road_surface=str(r["road_surface"]),
                    speed_limit=int(r["speed_limit"]),
                    vehicles_involved=int(r["vehicles_involved"]),
                    casualties=int(r["casualties"]),
                    fatalities=int(r["fatalities"]),
                    primary_cause=str(r["primary_cause"]),
                    is_peak_hour=bool(r["is_peak_hour"]),
                    is_weekend=bool(r["is_weekend"]),
                    risk_score=float(r["risk_score"])
                ))
                if len(batch) >= 1000:
                    db.bulk_save_objects(batch)
                    db.commit()
                    batch = []
            if batch:
                db.bulk_save_objects(batch)
                db.commit()
            print(f"-> Inserted {len(df_acc)} accidents.")

        # 3. Seed Traffic Observations (first 2,000 for high-performance responsive queries)
        traffic_path = settings.DATASETS_DIR / "mumbai_traffic_sensors.csv"
        if traffic_path.exists():
            df_traf = pd.read_csv(traffic_path)
            # Sample or take top 2500
            df_sample = df_traf.iloc[:2500]
            batch = []
            for _, r in df_sample.iterrows():
                batch.append(TrafficObservation(
                    sensor_id=str(r["sensor_id"]),
                    segment_id=str(r["segment_id"]),
                    corridor=str(r["corridor"]),
                    timestamp=pd.to_datetime(r["timestamp"]),
                    vehicle_count=int(r["vehicle_count"]),
                    average_speed_kmh=float(r["average_speed_kmh"]),
                    congestion_index=float(r["congestion_index"]),
                    congestion_level=str(r["congestion_level"]),
                    weather=str(r["weather"]),
                    is_peak_hour=bool(r["is_peak_hour"]),
                    is_weekend=bool(r["is_weekend"]),
                    incident_reported=bool(r["incident_reported"])
                ))
            db.bulk_save_objects(batch)
            db.commit()
            print(f"-> Inserted {len(df_sample)} traffic sensor records.")

        # 4. Seed Demographics
        demo_path = settings.DATASETS_DIR / "mumbai_demographics.csv"
        if demo_path.exists():
            df_demo = pd.read_csv(demo_path)
            for _, r in df_demo.iterrows():
                db.add(DemographicData(
                    zone=str(r["zone"]),
                    ward_code=str(r["ward_code"]),
                    population=int(r["population"]),
                    density_per_sqkm=float(r["density_per_sqkm"]),
                    registered_vehicles=int(r["registered_vehicles"]),
                    public_transit_accessibility_score=float(r["public_transit_accessibility_score"])
                ))
            db.commit()
            print(f"-> Inserted {len(df_demo)} demographic records.")

        # 5. Seed Dataset Registry records
        db.add(DatasetRecord(
            name="Mumbai Road Accidents Historical (2024-2026)",
            dataset_type="Accidents",
            file_path=str(accidents_path),
            row_count=len(df_acc),
            file_size_bytes=accidents_path.stat().st_size if accidents_path.exists() else 0,
            status="Processed",
            missing_values_count=0,
            duplicates_count=0,
            summary="Comprehensive collision logs across Western Suburbs, Eastern Suburbs, South Mumbai, Navi Mumbai, and Thane corridors."
        ))
        db.add(DatasetRecord(
            name="Mumbai Smart Traffic Sensor Feed",
            dataset_type="Traffic",
            file_path=str(traffic_path),
            row_count=len(df_traf),
            file_size_bytes=traffic_path.stat().st_size if traffic_path.exists() else 0,
            status="Processed",
            missing_values_count=0,
            duplicates_count=0,
            summary="Hourly arterial speed and congestion indexes across 38 highway corridors and key intersections."
        ))
        db.add(DatasetRecord(
            name="Mumbai Corridor Geometry & Infrastructure",
            dataset_type="Infrastructure",
            file_path=str(segments_path),
            row_count=len(df_seg),
            file_size_bytes=segments_path.stat().st_size if segments_path.exists() else 0,
            status="Processed",
            missing_values_count=0,
            duplicates_count=0,
            summary="Spatial network topology with lane configurations, speed limits, and historic risk profiles."
        ))

        # 6. Seed Model Metadata
        acc_meta_path = settings.ML_MODELS_DIR / "accident_model_metadata.json"
        if acc_meta_path.exists():
            with open(acc_meta_path) as f:
                am = json.load(f)
                db.add(ModelMetadata(
                    model_name=am["model_name"],
                    model_version=am["model_version"],
                    model_type=am["model_type"],
                    target_variable=am["target_variable"],
                    metrics=json.dumps(am["metrics"]),
                    feature_importance=json.dumps(am.get("feature_importance", {})),
                    training_sample_count=am["metrics"].get("sample_count", 0),
                    is_active=True
                ))

        traf_meta_path = settings.ML_MODELS_DIR / "traffic_model_metadata.json"
        if traf_meta_path.exists():
            with open(traf_meta_path) as f:
                tm = json.load(f)
                db.add(ModelMetadata(
                    model_name=tm["model_name"],
                    model_version=tm["model_version"],
                    model_type=tm["model_type"],
                    target_variable=",".join(tm["target_variables"]),
                    metrics=json.dumps(tm["metrics"]),
                    feature_importance=json.dumps(tm.get("feature_importance", {})),
                    training_sample_count=tm["metrics"].get("train_sample_count", 0),
                    is_active=True
                ))

        # 7. Seed Default Admin User
        db.add(User(
            username="admin",
            email="admin.traffic@urbanflow.gov.in",
            role="admin",
            is_active=True
        ))

        db.commit()
        print("\nDatabase seeding completed successfully.")

    finally:
        db.close()

if __name__ == "__main__":
    init_database(populate_data=True)

