from __future__ import annotations

import httpx
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.api.v1 import models as models_module
from app.api.v1.models import router as models_router


def make_client() -> TestClient:
    app = FastAPI()
    app.include_router(models_router)
    return TestClient(app)


def test_list_models_returns_normalized_payload(mocker) -> None:
    mocker.patch.object(
        models_module.LlmClient,
        "list_models",
        mocker.AsyncMock(
            return_value=[
                {"id": "openai/gpt-4o", "name": "OpenAI: GPT-4o", "context_length": 128000},
                {"id": "no-name-model"},
                {"missing_id": True},
            ]
        ),
    )

    with make_client() as client:
        response = client.get(
            "/api/v1/models", params={"base_url": "https://openrouter.ai/api/v1"}
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload == [
        {"id": "openai/gpt-4o", "name": "OpenAI: GPT-4o", "context_length": 128000},
        {"id": "no-name-model", "name": None, "context_length": None},
    ]


def test_list_models_returns_bad_gateway_on_provider_error(mocker) -> None:
    mocker.patch.object(
        models_module.LlmClient,
        "list_models",
        mocker.AsyncMock(side_effect=httpx.ConnectError("connection refused")),
    )

    with make_client() as client:
        response = client.get(
            "/api/v1/models", params={"base_url": "http://localhost:11434/v1"}
        )

    assert response.status_code == 502
