# Backend

FastAPI service for ingestion, document parsing, structured LLM orchestration, status streaming, and SQLite-backed result persistence.

This service accepts raw sales inputs, converts them into a validated sales brief, stores the analysis, and can generate a follow-up email from either the persisted result or an edited payload supplied by the frontend.

## Responsibilities

- Accept pasted text or uploaded source files
- Parse `.txt`, `.csv`, `.docx`, and `.pdf` inputs into normalized text
- Enforce token limits before sending requests to the model provider
- Call LLM-compatible chat completion endpoints through a configurable base URL
- Validate responses against strict Pydantic schemas
- Repair malformed JSON automatically through retry prompts
- Stream analysis status updates over Server-Sent Events
- Persist analysis jobs and outputs in SQLite

## Stack

- FastAPI
- Python 3.12+
- SQLAlchemy 2.0 async ORM
- SQLite via `aiosqlite`
- Pydantic v2
- HTTPX
- Tenacity
- `sse-starlette`
- `tiktoken`
- `PyPDF2`, `python-docx`, `pandas`

## Project structure

```text
backend/
|-- app/
|   |-- api/v1/
|   |   |-- analyze.py      Analysis creation, retrieval, deletion, SSE stream
|   |   `-- generate.py     Follow-up email generation
|   |-- db/
|   |   |-- models.py       SQLAlchemy models and status enum
|   |   `-- session.py      Engine, session factory, DB init
|   |-- schemas/
|   |   `-- analysis.py     Request and response contracts
|   |-- services/
|   |   |-- llm_client.py   HTTP client for chat completion APIs
|   |   |-- parsers.py      Text, CSV, DOCX, PDF ingestion
|   |   |-- pipeline.py     Status updates, retries, JSON repair loop
|   |   |-- prompts.py      Extraction, repair, and email prompts
|   |   `-- token_counter.py Token estimation and input guardrails
|   `-- main.py             App bootstrap, CORS, router registration, health check
|-- data/                   SQLite database location
|-- tests/                  API, parser, schema, follow-up, token-limit tests
|-- Dockerfile
`-- pyproject.toml
```

## How the backend works

### 1. Input ingestion

The backend accepts two entry points for analysis:

- `POST /api/v1/analyze` for raw pasted text
- `POST /api/v1/analyze/upload` for uploaded files

Uploaded files are parsed by extension:

- `.txt` -> UTF-8 text decode
- `.docx` -> paragraph extraction via `python-docx`
- `.pdf` -> page text extraction via `PyPDF2`
- `.csv` -> conversion into a markdown-style table via `pandas`

### 2. Guardrails

Before the model call, the backend estimates token usage with `tiktoken`.

- Default token ceiling: `128000`
- Unknown model names fall back to `cl100k_base` encoding
- Oversized inputs fail fast with HTTP `400`

### 3. Structured extraction

The analysis pipeline asks the model to return strict JSON matching the `AnalysisResult` schema:

- `client_profile`
- `pain_points`
- `proposed_solutions`
- `executive_summary`
- `next_steps`
- `key_metrics`

Validation is strict. Extra fields are rejected by the schema.

### 4. Automatic JSON repair

If the model returns malformed JSON or violates the schema, the pipeline:

1. Captures the invalid payload
2. Captures the validation error
3. Re-prompts the model with a repair instruction
4. Retries up to 3 attempts

This logic is shared between analysis generation and follow-up email generation.

### 5. Status streaming

During analysis, the backend publishes user-visible status messages such as:

- `Queued`
- `Reading transcript...`
- `Extracting pain points...`
- `Drafting summary...`
- `Complete`
- `Generation failed`

These are pushed through in-memory async queues and exposed over SSE from `GET /api/v1/analyze/{analysis_id}/stream`.

### 6. Persistence

Each analysis is stored in the `analyses` table with:

- UUID primary key
- source filename
- raw text
- job status
- status message
- serialized result JSON
- optional error message
- created and updated timestamps

## Data model

### Analysis status values

- `pending`
- `processing`
- `done`
- `error`

### Main response schema

`AnalysisResult` contains:

- `client_profile`
- `pain_points[]`
- `proposed_solutions[]`
- `executive_summary`
- `next_steps[]`
- `key_metrics[]`

### Follow-up schema

`FollowUpEmail` contains:

- `subject`
- `body`

## Local development

### Requirements

- Python 3.12+

### Install

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

Install dependencies:

```bash
pip install -e .
```

