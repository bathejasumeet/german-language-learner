# Getting Started: Enhance User-Friendliness Feature

**Purpose**: Quick reference guide for developers implementing this feature  
**Version**: 2.0.0  
**Date**: 2026-04-19

## Feature Overview

This feature enhances the German Language Learner app with three key improvements:

1. **Vocabulary with Example Sentences**: Users can add contextual example sentences to vocabulary entries
2. **Dedicated Vocabulary Management**: New "Words" tab for browsing vocabulary, separate from creation
3. **Multiple-Choice Quiz**: Quiz questions with 4 answer options instead of free-text responses

## Technology Stack

| Layer              | Technology | Version        |
| ------------------ | ---------- | -------------- |
| Backend            | FastAPI    | (existing)     |
| Backend ORM        | SQLAlchemy | 2.0.49         |
| Database           | PostgreSQL | (existing)     |
| Frontend           | React      | 19.2.4         |
| Frontend Build     | Vite       | 8.0.4          |
| Testing (Backend)  | pytest     | 9.0.3          |
| Testing (Frontend) | vitest     | (to integrate) |

## File Structure Overview

```
specs/002-enhance-user-features/
├── spec.md                   # Feature specification
├── plan.md                   # This implementation plan
├── research.md               # Technology decisions & best practices
├── data-model.md             # Database schema updates
├── quickstart.md             # This file
└── contracts/
    ├── vocabulary-api.md     # Vocabulary API specification
    └── quiz-api.md           # Quiz API specification

backend/src/
├── models/models.py          # ORM: Add example_sentence to Vocabulary
├── services/
│   ├── vocabulary.py         # Enhanced to handle example_sentence
│   └── quiz.py               # NEW: Multiple-choice quiz generation
└── api/
    ├── words.py              # Enhanced endpoints for vocabulary
    └── quiz.py               # NEW: Quiz endpoints

frontend/src/
├── components/
│   ├── VocabularyForm.jsx    # Enhanced with example_sentence input
│   ├── VocabularyManager.jsx # NEW: List/browse vocabulary
│   ├── QuizQuestion.jsx      # Enhanced for multiple-choice
│   └── AnswerOptions.jsx     # NEW: Render multiple-choice options
├── pages/
│   ├── VocabularyTab.jsx     # Form only (list moved to Words tab)
│   ├── WordsTab.jsx          # NEW: Dedicated vocabulary management
│   ├── QuizTab.jsx           # Enhanced for multiple-choice
│   └── Dashboard.jsx         # Updated navigation
└── services/
    ├── vocabularyService.js  # API calls for vocabulary
    ├── quizService.js        # NEW: Quiz API integration
    └── colors.js             # NEW: Centralized color palette
```

## Database Changes

### Migration Required

Create Alembic migration to add `example_sentence` column:

```bash
cd backend
alembic revision --autogenerate -m "add_example_sentence_to_vocabulary"
alembic upgrade head
```

**Migration SQL**:

```sql
ALTER TABLE vocabulary ADD COLUMN example_sentence VARCHAR(500);
CREATE TABLE quiz_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    vocabulary_ids TEXT NOT NULL,
    answers_json TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_quiz_sessions_user_id ON quiz_sessions(user_id);
```

### ORM Updates

**File**: `backend/src/models/models.py`

```python
# BEFORE:
class Vocabulary(Base):
    __tablename__ = "vocabulary"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    german_word: Mapped[str] = mapped_column(String(255))
    english_meaning: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

# AFTER: Add this line
class Vocabulary(Base):
    __tablename__ = "vocabulary"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    german_word: Mapped[str] = mapped_column(String(255))
    english_meaning: Mapped[str] = mapped_column(String(255))
    example_sentence: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # NEW
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
```

## Backend Implementation Checklist

### Phase 1: Database & ORM

- [ ] Create Alembic migration for `example_sentence` column
- [ ] Create Alembic migration for `quiz_sessions` table
- [ ] Add QuizSession ORM model to `models.py`
- [ ] Update Vocabulary ORM model with `example_sentence` field
- [ ] Run migrations in local development: `alembic upgrade head`

### Phase 2: Services Layer

- **File**: `backend/src/services/vocabulary.py`
  - [ ] Update `create_vocabulary()` to accept `example_sentence`
  - [ ] Update `update_vocabulary()` to handle `example_sentence` updates
  - [ ] Validation: max 500 chars for `example_sentence`
  - [ ] Tests: unit tests for example_sentence persistence

