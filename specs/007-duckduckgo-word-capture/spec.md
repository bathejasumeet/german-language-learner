# Feature Specification: DuckDuckGo Word Capture Extension

**Feature Branch**: `007-duckduckgo-word-capture`  
**Created**: 2026-06-12  
**Status**: Draft  
**Input**: User description: "It should be possible to add the words on the duckduckgo browser by highlighting them while reading a german website. This would mean that We need a browser extension for duckduckgo to be able to translate the words add add them automatically to the database here."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Capture Highlighted German Words (Priority: P1)

While reading a German website in the DuckDuckGo browser, a learner highlights a single German word or short phrase and uses the extension to capture it. The extension recognises the selection, shows the captured text, and offers a clear action to import it into the learner's vocabulary.

**Why this priority**: Without reliable capture from the page, the rest of the workflow does not exist. This is the primary user journey that turns passive reading into vocabulary collection.

**Independent Test**: Can be fully tested by loading a German webpage in the target browser, highlighting text, and invoking the extension. It delivers value even before automatic persistence is added because it validates the browser-side interaction model.

**Acceptance Scenarios**:

1. **Given** the learner is on a supported webpage in DuckDuckGo, **When** they highlight a German word and open the extension, **Then** the selected text is displayed in the extension UI.
2. **Given** no text is highlighted, **When** the learner opens the extension, **Then** the extension explains that a word must be selected before import can begin.
3. **Given** the highlighted selection contains only punctuation, numbers, or unsupported long text, **When** the extension tries to capture it, **Then** the extension rejects the selection with a clear validation message.

---

### User Story 2 - Translate And Save To Vocabulary (Priority: P2)

After selecting a German word, the learner uses the extension to translate it and add it directly to the application's vocabulary database without retyping it in the main web app.

**Why this priority**: Automatic translation and persistence eliminate the manual copy-paste workflow that the user wants to replace.

**Independent Test**: Can be tested by highlighting a valid German word, confirming the translation, and verifying that the new word appears in the existing vocabulary list through the current application API and UI.

**Acceptance Scenarios**:

1. **Given** a valid German word is selected, **When** the learner requests import, **Then** the system retrieves an English meaning and saves the word through the existing vocabulary backend.
2. **Given** the selected word already exists in the vocabulary list, **When** the learner tries to import it, **Then** the system does not create a duplicate entry and explains that the word already exists.
3. **Given** the translation service is unavailable, **When** the learner requests import, **Then** the extension shows a retryable error and no partial word is stored.

---

### User Story 3 - Review Import Status And Source Context (Priority: P3)

After import, the learner sees a concise success state that confirms what was saved, including the translation and the source page context, so they can trust that the right word was captured.

**Why this priority**: Import feedback reduces ambiguity and makes browser-based capture safe enough for repeated daily use.

**Independent Test**: Can be tested by importing a word and confirming that the extension success state shows the saved German word, translated meaning, and source URL or page title.

**Acceptance Scenarios**:

1. **Given** a word was saved successfully, **When** the extension returns to the confirmation view, **Then** it shows the saved word and translated meaning.
2. **Given** a source page title or URL is available, **When** the import succeeds, **Then** the extension shows that source context to the learner.
3. **Given** the learner wants to continue reading, **When** an import completes, **Then** the extension can be dismissed without navigating away from the current page.

### Edge Cases

- What happens when the highlighted text spans multiple words? The MVP accepts one word by default and rejects longer phrases unless they fit a configurable maximum token count defined by the backend contract.
- What happens when the highlighted word includes trailing punctuation or capitalization from sentence position? The system normalises the selection before translation and duplicate checks.
- What happens when the backend is unreachable from the extension? The extension reports the connection failure immediately and preserves the selected text locally until the user retries or dismisses it.
- What happens when DuckDuckGo on the target OS does not expose the required Chromium-style extension APIs? The extension is considered unsupported on that platform and installation guidance must state the supported DuckDuckGo environments explicitly.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide a browser extension workflow that can read the learner's current text selection from supported DuckDuckGo browser pages.
- **FR-002**: The extension MUST validate that the selection is a plausible German vocabulary candidate before translation or import.
- **FR-003**: The extension MUST show the selected source text to the learner before the word is saved.
- **FR-004**: The system MUST translate the selected German word into English automatically before saving it.
- **FR-005**: The system MUST save imported words into the existing vocabulary store used by the current application.
- **FR-006**: The backend MUST prevent duplicate vocabulary entries for the same German word during extension imports.
- **FR-007**: The system MUST return a clear success or failure result to the extension for every import attempt.
- **FR-008**: The extension MUST show a meaningful error when translation fails, validation fails, the backend is unavailable, or the word already exists.
- **FR-009**: The extension MUST include source metadata with each import attempt, including at least the selected text and page URL, and SHOULD include page title when available.
- **FR-010**: The backend MUST expose extension-safe HTTP endpoints that support the translate-and-save workflow without requiring the main web application UI.
- **FR-011**: The system MUST support a trusted single-user MVP where the extension talks to the user's own running backend instance without introducing a new authentication system.
- **FR-012**: The backend MUST allow configured extension origins in CORS without weakening existing local web-app access.
- **FR-013**: The extension MUST give the learner a way to retry a failed import from the current selection.
- **FR-014**: The extension MUST preserve the current reading page and MUST NOT navigate the user away from the source website as part of the import workflow.

### Key Entities

- **Selection Capture**: The extension-side representation of highlighted text plus page metadata before any API call is made.
- **Translation Result**: The translated meaning returned for a selected German word, including provider metadata and confidence or fallback status when available.
- **Extension Import Request**: The backend request that contains the normalized German word, translated meaning, and source metadata to be written into the vocabulary store.
- **Vocabulary Word**: The existing persisted word entity reused by the extension import flow.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A learner can highlight a valid German word and see it appear in the extension UI within 300 ms on a supported page.
- **SC-002**: In a local development setup, 95% of successful translate-and-save actions complete in under 2 seconds from user confirmation to success message.
- **SC-003**: Duplicate imports do not create additional vocabulary rows in 100% of repeated import attempts for the same normalized German word.
- **SC-004**: A successfully imported word appears in the existing vocabulary API response immediately after the import completes.
- **SC-005**: In manual testing across at least three representative German-language pages, the extension completes the capture flow without forcing page reloads or navigation.

## Assumptions

- The MVP targets a trusted single-user setup where the learner runs the backend locally or on a personally controlled host.
- The target DuckDuckGo browser environment supports Chromium-compatible extension packaging required by the implementation.
- The translation provider is configured server-side so the browser extension does not need to store third-party API credentials.
- Existing CSV-backed vocabulary storage remains the persistence layer for this feature.
- Extension account login, marketplace publishing, and cross-device sync are out of scope for the MVP.
