# Quiz API Contract

**Purpose**: Define the HTTP API contract for multiple-choice quiz functionality  
**Version**: 2.0.0  
**Base URL**: `/api/quiz`

## Endpoints

### Generate Quiz

**Endpoint**: `GET /api/quiz/generate`

**Purpose**: Generate a new quiz with multiple-choice questions from user's vocabulary

**Query Parameters**:

```json
{
  "count": 10 // (required) Number of questions, valid range: 1-20
}
```

**Request Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Success Response** (200 OK):

```json
{
  "quiz_id": "quiz_20260419_abc123",
  "total_questions": 10,
  "questions": [
    {
      "id": "q_1",
      "vocabulary_id": 5,
      "question": "What is the English meaning of: Haus",
      "german_word": "Haus",
      "options": ["House", "Window", "Door", "Room"],
      "correct_answer_index": 0
    },
    {
      "id": "q_2",
      "vocabulary_id": 12,
      "question": "What is the English meaning of: Baum",
      "german_word": "Baum",
      "options": ["Flower", "Tree", "Bush", "Plant"],
      "correct_answer_index": 1
    }
  ]
}
```

**Field Descriptions**:

- `quiz_id`: Unique identifier for this quiz session (used when submitting answers)
- `total_questions`: Total questions in this quiz
- `questions`: Array of quiz question objects
  - `id`: Unique question identifier within quiz
  - `vocabulary_id`: Reference to vocabulary entry being tested
  - `question`: Question prompt
  - `german_word`: The German word being tested
  - `options`: Array of 4 answer options (shuffled)
  - `correct_answer_index`: Position (0-3) of correct answer in shuffled options

**Error Responses**:

- `400 Bad Request`: Invalid count parameter
  ```json
  {
    "error": "Invalid count parameter",
    "details": "count must be between 1 and 20"
  }
  ```
- `409 Conflict`: Insufficient vocabulary to generate quiz
  ```json
  {
    "error": "Insufficient vocabulary entries",
    "details": "Minimum 4 vocabulary entries required; user has 2"
  }
  ```
- `401 Unauthorized`: Invalid/missing JWT token

---

### Submit Quiz Answer

**Endpoint**: `POST /api/quiz/submit`

**Purpose**: Submit a single answer during quiz; receives immediate feedback

**Request Body**:

```json
{
  "quiz_id": "quiz_20260419_abc123",
  "question_id": "q_1",
  "selected_option_index": 0
}
```

**Request Headers**:

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Validation Rules**:

- `quiz_id`: Required, must match active quiz session
- `question_id`: Required, must be valid question in quiz
- `selected_option_index`: Required, integer 0-3

**Success Response** (200 OK):

```json
{
  "is_correct": true,
  "correct_answer_index": 0,
  "correct_answer": "House",
  "explanation": "Haus is the German word for House."
}
```

**Response Fields**:

- `is_correct`: Boolean indicating if answer was correct
- `correct_answer_index`: Position (0-3) of the correct answer
- `correct_answer`: Text of the correct answer
- `explanation`: Optional explanation or feedback

**Error Responses**:

- `400 Bad Request`: Invalid answer format
  ```json
  {
    "error": "Invalid answer",
    "details": "selected_option_index must be 0-3"
  }
  ```
- `404 Not Found`: Quiz or question does not exist
- `401 Unauthorized`: Invalid/missing JWT token

---

### Complete Quiz & Get Score

**Endpoint**: `POST /api/quiz/complete`

**Purpose**: Mark quiz as complete and retrieve final score/statistics

**Request Body**:

```json
{
  "quiz_id": "quiz_20260419_abc123",
  "duration_seconds": 180
}
```

**Request Headers**:

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Success Response** (200 OK):

```json
{
  "quiz_id": "quiz_20260419_abc123",
  "score": 8,
  "total_questions": 10,
  "percentage": 80,
  "duration_seconds": 180,
  "results": [
    {
      "question_id": "q_1",
      "vocabulary_id": 5,
      "german_word": "Haus",
      "correct_answer": "House",
      "user_answer": "House",
      "is_correct": true
    },
    {
      "question_id": "q_2",
      "vocabulary_id": 12,
      "german_word": "Baum",
      "correct_answer": "Tree",
      "user_answer": "Bush",
      "is_correct": false
    }
  ],
  "statistics": {
    "average_time_per_question_seconds": 18,
    "streak": 1,
    "total_quizzes_completed": 5,
    "average_score": 75
  }
}
```

**Response Fields**:

- `quiz_id`: Quiz session identifier
- `score`: Number of correct answers
- `total_questions`: Total questions in quiz
- `percentage`: Score as percentage (0-100)
- `duration_seconds`: Total time spent on quiz
- `results`: Array of individual question results
- `statistics`: User quiz statistics (optional)

**Error Responses**:

- `404 Not Found`: Quiz does not exist
- `400 Bad Request`: Quiz not yet completed or invalid state
- `401 Unauthorized`: Invalid/missing JWT token

---

### Get Quiz History

**Endpoint**: `GET /api/quiz/history`

**Purpose**: Retrieve list of completed quizzes for user

**Query Parameters**:

```json
{
  "page": 1, // (optional) Page number, default 1
  "limit": 10, // (optional) Items per page, default 10
  "sort": "created_at" // (optional) Sort: "created_at" (descending)
}
```

**Request Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Success Response** (200 OK):

```json
{
  "data": [
    {
      "quiz_id": "quiz_20260419_abc123",
      "score": 8,
      "total_questions": 10,
      "percentage": 80,
      "duration_seconds": 180,
      "created_at": "2026-04-19T14:00:00Z"
    },
    {
      "quiz_id": "quiz_20260418_xyz789",
      "score": 7,
      "total_questions": 10,
      "percentage": 70,
      "duration_seconds": 220,
      "created_at": "2026-04-18T15:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 23,
    "pages": 3
  },
  "statistics": {
    "total_quizzes": 23,
    "average_score": 76.5,
    "best_score": 100,
    "worst_score": 45,
    "current_streak": 5
  }
}
```

**Error Responses**:

- `401 Unauthorized`: Invalid/missing JWT token

---

## Quiz Constraints

**Minimum Requirements**:

- User must have at least 4 vocabulary entries to generate quiz
- Minimum 1 question per quiz
- Maximum 20 questions per quiz

**Answer Options**:

- Exactly 4 options per question
- 1 correct answer + 3 incorrect distractors (selected from other vocabulary entries)
- No duplicate options
- Options shuffled randomly (correct answer can be in any position 0-3)

**Scoring**:

- Score = number of correct answers
- No partial credit
- Percentage = (score / total_questions) \* 100

**Session Management**:

- Quiz session active until submitted (expired after 24 hours if not completed)
- One active quiz per user at a time (new quiz invalidates previous unsubmitted quiz)
- Completed quizzes permanently saved to history

---

## Common Response Headers

```
Content-Type: application/json
X-Request-ID: {unique_request_id}
```

## Rate Limiting

- Generate quiz: 10 per minute per user
- Submit answer: 60 per minute per user
- Get history: 30 per minute per user
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Error Response Format

**Standard Error Response**:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {} // Optional, context-dependent
}
```

**HTTP Status Codes**:

- `200 OK`: Successful GET or POST request with result
- `201 Created`: Successful resource creation
- `400 Bad Request`: Client error (validation, format, etc.)
- `401 Unauthorized`: Authentication failure or missing token
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Conflict (e.g., insufficient vocabulary)
- `500 Internal Server Error`: Server-side error
