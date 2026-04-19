import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas import Word, WordCreate, WordUpdate
from src.services.vocabulary import VocabularyService

router = APIRouter(prefix="/api/v1/words", tags=["words"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=Word, status_code=status.HTTP_201_CREATED)
async def create_word(word: WordCreate, db: Session = Depends(get_db)):
    """Create a new word in the vocabulary"""
    try:
        created_word = VocabularyService.create_word(
            db, word.german_word, word.meaning, word.example_sentence
        )
        logger.info(f"Created word: {word.german_word}")
        return created_word
    except ValueError as e:
        logger.error(f"Error creating word: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/", response_model=List[Word])
async def get_words(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all words with pagination"""
    words = VocabularyService.get_all_words(db, skip=skip, limit=limit)
    return words


@router.get("/{word_id}", response_model=Word)
async def get_word(word_id: int, db: Session = Depends(get_db)):
    """Get a specific word by ID"""
    word = VocabularyService.get_word(db, word_id)
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Word not found"
        )
    return word


@router.put("/{word_id}", response_model=Word)
async def update_word(word_id: int, word: WordUpdate, db: Session = Depends(get_db)):
    """Update a word"""
    updated_word = VocabularyService.update_word(
        db, word_id, word.german_word, word.meaning, word.example_sentence
    )
    if not updated_word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Word not found"
        )
    logger.info(f"Updated word: {word_id}")
    return updated_word


@router.delete("/{word_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_word(word_id: int, db: Session = Depends(get_db)):
    """Delete a word"""
    if not VocabularyService.delete_word(db, word_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Word not found"
        )
    logger.info(f"Deleted word: {word_id}")
