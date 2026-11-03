from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.traffic_service import TrafficService

router = APIRouter(prefix="/traffic", tags=["Traffic Analytics"])

@router.get("/corridors")
def get_traffic_corridors(db: Session = Depends(get_db)):
    """Fetch recent sensor statistics for all monitored highway corridors."""
    corridors = TrafficService.get_corridor_summary(db)
    return {
        "count": len(corridors),
        "corridors": corridors
    }

