from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database.session import engine, Base
from app.database import models
from app.api import (
    dashboard,
    accidents,
    predictions,
    traffic,
    analytics,
    datasets,
    models_meta,
    health
)

# Ensure all database schema tables exist on initialization
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Smart City Traffic Prediction & Road Accident Hotspot Intelligence System REST API",
    version="2.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if settings.CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all route groups under /api
app.include_router(health.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(accidents.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(traffic.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(datasets.router, prefix="/api")
app.include_router(models_meta.router, prefix="/api")

@app.get("/")
def root():
    return {
        "platform": settings.PROJECT_NAME,
        "version": "2.1.0",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.BACKEND_HOST, port=settings.BACKEND_PORT, reload=True)
