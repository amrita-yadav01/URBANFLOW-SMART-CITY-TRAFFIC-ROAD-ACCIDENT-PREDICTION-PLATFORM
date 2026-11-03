from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics & Insights"])

@router.get("/overview")
def get_analytics_overview(db: Session = Depends(get_db)):
    """Fetch multidimensional data analytics computed directly from historical database."""
    return AnalyticsService.get_detailed_analytics(db)

@router.get("/diurnal-matrix")
def get_diurnal_matrix(db: Session = Depends(get_db)):
    """Fetch 2D Diurnal-Weekly collision matrix (24 Hours x 7 Days of Week)."""
    return AnalyticsService.get_diurnal_matrix(db)

@router.get("/trends")
def get_historical_trends(db: Session = Depends(get_db)):
    """Fetch multi-year and monthly severity trend trajectories."""
    return AnalyticsService.get_historical_trends(db)

