# Pitch Builder AI

[![CI](https://github.com/popa098/pitch-builder-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/popa098/pitch-builder-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Pitch Builder AI is a full-stack B2B sales intelligence dashboard that turns raw discovery call transcripts, CRM notes, and uploaded documents into structured sales briefs and follow-up emails.

The repository is organized as a monorepo with a Next.js frontend and a FastAPI backend. The system focuses on practical sales workflows: ingest messy source material, normalize it, run structured extraction through an LLM, stream progress to the UI, and let users edit the result before exporting or generating a follow-up.

## Key capabilities

- Multi-format ingestion for pasted text and uploaded `.txt`, `.csv`, `.docx`, and `.pdf` files
- Structured sales brief extraction with strict Pydantic schema validation
- Self-repairing JSON pipeline that retries malformed model output with repair prompts
- Real-time status updates from the backend to the frontend via Server-Sent Events
- Bring-your-own-key workflow for OpenRouter, plus local Ollama support for privacy-sensitive use cases
- Editable analysis cards for pain points, proposed solutions, summary, next steps, and key metrics
- Client-side PDF export for generated sales briefs
- Follow-up email generation based on the current edited analysis state
- Persisted analysis history backed by SQLite

## Technical highlights

### Self-repairing LLM pipeline

The backend does not trust raw model output. Analysis and follow-up generation both run through a validation loop that:

1. Requests strict JSON output from the model.
2. Parses and validates the response against Pydantic schemas.
3. Detects JSON decode or schema validation failures.
4. Sends a repair prompt back to the model with the invalid payload and validation error.
5. Retries until a valid response is produced or the retry budget is exhausted.

This keeps the API contract stable even when the model returns malformed or incomplete JSON.

### Live status streaming

The analysis workflow streams backend status messages to the UI over SSE. This gives users visibility into pipeline progress while long-running analysis jobs are executing in the background.

### Privacy-friendly model configuration

No server-side LLM secret is required to boot the app. The frontend stores provider settings in browser storage and passes the selected base URL, model, and optional API key to the backend per request.

Supported modes:

- OpenRouter using a user-supplied API key
- Ollama at `http://localhost:11434/v1` for local inference

## Tech stack

### Frontend

- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Radix UI primitives
- Zustand for UI and settings state
- TanStack React Query for server state
- React Dropzone for uploads
- Sonner for notifications
- `@react-pdf/renderer` for PDF export
- Vitest and React Testing Library for unit tests

### Backend

- FastAPI
- Python 3.12+
- SQLAlchemy 2.0 with `aiosqlite`
- Pydantic v2
- HTTPX for LLM HTTP requests
- Tenacity for retry loops
- `sse-starlette` for streaming responses
- `tiktoken` for token-limit checks
- `pypdf`, `python-docx`, and `pandas` for document parsing

## Repository layout

```text
.
|-- backend/
|   |-- app/
|   |   |-- api/v1/         FastAPI routes for analysis and email generation
|   |   |-- db/             Async SQLAlchemy models and session wiring
|   |   |-- schemas/        Pydantic request and response models
|   |   `-- services/       Parsing, prompts, LLM client, pipeline, token limits
|   |-- data/               SQLite database storage
|   `-- tests/              Backend test suite
|-- frontend/
|   `-- src/
|       |-- app/            Next.js pages and route segments
|       |-- components/     Cards, modal, PDF renderer, and UI primitives
|       |-- lib/            API client and shared frontend types
|       `-- stores/         Zustand stores for settings and editable analysis state
`-- docker-compose.yml      Local multi-service development setup
```

## Getting started

You can run the project with Docker Compose or start the frontend and backend separately.

### Option 1: Docker Compose

Requirements:

- Docker
- Docker Compose

From the repository root:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`

The Docker setup mounts backend data to `backend/data` so analyses persist across container restarts.

### Option 2: Manual local setup

Requirements:

- Python 3.12+
- Node.js 20+

#### Backend

From `backend/`:

```bash
python -m venv .venv
```

Activate the environment:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# macOS/Linux
source .venv/bin/activate
```

Install dependencies and run the API:

```bash
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

From `frontend/`:

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Configuration

The app is designed so you can start it without preconfiguring a server-side LLM key.

When the frontend opens, the settings modal lets you configure:

- Provider: `openrouter` or `ollama`
- Base URL: defaults to OpenRouter or local Ollama depending on provider
- API key: required for OpenRouter, omitted for Ollama
- Model: defaults to `google/gemini-3-flash-preview`

Behavior notes:

- Settings are persisted in the browser via Zustand persistence.
- The backend receives `base_url`, `model`, and optional `api_key` on each request.
- Ollama mode expects a compatible local endpoint at `http://localhost:11434/v1`.

For backend runtime configuration, API details, and developer notes, see `backend/README.md`.

## Development checks

### Backend tests

From `backend/`:

```bash
pip install -e ".[dev]"
pytest
```

Optional backend quality checks:

```bash
ruff check .
mypy app
```

### Frontend checks

From `frontend/`:

```bash
npm run lint
npm run test
npm run build
```

## Notes for contributors

- The backend persists analyses in SQLite under `backend/data`.
- Analysis results are editable in the frontend before PDF export or follow-up generation.
- The follow-up email uses the current edited analysis state, not just the original raw result.
- The root README is intentionally product-facing; backend-specific details live in `backend/README.md`.

## License

MIT © 2026 — see [LICENSE](LICENSE) for full terms.
