# Phase 0: Research & Knowledge Gathering

**Purpose**: Resolve technical unknowns and establish best practices for the feature  
**Date**: 2026-04-19

## Technology Decisions

### 1. Database Schema Extension (PostgreSQL)

**Decision**: Add `example_sentence` column to existing vocabulary/words table

**Rationale**:

- Minimizes schema disruption; single column addition maintains backward compatibility
- PostgreSQL nullable columns are efficient and don't require data migration complexity
- Alembic ORM integration already present in project; migration tool ready

**Alternatives Considered**:

- Separate `VocabularySentences` junction table: Rejected (adds complexity for 1:1 relationship; current approach sufficient)
- JSON/JSONB field: Rejected (less queryable; single text field sufficient for current needs)

**Implementation**: Add nullable `example_sentence: String(500)` column via SQLAlchemy ORM with Alembic migration

---

### 2. Multiple-Choice Distractor Generation

**Decision**: Server-side generation using existing vocabulary entries; shuffle answer positions

**Rationale**:

- Ensures reproducible, consistent distractors across quiz sessions
- Prevents easy answer detection from answer position patterns
- Leverages server resources vs client-side randomization
- Minimum viable threshold: 4 vocabulary entries required (1 correct + 3 distractors)

**Alternatives Considered**:

