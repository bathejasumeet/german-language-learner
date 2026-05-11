import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.schemas import RosettaRequest, RosettaResponse
from src.services.vocabulary import VocabularyService
from src.services import ollama_service
from src.services.ollama_service import (
    generate_memory_aid,
    OllamaUnavailableError,
)

router = APIRouter(prefix="/api/v1/rosetta", tags=["rosetta"])
logger = logging.getLogger(__name__)


@router.post("/generate", response_model=RosettaResponse)
async def generate_rosetta(
    body: RosettaRequest,
    db: Session = Depends(get_db),
):
    """Generate three memory-aid sentences for a German vocabulary word."""
    word = VocabularyService.get_word(db, body.word_id)
    if not word:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Word not found",
        )

    # Determine whether the result will come from cache before the call
    is_cached = body.word_id in ollama_service._cache and not body.force

    try:
        aid = await generate_memory_aid(
            word_id=body.word_id,
            german_word=word.german_word,
            meaning=word.meaning,
            force=body.force,
        )
    except OllamaUnavailableError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Local AI service unavailable. Please ensure Ollama is running.",
        )
    except Exception as exc:
        logger.error("Unexpected error during sentence generation: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate sentences. Try again.",
        )

    return RosettaResponse(
        word_id=aid.word_id,
        german_word=aid.german_word,
        sentences=aid.sentences,
        generated_at=aid.generated_at,
        cached=is_cached,
    )
