from __future__ import annotations

import asyncio
import json
from collections import defaultdict

from pydantic import BaseModel, ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from tenacity import AsyncRetrying, retry_if_exception_type, stop_after_attempt, wait_fixed

from app.db.models import Analysis, AnalysisStatus
from app.schemas.analysis import AnalysisResult, FollowUpEmail
from app.services.llm_client import LlmClient
from app.services.prompts import build_email_prompt, build_extraction_prompt, build_json_repair_prompt


class JsonRepairRequiredError(ValueError):
    pass


_channels: dict[str, list[asyncio.Queue[str]]] = defaultdict(list)


async def publish_status(analysis_id: str, status_message: str) -> None:
    queues = _channels.get(analysis_id, [])
    for queue in queues:
        await queue.put(status_message)


def create_status_channel(analysis_id: str) -> asyncio.Queue[str]:
    queue: asyncio.Queue[str] = asyncio.Queue()
    _channels[analysis_id].append(queue)
    return queue


def remove_status_channel(analysis_id: str, queue: asyncio.Queue[str]) -> None:
    channels = _channels.get(analysis_id)
    if not channels:
        return

    if queue in channels:
        channels.remove(queue)
    if not channels:
        _channels.pop(analysis_id, None)


async def _update_analysis_status(
    session: AsyncSession,
    analysis: Analysis,
    *,
    status: AnalysisStatus,
    message: str,
    error_message: str | None = None,
) -> None:
    analysis.status = status
    analysis.status_message = message
    analysis.error_message = error_message
    session.add(analysis)
    await session.commit()
    await session.refresh(analysis)
    await publish_status(analysis.id, message)


async def _generate_valid_analysis_result(
    *,
    client: LlmClient,
    base_url: str,
    api_key: str | None,
    model: str,
    raw_text: str,
) -> AnalysisResult:
    invalid_payload: str | None = None
    validation_error = ""

    async for attempt in AsyncRetrying(
        stop=stop_after_attempt(3),
        wait=wait_fixed(1),
        retry=retry_if_exception_type(JsonRepairRequiredError),
        reraise=True,
    ):
        with attempt:
            messages = (
                build_extraction_prompt(raw_text)
                if invalid_payload is None
                else build_json_repair_prompt(invalid_payload, validation_error)
            )
            completion = await client.create_chat_completion(
                base_url=base_url,
                api_key=api_key,
                model=model,
                messages=messages,
            )

            try:
                parsed = json.loads(completion)
                return AnalysisResult.model_validate(parsed)
            except (json.JSONDecodeError, ValidationError) as exc:
                invalid_payload = completion
                validation_error = str(exc)
                raise JsonRepairRequiredError(validation_error) from exc

    raise RuntimeError("Failed to produce a valid analysis result.")


async def _generate_valid_structured_output(
    *,
    client: LlmClient,
    base_url: str,
    api_key: str | None,
    model: str,
    initial_messages: list[dict[str, str]],
    response_model: type[BaseModel],
) -> BaseModel:
    invalid_payload: str | None = None
    validation_error = ""

    async for attempt in AsyncRetrying(
        stop=stop_after_attempt(3),
        wait=wait_fixed(1),
        retry=retry_if_exception_type(JsonRepairRequiredError),
        reraise=True,
    ):
        with attempt:
            messages = (
                initial_messages
                if invalid_payload is None
                else build_json_repair_prompt(invalid_payload, validation_error)
            )
            completion = await client.create_chat_completion(
                base_url=base_url,
                api_key=api_key,
                model=model,
                messages=messages,
            )

            try:
                parsed = json.loads(completion)
                return response_model.model_validate(parsed)
            except (json.JSONDecodeError, ValidationError) as exc:
                invalid_payload = completion
                validation_error = str(exc)
                raise JsonRepairRequiredError(validation_error) from exc

    raise RuntimeError("Failed to produce valid structured output.")


async def run_analysis(
    *,
    session_factory,
    analysis_id: str,
    raw_text: str,
    api_key: str | None,
    base_url: str,
    model: str,
) -> None:
    client = LlmClient()

    async with session_factory() as session:
        analysis = await session.get(Analysis, analysis_id)
        if analysis is None:
            return

        try:
            await _update_analysis_status(
                session,
                analysis,
                status=AnalysisStatus.PROCESSING,
                message="Reading transcript...",
            )
            await _update_analysis_status(
                session,
                analysis,
                status=AnalysisStatus.PROCESSING,
                message="Extracting pain points...",
            )
            result = await _generate_valid_analysis_result(
                client=client,
                base_url=base_url,
                api_key=api_key,
                model=model,
                raw_text=raw_text,
            )
            await _update_analysis_status(
                session,
                analysis,
                status=AnalysisStatus.PROCESSING,
                message="Drafting summary...",
            )
            analysis.result_json = result.model_dump_json()
            analysis.status = AnalysisStatus.DONE
            analysis.status_message = "Complete"
            session.add(analysis)
            await session.commit()
            await session.refresh(analysis)
            await publish_status(analysis.id, "Complete")
        except Exception as exc:  # pragma: no cover - defensive guard for background task
            await _update_analysis_status(
                session,
                analysis,
                status=AnalysisStatus.ERROR,
                message="Generation failed",
                error_message=str(exc),
            )


async def generate_follow_up_email(
    *,
    analysis_result: AnalysisResult,
    base_url: str,
    api_key: str | None,
    model: str,
) -> FollowUpEmail:
    client = LlmClient()
    email = await _generate_valid_structured_output(
        client=client,
        base_url=base_url,
        api_key=api_key,
        model=model,
        initial_messages=build_email_prompt(analysis_result.model_dump()),
        response_model=FollowUpEmail,
    )
    return FollowUpEmail.model_validate(email.model_dump())
