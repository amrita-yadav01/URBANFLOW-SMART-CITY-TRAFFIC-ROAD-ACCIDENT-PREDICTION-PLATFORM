import os
import random
import datetime
import numpy as np
import pandas as pd
from pathlib import Path

# Fix seed for reproducible realistic generation
np.random.seed(42)
random.seed(42)

CORRIDORS = [
    {
        "name": "Western Express Highway (WEH)",
        "zone": "Western Suburbs",
        "road_type": "Expressway",
        "speed_limit": 80,
        "lanes": 6,
        "daily_volume": 165000,
        "base_risk": 78.5,
        "hotspots": [
            {"name": "Bandra Kalanagar Junction", "lat": 19.0601, "lon": 72.8512, "weight": 1.4},
            {"name": "Santacruz Airport Flyover", "lat": 19.0880, "lon": 72.8540, "weight": 1.2},
            {"name": "Andheri WEH Flyover & Gundavali", "lat": 19.1197, "lon": 72.8584, "weight": 1.8},
            {"name": "Goregaon Hub Mall Junction", "lat": 19.1578, "lon": 72.8596, "weight": 1.5},
            {"name": "Kandivali Mahindra Flyover", "lat": 19.2045, "lon": 72.8612, "weight": 1.3},
            {"name": "Borivali National Park Junction", "lat": 19.2291, "lon": 72.8647, "weight": 1.6},
            {"name": "Dahisar Toll Plaza & Check Naka", "lat": 19.2570, "lon": 72.8680, "weight": 1.7},
        ]
    },
    {
        "name": "Eastern Express Highway (EEH)",
        "zone": "Eastern Suburbs",
        "road_type": "Expressway",
        "speed_limit": 80,
        "lanes": 6,
        "daily_volume": 145000,
        "base_risk": 72.0,
        "hotspots": [
            {"name": "Sion Circle & Chunabhatti Link", "lat": 19.0435, "lon": 72.8655, "weight": 1.9},
            {"name": "Kurla-CST Road Junction", "lat": 19.0682, "lon": 72.8821, "weight": 1.5},
            {"name": "Ghatkopar Chedda Nagar Junction", "lat": 19.0815, "lon": 72.9030, "weight": 1.7},
            {"name": "Vikhroli Godrej Flyover", "lat": 19.1120, "lon": 72.9260, "weight": 1.2},
            {"name": "Kanjurmarg JVLR Interchange", "lat": 19.1300, "lon": 72.9350, "weight": 1.6},
            {"name": "Mulund Airoli Bridge Turnoff", "lat": 19.1670, "lon": 72.9550, "weight": 1.4},
            {"name": "Thane Teen Hath Naka", "lat": 19.1872, "lon": 72.9641, "weight": 1.9},
        ]
    },
    {
        "name": "Sion-Panvel Highway",
        "zone": "Navi Mumbai",
        "road_type": "Expressway",
        "speed_limit": 80,
        "lanes": 8,
        "daily_volume": 180000,
        "base_risk": 82.0,
        "hotspots": [
            {"name": "Mankhurd Octroi Naka", "lat": 19.0520, "lon": 72.9310, "weight": 1.6},
            {"name": "Vashi Bridge Old & New Creek", "lat": 19.0645, "lon": 72.9770, "weight": 2.0},
            {"name": "Vashi Plaza & Sector 17 Junction", "lat": 19.0720, "lon": 72.9980, "weight": 1.4},
            {"name": "Sanpada APMC Market Turnoff", "lat": 19.0660, "lon": 73.0130, "weight": 1.3},
            {"name": "Nerul LP Flyover Junction", "lat": 19.0340, "lon": 73.0240, "weight": 1.7},
            {"name": "CBD Belapur Konkan Bhavan", "lat": 19.0180, "lon": 73.0410, "weight": 1.4},
            {"name": "Kharghar Hiranandani Curve", "lat": 19.0380, "lon": 73.0690, "weight": 1.8},
            {"name": "Kalamboli Expressway Interchange", "lat": 19.0320, "lon": 73.1040, "weight": 1.9},
        ]
    },
    {
        "name": "Palm Beach Road",
        "zone": "Navi Mumbai",
        "road_type": "Arterial",
        "speed_limit": 60,
        "lanes": 6,
        "daily_volume": 85000,
        "base_risk": 64.0,
        "hotspots": [
            {"name": "Vashi Blue Diamond Curve", "lat": 19.0830, "lon": 72.9930, "weight": 1.7},
            {"name": "Moraj Residency Sanpada Junction", "lat": 19.0720, "lon": 73.0030, "weight": 1.5},
            {"name": "Seawoods Grand Central Curve", "lat": 19.0190, "lon": 73.0170, "weight": 1.8},
            {"name": "NRI Seawoods Complex Signal", "lat": 19.0060, "lon": 73.0210, "weight": 1.4},
            {"name": "Belapur Killa Gaon End", "lat": 18.9950, "lon": 73.0330, "weight": 1.3},
        ]
    },
    {
        "name": "Thane Ghodbunder Road",
        "zone": "Thane",
        "road_type": "Arterial",
        "speed_limit": 60,
        "lanes": 6,
        "daily_volume": 120000,
        "base_risk": 79.0,
        "hotspots": [
            {"name": "Kapurbawdi Junction Flyover", "lat": 19.2150, "lon": 72.9770, "weight": 1.9},
            {"name": "Manpada D-Mart Junction", "lat": 19.2380, "lon": 72.9720, "weight": 1.4},
            {"name": "Patlipada Dongripada Cut", "lat": 19.2550, "lon": 72.9670, "weight": 1.5},
            {"name": "Waghbil Flyover Incline", "lat": 19.2680, "lon": 72.9620, "weight": 1.6},
            {"name": "Gaimukh Ghat Curve & Viewpoint", "lat": 19.2930, "lon": 72.9430, "weight": 2.1},
        ]
    },
    {
        "name": "Jogeshwari-Vikhroli Link Road (JVLR)",
        "zone": "Western Suburbs",
        "road_type": "Arterial",
        "speed_limit": 60,
        "lanes": 6,
        "daily_volume": 110000,
        "base_risk": 71.0,
        "hotspots": [
            {"name": "Jogeshwari WEH Interchange", "lat": 19.1350, "lon": 72.8550, "weight": 1.7},
            {"name": "SEEPZ Gate No 1 & Central Road", "lat": 19.1280, "lon": 72.8760, "weight": 1.4},
            {"name": "Powai Lake Hiranandani Turnoff", "lat": 19.1240, "lon": 72.9050, "weight": 1.5},
            {"name": "IIT Bombay Main Gate Signal", "lat": 19.1260, "lon": 72.9160, "weight": 1.3},
            {"name": "Kanjurmarg EEH Junction Ramp", "lat": 19.1310, "lon": 72.9340, "weight": 1.6},
        ]
    },
    {
        "name": "Bandra-Worli Sea Link & Coastal Road",
        "zone": "South Mumbai",
        "road_type": "Expressway",
        "speed_limit": 80,
        "lanes": 8,
        "daily_volume": 95000,
        "base_risk": 48.0,
        "hotspots": [
            {"name": "BWSL Bandra Toll Plaza", "lat": 19.0430, "lon": 72.8190, "weight": 1.3},
            {"name": "BWSL Worli Cable Bridge End", "lat": 19.0180, "lon": 72.8150, "weight": 1.2},
            {"name": "Worli Seaface Coastal Entry", "lat": 19.0110, "lon": 72.8160, "weight": 1.1},
            {"name": "Haji Ali Interchange Tunnel", "lat": 18.9770, "lon": 72.8120, "weight": 1.4},
            {"name": "Marine Drive Princess Street Flyover", "lat": 18.9440, "lon": 72.8240, "weight": 1.5},
        ]
    },
    {
        "name": "Swami Vivekanand Road (S.V. Road)",
        "zone": "Western Suburbs",
        "road_type": "Secondary",
        "speed_limit": 50,
        "lanes": 4,
        "daily_volume": 75000,
        "base_risk": 68.0,
        "hotspots": [
            {"name": "Bandra Lucky Restaurant Junction", "lat": 19.0540, "lon": 72.8410, "weight": 1.8},
            {"name": "Khar Telephone Exchange Signal", "lat": 19.0700, "lon": 72.8390, "weight": 1.3},
            {"name": "Santacruz Milan Subway Crossing", "lat": 19.0850, "lon": 72.8420, "weight": 1.6},
            {"name": "Andheri Market & Station Junction", "lat": 19.1200, "lon": 72.8440, "weight": 1.9},
        ]
    }
]

