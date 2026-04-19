# Phase 1: Data Model & Schema Design

**Purpose**: Define data structures and entity relationships for the feature  
**Date**: 2026-04-19

## Entity Definitions

### Vocabulary (Enhanced)

**Purpose**: Represents a single word/term in the user's learning collection  
**Database Table**: `vocabulary` (existing table, enhanced)

**Current Schema**:

```sql
CREATE TABLE vocabulary (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  german_word VARCHAR(255) NOT NULL,
  english_meaning VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Enhanced Schema** (ADD column):

```sql
ALTER TABLE vocabulary ADD COLUMN example_sentence VARCHAR(500);
```

**SQLAlchemy Model**:

```python
class Vocabulary(Base):
    __tablename__ = "vocabulary"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    german_word: Mapped[str] = mapped_column(String(255), nullable=False)
    english_meaning: Mapped[str] = mapped_column(String(255), nullable=False)
    example_sentence: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # NEW
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="vocabulary_entries")
```

**Attributes**:

- `id`: Unique identifier (primary key)
- `user_id`: Reference to user who owns this vocabulary entry
- `german_word`: German word/term (required, max 255 chars)
- `english_meaning`: English translation (required, max 255 chars)
- `example_sentence`: Usage example sentence in German (optional, max 500 chars) **NEW**
- `created_at`: Timestamp of creation
- `updated_at`: Timestamp of last modification

**Validation Rules**:

- german_word: Non-empty, no leading/trailing whitespace
- english_meaning: Non-empty, no leading/trailing whitespace
- example_sentence: Optional; if provided, max 500 characters
- Duplicate check: (user_id, german_word) must be unique (prevent duplicate vocabulary for same user)

**Access Patterns**:

- List all vocabulary for user (with pagination)
- Get single vocabulary entry by ID
- Create new vocabulary entry
- Update existing entry (word, meaning, example sentence)
- Delete entry by ID
- Random sampling: SELECT N random entries for quiz generation

---

### Quiz Session (New Entity)

**Purpose**: Represents a single quiz attempt by a user  
**Database Table**: `quiz_sessions` (new)

**Schema**:

```sql
CREATE TABLE quiz_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vocabulary_ids TEXT NOT NULL,  -- JSON array of vocabulary IDs used in quiz
    answers_json TEXT NOT NULL,     -- JSON array of {question_id, selected_answer, correct_answer}
    score INTEGER NOT NULL,          -- Final score (0-N)
    total_questions INTEGER NOT NULL,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**SQLAlchemy Model**:

```python
class QuizSession(Base):
    __tablename__ = "quiz_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    vocabulary_ids: Mapped[str] = mapped_column(Text, nullable=False)  # JSON array
    answers_json: Mapped[str] = mapped_column(Text, nullable=False)    # JSON array
    score: Mapped[int] = mapped_column(nullable=False)
    total_questions: Mapped[int] = mapped_column(nullable=False)
    duration_seconds: Mapped[Optional[int]] = mapped_column(nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", back_populates="quiz_sessions")
```

**Attributes**:

- `id`: Unique identifier
- `user_id`: Reference to user who took the quiz
- `vocabulary_ids`: JSON-encoded array of vocabulary IDs used in the quiz (for audit/replay)
- `answers_json`: JSON-encoded array of answer records (question_id, selected_answer, correct_answer)
- `score`: Total correct answers in this quiz
- `total_questions`: Total questions in quiz (e.g., 10)
- `duration_seconds`: Time spent on quiz (optional)
- `created_at`: When quiz was completed

**Access Patterns**:

- Create quiz session after quiz completion
- Retrieve quiz history for user
- Get quiz statistics (average score, quiz frequency, etc.)

---

### Quiz Question (Domain Object, not persisted)

**Purpose**: Represents a single quiz question with multiple-choice options  
**Database Table**: None (generated on-the-fly from vocabulary)

**Data Structure**:

```python
@dataclass
class QuizQuestion:
    id: str  # Unique identifier for this question instance
    vocabulary_id: int  # Reference to the vocabulary entry being tested
    question: str  # "What is the English meaning of: {german_word}?"
    german_word: str
    english_meaning: str  # Correct answer
    options: List[str]  # 4 options [correct_answer, distractor_1, distractor_2, distractor_3]
    correct_answer_index: int  # Position of correct answer in shuffled options (0-3)
```

**Generation Logic**:

1. Select 1 random vocabulary entry as question (correct answer = english_meaning)
2. Select 3 random vocabulary entries from other entries as distractors (use their english_meaning)
3. Shuffle all 4 options randomly
4. Track position of correct answer in shuffled list
5. Return QuizQuestion object

**Constraints**:

- Minimum 4 vocabulary entries required to generate quiz
- No duplicate options (all 4 must be distinct entries)
- Correct answer must be present in options

---

## Relationships & Dependencies

```
User (existing)
├── Vocabulary (1-to-many)
│   └── example_sentence (new field)
└── QuizSession (1-to-many, new)
    └── answers_json (references vocabulary entries)
```

---

## Migration Plan

**Phase 1 - Database Changes** (Alembic):

1. Create migration file: `versions/[timestamp]_add_example_sentence_to_vocabulary.py`
2. Add `example_sentence` column (nullable) to vocabulary table
3. Create `quiz_sessions` table
4. No data migration needed (existing vocabulary entries get NULL for example_sentence)

**Phase 2 - Backend Updates**:

1. Update Vocabulary ORM model with `example_sentence` field
2. Create QuizSession ORM model
3. Update services (vocabulary.py, quiz.py) to handle example_sentence
4. Add quiz generation logic to services

**Phase 3 - Frontend Updates**:

1. Update VocabularyForm to include example_sentence input
2. Create VocabularyManager component for Words tab
3. Update QuizQuestion component for multiple-choice display
4. Add colors.js utility

**Phase 4 - Testing**:

1. Write tests for new ORM models
2. Test API endpoints with example_sentence
3. Test quiz question generation (correct options, no duplicates)
4. Test UI components and workflows

---

## Index Optimization

**Recommended Indexes** (for performance):

```sql
-- For quick lookup of user's vocabulary
CREATE INDEX idx_vocabulary_user_id ON vocabulary(user_id);

-- For random sampling in quiz generation (if needed)
CREATE INDEX idx_vocabulary_user_created ON vocabulary(user_id, created_at);

-- For quiz history queries
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_created ON quiz_sessions(created_at);
```

**Rationale**: `user_id` is most frequent query filter; indexes speed up pagination and random sampling.

---

## Data Consistency Rules

**Integrity Constraints**:

1. **Referential Integrity**: All vocabulary entries and quiz sessions must reference existing users (foreign key)
2. **Unique Constraint**: (user_id, german_word) must be unique on vocabulary table (prevent duplicate entries)
3. **Quiz Validity**: Quiz session must reference vocabulary IDs that exist for the user
4. **Score Consistency**: Quiz score must be 0 <= score <= total_questions

**Enforcement**:

- Database: Foreign keys + unique constraints
- Application: Validation in services before persistence

---

## Schema Versioning

**Current Version**: 2.0.0 (after this feature)

- **1.0.0**: Initial schema (users, vocabulary, quizzes, flashcards, etc.)
- **2.0.0**: Add example_sentence to vocabulary; add quiz_sessions table; enhanced quiz tracking

**Migration Compatibility**: Backward compatible (new fields optional; new tables isolated)
