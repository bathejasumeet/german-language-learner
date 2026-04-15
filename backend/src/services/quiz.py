import logging
from sqlalchemy.orm import Session
from src.models import Quiz, Progress, Word

logger = logging.getLogger(__name__)


class QuizService:
    """Service for managing quiz and progress operations"""
    
    @staticmethod
    def create_quiz(db: Session, total_questions: int = 10) -> Quiz:
        """Create a new quiz session"""
        quiz = Quiz(total_questions=total_questions)
        db.add(quiz)
        db.commit()
        db.refresh(quiz)
        logger.info(f"Created quiz session {quiz.id} with {total_questions} questions")
        return quiz
    
    @staticmethod
    def submit_quiz_result(db: Session, quiz_id: int, correct_answers: int) -> Quiz | None:
        """Submit quiz results and calculate score"""
        quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
        if not quiz:
            return None
        
        quiz.correct_answers = correct_answers
        quiz.score = (correct_answers / quiz.total_questions) * 100 if quiz.total_questions > 0 else 0
        
        db.commit()
        db.refresh(quiz)
        logger.info(f"Submitted quiz {quiz_id}: {correct_answers}/{quiz.total_questions}, Score: {quiz.score}%")
        return quiz
    
    @staticmethod
    def get_quiz(db: Session, quiz_id: int) -> Quiz | None:
        """Get a specific quiz session"""
        return db.query(Quiz).filter(Quiz.id == quiz_id).first()
    
    @staticmethod
    def get_all_quizzes(db: Session, skip: int = 0, limit: int = 100) -> list:
        """Get all quiz sessions with pagination"""
        return db.query(Quiz).offset(skip).limit(limit).all()
    
    @staticmethod
    def record_word_progress(db: Session, word_id: int, correct: bool) -> Progress | None:
        """Record progress for a word"""
        progress = db.query(Progress).filter(Progress.word_id == word_id).first()
        
        if not progress:
            progress = Progress(word_id=word_id)
            db.add(progress)
        
        progress.times_reviewed += 1
        if correct:
            progress.correct_answers += 1
        else:
            progress.incorrect_answers += 1
        
        from datetime import datetime
        progress.last_reviewed = datetime.utcnow()
        
        db.commit()
        db.refresh(progress)
        logger.info(f"Updated progress for word {word_id}: {progress.correct_answers} correct, {progress.incorrect_answers} incorrect")
        return progress
    
    @staticmethod
    def get_word_progress(db: Session, word_id: int) -> Progress | None:
        """Get progress for a specific word"""
        return db.query(Progress).filter(Progress.word_id == word_id).first()
    
    @staticmethod
    def get_user_statistics(db: Session) -> dict:
        """Get overall user statistics"""
        total_words = db.query(Word).count()
        quizzes = db.query(Quiz).all()
        total_quizzes = len(quizzes)
        avg_score = sum(q.score for q in quizzes) / total_quizzes if total_quizzes > 0 else 0
        
        total_progress = db.query(Progress).all()
        total_reviews = sum(p.times_reviewed for p in total_progress)
        total_correct = sum(p.correct_answers for p in total_progress)
        overall_accuracy = (total_correct / total_reviews * 100) if total_reviews > 0 else 0
        
        return {
            "total_words": total_words,
            "total_quizzes": total_quizzes,
            "average_quiz_score": round(avg_score, 2),
            "total_reviews": total_reviews,
            "overall_accuracy": round(overall_accuracy, 2),
        }
