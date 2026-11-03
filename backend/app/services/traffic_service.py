from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database.models import TrafficObservation, RoadSegment
from app.ml.traffic_model import TrafficCongestionModel
from app.config import settings

traffic_model_instance = TrafficCongestionModel(settings.ML_MODELS_DIR)

class TrafficService:
    @staticmethod
    def get_corridor_summary(db: Session) -> list[dict]:
        """Aggregate recent traffic readings per corridor."""
        results = []
        corridors = db.query(TrafficObservation.corridor).distinct().all()
        for (c_name,) in corridors:
            obs = (
                db.query(TrafficObservation)
                .filter(TrafficObservation.corridor == c_name)
                .order_by(desc(TrafficObservation.timestamp))
                .limit(20)
                .all()
            )
            if not obs:
                continue

            avg_cong = round(sum(o.congestion_index for o in obs) / len(obs), 1)
            avg_spd = round(sum(o.average_speed_kmh for o in obs) / len(obs), 1)
            
            if avg_cong >= 65:
                status = "Congested"
                badge_color = "red"
            elif avg_cong >= 40:
                status = "Moderate"
                badge_color = "amber"
            else:
                status = "Flowing"
                badge_color = "emerald"

            results.append({
                "corridor": c_name,
                "average_congestion": avg_cong,
                "average_speed": avg_spd,
                "sample_points": len(obs),
                "status": status,
                "badge_color": badge_color
            })
        
        results.sort(key=lambda x: x["average_congestion"], reverse=True)
        return results

    @staticmethod
    def predict(query_params: dict) -> dict:
        return traffic_model_instance.predict_traffic(query_params)