PRIMARY_CAUSES = [
    ("Overspeeding", 0.32),
    ("Lane Violation & Reckless Cutting", 0.22),
    ("Sudden Braking & Tailgating", 0.16),
    ("Pedestrian Jaywalking", 0.12),
    ("Pothole & Surface Defect", 0.08),
    ("Signal Jumping", 0.06),
    ("Mechanical Failure / Tyre Burst", 0.04),
]

WEATHER_CONDITIONS = [
    ("Clear", 0.58),
    ("Heavy Rain", 0.22),
    ("Drizzle", 0.10),
    ("Fog/Haze", 0.06),
    ("Overcast", 0.04)
]

LIGHTING_CONDITIONS = [
    ("Daylight", 0.52),
    ("Dark - Streetlights On", 0.34),
    ("Dark - Unlit", 0.08),
    ("Dusk/Dawn", 0.06)
]

def generate_accidents(n_records: int = 3800) -> pd.DataFrame:
    """Generate realistic accident records across Mumbai & Navi Mumbai."""
    records = []
    start_date = datetime.datetime.now() - datetime.timedelta(days=730)
    
    # Precompute cause and weather distribution
    causes, cause_weights = zip(*PRIMARY_CAUSES)
    weathers, weather_weights = zip(*WEATHER_CONDITIONS)
    lightings, light_weights = zip(*LIGHTING_CONDITIONS)

    for i in range(1, n_records + 1):
        # Pick random corridor and hotspot
        corridor_data = random.choice(CORRIDORS)
        hotspot = random.choices(
            corridor_data["hotspots"], 
            weights=[h["weight"] for h in corridor_data["hotspots"]]
        )[0]
        
        # Spatial jitter around hotspot (approx 50m - 400m)
        lat = hotspot["lat"] + np.random.normal(0, 0.0025)
        lon = hotspot["lon"] + np.random.normal(0, 0.0025)
        
        # Generate timestamp with realistic time-of-day and seasonal bias
        day_offset = random.randint(0, 729)
        record_date = start_date + datetime.timedelta(days=day_offset)
        
        # Hourly distribution: higher during morning (8-11 AM) and late evening/night (7-11 PM, 1-3 AM)
        hour_weights = [
            2, 2, 3, 2, 1, 1, 3, 5, 8, 9, 7, 5, # 00-11
            4, 4, 4, 5, 6, 8, 9, 8, 7, 6, 4, 3  # 12-23
        ]
        hour = random.choices(range(24), weights=hour_weights)[0]
        minute = random.randint(0, 59)
        second = random.randint(0, 59)
        dt = record_date.replace(hour=hour, minute=minute, second=second)
        
        is_peak = (8 <= hour <= 11) or (17 <= hour <= 21)
        is_weekend = dt.weekday() >= 5
        month = dt.month
        
        # Monsoon seasonal weather adjustment (June-September)
        if month in [6, 7, 8, 9]:
            weather = random.choices(
                ["Heavy Rain", "Drizzle", "Clear", "Overcast"], 
                weights=[0.45, 0.25, 0.20, 0.10]
            )[0]
            road_surface = "Waterlogged" if weather == "Heavy Rain" else "Wet"
        else:
            weather = random.choices(weathers, weights=weather_weights)[0]
            road_surface = "Dry" if weather == "Clear" else "Wet"
            if random.random() < 0.08:
                road_surface = "Uneven/Potholes"
                
        # Lighting condition based on hour
        if 6 <= hour <= 18:
            lighting = "Daylight"
        elif hour in [19, 5]:
            lighting = "Dusk/Dawn"
        else:
            lighting = random.choices(
                ["Dark - Streetlights On", "Dark - Unlit"], 
                weights=[0.82, 0.18]
            )[0]
            
        cause = random.choices(causes, weights=cause_weights)[0]
        
        # Severity calculation based on conditions:
        # High speed + Night + Heavy rain / Unlit => higher fatal probability
        severity_score = random.random()
        risk_modifier = 0.0
        if lighting == "Dark - Unlit":
            risk_modifier += 0.25
        if weather == "Heavy Rain":
            risk_modifier += 0.15
        if cause == "Overspeeding":
            risk_modifier += 0.20
        if corridor_data["speed_limit"] >= 80:
            risk_modifier += 0.15
            
        final_score = min(1.0, max(0.0, severity_score * 0.5 + risk_modifier * 0.5))
        
        if final_score > 0.68:
            severity = "Fatal"
            fatalities = random.choices([1, 2, 3], weights=[0.8, 0.15, 0.05])[0]
            casualties = fatalities + random.randint(0, 3)
            vehicles = random.randint(1, 4)
        elif final_score > 0.38:
            severity = "Serious"
            fatalities = 0
            casualties = random.choices([1, 2, 3, 4], weights=[0.5, 0.3, 0.15, 0.05])[0]
            vehicles = random.randint(1, 3)
        else:
            severity = "Slight"
            fatalities = 0
            casualties = random.choices([0, 1, 2], weights=[0.7, 0.25, 0.05])[0]
            vehicles = random.randint(1, 2)
            
        records.append({
            "incident_id": f"ACC-MUM-{dt.year}-{i:05d}",
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "location_name": f"{hotspot['name']}, {corridor_data['name']}",
            "zone": corridor_data["zone"],
            "corridor": corridor_data["name"],
            "timestamp": dt.strftime("%Y-%m-%d %H:%M:%S"),
            "severity": severity,
            "road_type": corridor_data["road_type"],
            "weather_condition": weather,
            "lighting_condition": lighting,
            "road_surface": road_surface,
            "speed_limit": corridor_data["speed_limit"],
            "vehicles_involved": vehicles,
            "casualties": casualties,
            "fatalities": fatalities,
            "primary_cause": cause,
            "is_peak_hour": is_peak,
            "is_weekend": is_weekend,
            "risk_score": round(final_score * 100, 2)
        })
        
    df = pd.DataFrame(records)
    # Sort chronologically
    df["dt_temp"] = pd.to_datetime(df["timestamp"])
    df = df.sort_values("dt_temp").drop(columns=["dt_temp"]).reset_index(drop=True)
    return df

