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


def test_vocabulary_crud_with_example_sentence(client):
    """Test vocabulary CRUD operations including example_sentence field"""
    # Create word with example sentence
    example_sentence = "Das Wasser ist sehr kalt."
    create_response = client.post(
        "/api/v1/words/",
        json={
            "german_word": "Wasser",
            "meaning": "Water",
            "example_sentence": example_sentence
        }
    )
    assert create_response.status_code == 201
    word_id = create_response.json()["id"]
    assert create_response.json()["example_sentence"] == example_sentence
    
    # Get word and verify example_sentence
    get_response = client.get(f"/api/v1/words/{word_id}")
    assert get_response.status_code == 200
    assert get_response.json()["example_sentence"] == example_sentence
    
    # Update word with new example sentence
    new_example = "Das Wasser ist sehr sauber."
    update_response = client.put(
        f"/api/v1/words/{word_id}",
        json={"example_sentence": new_example}
    )
    assert update_response.status_code == 200
    assert update_response.json()["example_sentence"] == new_example
    
    # Verify all words include example_sentence field
    list_response = client.get("/api/v1/words/")
    assert list_response.status_code == 200
    words = list_response.json()
    assert all("example_sentence" in word for word in words)


def test_vocabulary_example_sentence_max_length(client):
    """Test that example_sentence field respects 500 character limit"""
    # Create word with example sentence exceeding 500 chars
    long_sentence = "A" * 501
    create_response = client.post(
        "/api/v1/words/",
        json={
            "german_word": "Test",
            "meaning": "Test",
            "example_sentence": long_sentence
        }
    )
    assert create_response.status_code == 400
    
    # Create word with exactly 500 chars - should succeed
    max_sentence = "B" * 500
    create_response = client.post(
        "/api/v1/words/",
        json={
            "german_word": "Test2",
            "meaning": "Test2",
            "example_sentence": max_sentence
        }
    )
    assert create_response.status_code == 201
    assert len(create_response.json()["example_sentence"]) == 500
