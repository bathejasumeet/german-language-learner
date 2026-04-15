import logging
from sqlalchemy.orm import Session
from src.models import Flashcard, Word, Quiz, Progress

logger = logging.getLogger(__name__)


class FlashcardService:
    """Service for managing flashcard operations"""
    
    @staticmethod
    def generate_flashcards(db: Session, word_ids: list) -> list:
        """Generate flashcards from selected words"""
        flashcards = []
        for word_id in word_ids:
            word = db.query(Word).filter(Word.id == word_id).first()
            if not word:
                continue
            
            # Check if flashcard already exists for this word
            existing = db.query(Flashcard).filter(
                Flashcard.word_id == word_id
            ).first()
            
            if not existing:
                flashcard = Flashcard(word_id=word_id)
                db.add(flashcard)
                flashcards.append(flashcard)
        
        db.commit()
        return flashcards
    
    @staticmethod
    def get_all_flashcards(db: Session, skip: int = 0, limit: int = 100) -> list:
        """Get all flashcards with pagination"""
        return db.query(Flashcard).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_flashcard(db: Session, flashcard_id: int) -> Flashcard | None:
        """Get a specific flashcard"""
        return db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
    
    @staticmethod
    def mark_flashcard_known(db: Session, flashcard_id: int) -> Flashcard | None:
        """Mark a flashcard as known"""
        flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
        if flashcard:
            flashcard.word.times_practiced += 1
            db.commit()
            db.refresh(flashcard)
            logger.info(f"Marked flashcard {flashcard_id} as known")
        return flashcard
    
    @staticmethod
    def delete_flashcard(db: Session, flashcard_id: int) -> bool:
        """Delete a flashcard"""
        flashcard = db.query(Flashcard).filter(Flashcard.id == flashcard_id).first()
        if flashcard:
            db.delete(flashcard)
            db.commit()
            logger.info(f"Deleted flashcard {flashcard_id}")
            return True
        return False
