import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database import engine, Base
from src.models import Word, Flashcard, Progress, Quiz
from src.api.words import router as words_router
from src.api.flashcards import router as flashcards_router
from src.api.quiz import router as quiz_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="German Language Learning API",
    description="API for learning German with vocabulary, flashcards, and quizzes",
    version="0.1.0"
)

# Include routers
app.include_router(words_router)
app.include_router(flashcards_router)
app.include_router(quiz_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup
@app.on_event("startup")
def startup():
    try:
        # Only create tables if not in test mode
        if os.getenv("ENV", "development") != "test":
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": "German Language Learning API"}
    """Root endpoint"""
    return {"message": "German Language Learning API"}


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions"""
    logger.error(f"ValueError: {exc}")
    return {"detail": str(exc)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
