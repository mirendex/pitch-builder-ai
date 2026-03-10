from app.schemas.analysis import AnalysisResult


def test_analysis_result_validates() -> None:
    payload = {
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

    result = AnalysisResult.model_validate(payload)

    assert result.client_profile.company == "Northstar Logistics"
