"""Contract tests for flashcard API endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.database import Base, get_db
from src.main import app
from src.models.models import Word, Flashcard


@pytest.fixture(scope="function")
def test_db():
    """Create a test database."""
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestingSessionLocal()
    Base.metadata.drop_all(engine)


@pytest.fixture
def client(test_db):
    """Create API client."""
    return TestClient(app)


def test_flashcard_api_schemas(client, test_db):
    """Test that flashcard endpoints return correct schema."""
    word = Word(german_word="Test", meaning="Test word")
    test_db.add(word)
    test_db.commit()
    test_db.refresh(word)
    
    # Test POST /generate response schema - use query params
    response = client.post(
        f"/api/v1/flashcards/generate?word_ids={word.id}"
    )
    assert response.status_code == 201
    data = response.json()
    if len(data) > 0:
        assert "id" in data[0]
        assert "word_id" in data[0]
        assert "created_at" in data[0]


def test_flashcard_error_handling(client, test_db):
    """Test that flashcard API handles errors correctly."""
    # Test with invalid word IDs
    response = client.post(
        "/api/v1/flashcards/generate?word_ids=9999"
    )
    # Should succeed but return empty list (no words found)
    assert response.status_code == 201


def test_get_nonexistent_flashcard(client):
    """Test retrieving non-existent flashcard returns 404."""
    response = client.get("/api/v1/flashcards/9999")
    assert response.status_code == 404


def test_delete_nonexistent_flashcard(client):
    """Test deleting non-existent flashcard returns 404."""
    response = client.delete("/api/v1/flashcards/9999")
    assert response.status_code == 404
