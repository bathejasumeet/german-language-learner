"""
Example integration test structure for vocabulary CRUD operations.
These tests are auto-generated via LLM and test complete workflows.
"""

import pytest


def test_vocabulary_crud_workflow(client):
    """Test complete vocabulary CRUD workflow"""
    # Create a word
    create_response = client.post(
        "/api/v1/words/",
        json={"german_word": "Wasser", "meaning": "Water"}
    )
    assert create_response.status_code == 201
    
    # Get all words
    get_response = client.get("/api/v1/words/")
    assert get_response.status_code == 200
