from app.schemas.analysis import AnalysisResult, FollowUpEmail
from app.services.pipeline import generate_follow_up_email


class FakeClient:
    def __init__(self) -> None:
        self.calls = 0

    async def create_chat_completion(self, **_: object) -> str:
        self.calls += 1
        if self.calls == 1:
            return "Here is your email: subject hello"
        return '{"subject": "Quick follow-up", "body": "Thanks for your time today."}'


def build_analysis_result() -> AnalysisResult:
    return AnalysisResult.model_validate(
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


async def test_generate_follow_up_email_recovers_from_invalid_json(mocker) -> None:
    fake_client = FakeClient()
    mocker.patch("app.services.pipeline.LlmClient", return_value=fake_client)

    result = await generate_follow_up_email(
        analysis_result=build_analysis_result(),
        base_url="http://localhost:11434/v1",
        api_key=None,
        model="test-model",
    )

    assert isinstance(result, FollowUpEmail)
    assert result.subject == "Quick follow-up"
    assert fake_client.calls == 2