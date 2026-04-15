from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from src.database import Base


class Word(Base):
    """Model for German words in the vocabulary database"""
    __tablename__ = "words"
    
    id = Column(Integer, primary_key=True, index=True)
    german_word = Column(String, unique=True, index=True, nullable=False)
    meaning = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    times_practiced = Column(Integer, default=0)
    accuracy = Column(Float, default=0.0)  # Accuracy as percentage (0-100)
    
    # Relationships
    flashcards = relationship("Flashcard", back_populates="word", cascade="all, delete-orphan")
    progress = relationship("Progress", back_populates="word", cascade="all, delete-orphan")


class Flashcard(Base):
    """Model for flashcards generated from words"""
    __tablename__ = "flashcards"
    
    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_studied = Column(DateTime, nullable=True)
    
    # Relationships
    word = relationship("Word", back_populates="flashcards")


class Progress(Base):
    """Model for tracking user progress on words"""
    __tablename__ = "progress"
    
    id = Column(Integer, primary_key=True, index=True)
    word_id = Column(Integer, ForeignKey("words.id"), nullable=False)
    times_reviewed = Column(Integer, default=0)
    correct_answers = Column(Integer, default=0)
    incorrect_answers = Column(Integer, default=0)
    last_reviewed = Column(DateTime, nullable=True)
    
    # Relationships
    word = relationship("Word", back_populates="progress")


class Quiz(Base):
    """Model for quiz sessions"""
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, default=0)
    score = Column(Float, default=0.0)  # Score as percentage
