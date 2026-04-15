"""
Example contract test structure for words API.
These tests are auto-generated via LLM and define the contract/interface.
"""

import pytest
from fastapi.testclient import TestClient


def test_create_word(client):
    """Test creating a new word"""
    response = client.post(
        "/api/v1/words/",
        json={"german_word": "Hallo", "meaning": "Hello"}
    )
    assert response.status_code == 201


def test_get_words(client):
    """Test retrieving all words"""
    response = client.get("/api/v1/words/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
