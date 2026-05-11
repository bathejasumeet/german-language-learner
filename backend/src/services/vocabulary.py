from datetime import datetime, timezone
import src.csv_store as csv_store


class VocabularyService:
    """Service for managing vocabulary operations"""

    @staticmethod
    def create_word(german_word: str, meaning: str, example_sentence: str = None) -> dict:
        """Create a new word entry with optional example sentence"""
        # Case-insensitive duplicate check
        existing = [
            w for w in csv_store.words_store.all()
            if w["german_word"].lower() == german_word.lower()
        ]
        if existing:
            raise ValueError(f"Word '{german_word}' already exists")

        if example_sentence and len(example_sentence) > 500:
            raise ValueError("Example sentence must not exceed 500 characters")

        return csv_store.words_store.insert({
            "german_word": german_word,
            "meaning": meaning,
            "example_sentence": example_sentence or "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "times_practiced": 0,
            "accuracy": 0.0,
        })

    @staticmethod
    def get_word(word_id: int) -> dict | None:
        """Get a word by ID"""
        return csv_store.words_store.get(word_id)

    @staticmethod
    def get_all_words(skip: int = 0, limit: int = 100) -> list:
        """Get all words with pagination"""
        return csv_store.words_store.all()[skip: skip + limit]

    @staticmethod
    def update_word(
        word_id: int,
        german_word: str = None,
        meaning: str = None,
        example_sentence: str = None,
    ) -> dict | None:
        """Update a word entry including optional example sentence"""
        word = csv_store.words_store.get(word_id)
        if not word:
            return None

        kwargs = {}
        if german_word:
            kwargs["german_word"] = german_word
        if meaning:
            kwargs["meaning"] = meaning
        if example_sentence is not None:
            if example_sentence and len(example_sentence) > 500:
                raise ValueError("Example sentence must not exceed 500 characters")
            kwargs["example_sentence"] = example_sentence

        if not kwargs:
            return word
        return csv_store.words_store.update(word_id, **kwargs)

    @staticmethod
    def delete_word(word_id: int) -> bool:
        """Delete a word entry"""
        return csv_store.words_store.delete(word_id)