def generate_road_segments() -> pd.DataFrame:
    """Generate canonical road segment definitions for Mumbai corridors."""
    segments = []
    seg_idx = 1
    for corridor in CORRIDORS:
        for i in range(len(corridor["hotspots"]) - 1):
            h_start = corridor["hotspots"][i]
            h_end = corridor["hotspots"][i+1]
            center_lat = (h_start["lat"] + h_end["lat"]) / 2
            center_lon = (h_start["lon"] + h_end["lon"]) / 2
            
            # Risk calculation
            comb_weight = (h_start["weight"] + h_end["weight"]) / 2
            hist_risk = round(min(98.0, corridor["base_risk"] * comb_weight / 1.5), 1)
            
            if hist_risk >= 80:
                risk_level = "Critical"
            elif hist_risk >= 65:
                risk_level = "High"
            elif hist_risk >= 45:
                risk_level = "Medium"
            else:
                risk_level = "Low"
                
            segments.append({
                "segment_id": f"SEG-MUM-{seg_idx:03d}",
                "corridor_name": corridor["name"],
                "segment_name": f"{h_start['name']} to {h_end['name']}",
                "zone": corridor["zone"],
                "start_lat": round(h_start["lat"], 6),
                "start_lon": round(h_start["lon"], 6),
                "end_lat": round(h_end["lat"], 6),
                "end_lon": round(h_end["lon"], 6),
                "center_lat": round(center_lat, 6),
                "center_lon": round(center_lon, 6),
                "lanes": corridor["lanes"],
                "speed_limit": corridor["speed_limit"],
                "daily_avg_volume": int(corridor["daily_volume"] * (0.85 + 0.3 * random.random())),
                "length_km": round(random.uniform(1.8, 4.5), 2),
                "historical_risk_score": hist_risk,
                "risk_level": risk_level
            })
            seg_idx += 1
    return pd.DataFrame(segments)

