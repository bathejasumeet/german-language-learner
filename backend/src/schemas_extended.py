from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class FlashcardBase(BaseModel):
    """Base schema for Flashcard"""
    word_id: int


class FlashcardCreate(FlashcardBase):
    """Schema for creating a flashcard"""
    pass


class Flashcard(FlashcardBase):
    """Schema for Flashcard response"""
    id: int
    created_at: datetime
    last_studied: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class QuizBase(BaseModel):
    """Base schema for Quiz"""
    total_questions: int = Field(default=10, ge=1, le=100)


class QuizCreate(QuizBase):
    """Schema for creating a quiz"""
    pass


class QuizResult(BaseModel):
    """Schema for submitting quiz results"""
    correct_answers: int = Field(ge=0)


class Quiz(QuizBase):
    """Schema for Quiz response"""
    id: int
    created_at: datetime
    correct_answers: int
    score: float
    
    class Config:
        from_attributes = True


# ============= Vocabulary Schemas (Enhanced) =============

class VocabularyBase(BaseModel):
    """Base schema for Vocabulary"""
    german_word: str = Field(..., min_length=1, max_length=255)
    meaning: str = Field(..., min_length=1, max_length=1024)
    example_sentence: Optional[str] = Field(None, max_length=500)


class Vocabulary(VocabularyBase):
    """Schema for Vocabulary response with example sentence"""
    id: int
    created_at: datetime
    times_practiced: int = 0
    accuracy: float = 0.0
    
    class Config:
        from_attributes = True


# ============= Quiz Session Schemas =============

class QuizSessionBase(BaseModel):
    """Base schema for QuizSession"""
    score: int = Field(ge=0)
    total_questions: int = Field(ge=1, le=20)
    duration_seconds: Optional[int] = Field(None, ge=0)


class QuizSession(QuizSessionBase):
    """Schema for QuizSession response"""
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class QuizQuestion(BaseModel):
    """Schema for QuizQuestion response"""
    id: str
    vocabulary_id: int
    question: str
    german_word: str
    english_meaning: str
    options: List[str]
    correct_answer_index: int


class QuizGenerateResponse(BaseModel):
    """Schema for quiz generation response"""
    quiz_id: str
    total_questions: int
    questions: List[QuizQuestion]


class QuizAnswerSubmission(BaseModel):
    """Schema for quiz answer submission"""
    quiz_id: str
    question_id: str
    selected_option_index: int = Field(ge=0, le=3)


class QuizAnswerFeedback(BaseModel):
    """Schema for quiz answer feedback"""
    is_correct: bool
    correct_answer_index: int
    correct_answer: str
    explanation: Optional[str] = None


class QuizScoreResponse(BaseModel):
    """Schema for final quiz score"""
    quiz_id: str
    score: int
    total_questions: int
    percentage: float
    duration_seconds: Optional[int] = None
    results: List[dict] = []
    statistics: Optional[dict] = None


class ProgressBase(BaseModel):
    """Base schema for Progress"""
    word_id: int


class Progress(ProgressBase):
    """Schema for Progress response"""
    id: int
    times_reviewed: int
    correct_answers: int
    incorrect_answers: int
    last_reviewed: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserStatistics(BaseModel):
    """Schema for user statistics"""
    total_words: int
    total_quizzes: int
    average_quiz_score: float
    total_reviews: int
    overall_accuracy: float
