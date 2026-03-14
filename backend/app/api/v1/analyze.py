from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sse_starlette.sse import EventSourceResponse

from app.db.models import Analysis, AnalysisStatus
from app.db.session import AsyncSessionLocal, get_session
from app.schemas.analysis import DEFAULT_MODEL, AnalysisDetail, AnalysisListItem, AnalyzeRequest
from app.services.parsers import UnsupportedFileTypeError, detect_and_parse
from app.services.pipeline import create_status_channel, remove_status_channel, run_analysis
from app.services.token_counter import TokenLimitExceededError, check_within_limit

router = APIRouter(prefix="/api/v1", tags=["analysis"])

SessionDep = Annotated[AsyncSession, Depends(get_session)]
UploadFileField = Annotated[UploadFile, File(...)]
BaseUrlField = Annotated[str, Form(...)]
ModelField = Annotated[str, Form()]
ApiKeyField = Annotated[str | None, Form()]


async def _serialize_analysis(analysis: Analysis) -> AnalysisDetail:
    result_json = json.loads(analysis.result_json) if analysis.result_json else None
    return AnalysisDetail(
        id=analysis.id,
        source_filename=analysis.source_filename,
        status=analysis.status.value,
        status_message=analysis.status_message,
        error_message=analysis.error_message,
        result_json=result_json,
        created_at=analysis.created_at,
        updated_at=analysis.updated_at,
    )


@router.get("/analyses", response_model=list[AnalysisListItem])
async def list_analyses(session: SessionDep) -> list[AnalysisListItem]:
    result = await session.execute(select(Analysis).order_by(Analysis.created_at.desc()))
    analyses = result.scalars().all()
    return [
        AnalysisListItem(
            id=analysis.id,
            source_filename=analysis.source_filename,
            status=analysis.status.value,
            status_message=analysis.status_message,
            created_at=analysis.created_at,
        )
        for analysis in analyses
    ]


@router.get("/analyze/{analysis_id}", response_model=AnalysisDetail)
async def get_analysis(
    analysis_id: str,
    session: SessionDep,
) -> AnalysisDetail:
    analysis = await session.get(Analysis, analysis_id)
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")
    return await _serialize_analysis(analysis)


@router.delete("/analyze/{analysis_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_analysis(
    analysis_id: str,
    session: SessionDep,
) -> None:
    analysis = await session.get(Analysis, analysis_id)
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")
    await session.delete(analysis)
    await session.commit()


@router.post("/analyze", status_code=status.HTTP_202_ACCEPTED)
async def create_analysis(
    background_tasks: BackgroundTasks,
    session: SessionDep,
    payload: AnalyzeRequest | None = None,
) -> dict[str, str]:
    if payload is None or not payload.raw_text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="raw_text is required.")

    try:
        check_within_limit(payload.raw_text, payload.model)
    except TokenLimitExceededError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    analysis = Analysis(
        source_filename=payload.source_filename,
        raw_text=payload.raw_text,
        status=AnalysisStatus.PENDING,
        status_message="Queued",
    )
    session.add(analysis)
    await session.commit()
    await session.refresh(analysis)

    background_tasks.add_task(
        run_analysis,
        session_factory=AsyncSessionLocal,
        analysis_id=analysis.id,
        raw_text=analysis.raw_text,
        api_key=payload.api_key,
        base_url=payload.base_url,
        model=payload.model,
    )

    return {"analysis_id": analysis.id}


@router.post("/analyze/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_analysis(
    background_tasks: BackgroundTasks,
    file: UploadFileField,
    base_url: BaseUrlField,
    session: SessionDep,
    model: ModelField = DEFAULT_MODEL,
    api_key: ApiKeyField = None,
) -> dict[str, str]:
    file_bytes = await file.read()
    try:
        raw_text = detect_and_parse(file.filename or "upload.txt", file_bytes)
        check_within_limit(raw_text, model)
    except UnsupportedFileTypeError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except TokenLimitExceededError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    analysis = Analysis(
        source_filename=file.filename,
        raw_text=raw_text,
        status=AnalysisStatus.PENDING,
        status_message="Queued",
    )
    session.add(analysis)
    await session.commit()
    await session.refresh(analysis)

    background_tasks.add_task(
        run_analysis,
        session_factory=AsyncSessionLocal,
        analysis_id=analysis.id,
        raw_text=raw_text,
        api_key=api_key,
        base_url=base_url,
        model=model,
    )

    return {"analysis_id": analysis.id}


@router.get("/analyze/{analysis_id}/stream")
async def stream_analysis(
    analysis_id: str,
    session: SessionDep,
) -> EventSourceResponse:
    analysis = await session.get(Analysis, analysis_id)
    if analysis is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Analysis not found.")

    async def event_generator() -> AsyncGenerator[dict[str, str], None]:
        queue = create_status_channel(analysis_id)
        try:
            yield {"event": "status", "data": json.dumps({"status": analysis.status_message})}
            while True:
                if analysis.status in {AnalysisStatus.DONE, AnalysisStatus.ERROR}:
                    refreshed = await session.get(Analysis, analysis_id)
                    if refreshed is not None:
                        yield {
                            "event": "status",
                            "data": json.dumps({"status": refreshed.status_message}),
                        }
                    break

                try:
                    next_message = await asyncio.wait_for(queue.get(), timeout=15)
                    yield {"event": "status", "data": json.dumps({"status": next_message})}
                    refreshed = await session.get(Analysis, analysis_id)
                    if refreshed is not None:
                        analysis.status = refreshed.status
                        analysis.status_message = refreshed.status_message
                except TimeoutError:
                    refreshed = await session.get(Analysis, analysis_id)
                    if refreshed is not None:
                        analysis.status = refreshed.status
                        analysis.status_message = refreshed.status_message
                        if analysis.status in {AnalysisStatus.DONE, AnalysisStatus.ERROR}:
                            yield {
                                "event": "status",
                                "data": json.dumps({"status": analysis.status_message}),
                            }
                            break
        finally:
            remove_status_channel(analysis_id, queue)

    return EventSourceResponse(event_generator())
