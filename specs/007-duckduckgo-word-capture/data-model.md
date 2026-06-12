# Data Model: DuckDuckGo Word Capture Extension

## 1. SelectionCapture

Represents the browser-side selection before the backend accepts it.

| Field              | Type     | Required | Notes                                                                                |
| ------------------ | -------- | -------- | ------------------------------------------------------------------------------------ |
| `selected_text`    | string   | Yes      | Raw text captured from the webpage selection.                                        |
| `normalized_word`  | string   | Yes      | Lowercased and punctuation-trimmed version used for validation and duplicate checks. |
| `page_url`         | string   | Yes      | Absolute URL of the page where the word was highlighted.                             |
| `page_title`       | string   | No       | Page title shown in confirmation UI and audit responses.                             |
| `surrounding_text` | string   | No       | Short optional context snippet for translation quality and troubleshooting.          |
| `captured_at`      | datetime | Yes      | Client timestamp for the capture event.                                              |

### Validation Rules

- `selected_text` must not be empty.
- `normalized_word` must contain at least one alphabetic character.
- `normalized_word` should default to a single word in MVP and must stay within backend max length.
- `page_url` must be a valid absolute URL.

## 2. TranslationResult

Represents the backend translation response before or during persistence.

| Field             | Type     | Required | Notes                                                 |
| ----------------- | -------- | -------- | ----------------------------------------------------- |
| `german_word`     | string   | Yes      | Normalized German word accepted by the backend.       |
| `meaning`         | string   | Yes      | English translation selected by the backend provider. |
| `provider`        | string   | Yes      | Provider identifier configured on the backend.        |
| `provider_status` | string   | Yes      | `translated`, `fallback`, or `failed`.                |
| `translated_at`   | datetime | Yes      | Translation completion time.                          |

### Validation Rules

- `meaning` must be non-empty to proceed to save.
- `provider_status=failed` prevents persistence.

## 3. ExtensionImportRequest

Represents the backend input for translate-and-save or save operations.

| Field               | Type   | Required | Notes                                        |
| ------------------- | ------ | -------- | -------------------------------------------- |
| `selected_text`     | string | Yes      | Raw selection as captured in the browser.    |
| `normalized_word`   | string | Yes      | Client-normalized word; backend revalidates. |
| `page_url`          | string | Yes      | Source page URL.                             |
| `page_title`        | string | No       | Source page title.                           |
| `surrounding_text`  | string | No       | Optional context snippet.                    |
| `client_request_id` | string | Yes      | Correlation ID for retries and UI state.     |

### Validation Rules

- `client_request_id` must be unique per UI attempt.
- Request is rejected if `normalized_word` maps to an existing vocabulary word.

## 4. ExtensionImportResult

Represents the final backend response consumed by the extension.

| Field         | Type   | Required | Notes                                                                                 |
| ------------- | ------ | -------- | ------------------------------------------------------------------------------------- |
| `status`      | enum   | Yes      | `saved`, `duplicate`, `validation_error`, `translation_error`, `backend_unavailable`. |
| `word`        | object | No       | Existing vocabulary word payload when save succeeds.                                  |
| `translation` | object | No       | TranslationResult payload when available.                                             |
| `message`     | string | Yes      | User-displayable outcome summary.                                                     |
| `source`      | object | Yes      | Source metadata echoed back for confirmation.                                         |

## 5. VocabularyWord

Existing persisted entity reused by this feature.

| Field              | Type     | Required | Notes                                                                   |
| ------------------ | -------- | -------- | ----------------------------------------------------------------------- |
| `id`               | integer  | Yes      | CSV-generated identifier.                                               |
| `german_word`      | string   | Yes      | Unique case-insensitive vocabulary key.                                 |
| `meaning`          | string   | Yes      | Imported English meaning.                                               |
| `example_sentence` | string   | No       | Remains optional and empty for extension imports unless later enhanced. |
| `created_at`       | datetime | Yes      | Persistence timestamp.                                                  |
| `times_practiced`  | integer  | Yes      | Existing default `0`.                                                   |
| `accuracy`         | float    | Yes      | Existing default `0.0`.                                                 |

## State Transitions

```text
SelectionCaptured
  -> ValidationFailed
  -> TranslationRequested

TranslationRequested
  -> TranslationFailed
  -> ReadyToSave

ReadyToSave
  -> DuplicateDetected
  -> Saved

Saved
  -> ConfirmedInExtensionUI
```
