from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List


class WordBase(BaseModel):
    """Base schema for Word"""
    german_word: str = Field(..., min_length=1, max_length=255)
    meaning: str = Field(..., min_length=1, max_length=1024)
    example_sentence: Optional[str] = Field(None, max_length=500)


class WordCreate(WordBase):
    """Schema for creating a word"""
    pass


class WordUpdate(BaseModel):
    """Schema for updating a word"""
    german_word: Optional[str] = Field(None, min_length=1, max_length=255)
    meaning: Optional[str] = Field(None, min_length=1, max_length=1024)
    example_sentence: Optional[str] = Field(None, max_length=500)


class Word(WordBase):
    """Schema for Word response"""
    id: int
    created_at: datetime
    times_practiced: int
    accuracy: float
    
    class Config:
        from_attributes = True


# ---------------------------------------------------------------------------
# Rosetta schemas
# ---------------------------------------------------------------------------

class RosettaRequest(BaseModel):
    """Request body for POST /api/v1/rosetta/generate"""
    word_id: int = Field(..., gt=0)
    force: bool = Field(False, description="Bypass cache and regenerate sentences")


class RosettaResponse(BaseModel):
    """Response body for POST /api/v1/rosetta/generate"""
    word_id: int
    german_word: str
    sentences: List[str] = Field(..., min_length=3, max_length=3)
    generated_at: datetime
    cached: bool
