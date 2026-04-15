"""Contract tests for quiz and progress API endpoints."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.database import Base, get_db
from src.main import app
from src.models.models import Word, Quiz


@pytest.fixture(scope="function")
def test_db():
    """Create a test database."""
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
    """Create API client."""
    return TestClient(app)


def test_create_quiz_schema(client):
    """Test that quiz creation returns correct schema."""
    response = client.post(
        "/api/v1/quiz/",
        json={"total_questions": 10}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["total_questions"] == 10
    assert "created_at" in data
    assert "correct_answers" in data


def test_submit_quiz_schema(client):
    """Test that quiz submission returns correct schema."""
    create_response = client.post(
        "/api/v1/quiz/",
        json={"total_questions": 10}
    )
    quiz_id = create_response.json()["id"]
    
    response = client.post(
        f"/api/v1/quiz/{quiz_id}/submit",
        json={"correct_answers": 7}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "score" in data
    assert isinstance(data["score"], float)


def test_get_nonexistent_quiz(client):
    """Test retrieving non-existent quiz returns 404."""
    response = client.get("/api/v1/quiz/9999")
    assert response.status_code == 404


def test_submit_to_nonexistent_quiz(client):
    """Test submitting to non-existent quiz returns 404."""
    response = client.post(
        "/api/v1/quiz/9999/submit",
        json={"correct_answers": 5}
    )
    assert response.status_code == 404


def test_statistics_schema(client):
    """Test that statistics API returns correct schema."""
    response = client.get("/api/v1/quiz/stats/overall")
    
    assert response.status_code == 200
    data = response.json()
    assert "total_words" in data
    assert "total_quizzes" in data
    assert "average_quiz_score" in data
    assert "total_reviews" in data
    assert "overall_accuracy" in data


def test_progress_schema(client, test_db):
    """Test that progress API returns correct schema."""
    word = Word(german_word="Test", meaning="Test word")
    test_db.add(word)
    test_db.commit()
    test_db.refresh(word)
    
    response = client.get(f"/api/v1/quiz/progress/{word.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert "word_id" in data
    assert "times_reviewed" in data
    assert "correct_answers" in data
    assert "incorrect_answers" in data