- LLM-based distractor generation: Rejected (adds dependency, latency, cost; simple vocabulary similarity sufficient)
- Client-side generation: Rejected (client doesn't have full vocabulary dataset; backend knows all entries)
- Fixed distractor pool: Rejected (less variety; dynamic generation more scalable)

**Implementation**:

- Query vocabulary randomly; select 1 as question, 3 others as distractors
- Shuffle all 4 options; record shuffled position of correct answer
- Return with `correct_position` for validation

---

### 3. Frontend Navigation Reorganization

**Decision**: Create new "Words" tab in main navigation; relocate vocabulary list there; keep "Vocabulary" tab for creation form only

**Rationale**:

- Clears cognitive load on vocabulary tab; users see only form (intent: create)
- Words tab becomes destination for browsing/managing vocabulary (clear information architecture)
- Aligns with user mental model: "create" vs "browse/manage" separation
- Consistent with language learning app patterns (Duolingo, Memrise, Anki)

**Alternatives Considered**:

- Accordion/modal for vocabulary list on vocabulary tab: Rejected (clutters UI; adds toggle state complexity)
- Sidebar vocabulary browser: Rejected (reduces form space; distracting secondary panel)
- Vocabulary list as tab within vocabulary form: Rejected (nesting reduces clarity)

**Implementation**:

- Add new route/page: `/words` (or `WordsTab` component)
- Move VocabularyList component to WordsTab
- Keep VocabularyForm in VocabularyTab only
- Update Dashboard navigation to include Words tab

---

### 4. Color Scheme Consistency

**Decision**: Define shared color palette in centralized utility file; apply consistently across new UI components

**Rationale**:

- Addresses user complaint about app not feeling cohesive
- Centralized colors.js/colors.ts enables single source of truth
- Facilitates A/B testing and theme changes
- Improves maintainability: update colors once, propagate everywhere

**Alternatives Considered**:

- CSS variables only: Rejected (less accessible to React components; harder to use in inline styles)
- Tailwind CSS: Rejected (project already established; adding new build dependency adds friction)
- Inline styles per component: Rejected (no consistency; hard to maintain)

**Implementation**:

- Create `src/services/colors.js` with exported color constants (primary, secondary, success, error, neutral)
- Use in all new components (VocabularyForm, QuizQuestion, VocabularyManager, etc.)
- Document color usage patterns in quickstart.md

---

### 5. Quiz User Experience Pattern

**Decision**: Immediate feedback (show correct answer); allow proceed to next question; track score

**Rationale**:

- Immediate feedback is proven learning science best practice
- Reduces frustration vs delayed feedback
- Clear visual distinction (green correct, red incorrect) aids comprehension
- Score tracking motivates continued learning

**Alternatives Considered**:

- Delayed feedback (aggregate at end): Rejected (poor learning science; reduces motivation)
- Retry mechanic per question: Rejected (extends quiz time; doesn't match feature request)
- No scoring: Rejected (motivation/progress tracking needed)

**Implementation**:

- Show feedback immediately on answer selection
- Highlight correct answer (green); show selected answer outcome (correct/incorrect with visual cues)
- Proceed button enables after feedback shown
- Accumulate score; show final score/metrics at quiz end

---

## API Design Patterns

### RESTful Endpoints

**Vocabulary Management**:

- `GET /api/words` - List all vocabulary (with pagination for large datasets)
- `POST /api/words` - Create new vocabulary entry (word, meaning, example_sentence)
- `GET /api/words/{id}` - Retrieve single entry
- `PUT /api/words/{id}` - Update entry (including example_sentence)
- `DELETE /api/words/{id}` - Delete entry

**Quiz Generation**:

- `GET /api/quiz/generate?count=10` - Generate quiz with N questions (returns questions + shuffled options)
- `POST /api/quiz/submit` - Submit answer (question_id, selected_option_index, receives validation)
- `GET /api/quiz/score` - Get quiz session results

**Design Pattern**: Stateless REST with session cookies/JWT for user context (existing auth reused)

---

## Frontend Component Architecture

**Pattern**: Functional React components with hooks; centralized services layer

**Structure**:

- Components handle UI only (render, user input capture)
- Services handle API calls (vocabularyService, quizService)
- Shared utilities (colors.js) provide constants
- Container components manage state; presentational components consume props

**Styling**: Inline styles using color constants + minimal CSS (maintain existing approach)

---

## Testing Strategy

### Backend Tests

- **Unit**: ORM models, service logic (vocabulary persistence, distractor generation)
- **Integration**: API endpoints (create word + example, retrieve, quiz generation, answer validation)
- **Contract**: API schema validation (response format, status codes)

### Frontend Tests

- **Unit**: Component rendering with various props (VocabularyForm with/without example, QuizQuestion with correct/incorrect)
- **Integration**: Form submission flow, quiz answer flow, vocabulary list interactions
- **E2E**: Full user journey (create vocabulary → browse in Words tab → take quiz → see score)

---

## Performance Considerations

### Vocabulary List Loading

- **Target**: <1 second for up to 500 entries
- **Implementation**: Paginate list (20 per page); lazy load on scroll OR implement server-side pagination
- **Testing**: Load test with 500+ vocabulary entries

### Quiz Question Generation

- **Target**: <500ms response time
- **Implementation**: Cache vocabulary list; minimize DB queries (select 4 random entries efficiently)
- **Optimization**: Index on vocabulary table for random sampling if needed

### Frontend Rendering

- **Target**: Smooth 60fps for quiz interactions
- **Implementation**: Memoize components; avoid unnecessary re-renders
- **Tools**: React DevTools Profiler for optimization

---

## Risks & Mitigation

| Risk                                           | Impact                     | Mitigation                                                        |
| ---------------------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| Insufficient vocabulary for quiz (< 4 entries) | Quiz cannot proceed        | Return error message with suggestion to add more vocabulary first |
| Example sentence field too long for UI display | Text overflow/layout break | Truncate to 500 chars; add ellipsis; tooltip for full text        |
| Color scheme doesn't match existing app        | Inconsistent UI appearance | Review existing styles first; test with real app layout           |
| Quiz distractor generation produces duplicates | Confusing quiz experience  | Filter duplicates; ensure 4 unique options before returning       |

---

## Dependency Review

**No new external dependencies required**:

- Database: PostgreSQL (existing) + SQLAlchemy (existing)
- Backend: FastAPI (existing) + existing testing tools
- Frontend: React (existing) + axios (existing)
- Colors: Native CSS/JS constants (no library needed)

**Optional enhancements** (future iterations):

- Color picker library for theme customization
- Quiz gamification library (badges, streaks)
- Advanced word similarity for distractor generation (future LLM integration)
