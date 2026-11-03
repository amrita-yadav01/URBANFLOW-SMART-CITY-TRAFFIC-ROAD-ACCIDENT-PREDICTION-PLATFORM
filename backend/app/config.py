import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Base paths - Canonical project root
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / ".env")

# Canonical absolute database path
DEFAULT_DB_FILE = (BASE_DIR / "urbanflow.db").resolve()

def get_database_url() -> str:
    env_url = os.getenv("DATABASE_URL", "")
    if not env_url or env_url.startswith("sqlite:///.") or env_url == "sqlite:///urbanflow.db":
        # Always resolve relative sqlite paths to canonical root database
        return f"sqlite:///{DEFAULT_DB_FILE.as_posix()}"
    return env_url

def get_models_dir() -> Path:
    env_dir = os.getenv("ML_MODELS_DIR", "")
    if env_dir and not env_dir.startswith("."):
        return Path(env_dir)
    return (BASE_DIR / "ml_models").resolve()

def get_datasets_dir() -> Path:
    env_dir = os.getenv("DATASETS_DIR", "")
    if env_dir and not env_dir.startswith("."):
        return Path(env_dir)
    return (BASE_DIR / "datasets" / "sample").resolve()

class Settings(BaseModel):
    PROJECT_NAME: str = os.getenv("PROJECT_NAME", "UrbanFlow - Smart City Traffic & Accident Intelligence")
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")

    DATABASE_URL: str = get_database_url()

    BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", 8000))
    FRONTEND_PORT: int = int(os.getenv("FRONTEND_PORT", 5173))

    CORS_ORIGINS: list[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")
        if origin.strip()
    ]

    DEFAULT_REGION: str = os.getenv("DEFAULT_REGION", "Maharashtra Statewide GIS (Demo: Mumbai MMR)")
    DEFAULT_LATITUDE: float = float(os.getenv("DEFAULT_LATITUDE", 19.7515))
    DEFAULT_LONGITUDE: float = float(os.getenv("DEFAULT_LONGITUDE", 75.7139))
    DEFAULT_ZOOM: int = int(os.getenv("DEFAULT_ZOOM", 7))

    ML_MODELS_DIR: Path = get_models_dir()
    DATASETS_DIR: Path = get_datasets_dir()

settings = Settings()
