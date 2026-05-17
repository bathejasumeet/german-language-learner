import logging
from datetime import datetime, timezone
import src.csv_store as csv_store

logger = logging.getLogger(__name__)


def _normalize_flashcard(fc: dict) -> dict:
    """Convert empty-string last_studied (CSV default) to None."""
    if fc.get("last_studied") == "":
        fc["last_studied"] = None
    return fc


def _enrich_flashcard(fc: dict | None) -> dict | None:
    """Attach nested word data required by the response schema."""
    if not fc:
        return None

    _normalize_flashcard(fc)
    word = csv_store.words_store.get(fc["word_id"])
    if not word:
        return fc

    fc["word"] = {
        "german_word": word["german_word"],
        "meaning": word["meaning"],
        "example_sentence": word.get("example_sentence") or None,
    }
    return fc


class FlashcardService:
    """Service for managing flashcard operations"""

    @staticmethod
    def generate_flashcards(word_ids: list) -> list:
        """Generate flashcards from selected words"""
        flashcards = []
        for word_id in word_ids:
            word = csv_store.words_store.get(word_id)
            if not word:
                continue

            # Check if flashcard already exists for this word
            existing = csv_store.flashcards_store.where(word_id=word_id)
            if existing:
                fc = existing[0]
            else:
                fc = csv_store.flashcards_store.insert({
                    "word_id": word_id,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "last_studied": "",
                })

            flashcards.append(_enrich_flashcard(fc))

        return flashcards

    @staticmethod
    def get_all_flashcards(skip: int = 0, limit: int = 100) -> list:
        """Get all flashcards with pagination"""
        return [_enrich_flashcard(fc) for fc in csv_store.flashcards_store.all()[skip: skip + limit]]

    @staticmethod
    def get_flashcard(flashcard_id: int) -> dict | None:
        """Get a specific flashcard"""
        return _enrich_flashcard(csv_store.flashcards_store.get(flashcard_id))

    @staticmethod
    def mark_flashcard_known(flashcard_id: int) -> dict | None:
        """Mark a flashcard as known"""
        flashcard = csv_store.flashcards_store.get(flashcard_id)
        if not flashcard:
            return None

        # Increment times_practiced on the associated word
        word_id = flashcard["word_id"]
        word = csv_store.words_store.get(word_id)
        if word:
            csv_store.words_store.update(word_id, times_practiced=word["times_practiced"] + 1)

        updated = csv_store.flashcards_store.update(
            flashcard_id,
            last_studied=datetime.now(timezone.utc).isoformat(),
        )
        logger.info(f"Marked flashcard {flashcard_id} as known")
        return _enrich_flashcard(updated)

    @staticmethod
    def delete_flashcard(flashcard_id: int) -> bool:
        """Delete a flashcard"""
        result = csv_store.flashcards_store.delete(flashcard_id)
        if result:
            logger.info(f"Deleted flashcard {flashcard_id}")
        return result

