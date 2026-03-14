from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

DEFAULT_MODEL = "google/gemini-3-flash-preview"


class ClientProfile(BaseModel):
    name: str | None = None
    company: str | None = None
    role: str | None = None
    industry: str | None = None


class PainPoint(BaseModel):
    title: str
    description: str
    severity: Literal["high", "medium", "low"]


class ProposedSolution(BaseModel):
    title: str
    description: str
    linked_pain_points: list[str] = Field(default_factory=list)


class KeyMetric(BaseModel):
    label: str
    value: str


class AnalysisResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    client_profile: ClientProfile
    pain_points: list[PainPoint] = Field(default_factory=list)
    proposed_solutions: list[ProposedSolution] = Field(default_factory=list)
    executive_summary: str
    next_steps: list[str] = Field(default_factory=list)
    key_metrics: list[KeyMetric] = Field(default_factory=list)


class FollowUpEmail(BaseModel):
    subject: str
    body: str


class AnalyzeRequest(BaseModel):
    raw_text: str | None = None
    source_filename: str | None = None
    api_key: str | None = None
    base_url: str
    model: str = DEFAULT_MODEL


class GenerateEmailRequest(BaseModel):
    analysis_id: str
    api_key: str | None = None
    base_url: str
    model: str = DEFAULT_MODEL
    analysis_result: AnalysisResult | None = None


class AnalysisListItem(BaseModel):
    id: str
    source_filename: str | None = None
    status: str
    status_message: str
    created_at: datetime


class AnalysisDetail(BaseModel):
    id: str
    source_filename: str | None = None
    status: str
    status_message: str
    error_message: str | None = None
    result_json: AnalysisResult | None = None
    created_at: datetime
    updated_at: datetime
