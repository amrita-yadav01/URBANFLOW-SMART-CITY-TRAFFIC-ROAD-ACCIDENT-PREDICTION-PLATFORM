# UrbanFlow — Machine Learning & Explainable AI Pipeline

## 1. Pipeline Overview

UrbanFlow incorporates two distinct machine learning subsystems:
1. **Accident Spatial Clustering & Severity Risk Classifier (Model 1)**
2. **Arterial Traffic Congestion & Speed Forecaster (Model 2)**

Both models prioritize data integrity, avoid temporal data leakage through chronological validation splits, and implement SHAP (SHapley Additive exPlanations) for interpretability.

## 2. ML Pipeline Workflow Diagram

```mermaid
flowchart LR
    subgraph DataIngestion["Data Ingestion & Preprocessing"]
        A1["Historical Collision Logs\n(3,800 records)"]
        A2["Arterial Sensor Observations\n(6,020 records)"]
        A3["Corridor Geometry & Demographics"]
        
        P1["Data Cleaning & Deduplication"]
        P2["Cyclic Feature Engineering\n(sin/cos hour & day-of-week)"]
        P3["Spatial Coordinate Transformation\n(Degrees -> Radians)"]
        
        A1 --> P1 --> P3
        A2 --> P1 --> P2
        A3 --> P1
    end

    subgraph SpatialClustering["Spatial Hotspot Discovery"]
        DBSCAN["DBSCAN Algorithm\n(metric='haversine', eps=500m, min_samples=15)"]
        Hotspots["32 Hotspot Clusters Detected\n(Centroid Lat/Lon, Fatal Density)"]
        P3 --> DBSCAN --> Hotspots
    end

    subgraph ModelTraining["Model Training & Cross-Validation"]
        Split1["Stratified Split (80/20)"]
        Split2["Chronological Split (80/20)\n(No future leakage)"]
        
        RF_Acc["Random Forest Severity Classifier\n(n=120 trees, max_depth=12)"]
        RF_Traf["Random Forest Traffic Regressor Ensemble\n(Congestion % + Speed km/h)"]
        
        Hotspots --> Split1 --> RF_Acc
        P2 --> Split2 --> RF_Traf
    end

    subgraph Explainability["Explainability & Persistence"]
        SHAP["SHAP TreeExplainer\n(Background sample n=100)"]
        Artifacts["Joblib & Metadata Persistence\n(ml_models/*.joblib)"]
        
        RF_Acc --> SHAP
        SHAP --> Artifacts
        RF_Traf --> Artifacts
    end
```

## 3. Evaluation Metrics Summary

| Pipeline Component | Target Variable | Algorithm | Key Metrics |
|---|---|---|---|
| Spatial Hotspots | Spatial Lat/Lon density | DBSCAN (Haversine) | 32 Hotspots Identified across Mumbai & Navi Mumbai |
| Accident Risk | Collision Severity (Slight/Serious/Fatal) | Random Forest Classifier | Weighted F1: 0.5587, Multi-class Accuracy: 55.66% |
| Traffic Congestion | Congestion Index % (0-100) | Random Forest Regressor | R²: 0.9084, MAE: 4.75% |
| Traffic Speed | Flow Velocity (km/h) | Random Forest Regressor | R²: 0.9176, MAE: 4.35 km/h |

## 4. SHAP Interpretability Methodology

UrbanFlow computes local SHAP feature attributions on every `/api/predictions/accident-risk` request using a precomputed background dataset.
The top 5 positive and negative contributors are returned to the user, illuminating why a specific coordinate or environmental configuration elevated risk (e.g., Unlit nighttime roads, monsoon waterlogging, or high speed limits).

