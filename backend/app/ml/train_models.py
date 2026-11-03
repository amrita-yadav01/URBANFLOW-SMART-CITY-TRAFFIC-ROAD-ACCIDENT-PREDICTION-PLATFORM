import sys
from pathlib import Path

# Ensure backend root is on PYTHONPATH
BASE_BACKEND = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_BACKEND))

import pandas as pd
from app.config import settings
from app.ml.dataset_generator import generate_all_datasets
from app.ml.accident_model import AccidentHotspotModel
from app.ml.traffic_model import TrafficCongestionModel

def run_training_pipeline():
    print("=" * 70)
    print("URBANFLOW ML PIPELINE: MODEL TRAINING & EVALUATION")
    print("=" * 70)

    # 1. Dataset verification or generation
    settings.DATASETS_DIR.mkdir(parents=True, exist_ok=True)
    settings.ML_MODELS_DIR.mkdir(parents=True, exist_ok=True)

    accidents_file = settings.DATASETS_DIR / "mumbai_accidents_historical.csv"
    traffic_file = settings.DATASETS_DIR / "mumbai_traffic_sensors.csv"
    segments_file = settings.DATASETS_DIR / "mumbai_road_segments.csv"

    print("\n[Step 1/3] Generating Mumbai & Navi Mumbai Baseline Datasets...")
    generate_all_datasets(settings.DATASETS_DIR)

    # Load datasets
    df_accidents = pd.read_csv(accidents_file)
    df_traffic = pd.read_csv(traffic_file)
    df_segments = pd.read_csv(segments_file)

    print(f"Loaded {len(df_accidents)} accidents, {len(df_traffic)} traffic observations, {len(df_segments)} road segments.")

    # 2. Train Accident Hotspot & Risk Classification Model
    print("\n[Step 2/3] Training Accident Spatial Clustering & Severity Model...")
    accident_model = AccidentHotspotModel(settings.ML_MODELS_DIR)
    accident_meta = accident_model.train(df_accidents)

    # 3. Train Traffic Congestion & Speed Model
    print("\n[Step 3/3] Training Traffic Congestion & Speed Regressors...")
    traffic_model = TrafficCongestionModel(settings.ML_MODELS_DIR)
    traffic_meta = traffic_model.train(df_traffic, df_segments)

    print("\n" + "=" * 70)
    print("TRAINING COMPLETE! SUMMARY OF RESULTS:")
    print("=" * 70)
    print(f"Accident Model Accuracy: {accident_meta['metrics']['accuracy'] * 100:.2f}%")
    print(f"Accident Model Weighted F1: {accident_meta['metrics']['f1_weighted']:.4f}")
    print(f"Hotspots Detected: {len(accident_meta['hotspots'])}")
    print(f"Traffic Congestion R^2: {traffic_meta['metrics']['congestion_r2']:.4f} (MAE: {traffic_meta['metrics']['congestion_mae']:.2f}%)")
    print(f"Traffic Speed R^2: {traffic_meta['metrics']['speed_r2']:.4f} (MAE: {traffic_meta['metrics']['speed_mae']:.2f} km/h)")
    print(f"Artifacts saved in: {settings.ML_MODELS_DIR}")
    print("=" * 70)

if __name__ == "__main__":
    run_training_pipeline()
