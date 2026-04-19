from sqlalchemy.orm import Session
from src.models import Word
from src.models.models import Word as WordModel


class VocabularyService:
    """Service for managing vocabulary operations"""
    
    @staticmethod
    def create_word(db: Session, german_word: str, meaning: str, example_sentence: str = None) -> Word:
        """Create a new word entry with optional example sentence"""
        # Check for duplicates
        existing = db.query(Word).filter(
            Word.german_word.ilike(german_word)
        ).first()
        
        if existing:
            raise ValueError(f"Word '{german_word}' already exists")
        
        # Validate example_sentence if provided
        if example_sentence and len(example_sentence) > 500:
            raise ValueError("Example sentence must not exceed 500 characters")
        
        word = Word(
            german_word=german_word, 
            meaning=meaning,
            example_sentence=example_sentence
        )
        db.add(word)
        db.commit()
        db.refresh(word)
        return word
    
    @staticmethod
    def get_word(db: Session, word_id: int) -> Word | None:
        """Get a word by ID"""
        return db.query(Word).filter(Word.id == word_id).first()
    
    @staticmethod
    def get_all_words(db: Session, skip: int = 0, limit: int = 100) -> list:
        """Get all words with pagination"""
        return db.query(Word).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_word(db: Session, word_id: int, german_word: str = None, meaning: str = None, example_sentence: str = None) -> Word | None:
        """Update a word entry including optional example sentence"""
        word = db.query(Word).filter(Word.id == word_id).first()
        if not word:
            return None
        
        if german_word:
            word.german_word = german_word
        if meaning:
            word.meaning = meaning
        if example_sentence is not None:
            # Validate example_sentence if provided
            if example_sentence and len(example_sentence) > 500:
                raise ValueError("Example sentence must not exceed 500 characters")
            word.example_sentence = example_sentence
        
        db.commit()
        db.refresh(word)
        return word
    
    @staticmethod
    def delete_word(db: Session, word_id: int) -> bool:
        """Delete a word entry"""
        word = db.query(Word).filter(Word.id == word_id).first()
        if not word:
            return False
        
        db.delete(word)
        db.commit()
        return True
