from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models import Analysis
from app.db.session import get_session
from app.schemas.analysis import AnalysisResult, FollowUpEmail, GenerateEmailRequest
from app.services.pipeline import generate_follow_up_email


router = APIRouter(prefix="/api/v1", tags=["email"])


@router.post("/generate-email", response_model=FollowUpEmail)
async def create_follow_up_email(
    payload: GenerateEmailRequest,
    session: AsyncSession = Depends(get_session),
) -> FollowUpEmail:
    analysis = await session.get(Analysis, payload.analysis_id)
    if analysis is None or not analysis.result_json:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Completed analysis not found.",
        )

    analysis_result = AnalysisResult.model_validate(json.loads(analysis.result_json))
    try:
        return await generate_follow_up_email(
            analysis_result=analysis_result,
            base_url=payload.base_url,
            api_key=payload.api_key,
            model=payload.model,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Failed to generate follow-up email: {exc}",
        ) from exc