def generate_traffic_observations(road_segments_df: pd.DataFrame, n_days: int = 30) -> pd.DataFrame:
    """Generate hourly traffic observation data across road segments."""
    records = []
    end_date = datetime.datetime.now()
    start_date = end_date - datetime.timedelta(days=n_days)
    
    # Generate for a subset of prominent segments to keep file size optimal
    sample_segments = road_segments_df.sample(n=min(20, len(road_segments_df)), random_state=42).to_dict("records")
    
    current_time = start_date.replace(minute=0, second=0, microsecond=0)
    while current_time <= end_date:
        hour = current_time.hour
        is_weekend = current_time.weekday() >= 5
        is_peak = (8 <= hour <= 11) or (17 <= hour <= 21)
        
        # Time of day speed factor
        if is_peak:
            speed_mult = 0.42 if not is_weekend else 0.70
            vol_mult = 1.6 if not is_weekend else 1.1
        elif 0 <= hour <= 5:
            speed_mult = 1.05
            vol_mult = 0.18
        else:
            speed_mult = 0.78
            vol_mult = 0.95
            
        for seg in sample_segments:
            base_speed = float(seg["speed_limit"])
            avg_speed = max(10.0, round(base_speed * speed_mult * random.uniform(0.85, 1.15), 1))
            
            # Congestion index calculation (0-100)
            congestion = min(100.0, max(5.0, round((1.0 - (avg_speed / base_speed)) * 100 + random.uniform(-4, 6), 1)))
            
            if congestion >= 75:
                cong_level = "Severe Gridlock"
            elif congestion >= 55:
                cong_level = "Heavy"
            elif congestion >= 30:
                cong_level = "Moderate"
            else:
                cong_level = "Free Flow"
                
            incident = random.random() < (0.04 if is_peak else 0.01)
            if incident:
                avg_speed = max(8.0, round(avg_speed * 0.5, 1))
                congestion = min(100.0, congestion + 30.0)
                cong_level = "Severe Gridlock"
                
            hourly_vol = int((seg["daily_avg_volume"] / 24) * vol_mult * random.uniform(0.88, 1.12))
            
            records.append({
                "sensor_id": f"SEN-{seg['segment_id']}",
                "segment_id": seg["segment_id"],
                "corridor": seg["corridor_name"],
                "timestamp": current_time.strftime("%Y-%m-%d %H:%M:%S"),
                "vehicle_count": hourly_vol,
                "average_speed_kmh": avg_speed,
                "congestion_index": congestion,
                "congestion_level": cong_level,
                "weather": "Heavy Rain" if (current_time.month in [7, 8] and random.random() < 0.4) else "Clear",
                "is_peak_hour": is_peak,
                "is_weekend": is_weekend,
                "incident_reported": incident
            })
            
        current_time += datetime.timedelta(hours=2) # 2-hour interval for balanced volume (~7,200 records)
        
    return pd.DataFrame(records)

