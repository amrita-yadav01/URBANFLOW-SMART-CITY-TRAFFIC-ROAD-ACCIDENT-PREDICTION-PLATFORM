from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import Accident
from app.services.accident_service import AccidentService

router = APIRouter(prefix="/accidents", tags=["Accidents & Hotspots"])

@router.get("")
def get_accidents(
    severity: str | None = Query(None, description="Filter by severity: Slight, Serious, Fatal"),
    zone: str | None = Query(None, description="Filter by zone name"),
    corridor: str | None = Query(None, description="Filter by corridor name"),
    weather: str | None = Query(None, description="Filter by weather condition"),
    time_of_day: str | None = Query(None, description="Filter by day, night, or peak"),
    limit: int = Query(500, ge=1, le=2000),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    accidents, total = AccidentService.get_accidents(
        db, severity, zone, corridor, weather, time_of_day, limit, offset
    )
    return {
        "total": total,
        "limit": limit,
        "offset": offset,
        "results": accidents
    }

@router.get("/hotspots")
def get_hotspots():
    """Retrieve spatial accident clusters identified via DBSCAN."""
    hotspots = AccidentService.get_hotspot_clusters()
    return {
        "algorithm": "DBSCAN (Density-Based Spatial Clustering with Haversine metric)",
        "cluster_count": len(hotspots),
        "hotspots": hotspots
    }

@router.get("/segments")
def get_road_segments(db: Session = Depends(get_db)):
    """Retrieve canonical road corridors with risk scoring and geometry."""
    segments = AccidentService.get_road_segments(db)
    return {
        "total": len(segments),
        "segments": segments
    }

@router.get("/filters")
def get_filter_options(db: Session = Depends(get_db)):
    """Retrieve distinct options for UI filter dropdowns."""
    corridors = [c[0] for c in db.query(Accident.corridor).distinct().order_by(Accident.corridor).all()]
    zones = [z[0] for z in db.query(Accident.zone).distinct().order_by(Accident.zone).all()]
    severities = ["Fatal", "Serious", "Slight"]
    weathers = [w[0] for w in db.query(Accident.weather_condition).distinct().all()]
    road_types = [rt[0] for rt in db.query(Accident.road_type).distinct().all()]

    return {
        "corridors": corridors,
        "zones": zones,
        "severities": severities,
        "weathers": weathers,
        "road_types": road_types
    }

