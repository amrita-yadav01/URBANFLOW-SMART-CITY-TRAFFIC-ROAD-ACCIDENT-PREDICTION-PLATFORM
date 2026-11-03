import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.config import settings

router = APIRouter(tags=["Health & Status"])

@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Backend system health, database heartbeat, and ML model runtime verification."""
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    models_ready = (
        (settings.ML_MODELS_DIR / "accident_classifier.joblib").exists() and
        (settings.ML_MODELS_DIR / "traffic_congestion_model.joblib").exists()
    )

    return {
        "status": "online" if db_status == "healthy" else "degraded",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "ml_models_loaded": models_ready,
        "target_region": settings.DEFAULT_REGION,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

