from __future__ import annotations

import json


def build_extraction_prompt(raw_text: str) -> list[dict[str, str]]:
    schema_hint = {
        "client_profile": {
            "name": "string | null",
            "company": "string | null",
            "role": "string | null",
            "industry": "string | null",
        },
        "pain_points": [{"title": "string", "description": "string", "severity": "high|medium|low"}],
        "proposed_solutions": [
            {"title": "string", "description": "string", "linked_pain_points": ["string"]}
        ],
        "executive_summary": "string",
        "next_steps": ["string"],
        "key_metrics": [{"label": "string", "value": "string"}],
    }
    return [
        {
            "role": "system",
            "content": (
                "You are a sales intelligence analyst. Return strict JSON only. "
                "Do not include markdown fences, prose, or commentary."
            ),
        },
        {
            "role": "user",
            "content": (
                "Extract a structured B2B sales brief from the source text. "
                "Use this exact schema shape and keep missing values null where needed: "
                f"{json.dumps(schema_hint)}\n\n"
                f"Source text:\n{raw_text}"
            ),
        },
    ]


def build_json_repair_prompt(invalid_payload: str, validation_error: str) -> list[dict[str, str]]:
    return [
        {
            "role": "system",
            "content": "Repair malformed JSON. Return only valid JSON that satisfies the user's schema.",
        },
        {
            "role": "user",
            "content": (
                "This previous response failed validation. Fix its JSON format and schema compliance.\n\n"
                f"Validation error:\n{validation_error}\n\nInvalid payload:\n{invalid_payload}"
            ),
        },
    ]


def build_email_prompt(analysis_json: dict[str, object]) -> list[dict[str, str]]:
    schema_hint = {"subject": "string", "body": "string"}
    return [
        {
            "role": "system",
            "content": (
                "Write a concise B2B follow-up email and return strict JSON only. "
                "Do not include markdown fences, prose, greetings outside the JSON, or commentary."
            ),
        },
        {
            "role": "user",
            "content": (
                "Draft a follow-up email based on this sales brief. Return JSON only using this schema: "
                f"{json.dumps(schema_hint)}\n\n"
                f"{json.dumps(analysis_json)}"
            ),
        },
    ]
