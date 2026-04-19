import logging
import random
import json
from dataclasses import dataclass
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from src.models import Quiz, Progress, Word
from src.models.models import QuizSession

logger = logging.getLogger(__name__)


@dataclass
class QuizQuestion:
    """Represents a single quiz question with multiple-choice options"""
    id: str
    vocabulary_id: int
    question: str
    german_word: str
    english_meaning: str
    options: List[str]
    correct_answer_index: int


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
    
    # ============= Multiple-Choice Quiz Methods =============
    
    MINIMUM_VOCABULARY_COUNT = 4
    
    @staticmethod
    def validate_quiz_prerequisites(db: Session) -> bool:
        """Check if user has minimum vocabulary to generate quiz"""
        vocab_count = db.query(Word).count()
        return vocab_count >= QuizService.MINIMUM_VOCABULARY_COUNT
    
    @staticmethod
    def get_vocabulary_count(db: Session) -> int:
        """Get total vocabulary count"""
        return db.query(Word).count()
    
    @staticmethod
    def generate_quiz(db: Session, num_questions: int) -> Tuple[str, List[QuizQuestion]]:
        """
        Generate a quiz with multiple-choice questions.
        
        Args:
            db: Database session
            num_questions: Number of questions to generate (1-20)
        
        Returns:
            Tuple of (quiz_id, list of QuizQuestion objects)
        
        Raises:
            ValueError: If insufficient vocabulary or invalid number of questions
        """
        # Validate input
        if num_questions < 1 or num_questions > 20:
            raise ValueError("Number of questions must be between 1 and 20")
        
        # Check prerequisites
        vocab_count = QuizService.get_vocabulary_count(db)
        if vocab_count < QuizService.MINIMUM_VOCABULARY_COUNT:
            raise ValueError(
                f"Insufficient vocabulary. Need at least {QuizService.MINIMUM_VOCABULARY_COUNT} "
                f"vocabulary entries to generate quiz. Current: {vocab_count}"
            )
        
        # Get all vocabulary entries
        all_vocab = db.query(Word).all()
        
        # Generate questions
        questions: List[QuizQuestion] = []
        used_vocab_ids = set()
        
        for q_idx in range(num_questions):
            try:
                # Select a random vocabulary entry as the correct answer
                available_vocab = [v for v in all_vocab if v.id not in used_vocab_ids]
                if not available_vocab and len(used_vocab_ids) < len(all_vocab):
                    used_vocab_ids = set()
                    available_vocab = all_vocab
                
                correct_vocab = random.choice(available_vocab)
                used_vocab_ids.add(correct_vocab.id)
                
                # Select 3 random distractors (different from correct answer)
                distractor_vocab = random.sample(
                    [v for v in all_vocab if v.id != correct_vocab.id],
                    min(3, len(all_vocab) - 1)
                )
                
                # Create options list with correct answer and distractors
                all_options = [correct_vocab.meaning] + [v.meaning for v in distractor_vocab]
                
                # Shuffle options and find correct answer index
                shuffled_options = all_options.copy()
                random.shuffle(shuffled_options)
                correct_answer_index = shuffled_options.index(correct_vocab.meaning)
                
                # Create question object
                question = QuizQuestion(
                    id=f"q_{q_idx + 1}",
                    vocabulary_id=correct_vocab.id,
                    question=f"What is the English meaning of: {correct_vocab.german_word}?",
                    german_word=correct_vocab.german_word,
                    english_meaning=correct_vocab.meaning,
                    options=shuffled_options,
                    correct_answer_index=correct_answer_index
                )
                questions.append(question)
                
            except (IndexError, ValueError) as e:
                if q_idx == 0:
                    raise ValueError("Unable to generate quiz with current vocabulary")
                break
        
        # Generate quiz session ID
        quiz_id = f"quiz_{len(questions)}q_{int(random.random() * 1000000)}"
        
        return quiz_id, questions
    
    @staticmethod
    def create_quiz_session(
        db: Session,
        user_id: int,
        vocabulary_ids: List[int],
        score: int,
        total_questions: int,
        answers_json: str,
        duration_seconds: Optional[int] = None
    ) -> QuizSession:
        """
        Create a quiz session record in database.
        
        Args:
            db: Database session
            user_id: User ID
            vocabulary_ids: List of vocabulary IDs used in quiz
            score: Number of correct answers
            total_questions: Total questions in quiz
            answers_json: JSON string of answer records
            duration_seconds: Optional duration of quiz
        
        Returns:
            QuizSession object
        """
        quiz_session = QuizSession(
            user_id=user_id,
            vocabulary_ids=json.dumps(vocabulary_ids),
            score=score,
            total_questions=total_questions,
            answers_json=answers_json,
            duration_seconds=duration_seconds
        )
        db.add(quiz_session)
        db.commit()
        db.refresh(quiz_session)
        logger.info(f"Created quiz session {quiz_session.id}: {score}/{total_questions}")
        return quiz_session
    
    @staticmethod
    def get_quiz_history(db: Session, user_id: int, skip: int = 0, limit: int = 10) -> List[QuizSession]:
        """
        Get paginated quiz history for a user.
        
        Args:
            db: Database session
            user_id: User ID
            skip: Number of records to skip
            limit: Maximum number of records to return
        
        Returns:
            List of QuizSession objects
        """
        return db.query(QuizSession).filter(
            QuizSession.user_id == user_id
        ).order_by(
            QuizSession.created_at.desc()
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_quiz_statistics(db: Session, user_id: int) -> Dict:
        """
        Get quiz statistics for a user.
        
        Args:
            db: Database session
            user_id: User ID
        
        Returns:
            Dictionary with quiz statistics
        """
        quiz_sessions = db.query(QuizSession).filter(
            QuizSession.user_id == user_id
        ).all()
        
        if not quiz_sessions:
            return {
                "total_quizzes": 0,
                "average_score": 0,
                "best_score": 0,
                "worst_score": 0,
                "current_streak": 0
            }
        
        scores = [
            (q.score / q.total_questions * 100) if q.total_questions > 0 else 0
            for q in quiz_sessions
        ]
        
        return {
            "total_quizzes": len(quiz_sessions),
            "average_score": round(sum(scores) / len(scores), 2) if scores else 0,
            "best_score": max(scores),
            "worst_score": min(scores),
            "current_streak": 1
        }
