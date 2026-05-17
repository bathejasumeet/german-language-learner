import logging
import re
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List

import httpx

from src.config import settings

logger = logging.getLogger(__name__)

_PROMPT_TEMPLATE = (
    "You are a German language teacher. Given a German word and its meaning, "
    "generate exactly 3 creative, memorable German sentences that help learners "
    'remember the German word "{word}" (meaning: "{meaning}"). '
    "Each sentence must include the German word. "
    "Number them 1, 2, 3. "
    "Be vivid and use memory techniques like rhyme, story, or imagery."
)

_FALLBACK_SENTENCE = "(Sentence unavailable — please regenerate.)"


class OllamaUnavailableError(Exception):
    """Raised when the local Ollama service cannot be reached."""


@dataclass
class MemoryAid:
    word_id: int
    german_word: str
    sentences: List[str]
    generated_at: datetime = field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


# Module-level in-memory cache: word_id -> MemoryAid
_cache: dict[int, MemoryAid] = {}


async def generate_memory_aid(
    word_id: int,
    german_word: str,
    meaning: str,
    force: bool = False,
) -> MemoryAid:
    """Return a MemoryAid for the given word, using the cache unless force=True."""
    if not force and word_id in _cache:
        logger.info("Cache hit for word_id=%d", word_id)
        return _cache[word_id]

    logger.info("Generating memory aid for word_id=%d (%s)", word_id, german_word)
    sentences = await _call_ollama(german_word, meaning)
    aid = MemoryAid(word_id=word_id, german_word=german_word, sentences=sentences)
    _cache[word_id] = aid
    return aid


async def _call_ollama(german_word: str, meaning: str) -> List[str]:
    """Call the local Ollama API and parse exactly 3 numbered sentences."""
    prompt = _PROMPT_TEMPLATE.format(word=german_word, meaning=meaning)
    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{settings.OLLAMA_BASE_URL}/api/generate",
                json=payload,
            )
            response.raise_for_status()
    except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
        logger.error("Ollama unreachable: %s", exc)
        raise OllamaUnavailableError("Cannot connect to Ollama service") from exc
    except httpx.TimeoutException as exc:
        logger.error("Ollama request timed out: %s", exc)
        raise OllamaUnavailableError("Ollama request timed out") from exc
    except httpx.HTTPStatusError as exc:
        logger.error("Ollama returned HTTP error: %s", exc)
        raise OllamaUnavailableError(f"Ollama returned error: {exc.response.status_code}") from exc

    data = response.json()
    raw_text: str = data.get("response", "")
    return _parse_sentences(raw_text)


def _parse_sentences(raw_text: str) -> List[str]:
    """Extract lines that start with 1. 2. 3. from the LLM response."""
    sentences: List[str] = []
    for line in raw_text.splitlines():
        stripped = line.strip()
        match = re.match(r"^[1-3][.)]\s+(.+)$", stripped)
        if match:
            sentences.append(match.group(1).strip())

    if len(sentences) < 3:
        logger.warning(
            "LLM returned only %d parseable sentences; padding to 3.", len(sentences)
        )
        while len(sentences) < 3:
            sentences.append(_FALLBACK_SENTENCE)

    return sentences[:3]
