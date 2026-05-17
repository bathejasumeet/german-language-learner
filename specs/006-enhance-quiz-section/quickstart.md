# Quick-Start Guide: Enhance Quiz Section

**Feature**: 006-enhance-quiz-section  
**Date**: 2026-05-13

---

## Running the App Locally

```bash
# From repo root
docker-compose up          # starts backend (port 8000) + frontend (port 5173)
# OR without Docker:
cd backend && pip install -r requirements.txt && uvicorn src.main:app --reload
cd frontend && npm install && npm run dev
```

---

## Verifying the Minimum-Word Guard

1. Ensure `backend/data/words.csv` has fewer than 10 words (or clear it).
2. Open the app → navigate to Quiz tab.
3. **Expected**: An error message is displayed — e.g. _"You need at least 10 words to take a quiz. You currently have 7."_ The page does not freeze.

---

## Verifying the Four-Option Quiz Flow

1. Add at least 10 words via the Words tab.
2. Navigate to Quiz tab → click **Start Quiz**.
3. **Expected per question**: One German word is shown as the prompt; four answer options are displayed; selecting an option highlights it but reveals no green/red feedback; a **Next** button appears.
4. Complete all questions.
5. **Expected results screen**: Every question is listed with the German word, your selected answer, and the correct answer, visually marked correct (green) or incorrect (red).

---

## Running Tests

```bash
# Backend
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm test
```

---

## Key Files Changed

| File                                             | Change                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `backend/src/services/quiz.py`                   | `MINIMUM_VOCABULARY_COUNT` 4 → 10; updated error message                                   |
| `frontend/src/components/Quiz/QuizComponent.jsx` | Word-count guard; use `quizService.generateQuiz()`; deferred feedback; full results screen |
| `frontend/src/components/Quiz/QuizQuestion.jsx`  | Remove immediate feedback; add `hasSelected` flag                                          |
| `frontend/src/components/Quiz/AnswerOptions.jsx` | Remove green/red colouring during quiz; add per-question review variant                    |
| `backend/tests/unit/`                            | Updated constant test                                                                      |
| `frontend/tests/quiz.test.jsx`                   | Updated tests for new flow                                                                 |
