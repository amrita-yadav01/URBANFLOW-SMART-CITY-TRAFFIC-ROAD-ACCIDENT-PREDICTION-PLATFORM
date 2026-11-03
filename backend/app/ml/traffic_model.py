import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

WEATHER_MAP = {"Clear": 0, "Drizzle": 1, "Heavy Rain": 2, "Fog/Haze": 3, "Overcast": 4}

class TrafficCongestionModel:
    def __init__(self, models_dir: Path):
        self.models_dir = models_dir
        self.models_dir.mkdir(parents=True, exist_ok=True)
        self.speed_regressor = None
        self.congestion_regressor = None
        self.metadata = {}

    def extract_features(self, df: pd.DataFrame) -> np.ndarray:
        df = df.copy()
        if "timestamp" in df.columns:
            dt = pd.to_datetime(df["timestamp"])
            hour = dt.dt.hour
            dow = dt.dt.dayofweek
            is_weekend = dow.isin([5, 6]).astype(int)
            is_peak = hour.apply(lambda h: int((8 <= h <= 11) or (17 <= h <= 21)))
        else:
            hour = df.get("hour", 12)
            dow = df.get("day_of_week", 2)
            is_weekend = df.get("is_weekend", 0)
            is_peak = df.get("is_peak_hour", 0)

        # Trigonometric cyclical encoding for hour and day of week
        sin_hour = np.sin(2 * np.pi * hour / 24.0)
        cos_hour = np.cos(2 * np.pi * hour / 24.0)
        sin_dow = np.sin(2 * np.pi * dow / 7.0)
        cos_dow = np.cos(2 * np.pi * dow / 7.0)

        speed_limit = df.get("speed_limit", 60)
        lanes = df.get("lanes", 6)
        daily_volume = df.get("daily_avg_volume", 120000)
        weather_enc = df.get("weather", "Clear").map(lambda w: WEATHER_MAP.get(w, 0)) if hasattr(df.get("weather", "Clear"), "map") else 0
        incident = df.get("incident_reported", 0).astype(int) if hasattr(df.get("incident_reported", 0), "astype") else 0

        feature_matrix = np.column_stack([
            hour, dow, is_weekend, is_peak,
            sin_hour, cos_hour, sin_dow, cos_dow,
            speed_limit, lanes, daily_volume, weather_enc, incident
        ])
        return feature_matrix

    def train(self, traffic_df: pd.DataFrame, road_segments_df: pd.DataFrame) -> dict:
        print("Training Traffic Congestion & Velocity Forecasting Models...")
        # Merge segment characteristics if segment_id is present
        if "segment_id" in traffic_df.columns and "segment_id" in road_segments_df.columns:
            seg_cols = ["segment_id", "speed_limit", "lanes", "daily_avg_volume"]
            merged_df = traffic_df.merge(road_segments_df[seg_cols], on="segment_id", how="left")
        else:
            merged_df = traffic_df.copy()
            merged_df["speed_limit"] = 60
            merged_df["lanes"] = 6
            merged_df["daily_avg_volume"] = 120000

        # Chronological Split (avoid future leakage in temporal forecasting)
        merged_df["dt"] = pd.to_datetime(merged_df["timestamp"])
        merged_df = merged_df.sort_values("dt").reset_index(drop=True)

        split_idx = int(len(merged_df) * 0.80)
        train_df = merged_df.iloc[:split_idx]
        test_df = merged_df.iloc[split_idx:]

        X_train = self.extract_features(train_df)
        X_test = self.extract_features(test_df)

        y_speed_train = train_df["average_speed_kmh"].values
        y_speed_test = test_df["average_speed_kmh"].values

        y_cong_train = train_df["congestion_index"].values
        y_cong_test = test_df["congestion_index"].values

        # 1. Regressor for Congestion Index (0-100%)
        self.congestion_regressor = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_split=4,
            random_state=42,
            n_jobs=-1
        )
        self.congestion_regressor.fit(X_train, y_cong_train)

        # 2. Regressor for Average Speed km/h
        self.speed_regressor = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_split=4,
            random_state=42,
            n_jobs=-1
        )
        self.speed_regressor.fit(X_train, y_speed_train)

        # Evaluate Congestion Model
        pred_cong = self.congestion_regressor.predict(X_test)
        cong_mae = float(mean_absolute_error(y_cong_test, pred_cong))
        cong_rmse = float(np.sqrt(mean_squared_error(y_cong_test, pred_cong)))
        cong_r2 = float(r2_score(y_cong_test, pred_cong))

        # Baseline Comparison: Naive Historical Mean
        naive_cong_mean = float(np.mean(y_cong_train))
        naive_cong_preds = np.full_like(y_cong_test, naive_cong_mean)
        baseline_cong_mae = float(mean_absolute_error(y_cong_test, naive_cong_preds))
        baseline_cong_rmse = float(np.sqrt(mean_squared_error(y_cong_test, naive_cong_preds)))

        # Evaluate Speed Model
        pred_speed = self.speed_regressor.predict(X_test)
        speed_mae = float(mean_absolute_error(y_speed_test, pred_speed))
        speed_rmse = float(np.sqrt(mean_squared_error(y_speed_test, pred_speed)))
        speed_r2 = float(r2_score(y_speed_test, pred_speed))

        # Baseline Comparison: Naive Speed Mean
        naive_speed_mean = float(np.mean(y_speed_train))
        naive_speed_preds = np.full_like(y_speed_test, naive_speed_mean)
        baseline_speed_mae = float(mean_absolute_error(y_speed_test, naive_speed_preds))
        baseline_speed_rmse = float(np.sqrt(mean_squared_error(y_speed_test, naive_speed_preds)))

        # Extract 20 chronological test samples for Actual vs Predicted auditing
        test_samples = []
        sample_indices = np.linspace(0, len(test_df) - 1, min(20, len(test_df)), dtype=int)
        for idx in sample_indices:
            row = test_df.iloc[idx]
            dt_str = str(row.get("dt", row.get("timestamp", "")))
            act_c = round(float(y_cong_test[idx]), 1)
            prd_c = round(float(pred_cong[idx]), 1)
            act_s = round(float(y_speed_test[idx]), 1)
            prd_s = round(float(pred_speed[idx]), 1)
            test_samples.append({
                "sample_id": int(idx),
                "timestamp": dt_str,
                "hour": int(row.get("dt", pd.to_datetime(row.get("timestamp"))).hour if hasattr(row.get("dt", None), "hour") else 12),
                "actual_congestion_pct": act_c,
                "predicted_congestion_pct": prd_c,
                "congestion_abs_error_pct": round(abs(act_c - prd_c), 1),
                "actual_speed_kmh": act_s,
                "predicted_speed_kmh": prd_s,
                "speed_abs_error_kmh": round(abs(act_s - prd_s), 1),
                "weather": str(row.get("weather", "Clear"))
            })

        feature_names = [
            "hour", "day_of_week", "is_weekend", "is_peak_hour",
            "sin_hour", "cos_hour", "sin_dow", "cos_dow",
            "speed_limit", "lanes", "daily_volume", "weather", "incident"
        ]

        importances = {
            name: round(float(imp), 4)
            for name, imp in zip(feature_names, self.congestion_regressor.feature_importances_)
        }

        self.metadata = {
            "model_name": "TrafficCongestionForecastingModel",
            "model_version": "v1.8",
            "model_architecture": "RandomForestRegressor (Ensemble)",
            "target_variables": ["congestion_index_pct", "average_speed_kmh"],
            "training_split": {
                "split_type": "Chronological (Temporal Out-of-Time)",
                "train_sample_count": len(train_df),
                "test_sample_count": len(test_df),
                "train_ratio": 0.80
            },
            "metrics": {
                "congestion_mae": round(cong_mae, 2),
                "congestion_mae_unit": "% points",
                "congestion_rmse": round(cong_rmse, 2),
                "congestion_rmse_unit": "% points",
                "congestion_r2": round(cong_r2, 4),
                "baseline_congestion_mae": round(baseline_cong_mae, 2),
                "baseline_congestion_rmse": round(baseline_cong_rmse, 2),
                "speed_mae": round(speed_mae, 2),
                "speed_mae_unit": "km/h",
                "speed_rmse": round(speed_rmse, 2),
                "speed_rmse_unit": "km/h",
                "speed_r2": round(speed_r2, 4),
                "baseline_speed_mae": round(baseline_speed_mae, 2),
                "baseline_speed_rmse": round(baseline_speed_rmse, 2)
            },
            "test_actual_vs_predicted": test_samples,
            "feature_importance": importances,
            "data_source_disclosure": "Trained on Mumbai MMR arterial sensor observations. Multi-hour profile is a scenario forecast model, not real-time telemetry.",
            "trained_at": pd.Timestamp.now().isoformat()
        }

        # Save artifacts
        joblib.dump(self.congestion_regressor, self.models_dir / "traffic_congestion_model.joblib")
        joblib.dump(self.speed_regressor, self.models_dir / "traffic_speed_model.joblib")
        with open(self.models_dir / "traffic_model_metadata.json", "w") as f:
            json.dump(self.metadata, f, indent=2)

        print(f"Traffic models trained successfully. Congestion R2: {cong_r2:.3f}, MAE: {cong_mae:.2f}%")
        return self.metadata

    def load(self):
        self.congestion_regressor = joblib.load(self.models_dir / "traffic_congestion_model.joblib")
        self.speed_regressor = joblib.load(self.models_dir / "traffic_speed_model.joblib")
        with open(self.models_dir / "traffic_model_metadata.json", "r") as f:
            self.metadata = json.load(f)

    def predict_traffic(self, query: dict) -> dict:
        """Predict congestion, speed, and 24-hour hourly trend profile."""
        if self.congestion_regressor is None:
            self.load()

        hour = int(query.get("hour", 17))
        dow = int(query.get("day_of_week", 2))
        weather = query.get("weather", "Clear")
        speed_limit = int(query.get("speed_limit", 60))
        lanes = int(query.get("lanes", 6))
        daily_vol = int(query.get("daily_volume", 135000))
        incident = int(query.get("incident_reported", 0))

        # Single prediction for requested hour
        df_single = pd.DataFrame([{
            "hour": hour,
            "day_of_week": dow,
            "is_weekend": 1 if dow in [5, 6] else 0,
            "is_peak_hour": 1 if ((8 <= hour <= 11) or (17 <= hour <= 21)) else 0,
            "speed_limit": speed_limit,
            "lanes": lanes,
            "daily_avg_volume": daily_vol,
            "weather": weather,
            "incident_reported": incident
        }])
        X_single = self.extract_features(df_single)

        pred_cong = float(self.congestion_regressor.predict(X_single)[0])
        pred_speed = float(self.speed_regressor.predict(X_single)[0])

        pred_cong = min(100.0, max(5.0, round(pred_cong, 1)))
        pred_speed = min(speed_limit * 1.1, max(8.0, round(pred_speed, 1)))

        if pred_cong >= 75:
            level = "Severe Gridlock"
            level_color = "#ef4444"
        elif pred_cong >= 55:
            level = "Heavy Congestion"
            level_color = "#f59e0b"
        elif pred_cong >= 32:
            level = "Moderate Traffic"
            level_color = "#38bdf8"
        else:
            level = "Free Flow"
            level_color = "#10b981"

        # Generate 24-hour diurnal profile
        hourly_records = []
        for h in range(24):
            df_h = pd.DataFrame([{
                "hour": h,
                "day_of_week": dow,
                "is_weekend": 1 if dow in [5, 6] else 0,
                "is_peak_hour": 1 if ((8 <= h <= 11) or (17 <= h <= 21)) else 0,
                "speed_limit": speed_limit,
                "lanes": lanes,
                "daily_avg_volume": daily_vol,
                "weather": weather,
                "incident_reported": incident
            }])
            X_h = self.extract_features(df_h)
            cong_h = round(float(self.congestion_regressor.predict(X_h)[0]), 1)
            spd_h = round(float(self.speed_regressor.predict(X_h)[0]), 1)
            hourly_records.append({
                "hour": f"{h:02d}:00",
                "congestion_index": min(100.0, max(5.0, cong_h)),
                "predicted_speed": min(speed_limit, max(8.0, spd_h)),
                "historical_baseline_speed": round(speed_limit * (0.45 if ((8<=h<=11) or (17<=h<=21)) else 0.85), 1)
            })

        return {
            "selected_hour": f"{hour:02d}:00",
            "predicted_congestion_index": pred_cong,
            "predicted_speed_kmh": pred_speed,
            "congestion_level": level,
            "congestion_color": level_color,
            "free_flow_speed": speed_limit,
            "travel_time_delay_multiplier": round(float(speed_limit / max(pred_speed, 5.0)), 2),
            "hourly_trends": hourly_records,
            "model_metrics": self.metadata.get("metrics", {})
        }

