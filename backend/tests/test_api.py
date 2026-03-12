from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncGenerator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.api.v1 import analyze as analyze_module
from app.api.v1.analyze import router as analyze_router
from app.api.v1.generate import router as generate_router
from app.db.models import Analysis, AnalysisStatus, Base
from app.db.session import get_session
from app.schemas.analysis import FollowUpEmail
from app.services.parsers import UnsupportedFileTypeError
from app.services.token_counter import TokenLimitExceededError


@pytest.fixture
def session_factory(tmp_path):
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'test.db'}"
    engine = create_async_engine(database_url, future=True)
    factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def setup() -> None:
        async with engine.begin() as connection:
            await connection.run_sync(Base.metadata.create_all)

    asyncio.run(setup())

    try:
        yield factory
    finally:
        asyncio.run(engine.dispose())


@pytest.fixture
def client(session_factory, mocker):
    async def override_get_session() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            yield session

    async def fake_run_analysis(**kwargs) -> None:
        async with session_factory() as session:
            analysis = await session.get(Analysis, kwargs["analysis_id"])
            assert analysis is not None
            analysis.status = AnalysisStatus.DONE
            analysis.status_message = "Complete"
            analysis.result_json = json.dumps(
                {
                    "client_profile": {
                        "name": "Mia Gomez",
                        "company": "Northstar Logistics",
                        "role": "VP Sales",
                        "industry": "Logistics",
                    },
                    "pain_points": [
                        {
                            "title": "Poor forecasting",
                            "description": "Forecasting accuracy is low across regions.",
                            "severity": "high",
                        }
                    ],
                    "proposed_solutions": [
                        {
                            "title": "Unified forecasting workflow",
                            "description": "Standardize planning across teams.",
                            "linked_pain_points": ["Poor forecasting"],
                        }
                    ],
                    "executive_summary": "The team needs a better sales planning workflow.",
                    "next_steps": ["Book product demo"],
                    "key_metrics": [{"label": "Pipeline coverage", "value": "2.8x"}],
                }
            )
            session.add(analysis)
            await session.commit()

    app = FastAPI()
    app.include_router(analyze_router)
    app.include_router(generate_router)
    app.dependency_overrides[get_session] = override_get_session

    mocker.patch.object(analyze_module, "AsyncSessionLocal", session_factory)
    mocker.patch.object(analyze_module, "run_analysis", fake_run_analysis)
    mocker.patch(
        "app.api.v1.generate.generate_follow_up_email",
        mocker.AsyncMock(return_value=FollowUpEmail(subject="Quick follow-up", body="Thanks for the call.")),
    )

    with TestClient(app) as test_client:
        yield test_client


