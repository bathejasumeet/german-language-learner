# Vocabulary API Contract

**Purpose**: Define the HTTP API contract for vocabulary management endpoints  
**Version**: 2.0.0  
**Base URL**: `/api/words`

## Endpoints

### List Vocabulary

**Endpoint**: `GET /api/words`

**Purpose**: Retrieve paginated list of vocabulary entries for authenticated user

**Query Parameters**:

```json
{
  "page": 1, // (optional) Page number, default 1
  "limit": 20, // (optional) Items per page, default 20, max 100
  "sort": "created_at" // (optional) Sort field: "created_at", "german_word", "updated_at"
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
      "id": 1,
      "german_word": "Haus",
      "english_meaning": "House",
      "example_sentence": "Das Haus ist sehr groß.",
      "created_at": "2026-04-19T10:30:00Z",
      "updated_at": "2026-04-19T10:30:00Z"
    },
    {
      "id": 2,
      "german_word": "Baum",
      "english_meaning": "Tree",
      "example_sentence": "Der Baum ist alt.",
      "created_at": "2026-04-19T11:00:00Z",
      "updated_at": "2026-04-19T11:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "pages": 3
  }
}
```

**Error Responses**:

- `401 Unauthorized`: Invalid/missing JWT token
- `400 Bad Request`: Invalid query parameters

---

### Create Vocabulary

**Endpoint**: `POST /api/words`

**Purpose**: Create a new vocabulary entry with optional example sentence

**Request Body**:

```json
{
  "german_word": "Katze",
  "english_meaning": "Cat",
  "example_sentence": "Die Katze schläft im Garten."
}
```

**Request Headers**:

```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Validation Rules**:

- `german_word`: Required, non-empty, max 255 chars
- `english_meaning`: Required, non-empty, max 255 chars
- `example_sentence`: Optional, max 500 chars
- Uniqueness: (user_id, german_word) must be unique for this user

**Success Response** (201 Created):

```json
{
  "id": 43,
  "german_word": "Katze",
  "english_meaning": "Cat",
  "example_sentence": "Die Katze schläft im Garten.",
  "created_at": "2026-04-19T12:00:00Z",
  "updated_at": "2026-04-19T12:00:00Z"
}
```

**Error Responses**:

- `400 Bad Request`: Missing required fields or validation failed
  ```json
  {
    "error": "Validation failed",
    "details": [
      { "field": "german_word", "message": "Required field" },
      { "field": "english_meaning", "message": "Required field" }
    ]
  }
  ```
- `409 Conflict`: Duplicate vocabulary entry for this user
  ```json
  {
    "error": "Vocabulary entry already exists for this user",
    "existing_id": 5
  }
  ```
- `401 Unauthorized`: Invalid/missing JWT token

---

### Get Vocabulary

**Endpoint**: `GET /api/words/{id}`

**Purpose**: Retrieve a single vocabulary entry by ID

**Path Parameters**:

- `id` (integer): Vocabulary entry ID

**Request Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Success Response** (200 OK):

```json
{
  "id": 43,
  "german_word": "Katze",
  "english_meaning": "Cat",
  "example_sentence": "Die Katze schläft im Garten.",
  "created_at": "2026-04-19T12:00:00Z",
  "updated_at": "2026-04-19T12:00:00Z"
}
```

**Error Responses**:

- `404 Not Found`: Vocabulary entry does not exist or belongs to different user
- `401 Unauthorized`: Invalid/missing JWT token

---

### Update Vocabulary

**Endpoint**: `PUT /api/words/{id}`

**Purpose**: Update an existing vocabulary entry (including example sentence)

**Path Parameters**:

- `id` (integer): Vocabulary entry ID

**Request Body** (all fields optional):

```json
{
  "german_word": "Katze",
  "english_meaning": "Cat",
  "example_sentence": "Die schwarze Katze läuft schnell."
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
  "id": 43,
  "german_word": "Katze",
  "english_meaning": "Cat",
  "example_sentence": "Die schwarze Katze läuft schnell.",
  "created_at": "2026-04-19T12:00:00Z",
  "updated_at": "2026-04-19T13:00:00Z"
}
```

**Error Responses**:

- `404 Not Found`: Vocabulary entry does not exist
- `400 Bad Request`: Validation failed or duplicate word
- `401 Unauthorized`: Invalid/missing JWT token

---

### Delete Vocabulary

**Endpoint**: `DELETE /api/words/{id}`

**Purpose**: Delete a vocabulary entry

**Path Parameters**:

- `id` (integer): Vocabulary entry ID

**Request Headers**:

```
Authorization: Bearer {JWT_TOKEN}
```

**Success Response** (204 No Content):

```
[empty body]
```

**Error Responses**:

- `404 Not Found`: Vocabulary entry does not exist
- `401 Unauthorized`: Invalid/missing JWT token

---

## Common Response Headers

```
Content-Type: application/json
X-Request-ID: {unique_request_id}
```

## Rate Limiting

- Limit: 100 requests per minute per user
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination Defaults

- Default limit: 20 items
- Maximum limit: 100 items
- Offset-based pagination (page/limit model)

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

- `200 OK`: Successful GET request
- `201 Created`: Successful resource creation
- `204 No Content`: Successful deletion/update with no response body
- `400 Bad Request`: Client error (validation, format, etc.)
- `401 Unauthorized`: Authentication failure or missing token
- `403 Forbidden`: User lacks permission for requested resource
- `404 Not Found`: Resource does not exist
- `409 Conflict`: Conflict (e.g., duplicate entry)
- `500 Internal Server Error`: Server-side error
