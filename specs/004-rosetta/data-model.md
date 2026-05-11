# Data Model: Rosetta — Local LLM Memory Aids

**Feature**: [spec.md](spec.md)
**Date**: 2026-05-11

---

## Overview

The Rosetta feature introduces **no new database tables**. It operates entirely on existing `Word` data and uses an in-memory cache. The only new persistent concept is the `MemoryAid` value object, which lives in memory only (per backend process lifetime in v1).

---

## Existing Entity: Word (unchanged)

Located at `backend/src/models/models.py`.

| Field              | Type              | Notes                               |
| ------------------ | ----------------- | ----------------------------------- |
| `id`               | Integer PK        | Used as cache key                   |
| `german_word`      | String            | Primary input to LLM prompt         |
| `meaning`          | String            | Secondary input to LLM prompt       |
| `example_sentence` | String (nullable) | Available but not used in prompt v1 |

No schema changes. No Alembic migration required.

---

## New Value Object: MemoryAid (in-memory only)

Represents the output of a single LLM generation cycle. Not persisted to DB.

| Field          | Type      | Notes                        |
| -------------- | --------- | ---------------------------- |
| `word_id`      | int       | FK-like reference to Word.id |
| `german_word`  | str       | Denormalised for display     |
| `sentences`    | list[str] | Exactly 3 strings            |
| `generated_at` | datetime  | UTC timestamp of generation  |

### Python Dataclass (backend, no DB mapping)

```python
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List

@dataclass
class MemoryAid:
    word_id: int
    german_word: str
    sentences: List[str]
    generated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
```

---

## In-Memory Cache

| Component          | Type                                               | Location                                                 |
| ------------------ | -------------------------------------------------- | -------------------------------------------------------- |
| Cache store        | `dict[int, MemoryAid]`                             | Module-level in `backend/src/services/ollama_service.py` |
| Cache key          | `word_id` (int)                                    | Unique per word                                          |
| Cache invalidation | Explicit regeneration request (`force=True` param) | No TTL                                                   |

---

## API Request/Response Shapes

### POST /api/v1/rosetta/generate

**Request body** (`RosettaRequest`):

```json
{
  "word_id": 42,
  "force": false
}
```

| Field     | Type    | Required            | Notes                                |
| --------- | ------- | ------------------- | ------------------------------------ |
| `word_id` | integer | Yes                 | Must exist in vocabulary             |
| `force`   | boolean | No (default: false) | If true, bypass cache and regenerate |

**Response body** (`RosettaResponse`):

```json
{
  "word_id": 42,
  "german_word": "Fenster",
  "sentences": [
    "When you look through the Fenster (window), imagine a fence with a star — Fen-ster.",
    "The Fenster fogged up as the knight in shining armour breathed on it, seeking his way.",
    "Fenster sounds like 'fan' + 'star': picture a star-shaped fan mounted in a window."
  ],
  "generated_at": "2026-05-11T10:00:00Z",
  "cached": false
}
```

| Field          | Type               | Notes                         |
| -------------- | ------------------ | ----------------------------- |
| `word_id`      | integer            | Echoed back                   |
| `german_word`  | string             | The German word               |
| `sentences`    | array of 3 strings | Memory-aid sentences          |
| `generated_at` | ISO 8601 datetime  | When sentences were generated |
| `cached`       | boolean            | True if returned from cache   |

**Error responses**:

| Status | Condition          | Body                                                                           |
| ------ | ------------------ | ------------------------------------------------------------------------------ |
| 404    | word_id not found  | `{"detail": "Word not found"}`                                                 |
| 503    | Ollama unreachable | `{"detail": "Local AI service unavailable. Please ensure Ollama is running."}` |
| 500    | LLM parse failure  | `{"detail": "Failed to generate sentences. Try again."}`                       |

---

## State Transitions

```
User selects word
      │
      ▼
[Cache hit?] ──Yes──► Return cached MemoryAid (cached=true)
      │
      No
      ▼
Request Ollama
      │
   ┌──┴──┐
Fail    Success
  │         │
503      Parse 3 sentences
           │
       Store in cache
           │
       Return MemoryAid (cached=false)
```

---

## Validation Rules

- `word_id` must be a positive integer referencing an existing Word row.
- LLM response must yield at least 1 parseable sentence; if fewer than 3 are parsed, remaining slots are padded with a fallback string: `"(Sentence unavailable — please regenerate.)"`.
- `force=true` always calls Ollama and updates the cache, even if a cached entry exists.
