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
