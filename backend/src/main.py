import logging
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.config import settings
import src.csv_store as csv_store
from src.api.words import router as words_router
from src.api.flashcards import router as flashcards_router
from src.api.quiz import router as quiz_router
from src.api.rosetta import router as rosetta_router

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
app.include_router(rosetta_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    data_dir = Path(settings.DATA_DIR)
    csv_store._init_stores(data_dir)
    logger.info(f"CSV data stores initialised at {data_dir.resolve()}")


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {"message": "German Language Learning API"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