def test_create_and_fetch_analysis(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/analyze",
        json={
            "raw_text": "Discovery call transcript",
            "source_filename": "notes.txt",
            "base_url": "http://localhost:11434/v1",
        },
    )

    assert create_response.status_code == 202
    analysis_id = create_response.json()["analysis_id"]

    list_response = client.get("/api/v1/analyses")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    detail_response = client.get(f"/api/v1/analyze/{analysis_id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["status"] == "done"
    assert detail_response.json()["result_json"]["client_profile"]["company"] == "Northstar Logistics"


def test_stream_analysis_returns_status_events(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/analyze",
        json={
            "raw_text": "Discovery call transcript",
            "source_filename": "notes.txt",
            "base_url": "http://localhost:11434/v1",
        },
    )

    analysis_id = create_response.json()["analysis_id"]
    stream_response = client.get(f"/api/v1/analyze/{analysis_id}/stream")

    assert stream_response.status_code == 200
    assert "Complete" in stream_response.text


def test_delete_analysis_removes_record(client: TestClient) -> None:
    create_response = client.post(
        "/api/v1/analyze",
        json={
            "raw_text": "Discovery call transcript",
            "source_filename": "notes.txt",
            "base_url": "http://localhost:11434/v1",
        },
    )

    analysis_id = create_response.json()["analysis_id"]
    delete_response = client.delete(f"/api/v1/analyze/{analysis_id}")

    assert delete_response.status_code == 204

    fetch_response = client.get(f"/api/v1/analyze/{analysis_id}")
    assert fetch_response.status_code == 404


def test_create_analysis_requires_raw_text(client: TestClient) -> None:
    response = client.post(
        "/api/v1/analyze",
        json={
            "source_filename": "notes.txt",
            "base_url": "http://localhost:11434/v1",
        },
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "raw_text is required."


def test_generate_follow_up_uses_payload_override(client: TestClient) -> None:
    async def seed_analysis() -> str:
        factory = client.app.dependency_overrides[get_session]
        async for session in factory():
            analysis = Analysis(
                source_filename="notes.txt",
                raw_text="raw",
                status=AnalysisStatus.DONE,
                status_message="Complete",
                result_json=json.dumps(
                    {
                        "client_profile": {"name": "Seed", "company": "SeedCo", "role": None, "industry": None},
                        "pain_points": [],
                        "proposed_solutions": [],
                        "executive_summary": "seed",
                        "next_steps": [],
                        "key_metrics": [],
                    }
                ),
            )
            session.add(analysis)
            await session.commit()
            await session.refresh(analysis)
            return analysis.id
        raise AssertionError("Session override did not yield a session")

    analysis_id = asyncio.run(seed_analysis())

    response = client.post(
        "/api/v1/generate-email",
        json={
            "analysis_id": analysis_id,
            "base_url": "http://localhost:11434/v1",
            "analysis_result": {
                "client_profile": {
                    "name": "Edited prospect",
                    "company": "EditedCo",
                    "role": "VP Sales",
                    "industry": "Logistics",
                },
                "pain_points": [],
                "proposed_solutions": [],
                "executive_summary": "edited summary",
                "next_steps": ["send proposal"],
                "key_metrics": [{"label": "Coverage", "value": "3.1x"}],
            },
        },
    )

    assert response.status_code == 200
    assert response.json()["subject"] == "Quick follow-up"


def test_create_analysis_rejects_token_limit(client: TestClient, mocker) -> None:
    mocker.patch.object(
        analyze_module,
        "check_within_limit",
        side_effect=TokenLimitExceededError("Input is too large for the selected model."),
    )

    response = client.post(
        "/api/v1/analyze",
        json={
            "raw_text": "Discovery call transcript",
            "source_filename": "notes.txt",
            "base_url": "http://localhost:11434/v1",
        },
    )

    assert response.status_code == 400
    assert "too large" in response.json()["detail"]


def test_upload_analysis_accepts_supported_file(client: TestClient, mocker) -> None:
    mocker.patch.object(analyze_module, "detect_and_parse", return_value="Parsed upload content")

    response = client.post(
        "/api/v1/analyze/upload",
        data={"base_url": "http://localhost:11434/v1", "model": "google/gemini-3-flash-preview"},
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )

    assert response.status_code == 202
    analysis_id = response.json()["analysis_id"]

    detail_response = client.get(f"/api/v1/analyze/{analysis_id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["status"] == "done"


def test_upload_analysis_rejects_unsupported_file(client: TestClient, mocker) -> None:
    mocker.patch.object(
        analyze_module,
        "detect_and_parse",
        side_effect=UnsupportedFileTypeError("Unsupported file type: notes.exe"),
    )

    response = client.post(
        "/api/v1/analyze/upload",
        data={"base_url": "http://localhost:11434/v1", "model": "google/gemini-3-flash-preview"},
        files={"file": ("notes.exe", b"binary", "application/octet-stream")},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported file type: notes.exe"


def test_upload_analysis_rejects_token_limit(client: TestClient, mocker) -> None:
    mocker.patch.object(analyze_module, "detect_and_parse", return_value="Parsed upload content")
    mocker.patch.object(
        analyze_module,
        "check_within_limit",
        side_effect=TokenLimitExceededError("Input is too large for the selected model."),
    )

    response = client.post(
        "/api/v1/analyze/upload",
        data={"base_url": "http://localhost:11434/v1", "model": "google/gemini-3-flash-preview"},
        files={"file": ("notes.txt", b"hello", "text/plain")},
    )

    assert response.status_code == 400
    assert "too large" in response.json()["detail"]