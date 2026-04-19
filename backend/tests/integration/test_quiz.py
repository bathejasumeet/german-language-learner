"""Integration tests for quiz and progress tracking functionality."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from src.database import Base, get_db
from src.main import app
from src.models.models import Word, Quiz, Progress


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


def test_create_quiz(client, test_db):
    """Test creating a new quiz."""
    response = client.post(
        "/api/v1/quiz/",
        json={"total_questions": 10}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["total_questions"] == 10
    assert "id" in data


def test_get_quiz(client, test_db):
    """Test retrieving a quiz."""
    # Create quiz
    create_response = client.post(
        "/api/v1/quiz/",
        json={"total_questions": 5}
    )
    quiz_id = create_response.json()["id"]
    
    # Get quiz
    response = client.get(f"/api/v1/quiz/{quiz_id}")
    
    assert response.status_code == 200
    assert response.json()["id"] == quiz_id


def test_submit_quiz_result(client, test_db):
    """Test submitting quiz results."""
    # Create quiz
    create_response = client.post(
        "/api/v1/quiz/",
        json={"total_questions": 10}
    )
    quiz_id = create_response.json()["id"]
    
    # Submit result
    response = client.post(
        f"/api/v1/quiz/{quiz_id}/submit",
        json={"correct_answers": 8}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["correct_answers"] == 8
    assert data["score"] == 80.0


def test_get_user_statistics(client, test_db):
    """Test retrieving user statistics."""
    response = client.get("/api/v1/quiz/stats/overall")
    
    assert response.status_code == 200
    data = response.json()
    assert "total_words" in data
    assert "total_quizzes" in data
    assert "average_quiz_score" in data


def test_record_word_progress(client, test_db):
    """Test recording progress for a word."""
    # Create a word
    word = Word(german_word="Fenster", meaning="Window")
    test_db.add(word)
    test_db.commit()
    test_db.refresh(word)
    
    # Record progress
    response = client.post(
        f"/api/v1/quiz/progress/{word.id}",
        json={"is_correct": True}
    )
    
    assert response.status_code == 201


def test_get_word_progress(client, test_db):
    """Test retrieving progress for a word."""
    # Create a word
    word = Word(german_word="Schlüssel", meaning="Key")
    test_db.add(word)
    test_db.commit()
    test_db.refresh(word)
    
    # Record some progress
    client.post(
        f"/api/v1/quiz/progress/{word.id}",
        json={"is_correct": True}
    )
    
    # Get progress
    response = client.get(f"/api/v1/quiz/progress/{word.id}")
    
    assert response.status_code == 200
    data = response.json()
    assert "times_reviewed" in data
    assert data["times_reviewed"] == 1


def test_quiz_score_calculation(client, test_db):
    """Test that quiz score is calculated correctly."""
    response = client.post(
        "/api/v1/quiz/",
        json={"total_questions": 20}
    )
    quiz_id = response.json()["id"]
    
    response = client.post(
        f"/api/v1/quiz/{quiz_id}/submit",
        json={"correct_answers": 15}
    )
    
    assert response.status_code == 200
    score = response.json()["score"]
    assert score == 75.0


def test_multiple_quiz_attempts(client, test_db):
    """Test creating and submitting multiple quizzes."""
    quiz_ids = []
    
    for i in range(3):
        response = client.post(
            "/api/v1/quiz/",
            json={"total_questions": 10}
        )
        quiz_ids.append(response.json()["id"])
    
    assert len(quiz_ids) == 3
    
    # Submit results for each
    for quiz_id in quiz_ids:
        response = client.post(
            f"/api/v1/quiz/{quiz_id}/submit",
            json={"correct_answers": 7}
        )
        assert response.status_code == 200


# ============= Multiple-Choice Quiz Tests (T053-T055) =============

def test_generate_multiple_choice_quiz(client, test_db):
    """Test generating a multiple-choice quiz (T053)"""
    # Create some vocabulary entries first
    for i in range(5):
        word = Word(
            german_word=f"Word{i}",
            meaning=f"Meaning{i}",
            example_sentence=f"Example sentence {i}"
        )
        test_db.add(word)
    test_db.commit()
    
    # Generate quiz
    response = client.get(
        "/api/v1/quiz/generate",
        params={"count": 5}
    )
    
    assert response.status_code == 201
    data = response.json()
    assert "quiz_id" in data
    assert data["total_questions"] == 5
    assert len(data["questions"]) == 5
    
    # Verify each question has 4 options
    for question in data["questions"]:
        assert len(question["options"]) == 4
        assert "correct_answer_index" in question
        assert 0 <= question["correct_answer_index"] <= 3


def test_generate_quiz_with_insufficient_vocabulary(client, test_db):
    """Test that quiz generation fails with insufficient vocabulary"""
    # Create only 2 vocabulary entries (need at least 4)
    for i in range(2):
        word = Word(german_word=f"Word{i}", meaning=f"Meaning{i}")
        test_db.add(word)
    test_db.commit()
    
    response = client.get(
        "/api/v1/quiz/generate",
        params={"count": 5}
    )
    
    assert response.status_code == 409
    assert "Insufficient vocabulary" in response.json()["detail"]


def test_quiz_answer_submission(client, test_db):
    """Test submitting quiz answers (T054)"""
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
    assert "is_correct" in data
    assert "correct_answer_index" in data


def test_quiz_answer_submission_with_invalid_option(client, test_db):
    """Test that invalid option index is rejected (T051)"""
    response = client.post(
        "/api/v1/quiz/submit",
        json={
            "quiz_id": "quiz_1",
            "question_id": "q_1",
            "selected_option_index": 5  # Invalid: must be 0-3
        }
    )
    
    assert response.status_code == 400
    assert "Invalid option index" in response.json()["detail"]


def test_quiz_completion(client, test_db):
    """Test completing a quiz and persisting results"""
    # Create vocabulary
    for i in range(5):
        word = Word(german_word=f"Word{i}", meaning=f"Meaning{i}")
        test_db.add(word)
    test_db.commit()
    
    response = client.post(
        "/api/v1/quiz/complete",
        json={
            "quiz_id": "test_quiz_1",
            "score": 7,
            "total_questions": 10,
            "vocabulary_ids": [1, 2, 3, 4, 5],
            "results": [
                {"question_id": "q_1", "selected": 0, "correct": 0},
                {"question_id": "q_2", "selected": 1, "correct": 1},
            ],
            "duration_seconds": 120
        },
        params={"user_id": 1}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 7
    assert data["total_questions"] == 10
    assert data["percentage"] == 70.0
    assert data["duration_seconds"] == 120


def test_quiz_history_retrieval(client, test_db):
    """Test retrieving quiz history for a user"""
    # Create and complete a quiz
    for i in range(5):
        word = Word(german_word=f"Word{i}", meaning=f"Meaning{i}")
        test_db.add(word)
    test_db.commit()
    
    # Complete quiz
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
        params={"user_id": 1, "skip": 0, "limit": 10}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
