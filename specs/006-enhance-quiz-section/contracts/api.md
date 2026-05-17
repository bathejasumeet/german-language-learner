# API Contracts: Enhance Quiz Section

**Feature**: 006-enhance-quiz-section  
**Date**: 2026-05-13

Only the two endpoints used by this feature are documented. No new endpoints are added.

---

## GET /api/v1/quiz/generate

Generates a randomised multiple-choice quiz session.

### Query Parameters

| Parameter | Type | Default | Notes                             |
| --------- | ---- | ------- | --------------------------------- |
| count     | int  | 10      | Number of questions; must be 1–20 |

### Success Response — 200 OK

```json
{
  "quiz_id": "quiz_10q_482931",
  "total_questions": 10,
  "questions": [
    {
      "id": "q_1",
      "vocabulary_id": 7,
      "question": "What is the English meaning of: Hund?",
      "german_word": "Hund",
      "english_meaning": "Dog",
      "options": ["Cat", "Dog", "House", "Tree"],
      "correct_answer_index": 1
    }
  ]
}
```

### Error — 409 Conflict (vocabulary < 10)

```json
{
  "detail": "Insufficient vocabulary. Need at least 10 entries to generate quiz. Current: 7"
}
```

### Changed Behaviour in This Feature

- `MINIMUM_VOCABULARY_COUNT` is raised from `4` to `10`.
- Error message text is updated to reflect the new minimum.

---

## POST /api/v1/quiz/complete

Persists the completed quiz session for history/statistics.

### Request Body

```json
{
  "quiz_id": "quiz_10q_482931",
  "score": 8,
  "total_questions": 10,
  "vocabulary_ids": [7, 3, 12, 5, 9, 1, 4, 6, 2, 11],
  "results": [
    {
      "question_id": "q_1",
      "selected_option_index": 1,
      "is_correct": true
    }
  ],
  "duration_seconds": 120
}
```

### Success Response — 200 OK

```json
{
  "quiz_id": "quiz_10q_482931",
  "score": 8,
  "total_questions": 10,
  "percentage": 80.0,
  "duration_seconds": 120,
  "results": [...],
  "statistics": {
    "total_quizzes": 5,
    "average_score": 75.0,
    "best_score": 90.0,
    "worst_score": 60.0,
    "current_streak": 1
  }
}
```

No changes to this endpoint in this feature.
