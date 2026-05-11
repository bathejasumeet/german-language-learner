"""
Integration tests for the Rosetta feature.

These tests require a running Ollama instance AND a populated database.
They are skipped unless the OLLAMA_AVAILABLE=1 environment variable is set.

Usage:
    OLLAMA_AVAILABLE=1 pytest tests/integration/test_rosetta_integration.py -v
"""
import os
import pytest
from fastapi.testclient import TestClient
from src.main import app

OLLAMA_AVAILABLE = os.getenv("OLLAMA_AVAILABLE") == "1"


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


@pytest.mark.skipif(not OLLAMA_AVAILABLE, reason="Ollama not available (set OLLAMA_AVAILABLE=1)")
class TestRosettaIntegration:
    def test_generate_returns_three_sentences_for_first_word(self, client):
        """Full round-trip: real DB word + real Ollama call."""
        # Fetch the first available word
        words_resp = client.get("/api/v1/words/")
        assert words_resp.status_code == 200, "Words endpoint failed"
        words = words_resp.json()
        assert len(words) > 0, "No words in DB — seed data first"

        word_id = words[0]["id"]
        resp = client.post("/api/v1/rosetta/generate", json={"word_id": word_id, "force": True})

        assert resp.status_code == 200, f"Unexpected status: {resp.status_code} — {resp.text}"
        data = resp.json()
        assert data["word_id"] == word_id
        assert len(data["sentences"]) == 3
        for sentence in data["sentences"]:
            assert isinstance(sentence, str)
            assert len(sentence) > 0

    @pytest.mark.skipif(not OLLAMA_AVAILABLE, reason="Ollama not available")
    def test_cached_response_is_fast(self, client):
        """Second request for the same word returns cached=True."""
        words_resp = client.get("/api/v1/words/")
        word_id = words_resp.json()[0]["id"]

        # First call (may hit LLM)
        client.post("/api/v1/rosetta/generate", json={"word_id": word_id, "force": False})
        # Second call (should be from cache)
        resp = client.post("/api/v1/rosetta/generate", json={"word_id": word_id, "force": False})
        assert resp.status_code == 200
        assert resp.json()["cached"] is True
