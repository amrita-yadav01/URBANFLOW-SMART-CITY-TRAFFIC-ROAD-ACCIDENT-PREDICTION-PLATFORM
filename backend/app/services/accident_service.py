import joblib
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from app.database.models import Accident, RoadSegment
from app.config import settings

class AccidentService:
    @staticmethod
    def get_accidents(
        db: Session,
        severity: str | None = None,
        zone: str | None = None,
        corridor: str | None = None,
        weather: str | None = None,
        time_of_day: str | None = None,
        limit: int = 500,
        offset: int = 0
    ) -> tuple[list[Accident], int]:
        query = db.query(Accident)

        if severity and severity.lower() != "all":
            query = query.filter(Accident.severity == severity)
        if zone and zone.lower() != "all":
            query = query.filter(Accident.zone == zone)
        if corridor and corridor.lower() != "all":
            query = query.filter(Accident.corridor == corridor)
        if weather and weather.lower() != "all":
            query = query.filter(Accident.weather_condition == weather)
        if time_of_day:
            if time_of_day.lower() == "day":
                query = query.filter(Accident.lighting_condition.like("%Day%"))
            elif time_of_day.lower() == "night":
                query = query.filter(Accident.lighting_condition.like("%Dark%"))
            elif time_of_day.lower() == "peak":
                query = query.filter(Accident.is_peak_hour == True)

        total_count = query.count()
        accidents = query.order_by(desc(Accident.timestamp)).offset(offset).limit(limit).all()
        return accidents, total_count

    @staticmethod
    def get_hotspot_clusters() -> list[dict]:
        """Retrieve precomputed DBSCAN spatial clusters from ML pipeline."""
        hotspots_path = settings.ML_MODELS_DIR / "hotspots_summary.joblib"
        if hotspots_path.exists():
            return joblib.load(hotspots_path)
        return []

    @staticmethod
    def get_road_segments(db: Session) -> list[RoadSegment]:
        return db.query(RoadSegment).order_by(desc(RoadSegment.historical_risk_score)).all()

