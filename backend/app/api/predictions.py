import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import PredictionResult
from app.schemas import AccidentRiskRequest, TrafficPredictionRequest
from app.ml.accident_model import AccidentHotspotModel
from app.services.traffic_service import TrafficService
from app.config import settings

router = APIRouter(prefix="/predictions", tags=["ML Predictions"])

accident_model_instance = AccidentHotspotModel(settings.ML_MODELS_DIR)

@router.post("/accident-risk")
def predict_accident_risk(payload: AccidentRiskRequest, db: Session = Depends(get_db)):
    """Run Random Forest inference with SHAP explainability for geospatial & temporal conditions."""
    feature_dict = payload.model_dump()
    
    try:
        prediction = accident_model_instance.predict_risk(feature_dict)
        
        # Persist prediction in DB for audit trail
        rec = PredictionResult(
            prediction_type="accident_risk",
            input_features=json.dumps(feature_dict),
            predicted_value=prediction["predicted_category"],
            risk_score=prediction["risk_score"],
            confidence_score=round(1.0 - prediction["uncertainty_score"], 3),
            top_contributing_factors=json.dumps(prediction["top_contributing_factors"]),
            model_version=prediction["model_version"]
        )
        db.add(rec)
        db.commit()

        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")

@router.post("/traffic")
def predict_traffic_congestion(payload: TrafficPredictionRequest, db: Session = Depends(get_db)):
    """Run Traffic forecasting regressor for requested corridor and time conditions."""
    query_dict = payload.model_dump()
    try:
        forecast = TrafficService.predict(query_dict)
        
        # Persist prediction
        rec = PredictionResult(
            prediction_type="traffic_congestion",
            input_features=json.dumps(query_dict),
            predicted_value=forecast["congestion_level"],
            risk_score=forecast["predicted_congestion_index"],
            confidence_score=0.91,
            top_contributing_factors=json.dumps({"predicted_speed": forecast["predicted_speed_kmh"]}),
            model_version="v1.8"
        )
        db.add(rec)
        db.commit()

        return forecast
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Traffic forecasting error: {str(e)}")

