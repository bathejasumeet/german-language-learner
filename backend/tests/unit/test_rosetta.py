"""
Unit tests for the Rosetta feature.

Covers:
  - ollama_service: prompt building, response parsing, cache, error handling
  - rosetta router: 200 / 404 / 503 / 500 responses
"""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# ollama_service tests
# ---------------------------------------------------------------------------
from src.services import ollama_service
from src.services.ollama_service import (
    MemoryAid,
    OllamaUnavailableError,
    _parse_sentences,
    generate_memory_aid,
)


class TestParseSentences:
    def test_parses_three_numbered_lines(self):
        raw = "1. Imagine a fence made of stars — Fenster!\n2. Story two.\n3. Story three."
        result = _parse_sentences(raw)
        assert len(result) == 3
        assert result[0] == "Imagine a fence made of stars — Fenster!"

    def test_pads_when_fewer_than_three(self):
        raw = "1. Only one sentence."
        result = _parse_sentences(raw)
        assert len(result) == 3
        assert result[1] == "(Sentence unavailable — please regenerate.)"

    def test_accepts_period_or_paren_separator(self):
        raw = "1) First.\n2) Second.\n3) Third."
        result = _parse_sentences(raw)
        assert len(result) == 3
        assert result[0] == "First."

    def test_trims_to_three_when_more_provided(self):
        raw = "1. A\n2. B\n3. C\n4. D\n5. E"
        result = _parse_sentences(raw)
        assert len(result) == 3


@pytest.mark.asyncio
class TestGenerateMemoryAid:
    async def test_returns_cached_result_on_hit(self):
        aid = MemoryAid(
            word_id=1,
            german_word="Haus",
            sentences=["S1", "S2", "S3"],
        )
        ollama_service._cache[1] = aid
        result = await generate_memory_aid(1, "Haus", "house", force=False)
        assert result is aid
        del ollama_service._cache[1]

    async def test_force_bypasses_cache(self):
        aid = MemoryAid(word_id=2, german_word="Hund", sentences=["S1", "S2", "S3"])
        ollama_service._cache[2] = aid

        mock_response = MagicMock()
        mock_response.json.return_value = {"response": "1. New one.\n2. New two.\n3. New three."}
        mock_response.raise_for_status = MagicMock()

        with patch("src.services.ollama_service.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client.post = AsyncMock(return_value=mock_response)
            mock_client_cls.return_value = mock_client

            result = await generate_memory_aid(2, "Hund", "dog", force=True)

        assert result.sentences[0] == "New one."
        ollama_service._cache.pop(2, None)

    async def test_raises_ollama_unavailable_on_connect_error(self):
        import httpx

        with patch("src.services.ollama_service.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client.post = AsyncMock(side_effect=httpx.ConnectError("refused"))
            mock_client_cls.return_value = mock_client

            with pytest.raises(OllamaUnavailableError):
                await generate_memory_aid(99, "Test", "test", force=True)


# ---------------------------------------------------------------------------
# rosetta router tests
# ---------------------------------------------------------------------------
import os
os.environ.setdefault("ENV", "test")

from fastapi.testclient import TestClient
from src.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_word():
    word = MagicMock()
    word.id = 10
    word.german_word = "Fenster"
    word.meaning = "window"
    return word


class TestRosettaRouter:
    def test_404_when_word_not_found(self, client):
        with patch("src.api.rosetta.VocabularyService.get_word", return_value=None):
            resp = client.post("/api/v1/rosetta/generate", json={"word_id": 999})
        assert resp.status_code == 404
        assert resp.json()["detail"] == "Word not found"

    def test_503_when_ollama_unavailable(self, client, mock_word):
        with patch("src.api.rosetta.VocabularyService.get_word", return_value=mock_word):
            with patch(
                "src.api.rosetta.generate_memory_aid",
                new_callable=AsyncMock,
                side_effect=OllamaUnavailableError("down"),
            ):
                resp = client.post("/api/v1/rosetta/generate", json={"word_id": 10})
        assert resp.status_code == 503
        assert "Ollama" in resp.json()["detail"]

    def test_200_returns_three_sentences(self, client, mock_word):
        aid = MemoryAid(
            word_id=10,
            german_word="Fenster",
            sentences=["S1", "S2", "S3"],
            generated_at=datetime(2026, 5, 11, tzinfo=timezone.utc),
        )
        with patch("src.api.rosetta.VocabularyService.get_word", return_value=mock_word):
            with patch(
                "src.api.rosetta.generate_memory_aid",
                new_callable=AsyncMock,
                return_value=aid,
            ):
                resp = client.post("/api/v1/rosetta/generate", json={"word_id": 10})

        assert resp.status_code == 200
        data = resp.json()
        assert data["word_id"] == 10
        assert data["german_word"] == "Fenster"
        assert len(data["sentences"]) == 3
        assert "cached" in data

    def test_500_on_unexpected_error(self, client, mock_word):
        with patch("src.api.rosetta.VocabularyService.get_word", return_value=mock_word):
            with patch(
                "src.api.rosetta.generate_memory_aid",
                new_callable=AsyncMock,
                side_effect=RuntimeError("boom"),
            ):
                resp = client.post("/api/v1/rosetta/generate", json={"word_id": 10})
        assert resp.status_code == 500
