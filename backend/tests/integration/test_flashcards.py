"""Integration tests for flashcard functionality."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.database import Base, get_db
from src.main import app
from src.models.models import Word, Flashcard


@pytest.fixture(scope="function")
def test_db():
    """Create a test database and yield session."""
    engine = create_engine("sqlite:///:memory:")
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
    """Create API client for testing."""
    return TestClient(app)


def test_generate_flashcards(client, test_db):
    """Test generating flashcards from selected words."""
    # Create test words first
    word1 = Word(german_word="Apfel", meaning="Apple")
    word2 = Word(german_word="Baum", meaning="Tree")
    test_db.add(word1)
    test_db.add(word2)
    test_db.commit()
    test_db.refresh(word1)
    test_db.refresh(word2)
    
    # Generate flashcards
    response = client.post(
        "/api/v1/flashcards/generate",
        json={"word_ids": [word1.id, word2.id]}
    )
    
    assert response.status_code == 201
    assert len(response.json()) == 2


def test_get_all_flashcards(client, test_db):
    """Test retrieving all flashcards."""
    word = Word(german_word="Haus", meaning="House")
    test_db.add(word)
    test_db.commit()
    test_db.refresh(word)
    
    # Create flashcards
    card1 = Flashcard(word_id=word.id)
    test_db.add(card1)
    test_db.commit()
    
    response = client.get("/api/v1/flashcards/")
    
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_mark_flashcard_known(client, test_db):
    """Test marking a flashcard as known."""
    word = Word(german_word="Fenster", meaning="Window", times_practiced=0)
    test_db.add(word)
    test_db.commit()
    test_db.refresh(word)
    
    card = Flashcard(word_id=word.id)
    test_db.add(card)
    test_db.commit()
    test_db.refresh(card)
    
    response = client.post(f"/api/v1/flashcards/{card.id}/known")
    
    assert response.status_code == 200
    
    # Verify times_practiced was incremented
    test_db.refresh(word)
    assert word.times_practiced == 1


def test_delete_flashcard(client, test_db):
    """Test deleting a flashcard."""
    word = Word(german_word="Tisch", meaning="Table")
    test_db.add(word)
    test_db.commit()
    test_db.refresh(word)
    
    card = Flashcard(word_id=word.id)
    test_db.add(card)
    test_db.commit()
    test_db.refresh(card)
    card_id = card.id
    
    response = client.delete(f"/api/v1/flashcards/{card_id}")
    
    assert response.status_code == 200
    
    # Verify it's deleted
    response = client.get(f"/api/v1/flashcards/{card_id}")
    assert response.status_code == 404


def test_duplicate_flashcard_generation(client, test_db):
    """Test that duplicate flashcards are not generated."""
    word = Word(german_word="Stuhl", meaning="Chair")
    test_db.add(word)
    test_db.commit()
    test_db.refresh(word)
    
    # Generate flashcards twice for same word
    response1 = client.post(
        "/api/v1/flashcards/generate",
        json={"word_ids": [word.id]}
    )
    assert response1.status_code == 201
    
    response2 = client.post(
        "/api/v1/flashcards/generate",
        json={"word_ids": [word.id]}
    )
    # Should return empty because card already exists
    assert response2.status_code == 201
    assert len(response2.json()) == 0
