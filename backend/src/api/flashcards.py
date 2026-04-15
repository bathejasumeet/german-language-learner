import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas_extended import Flashcard, FlashcardCreate, Quiz, QuizResult, Progress, UserStatistics
from src.services.flashcards import FlashcardService
from src.services.quiz import QuizService

router = APIRouter(prefix="/api/v1/flashcards", tags=["flashcards"])
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=List[Flashcard], status_code=status.HTTP_201_CREATED)
async def generate_flashcards(word_ids: List[int], db: Session = Depends(get_db)):
    """Generate flashcards from selected words"""
    try:
        flashcards = FlashcardService.generate_flashcards(db, word_ids)
        logger.info(f"Generated {len(flashcards)} flashcards")
        return flashcards
    except Exception as e:
        logger.error(f"Error generating flashcards: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/", response_model=List[Flashcard])
async def get_flashcards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all flashcards with pagination"""
    flashcards = FlashcardService.get_all_flashcards(db, skip=skip, limit=limit)
    return flashcards


@router.get("/{flashcard_id}", response_model=Flashcard)
async def get_flashcard(flashcard_id: int, db: Session = Depends(get_db)):
    """Get a specific flashcard"""
    flashcard = FlashcardService.get_flashcard(db, flashcard_id)
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found"
        )
    return flashcard


@router.post("/{flashcard_id}/known", response_model=Flashcard)
async def mark_flashcard_known(flashcard_id: int, db: Session = Depends(get_db)):
    """Mark a flashcard as known"""
    flashcard = FlashcardService.mark_flashcard_known(db, flashcard_id)
    if not flashcard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found"
        )
    return flashcard


@router.delete("/{flashcard_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_flashcard(flashcard_id: int, db: Session = Depends(get_db)):
    """Delete a flashcard"""
    if not FlashcardService.delete_flashcard(db, flashcard_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Flashcard not found"
        )
