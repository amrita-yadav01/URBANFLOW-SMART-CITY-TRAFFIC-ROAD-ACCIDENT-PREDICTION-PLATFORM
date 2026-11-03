from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Fetch aggregated KPIs, monthly trend line, high-risk corridors, and traffic status."""
    return AnalyticsService.get_dashboard_summary(db)

