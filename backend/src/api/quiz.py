import logging
from typing import List, Optional
import json
from fastapi import APIRouter, HTTPException, status, Query

from src.schemas_extended import (
    Quiz, QuizCreate, QuizResult, Progress, UserStatistics,
    QuizGenerateResponse,
    QuizAnswerSubmission,
    QuizAnswerFeedback,
    QuizScoreResponse,
    QuizSession as QuizSessionSchema
)
from src.services.quiz import QuizService

router = APIRouter(prefix="/api/v1/quiz", tags=["quiz"])
logger = logging.getLogger(__name__)


@router.post("/", response_model=Quiz, status_code=status.HTTP_201_CREATED)
async def create_quiz(quiz: QuizCreate):
    """Create a new quiz session"""
    try:
        created_quiz = QuizService.create_quiz(quiz.total_questions)
        return created_quiz
    except Exception as e:
        logger.error(f"Error creating quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.get("/", response_model=List[Quiz])
async def get_quizzes(skip: int = 0, limit: int = 100):
    """Get all quiz sessions with pagination"""
    return QuizService.get_all_quizzes(skip=skip, limit=limit)


@router.get("/{quiz_id}", response_model=Quiz)
async def get_quiz(quiz_id: int):
    """Get a specific quiz session"""
    quiz = QuizService.get_quiz(quiz_id)
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found"
        )
    return quiz


@router.post("/{quiz_id}/submit", response_model=Quiz)
async def submit_quiz(quiz_id: int, result: QuizResult):
    """Submit quiz results"""
    try:
        quiz = QuizService.submit_quiz_result(quiz_id, result.correct_answers)
        if not quiz:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Quiz not found"
            )
        logger.info(f"Submitted quiz {quiz_id} with score {quiz['score']}%")
        return quiz
    except Exception as e:
        logger.error(f"Error submitting quiz: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )


@router.post("/progress/{word_id}", response_model=Progress)
async def record_word_progress(word_id: int, correct: bool):
    """Record progress for a word"""
    try:
        progress = QuizService.record_word_progress(word_id, correct)
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
async def get_word_progress(word_id: int):
    """Get progress for a specific word"""
    progress = QuizService.get_word_progress(word_id)
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Progress not found"
        )
    return progress


@router.get("/stats/overall", response_model=UserStatistics)
async def get_user_statistics():
    """Get overall user statistics"""
    return QuizService.get_user_statistics()


# ============= Multiple-Choice Quiz Endpoints =============

@router.post("/generate", response_model=QuizGenerateResponse, status_code=status.HTTP_201_CREATED)
async def generate_quiz(
    count: int = Query(10, ge=1, le=20),
):
    """
    Generate a new multiple-choice quiz with specified number of questions.
    """
    try:
        if not QuizService.validate_quiz_prerequisites():
            vocab_count = QuizService.get_vocabulary_count()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Insufficient vocabulary. Need at least 4 entries to generate quiz. Current: {vocab_count}"
            )

        quiz_id, questions = QuizService.generate_quiz(count)
        
        # Convert QuizQuestion dataclass objects to dict for response
        questions_data = [
            {
                "id": q.id,
                "vocabulary_id": q.vocabulary_id,
                "question": q.question,
                "german_word": q.german_word,
                "english_meaning": q.english_meaning,
                "options": q.options,
                "correct_answer_index": q.correct_answer_index
            }
            for q in questions
        ]
        
        logger.info(f"Generated quiz {quiz_id} with {len(questions)} questions")
        
        return {
            "quiz_id": quiz_id,
            "total_questions": len(questions),
            "questions": questions_data
        }
        
    except ValueError as e:
        logger.error(f"Quiz generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/submit", response_model=QuizAnswerFeedback)
async def submit_quiz_answer(
    submission: QuizAnswerSubmission,
):
    """
    Submit an answer to a quiz question and get feedback.
    
    Args:
        submission: Quiz submission with quiz_id, question_id, selected_option_index
        db: Database session
    
    Returns:
        Feedback: is_correct, correct_answer_index, and explanation
    """
    try:
        # Validate option index range (T051)
        if not 0 <= submission.selected_option_index <= 3:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid option index. Must be 0-3"
            )
        
        # For now, return a placeholder feedback
        # In a real implementation, you'd store and verify against actual question data
        return {
            "is_correct": True,
            "correct_answer_index": submission.selected_option_index,
            "correct_answer": "Correct answer text",
            "explanation": None
        }
        
    except ValueError as e:
        logger.error(f"Answer submission error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/complete", response_model=QuizScoreResponse)
async def complete_quiz(
    quiz_data: dict,
    user_id: int = Query(1),
):
    """
    Complete a quiz and persist results.
    
    Args:
        quiz_data: Dictionary with quiz_id, score, total_questions, vocabulary_ids, results
        user_id: User ID
        db: Database session
    
    Returns:
        Final quiz score and statistics
    """
    try:
        quiz_id = quiz_data.get("quiz_id")
        score = quiz_data.get("score", 0)
        total_questions = quiz_data.get("total_questions", 0)
        vocabulary_ids = quiz_data.get("vocabulary_ids", [])
        results = quiz_data.get("results", [])
        duration_seconds = quiz_data.get("duration_seconds")
        
        # Validate scores
        if not 0 <= score <= total_questions or total_questions == 0:
            raise ValueError("Invalid score or total_questions")
        
        quiz_session = QuizService.create_quiz_session(
            user_id=user_id,
            vocabulary_ids=vocabulary_ids,
            score=score,
            total_questions=total_questions,
            answers_json=json.dumps(results),
            duration_seconds=duration_seconds
        )

        percentage = (score / total_questions * 100) if total_questions > 0 else 0
        statistics = QuizService.get_quiz_statistics(user_id)
        
        logger.info(f"Completed quiz {quiz_id}: {score}/{total_questions} ({percentage:.1f}%)")
        
        return {
            "quiz_id": quiz_id,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "duration_seconds": duration_seconds,
            "results": results,
            "statistics": statistics
        }
        
    except ValueError as e:
        logger.error(f"Quiz completion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/history", response_model=List[QuizSessionSchema])
async def get_quiz_history(
    user_id: int = Query(1),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
):
    """
    Get paginated quiz history for a user.
    
    Args:
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum records to return
        db: Database session
    
    Returns:
        List of quiz sessions
    """
    try:
        quiz_history = QuizService.get_quiz_history(user_id, skip, limit)
        logger.info(f"Retrieved quiz history for user {user_id}: {len(quiz_history)} sessions")
        return quiz_history
        
    except Exception as e:
        logger.error(f"Error retrieving quiz history: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve quiz history"
        )


@router.get("/statistics")
async def get_quiz_statistics_endpoint(
    user_id: int = Query(1),
):
    """
    Get quiz statistics for a user.
    
    Args:
        user_id: User ID
        db: Database session
    
    Returns:
        Statistics including total quizzes, average score, etc.
    """
    try:
        statistics = QuizService.get_quiz_statistics(user_id)
        logger.info(f"Retrieved quiz statistics for user {user_id}")
        return statistics
        
    except Exception as e:
        logger.error(f"Error retrieving statistics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve statistics"
        )
