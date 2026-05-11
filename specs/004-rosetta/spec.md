# Feature Specification: Rosetta — Local LLM Memory Aids

**Feature Branch**: `004-rosetta`  
**Created**: 2026-05-11  
**Status**: Draft  
**Input**: User description: "I have a setup local llm using ollama. I want to run llms locally and from the words create unique ways to remember the word. The llm should generate three unique sentences for each word. This should come as additional feature on UI, before Statistics, called rosetta"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Generate Memory Sentences for a Word (Priority: P1)

A learner is studying a German word and wants creative, memorable sentences to help them retain the word. They open the Rosetta tab, select or view a word, and the system produces three unique sentences that make the word memorable and contextually meaningful.

**Why this priority**: This is the core value proposition of the feature — without sentence generation the Rosetta tab has no content. Every other story depends on this working.

**Independent Test**: Can be fully tested by navigating to the Rosetta tab, selecting any word from the vocabulary list, and verifying that three distinct sentences are displayed — each using the German word in context.

**Acceptance Scenarios**:

1. **Given** the user is on the Rosetta tab and selects a word, **When** they request memory sentences, **Then** the system displays exactly three sentences, each using the German word meaningfully.
2. **Given** the user has requested sentences, **When** the response arrives, **Then** each sentence is distinct (no two sentences are identical or near-identical).
3. **Given** the user requests sentences for a word they have already seen, **When** the result is displayed, **Then** previously generated sentences are shown immediately (from cache) without contacting the LLM again.

---

### User Story 2 - Navigate to the Rosetta Tab (Priority: P1)

A learner wants to access the Rosetta feature via the main navigation. The Rosetta tab appears in the top-level navigation bar, positioned immediately before the Statistics tab, and is reachable with a single click.

**Why this priority**: Without discoverability, no user will use the feature. Navigation is a P1 prerequisite.

**Independent Test**: Can be fully tested by loading the application and verifying the Rosetta tab is present in the nav bar in the correct position, and clicking it renders the Rosetta page.

**Acceptance Scenarios**:

1. **Given** the application is loaded, **When** the user views the navigation bar, **Then** a "Rosetta" tab is visible before the "Statistics" tab.
2. **Given** the user clicks the Rosetta tab, **When** the page loads, **Then** the Rosetta page is displayed with a vocabulary word selector and a placeholder for generated sentences.
3. **Given** the user is on any other tab, **When** they click Rosetta, **Then** the app navigates to the Rosetta page without full-page reload.

---

### User Story 3 - Handle LLM Unavailability Gracefully (Priority: P2)

A learner attempts to generate sentences, but the local LLM service is not running or is unreachable. The system informs the user clearly and does not crash or display a blank screen.

**Why this priority**: Ollama is a locally hosted service that may not always be running. Graceful degradation is essential for a good user experience, but it is secondary to core functionality.

**Independent Test**: Can be tested by stopping the local LLM service and attempting to generate sentences — the UI must show a clear error message with guidance to start the service.

**Acceptance Scenarios**:

1. **Given** the LLM service is not running, **When** the user requests sentences, **Then** the system displays a user-friendly message indicating the local AI service is unavailable.
2. **Given** an error has been shown, **When** the user fixes the issue and retries, **Then** the system attempts generation again and succeeds without requiring a page refresh.
3. **Given** sentence generation takes longer than expected, **When** the user is waiting, **Then** a loading indicator is visible for the duration of the request.

---

### User Story 4 - Regenerate Sentences (Priority: P3)

A learner wants fresh, alternative sentences for a word they have already seen. They can trigger a regeneration action to replace the current three sentences with newly generated ones.

**Why this priority**: Useful for learners who want varied examples, but the feature is complete without it. Cached results from Story 1 still provide value.

**Independent Test**: Can be tested by generating sentences for a word, clicking "Regenerate", and verifying that at least one of the three sentences differs from the previous set.

**Acceptance Scenarios**:

1. **Given** sentences are already displayed for a word, **When** the user clicks "Regenerate", **Then** the system requests new sentences from the LLM and replaces the displayed ones.
2. **Given** regeneration is requested, **When** the new sentences arrive, **Then** the cache is updated with the latest set.

---

### Edge Cases

- What happens when the vocabulary list is empty (no words to select)?
- What happens when the LLM returns fewer than three sentences?
- What happens when the LLM returns malformed or empty output?
- How does the system behave when multiple rapid requests are made for the same word?
- What happens when the user switches words while a generation is in progress?

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The application MUST display a "Rosetta" navigation tab positioned immediately before the "Statistics" tab in the main navigation bar.
- **FR-002**: The Rosetta page MUST allow the user to select or browse words from the existing vocabulary list.
- **FR-003**: For each selected word, the system MUST generate exactly three unique memory-aid sentences that include the German word in context.
- **FR-004**: Sentences MUST be generated using a locally running LLM service (Ollama) without sending vocabulary data to external services.
- **FR-005**: The system MUST cache previously generated sentences per word so that repeat views do not trigger redundant LLM calls.
- **FR-006**: The system MUST display a loading indicator while sentence generation is in progress.
- **FR-007**: The system MUST display a clear, actionable error message when the local LLM service is unreachable or returns an error.
- **FR-008**: Users MUST be able to trigger regeneration of sentences for a word to receive a fresh set from the LLM.
- **FR-009**: The backend MUST expose an endpoint that accepts a German word and returns three generated sentences by communicating with the local Ollama service.
- **FR-010**: The system MUST use the default or configured local Ollama model; no external API keys or internet connectivity shall be required for sentence generation.

### Key Entities

- **Word**: An existing German vocabulary item (word, translation, part of speech) from the vocabulary list — no new schema additions required.
- **MemoryAid**: A generated artifact associated with a word; contains three sentences produced by the LLM, a timestamp, and the word it belongs to.
- **LLM Request**: A transient interaction with the local Ollama service; includes the prompt constructed from the word and the raw response.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A user can navigate to the Rosetta tab and receive three generated sentences for any vocabulary word within 30 seconds under normal local LLM conditions.
- **SC-002**: Repeat requests for the same word return cached sentences instantly (under 200ms) without contacting the LLM again.
- **SC-003**: When the LLM service is unavailable, 100% of error states display an actionable message (no silent failures or blank screens).
- **SC-004**: All three generated sentences for a given word are distinct from one another in at least 80% of generations.
- **SC-005**: The Rosetta tab is reachable in a single click from any other tab in the application.

## Assumptions

- Ollama is installed and accessible on the same host as the backend service (localhost); no cross-machine or networked LLM setup is assumed.
- The default Ollama model available on the user's machine is sufficient for German-language sentence generation; the specific model is configurable via environment variable.
- Sentence caching is in-memory (per backend session) for v1; persistent caching across restarts is out of scope.
- The vocabulary list already exists and is populated; this feature does not add vocabulary management.
- The feature targets the existing web UI (React frontend + FastAPI backend); no mobile or CLI interface is in scope.
- Generated sentences are in English or mixed English/German (mnemonic style) to help non-native learners; the output language is configurable via prompt but defaults to English context with the German word embedded.
- No user authentication changes are required; Rosetta is accessible to all existing users.
