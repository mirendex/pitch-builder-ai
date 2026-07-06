from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException, Query, status

from app.schemas.analysis import ModelInfo
from app.services.llm_client import LlmClient

router = APIRouter(prefix="/api/v1", tags=["models"])


@router.get("/models", response_model=list[ModelInfo])
async def list_models(
    base_url: str = Query(...),
) -> list[ModelInfo]:
    try:
        raw_models = await LlmClient().list_models(base_url=base_url)
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to fetch models from provider: {exc}",
        ) from exc

    return [
        ModelInfo(
            id=model["id"],
            name=model.get("name"),
            context_length=model.get("context_length"),
        )
        for model in raw_models
        if "id" in model
    ]
