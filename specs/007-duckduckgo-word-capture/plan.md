# Implementation Plan: DuckDuckGo Word Capture Extension

**Branch**: `007-duckduckgo-word-capture` | **Date**: 2026-06-12 | **Spec**: `/Users/Sumeet/smg/nky/projects/german-language-learner/specs/007-duckduckgo-word-capture/spec.md`
**Input**: Feature specification from `/specs/007-duckduckgo-word-capture/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a DuckDuckGo-targeted browser extension that captures highlighted German words from webpages, requests a backend-managed translation, and saves the result into the existing vocabulary store through extension-specific API endpoints. The plan keeps the MVP single-user and trusted, centralizes translation/provider secrets in the backend, and adds explicit duplicate-handling, CORS, and error contracts for the extension flow.

## Technical Context

**Language/Version**: Python 3.11+ (backend), JavaScript ES2022 (extension), React 19.2.4 (existing frontend)  
**Primary Dependencies**: FastAPI 0.135, existing CSV store services, Axios 1.15, Chromium Manifest V3 extension APIs, configurable translation provider via backend HTTP integration  
**Storage**: CSV files under `backend/data/` for persisted vocabulary; browser local storage for transient extension UI state only  
**Testing**: pytest for backend/unit-contract coverage, Vitest for extension UI/helpers, manual browser verification in supported DuckDuckGo desktop environment  
**Target Platform**: DuckDuckGo desktop browser environments that support Chromium-compatible extensions; local or user-controlled backend host  
**Project Type**: Web application plus browser extension companion  
**Performance Goals**: selection capture feedback under 300 ms; translate-and-save round trip under 2 s in local development; no main-page navigation during import  
**Constraints**: privacy-sensitive workflow, explicit user confirmation before save, existing CSV store is single-process, CORS must permit extension origins, no new auth system in MVP  
**Scale/Scope**: single-user MVP, tens to hundreds of imported words per learner, one active backend instance per user

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Code Quality**: PASS. The feature can be isolated into a new extension package plus small backend additions with explicit contracts and no cross-cutting shortcut required.
- **Testing Standards**: PASS. Plan includes backend unit/contract coverage and extension-side automated tests, with manual browser validation only for the final platform-specific integration layer.
- **User Experience Consistency**: PASS. The extension uses the same vocabulary model and error semantics as the existing app while adding clear selection, validation, and import feedback.
- **Performance Requirements**: PASS. The design keeps translation secrets server-side and scopes latency targets to short interactive operations.

Post-design re-check: PASS. No constitution violations were introduced by the design artifacts below.

## Project Structure

### Documentation (this feature)

```text
specs/007-duckduckgo-word-capture/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── browser-extension-api.md
└── tasks.md
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── api/
│   │   └── extension.py
│   ├── services/
│   │   ├── translation.py
│   │   └── vocabulary.py
│   └── schemas.py
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

extension/
├── manifest.json
├── src/
│   ├── background/
│   ├── content/
│   ├── popup/
│   └── services/
└── tests/

frontend/
└── src/
    └── services/
```

**Structure Decision**: Add a dedicated top-level `extension/` package rather than folding browser-extension code into the existing web frontend. This keeps manifest/build/runtime concerns isolated while the backend remains the shared source of truth for translation and vocabulary persistence.

## Complexity Tracking

No constitution exceptions are required for this feature.
