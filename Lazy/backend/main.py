"""
Lazy - AI-Powered Executive Function Companion
FastAPI Backend - Main Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.api.routes import process_voice, process_text, tasks, proactive
from app.core.config import settings
from app.db.database import init_db, close_db

# Initialize FastAPI app
app = FastAPI(
    title="Lazy API",
    description="AI-Powered Executive Function Companion Backend",
    version="0.1.0",
)

# CORS middleware - allow mobile app to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(process_voice.router, prefix="/api/v1", tags=["voice"])
app.include_router(process_text.router, prefix="/api/v1", tags=["text"])
app.include_router(tasks.router, prefix="/api/v1", tags=["tasks"])
app.include_router(proactive.router, prefix="/api/v1", tags=["proactive"])


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    await init_db()


@app.on_event("shutdown")
async def shutdown_event():
    """Close database connections on shutdown"""
    await close_db()


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Lazy API",
        "version": "0.1.0"
    }


@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Lazy API"
    }


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )

