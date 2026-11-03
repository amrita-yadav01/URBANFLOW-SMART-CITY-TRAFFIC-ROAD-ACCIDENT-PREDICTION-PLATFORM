from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/datasets", tags=["Dataset Management"])

@router.get("")
def list_datasets(db: Session = Depends(get_db)):
    """List all registered urban datasets and ingestion states."""
    datasets = DatasetService.get_all(db)
    return {
        "count": len(datasets),
        "datasets": datasets
    }

@router.get("/{dataset_id}/preview")
def get_dataset_preview(dataset_id: int, db: Session = Depends(get_db)):
    """Inspect schema, null counts, duplicate counts, bounding box, and preview rows."""
    preview = DatasetService.get_preview(dataset_id, db)
    if "error" in preview:
        raise HTTPException(status_code=404, detail=preview["error"])
    return preview

@router.post("/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    dataset_type: str = Form("Accidents"),
    db: Session = Depends(get_db)
):
    """Upload, parse, validate, and compute data quality metrics on a CSV dataset."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        result = DatasetService.process_uploaded_csv(
            filename=file.filename,
            content=content,
            dataset_type=dataset_type,
            db=db
        )
        return {
            "success": True,
            "message": f"Successfully ingested {file.filename}",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process dataset: {str(e)}")