Run the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Available locally:

- API base: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

## Docker

The backend Docker image:

- uses `python:3.12-slim`
- installs the package from `pyproject.toml`
- creates `/app/data` for SQLite storage
- runs `uvicorn app.main:app --host 0.0.0.0 --port 8000`

From the repository root, the backend is normally started through Docker Compose:

```bash
docker compose up --build
```

## Configuration

### Environment variables

Supported environment variables:

- `DATABASE_URL`
- `CORS_ORIGINS`

Defaults:

```text
DATABASE_URL=sqlite+aiosqlite:///./data/app.db
CORS_ORIGINS=http://localhost:3000
```

Notes:

- `CORS_ORIGINS` accepts a comma-separated list.
- Database tables are created automatically on startup.
- The backend does not require a server-side LLM API key at boot time.

### Request-level model settings

The frontend sends model configuration on each request:

- `base_url`
- `model`
- optional `api_key`

This makes the backend compatible with both hosted and local OpenAI-style providers.

Examples:

- OpenRouter: `https://openrouter.ai/api/v1`
- Ollama: `http://localhost:11434/v1`

Default model in the schema layer:

- `google/gemini-3-flash-preview`

## API reference

### Health

`GET /health`

Response:

```json
{
	"status": "ok"
}
```

### Create analysis from text

`POST /api/v1/analyze`

Request body:

```json
{
	"raw_text": "Discovery call transcript...",
	"source_filename": "notes.txt",
	"base_url": "http://localhost:11434/v1",
	"api_key": null,
	"model": "google/gemini-3-flash-preview"
}
```

Response:

```json
{
	"analysis_id": "uuid"
}
```

### Create analysis from upload

`POST /api/v1/analyze/upload`

Multipart form fields:

- `file`
- `base_url`
- optional `api_key`
- optional `model`

Response:

```json
{
	"analysis_id": "uuid"
}
```

### List analyses

`GET /api/v1/analyses`

Returns saved jobs ordered by newest first.

### Fetch one analysis

`GET /api/v1/analyze/{analysis_id}`

Returns status, metadata, and `result_json` when available.

### Stream analysis status

`GET /api/v1/analyze/{analysis_id}/stream`

Returns an SSE stream with `status` events.

Event payload shape:

```json
{
	"status": "Extracting pain points..."
}
```

### Delete analysis

`DELETE /api/v1/analyze/{analysis_id}`

Returns HTTP `204` on success.

### Generate follow-up email

`POST /api/v1/generate-email`

Request body:

```json
{
	"analysis_id": "uuid",
	"base_url": "http://localhost:11434/v1",
	"api_key": null,
	"model": "google/gemini-3-flash-preview",
	"analysis_result": null
}
```

Behavior:

- If `analysis_result` is omitted, the backend uses the persisted analysis JSON.
- If `analysis_result` is supplied, it overrides the stored result. This is how the frontend generates follow-up emails from user edits.

Response:

```json
{
	"subject": "Quick follow-up",
	"body": "Thanks for your time today. ..."
}
```

## Error handling

Common failure cases:

- Missing `raw_text` -> HTTP `400`
- Unsupported file extension -> HTTP `400`
- Token limit exceeded -> HTTP `400`
- Missing or incomplete analysis for email generation -> HTTP `404`
- Upstream model/provider failure during email generation -> HTTP `502`

Background analysis failures are persisted as:

- status: `error`
- status message: `Generation failed`
- `error_message` populated with the exception text

## Testing

Install dev dependencies:

```bash
pip install -e ".[dev]"
```

Run tests:

```bash
pytest
```

The current test suite covers:

- analysis creation, fetch, list, stream, and delete flows
- upload handling for supported and unsupported file types
- token limit enforcement
- schema validation
- parser behavior
- follow-up generation recovery after invalid JSON

Optional quality checks:

```bash
ruff check .
mypy app
```

## Extension points

Common backend changes usually land in these files:

- add providers or request-shaping logic in `app/services/llm_client.py`
- change extraction or email behavior in `app/services/prompts.py`
- tune retries or status messages in `app/services/pipeline.py`
- add new response fields in `app/schemas/analysis.py`
- support new file formats in `app/services/parsers.py`

## Notes

- The service assumes an OpenAI-compatible `/chat/completions` endpoint.
- Provider credentials are request-scoped rather than stored server-side.
- SSE status channels are in-memory, which is fine for local/single-instance use but would need redesign for distributed deployment.
