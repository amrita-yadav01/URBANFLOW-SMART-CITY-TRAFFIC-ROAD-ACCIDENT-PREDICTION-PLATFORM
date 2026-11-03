import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import ModelMetadata

router = APIRouter(prefix="/models", tags=["Model Governance & Metrics"])

@router.get("/metrics")
def get_model_metrics(db: Session = Depends(get_db)):
    """Fetch active production model evaluation metrics and feature importances."""
    records = db.query(ModelMetadata).filter(ModelMetadata.is_active == True).all()
    models = []
    for r in records:
        models.append({
            "model_name": r.model_name,
            "model_version": r.model_version,
            "model_type": r.model_type,
            "target_variable": r.target_variable,
            "metrics": json.loads(r.metrics) if r.metrics else {},
            "feature_importance": json.loads(r.feature_importance) if r.feature_importance else {},
            "trained_at": r.trained_at,
            "sample_count": r.training_sample_count
        })
    return {
        "count": len(models),
        "models": models
    }

