# Contract: Browser Extension Import API

## Overview

The extension uses backend-owned endpoints so translation-provider secrets, duplicate handling, and storage rules stay server-side.

## Endpoint 1: Translate Preview

- **Method**: `POST`
- **Path**: `/api/v1/extension/translate`

### Request Body

```json
{
  "selected_text": "Buch",
  "normalized_word": "buch",
  "page_url": "https://example.org/de/article",
  "page_title": "Deutscher Artikel",
  "surrounding_text": "Ich lese ein Buch am Abend.",
  "client_request_id": "3f22f64e-3f6d-4b1f-b0b1-3536c841f5de"
}
```

### Success Response `200`

```json
{
  "status": "translated",
  "translation": {
    "german_word": "buch",
    "meaning": "book",
    "provider": "configured-http-provider",
    "provider_status": "translated",
    "translated_at": "2026-06-12T12:00:00Z"
  },
  "message": "Translation ready for import.",
  "source": {
    "selected_text": "Buch",
    "page_url": "https://example.org/de/article",
    "page_title": "Deutscher Artikel"
  }
}
```

### Error Responses

- `400`: invalid or unsupported selection
- `409`: duplicate word already exists
- `424`: translation provider failed
- `503`: backend or provider unavailable

## Endpoint 2: Translate And Save

- **Method**: `POST`
- **Path**: `/api/v1/extension/import`

### Request Body

Same as `/api/v1/extension/translate`.

### Success Response `201`

```json
{
  "status": "saved",
  "word": {
    "id": 42,
    "german_word": "buch",
    "meaning": "book",
    "example_sentence": "",
    "created_at": "2026-06-12T12:00:02Z",
    "times_practiced": 0,
    "accuracy": 0.0
  },
  "translation": {
    "german_word": "buch",
    "meaning": "book",
    "provider": "configured-http-provider",
    "provider_status": "translated",
    "translated_at": "2026-06-12T12:00:01Z"
  },
  "message": "Word saved to vocabulary.",
  "source": {
    "selected_text": "Buch",
    "page_url": "https://example.org/de/article",
    "page_title": "Deutscher Artikel"
  }
}
```

### Error Responses

- `400`: invalid or unsupported selection
- `409`: duplicate word already exists
- `424`: translation provider failed before save
- `503`: backend unavailable

## Backend Behavior Rules

- The backend is the source of truth for normalization and duplicate detection.
- The backend must reuse the existing vocabulary persistence layer for successful imports.
- The backend must return a display-ready `message` for every non-2xx response body.
- The backend must only allow configured extension origins in CORS.
- The backend must not persist a word when translation fails.
