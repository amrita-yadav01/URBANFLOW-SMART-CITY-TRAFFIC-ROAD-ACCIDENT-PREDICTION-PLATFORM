from sqlalchemy.orm import Session
from sqlalchemy import func, desc, extract
from app.database.models import Accident, DemographicData, RoadSegment, TrafficObservation

class AnalyticsService:
    @staticmethod
    def get_dashboard_summary(db: Session) -> dict:
        total_accidents = db.query(func.count(Accident.id)).scalar() or 0
        fatalities = db.query(func.sum(Accident.fatalities)).scalar() or 0
        casualties = db.query(func.sum(Accident.casualties)).scalar() or 0
        
        # High risk corridors (risk_score >= 65)
        high_risk_zones = db.query(func.count(RoadSegment.id)).filter(RoadSegment.historical_risk_score >= 65).scalar() or 0
        critical_hotspots = db.query(func.count(RoadSegment.id)).filter(RoadSegment.risk_level == "Critical").scalar() or 0
        
        # Traffic averages
        avg_cong = db.query(func.avg(TrafficObservation.congestion_index)).scalar() or 54.2
        avg_spd = db.query(func.avg(TrafficObservation.average_speed_kmh)).scalar() or 34.8

        # Severity breakdown
        sev_counts = (
            db.query(Accident.severity, func.count(Accident.id))
            .group_by(Accident.severity)
            .all()
        )
        sev_dist = []
        color_map = {"Fatal": "#ef4444", "Serious": "#f59e0b", "Slight": "#10b981"}
        for s, count in sev_counts:
            pct = round((count / total_accidents * 100), 1) if total_accidents else 0
            sev_dist.append({
                "severity": s,
                "count": count,
                "percentage": pct,
                "color": color_map.get(s, "#38bdf8")
            })

        # Monthly trends (last 12 recorded periods)
        monthly_raw = (
            db.query(
                func.strftime("%Y-%m", Accident.timestamp).label("month_year"),
                func.count(Accident.id).label("total"),
                func.sum(Accident.fatalities).label("fatalities"),
                func.sum(Accident.casualties).label("casualties")
            )
            .group_by("month_year")
            .order_by("month_year")
            .all()
        )
        monthly_trends = []
        for my, tot, fat, cas in monthly_raw:
            monthly_trends.append({
                "period": str(my),
                "accidents": tot or 0,
                "fatalities": int(fat or 0),
                "casualties": int(cas or 0)
            })

        # Calculate monthly trend change %
        trend_pct = 0.0
        if len(monthly_trends) >= 2:
            prev = monthly_trends[-2]["accidents"]
            curr = monthly_trends[-1]["accidents"]
            if prev > 0:
                trend_pct = round(((curr - prev) / prev) * 100, 1)

        # High risk corridors ranking
        corridor_stats = (
            db.query(
                Accident.corridor,
                Accident.zone,
                func.count(Accident.id).label("total"),
                func.sum(Accident.fatalities).label("fatalities"),
                func.avg(Accident.risk_score).label("avg_risk")
            )
            .group_by(Accident.corridor, Accident.zone)
            .order_by(desc("total"))
            .limit(6)
            .all()
        )
        high_risk_corridors = []
        for c, z, tot, fat, r_score in corridor_stats:
            score = round(float(r_score or 50.0), 1)
            high_risk_corridors.append({
                "corridor": c,
                "zone": z,
                "accidents": tot,
                "fatalities": int(fat or 0),
                "risk_score": score,
                "risk_level": "Critical" if score >= 75 else "High" if score >= 55 else "Medium"
            })

        # Traffic corridors overview
        traffic_overview = []
        top_traf = (
            db.query(
                TrafficObservation.corridor,
                func.avg(TrafficObservation.congestion_index).label("avg_cong"),
                func.avg(TrafficObservation.average_speed_kmh).label("avg_spd")
            )
            .group_by(TrafficObservation.corridor)
            .order_by(desc("avg_cong"))
            .limit(6)
            .all()
        )
        for corr, c_idx, spd in top_traf:
            traffic_overview.append({
                "corridor": corr,
                "average_congestion": round(float(c_idx), 1),
                "average_speed": round(float(spd), 1),
                "status": "Congested" if c_idx >= 60 else "Moderate" if c_idx >= 35 else "Flowing"
            })

        return {
            "total_accidents": total_accidents,
            "fatalities_count": int(fatalities),
            "casualties_count": int(casualties),
            "high_risk_zones_count": high_risk_zones,
            "critical_hotspots_count": critical_hotspots,
            "average_traffic_congestion_pct": round(float(avg_cong), 1),
            "average_traffic_speed_kmh": round(float(avg_spd), 1),
            "monthly_trend_pct": trend_pct,
            "severity_distribution": sev_dist,
            "monthly_trends": monthly_trends[-12:] if monthly_trends else [],
            "high_risk_corridors": high_risk_corridors,
            "traffic_corridors_overview": traffic_overview
        }

    @staticmethod
    def get_detailed_analytics(db: Session) -> dict:
        # 1. Hourly distribution (0-23)
        hourly_data = []
        for h in range(24):
            # Query accidents by hour using strftime
            count = db.query(func.count(Accident.id)).filter(
                func.strftime("%H", Accident.timestamp) == f"{h:02d}"
            ).scalar() or 0
            fat = db.query(func.sum(Accident.fatalities)).filter(
                func.strftime("%H", Accident.timestamp) == f"{h:02d}"
            ).scalar() or 0
            hourly_data.append({
                "hour": f"{h:02d}:00",
                "accidents": count,
                "fatalities": int(fat or 0),
                "is_rush": (8 <= h <= 11) or (17 <= h <= 21)
            })

        # 2. Day of week distribution
        day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        dow_raw = (
            db.query(
                func.strftime("%w", Accident.timestamp).label("dow"),
                func.count(Accident.id).label("count")
            )
            .group_by("dow")
            .all()
        )
        # SQLite %w: 0=Sunday, 1=Monday ... 6=Saturday
        dow_map = {str(i): 0 for i in range(7)}
        for d, c in dow_raw:
            dow_map[str(d)] = c
            
        dow_data = [
            {"day": "Mon", "accidents": dow_map.get("1", 0)},
            {"day": "Tue", "accidents": dow_map.get("2", 0)},
            {"day": "Wed", "accidents": dow_map.get("3", 0)},
            {"day": "Thu", "accidents": dow_map.get("4", 0)},
            {"day": "Fri", "accidents": dow_map.get("5", 0)},
            {"day": "Sat", "accidents": dow_map.get("6", 0)},
            {"day": "Sun", "accidents": dow_map.get("0", 0)},
        ]

        # 3. Weather impact
        weather_raw = (
            db.query(
                Accident.weather_condition,
                func.count(Accident.id).label("count"),
                func.sum(Accident.fatalities).label("fatalities"),
                func.avg(Accident.risk_score).label("avg_risk")
            )
            .group_by(Accident.weather_condition)
            .order_by(desc("count"))
            .all()
        )
        weather_impact = []
        for w, c, fat, r in weather_raw:
            weather_impact.append({
                "weather": w,
                "accidents": c,
                "fatalities": int(fat or 0),
                "avg_risk_score": round(float(r or 50.0), 1)
            })

        # 4. Primary causes
        cause_raw = (
            db.query(
                Accident.primary_cause,
                func.count(Accident.id).label("count"),
                func.sum(Accident.fatalities).label("fatalities")
            )
            .group_by(Accident.primary_cause)
            .order_by(desc("count"))
            .all()
        )
        primary_causes = []
        for cause, c, fat in cause_raw:
            primary_causes.append({
                "cause": cause,
                "accidents": c,
                "fatalities": int(fat or 0)
            })

        # 5. Road types
        road_type_raw = (
            db.query(
                Accident.road_type,
                func.count(Accident.id).label("count"),
                func.avg(Accident.speed_limit).label("avg_speed_limit")
            )
            .group_by(Accident.road_type)
            .order_by(desc("count"))
            .all()
        )
        road_type_dist = [
            {"road_type": rt, "accidents": c, "avg_speed_limit": round(float(sl or 60), 0)}
            for rt, c, sl in road_type_raw
        ]

        # 6. Demographics vs Accidents
        demo_list = db.query(DemographicData).all()
        demo_correlations = []
        for d in demo_list:
            zone_acc = db.query(func.count(Accident.id)).filter(Accident.zone == d.zone).scalar() or 0
            rate_per_100k = round((zone_acc / (d.population / 100000.0)), 1) if d.population else 0
            demo_correlations.append({
                "zone": d.zone,
                "population": d.population,
                "registered_vehicles": d.registered_vehicles,
                "accidents": zone_acc,
                "rate_per_100k_pop": rate_per_100k,
                "transit_accessibility": d.public_transit_accessibility_score
            })

        return {
            "hourly_distribution": hourly_data,
            "day_of_week_distribution": dow_data,
            "weather_impact": weather_impact,
            "primary_causes": primary_causes,
            "road_type_distribution": road_type_dist,
            "demographic_correlations": demo_correlations
        }

    @staticmethod
    def get_diurnal_matrix(db: Session) -> dict:
        """Compute 2D Diurnal-Weekly collision matrix (24 Hours x 7 Days of Week)."""
        days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        day_keys = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        # SQLite strftime('%w'): 0=Sunday, 1=Monday ... 6=Saturday
        sqlite_to_mon_first = {"1": 0, "2": 1, "3": 2, "4": 3, "5": 4, "6": 5, "0": 6}

        matrix = [[0 for _ in range(24)] for _ in range(7)]
        
        # Query grouped counts by day of week and hour
        rows = (
            db.query(
                func.strftime("%w", Accident.timestamp).label("dow"),
                func.strftime("%H", Accident.timestamp).label("hour"),
                func.count(Accident.id).label("count")
            )
            .group_by("dow", "hour")
            .all()
        )

        max_val = 1
        peak_cell = {"day": "Friday", "hour": "19:00", "count": 0}

        for dow_str, hr_str, cnt in rows:
            if dow_str in sqlite_to_mon_first and hr_str is not None:
                d_idx = sqlite_to_mon_first[dow_str]
                h_idx = int(hr_str)
                matrix[d_idx][h_idx] = cnt
                if cnt > max_val:
                    max_val = cnt
                    peak_cell = {"day": days[d_idx], "hour": f"{h_idx:02d}:00", "count": cnt}

        # Format matrix response for heatmaps
        formatted_rows = []
        for d_idx, day_name in enumerate(days):
            row_data = {
                "day": day_name,
                "short_day": day_keys[d_idx],
                "hours": matrix[d_idx],
                "day_total": sum(matrix[d_idx])
            }
            formatted_rows.append(row_data)

        return {
            "days": days,
            "short_days": day_keys,
            "hours": [f"{h:02d}:00" for h in range(24)],
            "matrix": formatted_rows,
            "max_cell_count": max_val,
            "peak_risk_window": peak_cell,
            "safest_window": {"time": "03:00 - 05:00 AM", "description": "Lowest citywide traffic volume and collision rate"}
        }

    @staticmethod
    def get_historical_trends(db: Session) -> dict:
        """Compute multi-year collision volume and monthly trajectory."""
        yearly_raw = (
            db.query(
                func.strftime("%Y", Accident.timestamp).label("year"),
                func.count(Accident.id).label("total"),
                func.sum(Accident.fatalities).label("fatalities"),
                func.sum(Accident.casualties).label("casualties")
            )
            .group_by("year")
            .order_by("year")
            .all()
        )
        yearly_trends = [
            {"year": str(y), "total_accidents": t, "fatalities": int(f or 0), "casualties": int(c or 0)}
            for y, t, f, c in yearly_raw
        ]

        monthly_raw = (
            db.query(
                func.strftime("%Y-%m", Accident.timestamp).label("month"),
                Accident.severity,
                func.count(Accident.id).label("count")
            )
            .group_by("month", Accident.severity)
            .order_by("month")
            .all()
        )
        months_dict = {}
        for m, sev, cnt in monthly_raw:
            if m not in months_dict:
                months_dict[m] = {"month": m, "Slight": 0, "Serious": 0, "Fatal": 0, "total": 0}
            months_dict[m][sev] = cnt
            months_dict[m]["total"] += cnt

        return {
            "yearly_trends": yearly_trends,
            "monthly_severity_trends": list(months_dict.values())
        }

