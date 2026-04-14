# Implementation Plan: German Language Learning App

**Branch**: `001-german-language-app` | **Date**: 2026-04-14 | **Spec**: [specs/001-german-language-app/spec.md](specs/001-german-language-app/spec.md)
**Input**: Feature specification from `/specs/001-german-language-app/spec.md`

**Note**: This plan is generated per user requirements and project constitution.

## Summary

Build a full-stack web application to help users learn German by storing vocabulary, generating flashcards, tracking progress, and providing quizzes. Backend is Python (FastAPI), frontend is React, and persistent storage is PostgreSQL (via Docker, with DB files mounted to the local filesystem for git commit). All configuration (creds, URLs, etc.) is via environment variables. Tests are required for all components and must be compatible with LLM-based generation (local Ollama).

## Technical Context

**Language/Version**: Python 3.11 (backend), JavaScript/TypeScript (React 18+, frontend)  
**Primary Dependencies**: FastAPI, SQLAlchemy, psycopg2, Docker, React, Jest, Testing LLM integration (Ollama-compatible)  
**Storage**: PostgreSQL (Docker container, data mounted to ./db for git commit)  
**Testing**: pytest (backend), Jest (frontend), LLM-based test generation (Ollama local)  
**Target Platform**: Linux/macOS/Windows (Docker, Node.js, Python)  
**Project Type**: Web application (SPA + REST API)  
**Performance Goals**: Sub-second API response, frontend loads <2s, support for 10k+ words per user  
**Constraints**: All secrets/config via env vars, DB data must be mountable/committable, tests must run headless, LLM test generation must be scriptable  
**Scale/Scope**: Single-user MVP, extensible to multi-user in future

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- Code Quality: Linting, code review, and static analysis required for all code.
- Testing Standards: TDD, automated tests, and LLM-based test generation enforced.
- UX Consistency: All UI must follow consistent patterns and accessibility guidelines.
- Performance: All endpoints and UI must meet defined performance goals.
- Additional: All config via env, open-source deps must be approved, security best practices enforced.

## Project Structure

### Documentation (this feature)

```text
specs/001-german-language-app/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
├── tests/
│   ├── contract/
│   ├── integration/
│   └── unit/
├── Dockerfile
├── docker-compose.yml
└── .env.example

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
├── tests/
└── .env.example

db/   # PostgreSQL data volume (mounted, committable)
```

**Structure Decision**: Two top-level folders: backend (FastAPI) and frontend (React). PostgreSQL runs in Docker, with data mounted to ./db. All config via env files. Tests in both backend and frontend, with LLM-based test generation scripts.

## Complexity Tracking

No constitution violations. All requirements and constraints are justified by user needs and project principles.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| [e.g., 4th project]        | [current need]     | [why 3 projects insufficient]        |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient]  |