def generate_demographics() -> pd.DataFrame:
    """Generate realistic demographic metrics for Mumbai administrative zones."""
    return pd.DataFrame([
        {
            "zone": "South Mumbai",
            "ward_code": "A-E",
            "population": 3145000,
            "density_per_sqkm": 46500.0,
            "registered_vehicles": 820000,
            "public_transit_accessibility_score": 88.5
        },
        {
            "zone": "Western Suburbs",
            "ward_code": "H-R",
            "population": 5480000,
            "density_per_sqkm": 32100.0,
            "registered_vehicles": 1640000,
            "public_transit_accessibility_score": 82.0
        },
        {
            "zone": "Eastern Suburbs",
            "ward_code": "L-T",
            "population": 4210000,
            "density_per_sqkm": 28900.0,
            "registered_vehicles": 1180000,
            "public_transit_accessibility_score": 76.5
        },
        {
            "zone": "Navi Mumbai",
            "ward_code": "NMMC",
            "population": 1520000,
            "density_per_sqkm": 14200.0,
            "registered_vehicles": 710000,
            "public_transit_accessibility_score": 71.0
        },
        {
            "zone": "Thane",
            "ward_code": "TMC",
            "population": 2180000,
            "density_per_sqkm": 17800.0,
            "registered_vehicles": 890000,
            "public_transit_accessibility_score": 68.0
        }
    ])

def generate_all_datasets(output_dir: Path):
    output_dir.mkdir(parents=True, exist_ok=True)
    print(f"Generating realistic datasets for Mumbai Metropolitan Region in {output_dir}...")
    
    # 1. Road Segments
    df_segments = generate_road_segments()
    segments_path = output_dir / "mumbai_road_segments.csv"
    df_segments.to_csv(segments_path, index=False)
    print(f"-> Created {segments_path} ({len(df_segments)} segments)")
    
    # 2. Accidents
    df_accidents = generate_accidents(n_records=3800)
    accidents_path = output_dir / "mumbai_accidents_historical.csv"
    df_accidents.to_csv(accidents_path, index=False)
    print(f"-> Created {accidents_path} ({len(df_accidents)} accidents)")
    
    # 3. Traffic Observations
    df_traffic = generate_traffic_observations(df_segments, n_days=25)
    traffic_path = output_dir / "mumbai_traffic_sensors.csv"
    df_traffic.to_csv(traffic_path, index=False)
    print(f"-> Created {traffic_path} ({len(df_traffic)} traffic observations)")
    
    # 4. Demographics
    df_demo = generate_demographics()
    demo_path = output_dir / "mumbai_demographics.csv"
    df_demo.to_csv(demo_path, index=False)
    print(f"-> Created {demo_path} ({len(df_demo)} zones)")

if __name__ == "__main__":
    from app.config import settings
    generate_all_datasets(settings.DATASETS_DIR)
