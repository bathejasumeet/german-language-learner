# Research: DuckDuckGo Word Capture Extension

## Decision 1: Build the browser feature as a dedicated Chromium Manifest V3 extension

- **Decision**: Implement the browser client as its own top-level extension package with content-script selection capture, popup UI, and background coordination.
- **Rationale**: The current frontend is a standard Vite web app and does not own browser-extension lifecycle concerns such as manifest permissions, content scripts, and page-selection access.
- **Alternatives considered**:
  - Embedding extension code inside `frontend/`: rejected because browser runtime concerns and build outputs would be tightly coupled to the web app.
  - Bookmarklet approach: rejected because it provides weaker permissions, worse UX, and no reliable extension settings/popup model.

## Decision 2: Route translation through the backend instead of the extension

- **Decision**: Add backend endpoints that translate a selected word and then save it into the existing vocabulary store.
- **Rationale**: This keeps translation-provider configuration and secrets out of the browser extension, reuses existing vocabulary validation, and gives one place to enforce duplicate rules and error semantics.
- **Alternatives considered**:
  - Calling a third-party translation API directly from the extension: rejected because it exposes provider credentials and complicates privacy controls.
  - Reusing the existing Rosetta generation flow: rejected because that feature generates memory aids for already-saved words rather than fast word translation for capture.

## Decision 3: Treat the MVP as a trusted single-user integration

- **Decision**: Do not introduce a new authentication system for the first version. The extension talks to the user's own backend instance.
- **Rationale**: The current application has no auth layer, and adding one would expand scope substantially beyond the requested workflow.
- **Alternatives considered**:
  - Add full login/auth before any extension work: rejected for MVP because it delays the primary capture workflow.
  - Expose anonymous public endpoints for multi-user hosted use: rejected because it creates avoidable abuse and privacy risk.

## Decision 4: Reuse existing duplicate protection and harden it for extension imports

- **Decision**: Keep the existing case-insensitive duplicate check in `VocabularyService.create_word`, and add extension-specific conflict responses at the API layer.
- **Rationale**: Duplicate protection already exists in the service layer, so the extension contract should surface that behavior clearly instead of inventing a second rule.
- **Alternatives considered**:
  - Allow duplicate saves and clean them later: rejected because it degrades the learner's vocabulary list immediately.
  - Only detect duplicates in the extension: rejected because backend-side enforcement is still required.

## Decision 5: Preserve CSV storage for MVP, but constrain concurrency expectations

- **Decision**: Continue using the current CSV-backed storage and document the feature as single-user, single-backend-process.
- **Rationale**: The repository already migrated to CSV storage, and the requested feature does not require a storage rewrite if the MVP remains local and single-user.
- **Alternatives considered**:
  - Move back to a database before implementing the extension: rejected as unrelated to the immediate user value.
  - Add background sync queues and multi-writer conflict resolution now: rejected because the current architecture does not need it for a trusted local MVP.

## Decision 6: Add explicit extension-friendly CORS support

- **Decision**: Expand backend CORS configuration to allow configured extension origins in addition to the existing local frontend origins.
- **Rationale**: Browser extensions do not originate from `localhost`, so the current backend setup will block them even in a local install.
- **Alternatives considered**:
  - Disable CORS restrictions broadly: rejected because it weakens security posture unnecessarily.
  - Proxy all extension traffic through the web app: rejected because it adds an extra moving part and requires the web app to be open.

## Decision 7: Capture source metadata with every import

- **Decision**: Include selected text, normalized text, page URL, and page title in extension import requests and responses.
- **Rationale**: Source context improves learner trust, simplifies debugging bad captures, and gives room for later provenance features without changing the base workflow.
- **Alternatives considered**:
  - Save only the German word and meaning: rejected because it makes it harder to verify what the extension actually captured.

## Decision 8: Validate browser support as part of delivery, not as an unresolved planning blocker

- **Decision**: Target DuckDuckGo desktop environments that accept Chromium-compatible extensions and include explicit installation/QA verification in quickstart.
- **Rationale**: The requested outcome is browser-based capture in DuckDuckGo, and the implementation path is a WebExtension-compatible package. Support must be verified during QA, but this does not block planning.
- **Alternatives considered**:
  - Postpone planning until every DuckDuckGo packaging detail is externally verified: rejected because the engineering design is still clear enough to define now.
