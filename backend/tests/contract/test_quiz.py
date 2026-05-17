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


# ============= Multiple-Choice Quiz Contract Tests (T055) =============

def test_quiz_generate_response_schema(client, test_db):
    """Test that quiz generation returns correct response schema"""
    # Create vocabulary first
    for i in range(5):
        word = Word(german_word=f"Word{i}", meaning=f"Meaning{i}")
        test_db.add(word)
    test_db.commit()
    
    response = client.get("/api/v1/quiz/generate", params={"count": 3})
    
    assert response.status_code == 201
    data = response.json()
    
    # Verify top-level schema
    assert "quiz_id" in data
    assert "total_questions" in data
    assert "questions" in data
    assert isinstance(data["questions"], list)
    assert len(data["questions"]) == 3
    
    # Verify each question schema
    for question in data["questions"]:
        assert "id" in question
        assert "vocabulary_id" in question
        assert "question" in question
        assert "german_word" in question
        assert "english_meaning" in question
        assert "options" in question
        assert isinstance(question["options"], list)
        assert len(question["options"]) == 4  # Must have 4 options
        assert "correct_answer_index" in question
        assert 0 <= question["correct_answer_index"] <= 3


def test_quiz_answer_submission_schema(client):
    """Test that answer submission returns correct feedback schema"""
    response = client.post(
        "/api/v1/quiz/submit",
        json={
            "quiz_id": "quiz_1",
            "question_id": "q_1",
            "selected_option_index": 0
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify feedback schema
    assert "is_correct" in data
    assert isinstance(data["is_correct"], bool)
    assert "correct_answer_index" in data
    assert isinstance(data["correct_answer_index"], int)
    assert "correct_answer" in data
    assert isinstance(data["correct_answer"], str)
    # explanation is optional
    if "explanation" in data:
        assert data["explanation"] is None or isinstance(data["explanation"], str)


def test_quiz_completion_response_schema(client, test_db):
    """Test that quiz completion returns correct score schema"""
    # Create vocabulary
    for i in range(5):
        word = Word(german_word=f"Word{i}", meaning=f"Meaning{i}")
        test_db.add(word)
    test_db.commit()
    
    response = client.post(
        "/api/v1/quiz/complete",
        json={
            "quiz_id": "test_quiz_1",
            "score": 6,
            "total_questions": 10,
            "vocabulary_ids": [1, 2, 3, 4, 5],
            "results": []
        },
        params={"user_id": 1}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify completion schema
    assert "quiz_id" in data
    assert data["quiz_id"] == "test_quiz_1"
    assert "score" in data
    assert data["score"] == 6
    assert "total_questions" in data
    assert data["total_questions"] == 10
    assert "percentage" in data
    assert data["percentage"] == 60.0
    assert "duration_seconds" in data
    assert "results" in data
    assert isinstance(data["results"], list)
    assert "statistics" in data
    assert isinstance(data["statistics"], dict)


def test_quiz_history_response_schema(client, test_db):
    """Test that quiz history returns correct schema"""
    # Create vocabulary
    for i in range(5):
        word = Word(german_word=f"Word{i}", meaning=f"Meaning{i}")
        test_db.add(word)
    test_db.commit()
    
    # Complete a quiz first
    client.post(
        "/api/v1/quiz/complete",
        json={
            "quiz_id": "quiz_1",
            "score": 8,
            "total_questions": 10,
            "vocabulary_ids": [1, 2, 3, 4, 5],
            "results": []
        },
        params={"user_id": 1}
    )
    
    # Get history
    response = client.get(
        "/api/v1/quiz/history",
        params={"user_id": 1}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    
    if len(data) > 0:
        session = data[0]
        # Verify quiz session schema
        assert "id" in session
        assert "user_id" in session
        assert session["user_id"] == 1
        assert "score" in session
        assert "total_questions" in session
        assert "created_at" in session


def test_quiz_statistics_response_schema(client, test_db):
    """Test that statistics endpoint returns correct schema"""
    response = client.get(
        "/api/v1/quiz/statistics",
        params={"user_id": 1}
    )
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify statistics schema
    assert "total_quizzes" in data
    assert isinstance(data["total_quizzes"], int)
    assert "average_score" in data
    assert isinstance(data["average_score"], (int, float))
    assert "best_score" in data
    assert "worst_score" in data
    assert "current_streak" in data


def test_error_response_schema_for_insufficient_vocabulary(client, test_db):
    """Test error response schema when vocabulary is insufficient"""
    # Create only 2 words (need at least 10)
    for i in range(2):
        word = Word(german_word=f"Word{i}", meaning=f"Meaning{i}")
        test_db.add(word)
    test_db.commit()
    
    response = client.get(
        "/api/v1/quiz/generate",
        params={"count": 5}
    )
    
    assert response.status_code == 409
    data = response.json()
    assert "detail" in data
    assert isinstance(data["detail"], str)
    assert "Insufficient vocabulary" in data["detail"]


def test_error_response_schema_for_invalid_options(client):
    """Test error response schema for invalid option index"""
    response = client.post(
        "/api/v1/quiz/submit",
        json={
            "quiz_id": "quiz_1",
            "question_id": "q_1",
            "selected_option_index": 5  # Invalid
        }
    )
    
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert isinstance(data["detail"], str)
    assert "Invalid option index" in data["detail"]


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