- **File**: `backend/src/services/quiz.py` (NEW)
  - [ ] Create `generate_quiz(user_id, num_questions)` function
  - [ ] Logic: Select N random vocabulary entries (1 per question + 3 as distractors)
  - [ ] Shuffle options; track correct answer position
  - [ ] Return QuizQuestion objects
  - [ ] Validation: Require minimum 4 vocabulary entries
  - [ ] Tests: unit tests for distractor generation, no duplicates

### Phase 3: API Endpoints

- **File**: `backend/src/api/words.py`
  - [ ] Update `POST /api/words` to accept `example_sentence`
  - [ ] Update `PUT /api/words/{id}` to handle `example_sentence` updates
  - [ ] Update `GET /api/words` response to include `example_sentence`
  - [ ] Update `GET /api/words/{id}` response to include `example_sentence`
  - [ ] Integration tests for all endpoints

- **File**: `backend/src/api/quiz.py` (NEW)
  - [ ] `GET /api/quiz/generate?count=N` - Generate quiz
  - [ ] `POST /api/quiz/submit` - Submit answer (immediate feedback)
  - [ ] `POST /api/quiz/complete` - Finalize quiz, get score
  - [ ] `GET /api/quiz/history` - Quiz history
  - [ ] Integration tests for all endpoints

### Phase 4: Testing

- [ ] Unit tests: ORM models, service functions
- [ ] Integration tests: API endpoints with real database
- [ ] Contract tests: Response format validation
- [ ] Edge cases: Empty example_sentence, insufficient vocabulary for quiz

## Frontend Implementation Checklist

### Phase 1: Components

- **File**: `frontend/src/components/VocabularyForm.jsx` (ENHANCE)
  - [ ] Add `<input>` field for `example_sentence` (max 500 chars)
  - [ ] Label: "Example Sentence (optional)"
  - [ ] Placeholder: "e.g., Das Haus ist sehr groß."
  - [ ] Character counter: Show "X/500" as user types
  - [ ] Update form submission to send `example_sentence`

- **File**: `frontend/src/components/VocabularyManager.jsx` (NEW)
  - [ ] Display vocabulary list with pagination (20 items per page)
  - [ ] Show: German word, English meaning, example sentence
  - [ ] Actions: View, Edit, Delete buttons for each entry
  - [ ] Empty state: "No vocabulary yet. Create your first word!"
  - [ ] Search/filter: Allow search by German word or meaning
  - [ ] Tests: Rendering, pagination, edit/delete actions

- **File**: `frontend/src/components/QuizQuestion.jsx` (ENHANCE)
  - [ ] Change from free-text input to multiple-choice buttons
  - [ ] Display 4 answer buttons (A, B, C, D or option text)
  - [ ] Track user's selected answer
  - [ ] Disable buttons after selection
  - [ ] Tests: Multiple-choice rendering, selection tracking

- **File**: `frontend/src/components/AnswerOptions.jsx` (NEW)
  - [ ] Render 4 answer option buttons
  - [ ] Visual styling: Button states (default, selected, correct, incorrect)
  - [ ] Props: `options`, `onSelect`, `disabled`, `userSelectedIndex`, `correctIndex`, `showFeedback`
  - [ ] Feedback display: Highlight correct answer after selection

### Phase 2: Pages

- **File**: `frontend/src/pages/VocabularyTab.jsx` (SIMPLIFY)
  - [ ] Remove vocabulary list (moved to WordsTab)
  - [ ] Keep only VocabularyForm
  - [ ] Page now focuses on creating new vocabulary
  - [ ] Update header/instructions accordingly

- **File**: `frontend/src/pages/WordsTab.jsx` (NEW)
  - [ ] Import VocabularyManager component
  - [ ] Title: "My Vocabulary"
  - [ ] Include VocabularyManager to display vocabulary list
  - [ ] Include button to create new word (redirects to VocabularyTab)
  - [ ] Tests: Page rendering, navigation

- **File**: `frontend/src/pages/QuizTab.jsx` (ENHANCE)
  - [ ] Update quiz flow to support multiple-choice
  - [ ] Display current question and 4 options (via AnswerOptions)
  - [ ] Show immediate feedback after answer selection
  - [ ] Progress indicator: "Question X of Y"
  - [ ] Next button to proceed to next question
  - [ ] Final score screen
  - [ ] Tests: Quiz flow, scoring, navigation

- **File**: `frontend/src/pages/Dashboard.jsx` (UPDATE)
  - [ ] Add "Words" tab to main navigation (between Vocabulary and Quiz)
  - [ ] Update tab order: Vocabulary | Words | Quiz | Flashcards
  - [ ] Ensure all tabs properly route
  - [ ] Update navigation styling (consistent colors)

