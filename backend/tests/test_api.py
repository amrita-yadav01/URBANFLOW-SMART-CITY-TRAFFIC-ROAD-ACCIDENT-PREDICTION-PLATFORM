import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["ml_models_loaded"] is True
    assert "Mumbai" in data["target_region"]

def test_dashboard_summary():
    response = client.get("/api/dashboard/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_accidents"] > 0
    assert len(data["severity_distribution"]) > 0
    assert len(data["high_risk_corridors"]) > 0
    assert "average_traffic_congestion_pct" in data

def test_accidents_and_filters():
    # Test all accidents
    response = client.get("/api/accidents?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 10
    assert data["total"] >= 1000

    # Test filtering by severity
    res_fatal = client.get("/api/accidents?severity=Fatal&limit=5")
    assert res_fatal.status_code == 200
    for acc in res_fatal.json()["results"]:
        assert acc["severity"] == "Fatal"

    # Test filters endpoint
    res_filters = client.get("/api/accidents/filters")
    assert res_filters.status_code == 200
    filter_data = res_filters.json()
    assert len(filter_data["corridors"]) > 0
    assert len(filter_data["severities"]) > 0

def test_hotspot_clusters():
    response = client.get("/api/accidents/hotspots")
    assert response.status_code == 200
    data = response.json()
    assert "DBSCAN" in data["algorithm"]
    assert data["cluster_count"] > 0
    first_cluster = data["hotspots"][0]
    assert "center_latitude" in first_cluster
    assert "calculated_risk_score" in first_cluster

def test_accident_risk_prediction():
    payload = {
        "latitude": 19.1197,
        "longitude": 72.8584,
        "road_type": "Expressway",
        "hour": 22,
        "day_of_week": 5,
        "weather_condition": "Heavy Rain",
        "lighting_condition": "Dark - Unlit",
        "road_surface": "Waterlogged",
        "speed_limit": 80
    }
    response = client.post("/api/predictions/accident-risk", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "predicted_category" in res
    assert "risk_score" in res
    assert 0 <= res["risk_score"] <= 100
    assert len(res["top_contributing_factors"]) > 0
    assert "disclaimer" in res

def test_traffic_congestion_prediction():
    payload = {
        "corridor": "Western Express Highway (WEH)",
        "hour": 18,
        "day_of_week": 2,
        "weather": "Clear",
        "speed_limit": 80,
        "lanes": 6,
        "daily_volume": 160000,
        "incident_reported": 0
    }
    response = client.post("/api/predictions/traffic", json=payload)
    assert response.status_code == 200
    res = response.json()
    assert "predicted_congestion_index" in res
    assert "predicted_speed_kmh" in res
    assert len(res["hourly_trends"]) == 24

def test_analytics_overview():
    response = client.get("/api/analytics/overview")
    assert response.status_code == 200
    data = response.json()
    assert len(data["hourly_distribution"]) == 24
    assert len(data["day_of_week_distribution"]) == 7
    assert len(data["weather_impact"]) > 0
    assert len(data["primary_causes"]) > 0

def test_model_metrics():
    response = client.get("/api/models/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] >= 2
    for m in data["models"]:
        assert "metrics" in m
        assert "feature_importance" in m

