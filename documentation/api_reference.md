# UrbanFlow — REST API Reference Documentation

All endpoints are served under the `/api` prefix. Interactive OpenAPI documentation is accessible at `/docs` (Swagger UI) and `/redoc`.

## Endpoints Summary

### 1. System Health
- **`GET /api/health`**
  - Heartbeat status, database connectivity verification, and ML model weights readiness.
  - Response:
    ```json
    {
      "status": "online",
      "service": "UrbanFlow - Smart City Traffic & Accident Intelligence",
      "database": "healthy",
      "ml_models_loaded": true,
      "target_region": "Mumbai & Navi Mumbai Metropolitan Area"
    }
    ```

### 2. Dashboard
- **`GET /api/dashboard/summary`**
  - Returns calculated citywide metrics: total recorded accidents, high-risk zones, monthly trends, severity distribution, top high-risk corridors, and live traffic averages.

### 3. Accidents & Hotspots
- **`GET /api/accidents`**
  - Query Parameters: `severity`, `zone`, `corridor`, `weather`, `time_of_day`, `limit`, `offset`.
  - Returns paginated incident items with latitude, longitude, and casualty details.
- **`GET /api/accidents/hotspots`**
  - Returns all 32 DBSCAN discovered spatial clusters with center latitude, longitude, fatal count, and calculated risk score.
- **`GET /api/accidents/segments`**
  - Returns canonical road segments with bounding coordinates and historical risk classifications.
- **`GET /api/accidents/filters`**
  - Returns available options for dropdown menus.

### 4. ML Predictions
- **`POST /api/predictions/accident-risk`**
  - Input JSON:
    ```json
    {
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
    ```
  - Response:
    - `predicted_category`: "High Risk"
    - `risk_score`: 68.2
    - `probabilities`: `{ slight_risk, serious_risk, fatal_risk }`
    - `top_contributing_factors`: List of SHAP factors with impact and directional classification.
    - `recommendation`: Planning and engineering intervention recommendations.
- **`POST /api/predictions/traffic`**
  - Input JSON:
    ```json
    {
      "corridor": "Western Express Highway (WEH)",
      "hour": 18,
      "day_of_week": 2,
      "weather": "Clear",
      "speed_limit": 80,
      "lanes": 6,
      "daily_volume": 160000,
      "incident_reported": 0
    }
    ```
  - Response:
    - `predicted_congestion_index`: 62.4%
    - `predicted_speed_kmh`: 26.8 km/h
    - `travel_time_delay_multiplier`: 2.98x
    - `hourly_trends`: 24-hour hourly prediction curve.

### 5. Analytics
- **`GET /api/analytics/overview`**
  - Real calculations for hourly distribution, day-of-week patterns, weather vulnerability impact, primary cause breakdown, and demographic rates per 100k population.

### 6. Datasets
- **`GET /api/datasets`**: List all registered datasets.
- **`POST /api/datasets/upload`**: Multipart file upload accepting CSV, performing data quality profiling (row count, duplicates, missing values, preview).

### 7. Model Governance
- **`GET /api/models/metrics`**: Evaluation reports, accuracy, F1-scores, R², MAE, and Gini feature importance rankings.