### Phase 3: Services

- **File**: `frontend/src/services/vocabularyService.js` (ENHANCE)
  - [ ] `createVocabulary(word, meaning, exampleSentence)` - Include example_sentence in request
  - [ ] `updateVocabulary(id, word, meaning, exampleSentence)` - Handle example_sentence
  - [ ] `getVocabulary(id)` - Response includes example_sentence
  - [ ] `listVocabulary(page, limit)` - Response includes example_sentence

- **File**: `frontend/src/services/quizService.js` (NEW)
  - [ ] `generateQuiz(count)` - `GET /api/quiz/generate?count=N`
  - [ ] `submitAnswer(quizId, questionId, selectedOptionIndex)` - `POST /api/quiz/submit`
  - [ ] `completeQuiz(quizId, durationSeconds)` - `POST /api/quiz/complete`
  - [ ] `getQuizHistory(page, limit)` - `GET /api/quiz/history`

- **File**: `frontend/src/services/colors.js` (NEW)
  - [ ] Create centralized color palette
  - [ ] Export constants: `PRIMARY`, `SECONDARY`, `SUCCESS`, `ERROR`, `NEUTRAL`, `BACKGROUND`, `TEXT`
  - [ ] Example:
    ```javascript
    export const colors = {
      PRIMARY: "#2563eb", // Blue
      SECONDARY: "#8b5cf6", // Purple
      SUCCESS: "#10b981", // Green
      ERROR: "#ef4444", // Red
      NEUTRAL: "#6b7280", // Gray
      BACKGROUND: "#f9fafb", // Light gray
      TEXT: "#111827", // Dark gray/black
    };
    ```

### Phase 4: Styling & Theme

- [ ] Apply colors from `colors.js` to all components
- [ ] Update buttons, inputs, success/error messages
- [ ] Ensure consistent spacing and typography
- [ ] Review VocabularyManager styling for list display
- [ ] Quiz feedback colors: Green for correct, Red for incorrect

### Phase 5: Testing

- [ ] Component tests: VocabularyForm, VocabularyManager, QuizQuestion, AnswerOptions
- [ ] Integration tests: Vocabulary workflow (create → browse → edit)
- [ ] Integration tests: Quiz workflow (generate → answer → score)
- [ ] E2E tests: Full user journey (create word with example → browse → take quiz)

## Implementation Order (Recommended)

1. **Backend**: Database migrations + ORM updates
2. **Backend**: Services layer (vocabulary + quiz generation)
3. **Backend**: API endpoints + tests
4. **Frontend**: Centralized colors (`colors.js`)
5. **Frontend**: Component updates (VocabularyForm, QuizQuestion)
6. **Frontend**: New components (VocabularyManager, AnswerOptions)
7. **Frontend**: Page reorganization (WordsTab, update Dashboard)
8. **Testing**: Full integration and E2E tests
9. **Review**: Code review, performance testing
10. **Deploy**: Merge to main, deploy to production

## Testing Commands

### Backend

```bash
cd backend

# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_vocabulary.py

# Run with coverage
pytest --cov=src tests/

# Run integration tests
pytest tests/integration/
```

### Frontend

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Build
npm run build

# Lint
npm run lint
```

## Performance Targets

| Metric                                  | Target  |
| --------------------------------------- | ------- |
| Vocabulary list load (500 entries)      | < 1s    |
| Quiz question generation (10 questions) | < 500ms |
| Quiz answer feedback display            | < 500ms |
| Frontend build time                     | < 30s   |
| API response time (p95)                 | < 200ms |

## Common Errors & Troubleshooting

### "Insufficient vocabulary entries for quiz"

- **Cause**: User has < 4 vocabulary entries
- **Solution**: Create more vocabulary entries first

### "Duplicate vocabulary entry"

- **Cause**: User already created same German word
- **Solution**: Use different word or update existing entry

### Quiz answer not recording

- **Cause**: Network issue or quiz session expired
- **Solution**: Refresh quiz, ensure good connection

### Colors not applying

- **Cause**: `colors.js` not imported in component
- **Solution**: Add `import { colors } from '../services/colors.js'`

## Additional Resources

- **Vocabulary API**: See `contracts/vocabulary-api.md`
- **Quiz API**: See `contracts/quiz-api.md`
- **Data Model**: See `data-model.md`
- **Research**: See `research.md` for technology decisions

## Contacts & Escalation

- **Backend Questions**: Refer to research.md for architecture decisions
- **Frontend Questions**: Check component examples in existing codebase
- **Database Issues**: Review Alembic migration logs and data-model.md
