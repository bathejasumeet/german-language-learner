from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class WordBase(BaseModel):
    """Base schema for Word"""
    german_word: str = Field(..., min_length=1, max_length=255)
    meaning: str = Field(..., min_length=1, max_length=1024)


class WordCreate(WordBase):
    """Schema for creating a word"""
    pass


class WordUpdate(BaseModel):
    """Schema for updating a word"""
    german_word: Optional[str] = Field(None, min_length=1, max_length=255)
    meaning: Optional[str] = Field(None, min_length=1, max_length=1024)


class Word(WordBase):
    """Schema for Word response"""
    id: int
    created_at: datetime
    times_practiced: int
    accuracy: float
    
    class Config:
        from_attributes = True
