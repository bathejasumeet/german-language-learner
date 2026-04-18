# Backend - German Language Learning App

FastAPI-based REST API backend for the German Language Learning Application. Provides complete CRUD operations for vocabulary, flashcards, quizzes, and user progress tracking.

## Stack

- **Python**: 3.11
- **Framework**: FastAPI 0.135.3
- **Database**: PostgreSQL (Docker)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Testing**: pytest, pytest-asyncio
- **Linting**: black, flake8, isort

## Quick Start

### 1. Setup Environment

```bash
cd backend

# Create .env file from template
cp .env.example .env

# Edit .env with your settings (or use defaults)
# Important variables:
# - DATABASE_URL: PostgreSQL connection string
# - LOG_LEVEL: DEBUG, INFO, WARNING
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Start Backend with Docker Compose

From project root:

```bash
# Build and start all services (backend + PostgreSQL)
docker-compose up --build

# Backend will be available at: http://localhost:8000
# API docs at: http://localhost:8000/docs
```

### 4. Run Database Migrations

```bash
# First time setup (creates tables)
cd backend
alembic upgrade head

# After schema changes
alembic revision --autogenerate -m "Description of changes"
alembic upgrade head
```

## Project Structure

```
backend/
├── src/
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Configuration loading
│   ├── database.py          # Database setup
│   ├── schemas.py           # Pydantic request/response schemas
│   ├── schemas_extended.py  # Extended schemas (as-needed)
│   ├── models/
│   │   ├── __init__.py
│   │   └── models.py        # SQLAlchemy ORM models
│   ├── services/
│   │   ├── vocabulary.py    # Word CRUD service
│   │   ├── flashcards.py    # Flashcard service
│   │   └── quiz.py          # Quiz & progress service
│   └── api/
│       ├── __init__.py
│       ├── words.py         # Word endpoints
│       ├── flashcards.py    # Flashcard endpoints
│       └── quiz.py          # Quiz endpoints
├── tests/
│   ├── conftest.py          # Test configuration
│   ├── contract/            # Contract/API tests
│   ├── integration/         # Integration tests
│   ├── unit/                # Unit tests
│   ├── e2e/
│   │   └── test_full_user_flow.py  # End-to-end tests
│   └── llm/
│       └── generate_tests.py  # LLM-based test generation
├── alembic/                 # Database migrations
├── Dockerfile
├── requirements.txt
├── pyproject.toml
└── README.md
```

## API Endpoints

### Words (Vocabulary)

```bash
# Create a word
POST /words
Body: { "german_word": "Apfel", "meaning": "Apple" }

# Get all words (paginated)
GET /words?skip=0&limit=100

# Get a specific word
GET /words/{word_id}

# Update a word
PUT /words/{word_id}
Body: { "meaning": "Updated meaning" }

# Delete a word
DELETE /words/{word_id}
```

### Flashcards

```bash
# Create a flashcard from a word
POST /flashcards
Body: { "word_id": 1 }

# Get all flashcards
GET /flashcards?skip=0&limit=100

# Get flashcards by word
GET /flashcards/word/{word_id}

# Mark flashcard as known
POST /flashcards/{flashcard_id}/mark-known

# Mark flashcard as unknown
POST /flashcards/{flashcard_id}/mark-unknown
```

### Quiz

```bash
# Create a quiz
POST /quiz
Body: { "num_questions": 10 }

# Get quiz details
GET /quiz/{quiz_id}

# Submit quiz answers
POST /quiz/{quiz_id}/submit
Body: { "score": 8 }
```

### Progress

```bash
# Get all progress records
GET /progress

# Get progress for a specific word
GET /progress/word/{word_id}

# Get progress statistics
GET /progress/stats
```

## Testing

### Run All Tests

```bash
cd backend

# Run with coverage
pytest -v --cov=src tests/

# Run specific test file
pytest -v tests/contract/test_words.py

# Run with markers
pytest -v -m integration
```

### Run E2E Tests

```bash
# Ensure backend is running
docker-compose up

# In another terminal
python tests/e2e/test_full_user_flow.py
```

### Generate Tests with LLM

```bash
# Requires Ollama running locally
python tests/llm/generate_tests.py --model llama2 --output tests/unit/
```

## Development

### Start Backend in Dev Mode

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

### Code Quality

```bash
# Format code
black src/ tests/

# Sort imports
isort src/ tests/

# Lint
flake8 src/ tests/

# All at once
make lint  # if Makefile exists
```

### Database Management

```bash
# Create new migration
alembic revision --autogenerate -m "Add new column"

# View migration history
alembic history

# Downgrade to previous migration
alembic downgrade -1

# Reset database (development only!)
alembic downgrade base
alembic upgrade head
```

## Configuration

All configuration is via environment variables (see `.env.example`):

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/german_learning

# Server
LOG_LEVEL=INFO
DEBUG=False

# CORS
FRONTEND_URL=http://localhost:5173
```

## Performance

See [PERFORMANCE.md](PERFORMANCE.md) for:

- Performance benchmarks
- Optimization techniques
- Load testing results
- Profiling tools and commands

## Security

See [SECURITY.md](../SECURITY.md) for:

- Security measures implemented
- Input validation
- Database security
- Dependency audit
- OWASP Top 10 checklist

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Migration Issues

```bash
# View current migration status
alembic current

# Downgrade all migrations
alembic downgrade base

# Re-run migrations
alembic upgrade head
```

### API Not Responding

```bash
# Check backend logs
docker-compose logs backend

# Verify backend is running
curl http://localhost:8000/docs

# Restart backend
docker-compose restart backend
```

## Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Use environment variables for all secrets
3. Enable HTTPS (reverse proxy with Nginx)
4. Use strong database credentials
5. Enable connection pooling
6. Setup monitoring and logging
7. Run database migrations

See [SECURITY.md](../SECURITY.md) for production security checklist.

## API Documentation

Once running, view interactive API docs at:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Contributing

- Follow code style: `black` formatted
- Write tests for new features
- Update documentation
- Run full test suite before submitting

## License

See LICENSE file in project root.
