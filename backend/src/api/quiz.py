import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas_extended import Quiz, QuizCreate, QuizResult, Progress, UserStatistics
from src.services.quiz import QuizService

router = APIRouter(prefix="/api/v1/quiz", tags=["quiz"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=Quiz, status_code=status.HTTP_201_CREATED)
async def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db)):
    """Create a new quiz session"""
    try:
        created_quiz = QuizService.create_quiz(db, quiz.total_questions)
        return created_quiz
    except Exception as e:
        logger.error(f"Error creating quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/", response_model=List[Quiz])
async def get_quizzes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all quiz sessions with pagination"""
    quizzes = QuizService.get_all_quizzes(db, skip=skip, limit=limit)
    return quizzes


@router.get("/{quiz_id}", response_model=Quiz)
async def get_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Get a specific quiz session"""
    quiz = QuizService.get_quiz(db, quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found"
        )
    return quiz


@router.post("/{quiz_id}/submit", response_model=Quiz)
async def submit_quiz(quiz_id: int, result: QuizResult, db: Session = Depends(get_db)):
    """Submit quiz results"""
    try:
        quiz = QuizService.submit_quiz_result(db, quiz_id, result.correct_answers)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found"
            )
        logger.info(f"Submitted quiz {quiz_id} with score {quiz.score}%")
        return quiz
    except Exception as e:
        logger.error(f"Error submitting quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.post("/progress/{word_id}", response_model=Progress)
async def record_word_progress(word_id: int, correct: bool, db: Session = Depends(get_db)):
    """Record progress for a word"""
    try:
        progress = QuizService.record_word_progress(db, word_id, correct)
        if not progress:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Word not found"
            )
        return progress
    except Exception as e:
        logger.error(f"Error recording progress: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/progress/{word_id}", response_model=Progress)
async def get_word_progress(word_id: int, db: Session = Depends(get_db)):
    """Get progress for a specific word"""
    progress = QuizService.get_word_progress(db, word_id)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Progress not found"
        )
    return progress


@router.get("/stats/overall", response_model=UserStatistics)
async def get_user_statistics(db: Session = Depends(get_db)):
    """Get overall user statistics"""
    stats = QuizService.get_user_statistics(db)
    return stats
