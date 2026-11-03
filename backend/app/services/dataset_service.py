import io
import pandas as pd
from sqlalchemy.orm import Session
from app.database.models import DatasetRecord
from app.config import settings

class DatasetService:
    @staticmethod
    def get_all(db: Session) -> list[DatasetRecord]:
        return db.query(DatasetRecord).order_by(DatasetRecord.uploaded_at.desc()).all()

    @staticmethod
    def get_preview(dataset_id: int, db: Session) -> dict:
        rec = db.query(DatasetRecord).filter(DatasetRecord.id == dataset_id).first()
        if not rec:
            return {"error": "Dataset record not found"}

        file_path = rec.file_path
        try:
            df = pd.read_csv(file_path)
        except Exception as e:
            return {"error": f"Failed to load dataset file: {str(e)}"}

        # Compute column-level schema info
        schema_info = []
        for col in df.columns:
            null_count = int(df[col].isnull().sum())
            null_pct = round((null_count / len(df)) * 100, 2) if len(df) > 0 else 0.0
            schema_info.append({
                "column_name": col,
                "data_type": str(df[col].dtype),
                "non_null_count": int(df[col].notnull().sum()),
                "null_count": null_count,
                "null_pct": null_pct,
                "sample_value": str(df[col].dropna().iloc[0]) if not df[col].dropna().empty else None
            })

        # Spatial Bounding Box Check if lat/long columns exist
        lat_cols = [c for c in df.columns if c.lower() in ["latitude", "lat", "y"]]
        lon_cols = [c for c in df.columns if c.lower() in ["longitude", "lon", "lng", "long", "x"]]
        spatial_analysis = None

        if lat_cols and lon_cols:
            lat_c = lat_cols[0]
            lon_c = lon_cols[0]
            valid_coords = df[[lat_c, lon_c]].dropna()
            if not valid_coords.empty:
                min_lat = float(valid_coords[lat_c].min())
                max_lat = float(valid_coords[lat_c].max())
                min_lon = float(valid_coords[lon_c].min())
                max_lon = float(valid_coords[lon_c].max())

                # Maharashtra Envelope: lat [15.6, 22.1], lon [72.6, 80.9]
                in_maha = bool(15.6 <= min_lat and max_lat <= 22.1 and 72.6 <= min_lon and max_lon <= 80.9)
                # Mumbai MMR Envelope: lat [18.8, 19.5], lon [72.7, 73.2]
                in_mumbai = bool(18.8 <= min_lat and max_lat <= 19.5 and 72.7 <= min_lon and max_lon <= 73.2)

                spatial_analysis = {
                    "has_spatial_coordinates": True,
                    "crs": "EPSG:4326 (WGS 84)",
                    "latitude_column": lat_c,
                    "longitude_column": lon_c,
                    "bounding_box": {
                        "min_latitude": round(min_lat, 4),
                        "max_latitude": round(max_lat, 4),
                        "min_longitude": round(min_lon, 4),
                        "max_longitude": round(max_lon, 4)
                    },
                    "within_maharashtra_envelope": in_maha,
                    "within_mumbai_mmr": in_mumbai,
                    "spatial_extent_label": "Mumbai Metropolitan Region (MMR)" if in_mumbai else "Statewide Maharashtra" if in_maha else "Outside Maharashtra GIS Scope"
                }

        preview_rows = df.head(10).to_dict(orient="records")

        return {
            "dataset_id": rec.id,
            "name": rec.name,
            "dataset_type": rec.dataset_type,
            "row_count": len(df),
            "column_count": len(df.columns),
            "duplicates_count": int(df.duplicated().sum()),
            "total_missing_values": int(df.isnull().sum().sum()),
            "schema": schema_info,
            "spatial_analysis": spatial_analysis,
            "preview_rows": preview_rows,
            "file_size_bytes": rec.file_size_bytes,
            "uploaded_at": str(rec.uploaded_at) if rec.uploaded_at else ""
        }

    @staticmethod
    def process_uploaded_csv(
        filename: str,
        content: bytes,
        dataset_type: str,
        db: Session
    ) -> dict:
        settings.DATASETS_DIR.mkdir(parents=True, exist_ok=True)
        dest_path = settings.DATASETS_DIR / filename
        
        with open(dest_path, "wb") as f:
            f.write(content)

        # Parse with pandas
        df = pd.read_csv(io.BytesIO(content))
        row_count = len(df)
        cols = list(df.columns)
        missing_count = int(df.isnull().sum().sum())
        duplicates_count = int(df.duplicated().sum())

        # Check required schema according to dataset_type
        validation_status = "Processed"
        validation_notes = []
        if dataset_type.lower() == "accidents":
            expected = ["latitude", "longitude", "severity"]
            missing_cols = [c for c in expected if c not in [col.lower() for col in cols]]
            if missing_cols:
                validation_status = "Warning"
                validation_notes.append(f"Missing recommended columns: {missing_cols}")
        elif dataset_type.lower() == "traffic":
            expected = ["congestion_index", "average_speed_kmh"]
            missing_cols = [c for c in expected if c not in [col.lower() for col in cols]]
            if missing_cols:
                validation_status = "Warning"
                validation_notes.append(f"Missing recommended traffic columns: {missing_cols}")

        summary = f"Uploaded {filename}. Columns: {len(cols)}. Duplicates: {duplicates_count}. Missing values: {missing_count}."
        if validation_notes:
            summary += " Notes: " + " ".join(validation_notes)

        # Save record in db
        rec = DatasetRecord(
            name=filename,
            dataset_type=dataset_type.capitalize(),
            file_path=str(dest_path),
            row_count=row_count,
            file_size_bytes=len(content),
            status=validation_status,
            missing_values_count=missing_count,
            duplicates_count=duplicates_count,
            summary=summary
        )
        db.add(rec)
        db.commit()
        db.refresh(rec)

        preview_rows = df.head(5).to_dict(orient="records")

        return {
            "id": rec.id,
            "filename": filename,
            "status": validation_status,
            "row_count": row_count,
            "columns": cols,
            "missing_values": missing_count,
            "duplicates": duplicates_count,
            "preview": preview_rows,
            "summary": summary
        }

