import logging
import random
import json
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import List, Dict, Optional, Tuple
import src.csv_store as csv_store

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
    def create_quiz(total_questions: int = 10) -> dict:
        """Create a new quiz session"""
        quiz = csv_store.quizzes_store.insert({
            "created_at": datetime.now(timezone.utc).isoformat(),
            "total_questions": total_questions,
            "correct_answers": 0,
            "score": 0.0,
        })
        logger.info(f"Created quiz session {quiz['id']} with {total_questions} questions")
        return quiz

    @staticmethod
    def submit_quiz_result(quiz_id: int, correct_answers: int) -> dict | None:
        """Submit quiz results and calculate score"""
        quiz = csv_store.quizzes_store.get(quiz_id)
        if not quiz:
            return None

        score = (correct_answers / quiz["total_questions"]) * 100 if quiz["total_questions"] > 0 else 0
        updated = csv_store.quizzes_store.update(quiz_id, correct_answers=correct_answers, score=round(score, 2))
        logger.info(f"Submitted quiz {quiz_id}: {correct_answers}/{quiz['total_questions']}, Score: {score}%")
        return updated

    @staticmethod
    def get_quiz(quiz_id: int) -> dict | None:
        """Get a specific quiz session"""
        return csv_store.quizzes_store.get(quiz_id)
    
    @staticmethod
    def get_all_quizzes(skip: int = 0, limit: int = 100) -> list:
        """Get all quiz sessions with pagination"""
        return csv_store.quizzes_store.all()[skip: skip + limit]

    @staticmethod
    def record_word_progress(word_id: int, correct: bool) -> dict | None:
        """Record progress for a word"""
        existing = csv_store.progress_store.where(word_id=word_id)
        now = datetime.now(timezone.utc).isoformat()

        if existing:
            prog = existing[0]
            prog_id = prog["id"]
            times = prog["times_reviewed"] + 1
            correct_count = prog["correct_answers"] + (1 if correct else 0)
            incorrect_count = prog["incorrect_answers"] + (0 if correct else 1)
            updated = csv_store.progress_store.update(
                prog_id,
                times_reviewed=times,
                correct_answers=correct_count,
                incorrect_answers=incorrect_count,
                last_reviewed=now,
            )
            logger.info(f"Updated progress for word {word_id}: {correct_count} correct, {incorrect_count} incorrect")
            return updated
        else:
            new_prog = csv_store.progress_store.insert({
                "word_id": word_id,
                "times_reviewed": 1,
                "correct_answers": 1 if correct else 0,
                "incorrect_answers": 0 if correct else 1,
                "last_reviewed": now,
            })
            logger.info(f"Created progress for word {word_id}")
            return new_prog

    @staticmethod
    def get_word_progress(word_id: int) -> dict | None:
        """Get progress for a specific word"""
        results = csv_store.progress_store.where(word_id=word_id)
        return results[0] if results else None

    @staticmethod
    def get_user_statistics() -> dict:
        """Get overall user statistics"""
        total_words = csv_store.words_store.count()
        quizzes = csv_store.quizzes_store.all()
        total_quizzes = len(quizzes)
        avg_score = sum(q["score"] for q in quizzes) / total_quizzes if total_quizzes > 0 else 0

        all_progress = csv_store.progress_store.all()
        total_reviews = sum(p["times_reviewed"] for p in all_progress)
        total_correct = sum(p["correct_answers"] for p in all_progress)
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
    def validate_quiz_prerequisites() -> bool:
        """Check if user has minimum vocabulary to generate quiz"""
        return csv_store.words_store.count() >= QuizService.MINIMUM_VOCABULARY_COUNT

    @staticmethod
    def get_vocabulary_count() -> int:
        """Get total vocabulary count"""
        return csv_store.words_store.count()

    @staticmethod
    def generate_quiz(num_questions: int) -> Tuple[str, List[QuizQuestion]]:
        """
        Generate a quiz with multiple-choice questions.

        Returns:
            Tuple of (quiz_id, list of QuizQuestion objects)

        Raises:
            ValueError: If insufficient vocabulary or invalid number of questions
        """
        if num_questions < 1 or num_questions > 20:
            raise ValueError("Number of questions must be between 1 and 20")

        vocab_count = QuizService.get_vocabulary_count()
        if vocab_count < QuizService.MINIMUM_VOCABULARY_COUNT:
            raise ValueError(
                f"Insufficient vocabulary. Need at least {QuizService.MINIMUM_VOCABULARY_COUNT} "
                f"vocabulary entries to generate quiz. Current: {vocab_count}"
            )

        all_vocab = csv_store.words_store.all()

        questions: List[QuizQuestion] = []
        used_vocab_ids: set = set()

        for q_idx in range(num_questions):
            try:
                available_vocab = [v for v in all_vocab if v["id"] not in used_vocab_ids]
                if not available_vocab and len(used_vocab_ids) < len(all_vocab):
                    used_vocab_ids = set()
                    available_vocab = all_vocab

                correct_vocab = random.choice(available_vocab)
                used_vocab_ids.add(correct_vocab["id"])

                distractor_vocab = random.sample(
                    [v for v in all_vocab if v["id"] != correct_vocab["id"]],
                    min(3, len(all_vocab) - 1),
                )

                all_options = [correct_vocab["meaning"]] + [v["meaning"] for v in distractor_vocab]
                shuffled_options = all_options.copy()
                random.shuffle(shuffled_options)
                correct_answer_index = shuffled_options.index(correct_vocab["meaning"])

                question = QuizQuestion(
                    id=f"q_{q_idx + 1}",
                    vocabulary_id=correct_vocab["id"],
                    question=f"What is the English meaning of: {correct_vocab['german_word']}?",
                    german_word=correct_vocab["german_word"],
                    english_meaning=correct_vocab["meaning"],
                    options=shuffled_options,
                    correct_answer_index=correct_answer_index,
                )
                questions.append(question)

            except (IndexError, ValueError):
                if q_idx == 0:
                    raise ValueError("Unable to generate quiz with current vocabulary")
                break

        quiz_id = f"quiz_{len(questions)}q_{int(random.random() * 1000000)}"
        return quiz_id, questions

    @staticmethod
    def create_quiz_session(
        user_id: int,
        vocabulary_ids: List[int],
        score: int,
        total_questions: int,
        answers_json: str,
        duration_seconds: Optional[int] = None,
    ) -> dict:
        """Create a quiz session record."""
        quiz_session = csv_store.quiz_sessions_store.insert({
            "user_id": user_id,
            "vocabulary_ids": json.dumps(vocabulary_ids),
            "score": score,
            "total_questions": total_questions,
            "answers_json": answers_json,
            "duration_seconds": duration_seconds if duration_seconds is not None else "",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
        logger.info(f"Created quiz session {quiz_session['id']}: {score}/{total_questions}")
        return quiz_session

    @staticmethod
    def get_quiz_history(user_id: int, skip: int = 0, limit: int = 10) -> List[dict]:
        """Get paginated quiz history for a user (most-recent first)."""
        sessions = csv_store.quiz_sessions_store.where(user_id=user_id)
        sessions.sort(key=lambda s: s["created_at"], reverse=True)
        return sessions[skip: skip + limit]

    @staticmethod
    def get_quiz_statistics(user_id: int) -> Dict:
        """Get quiz statistics for a user."""
        sessions = csv_store.quiz_sessions_store.where(user_id=user_id)

        if not sessions:
            return {
                "total_quizzes": 0,
                "average_score": 0,
                "best_score": 0,
                "worst_score": 0,
                "current_streak": 0,
            }

        scores = [
            (s["score"] / s["total_questions"] * 100) if s["total_questions"] > 0 else 0
            for s in sessions
        ]

        return {
            "total_quizzes": len(sessions),
            "average_score": round(sum(scores) / len(scores), 2) if scores else 0,
            "best_score": max(scores),
            "worst_score": min(scores),
            "current_streak": 1,
        }
