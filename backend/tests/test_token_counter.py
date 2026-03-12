import pytest

from app.services.token_counter import TokenLimitExceededError, check_within_limit


def test_token_counter_allows_small_payload() -> None:
    total = check_within_limit("hello world", "gpt-4o-mini", max_tokens=100)
    assert total > 0


def test_token_counter_rejects_large_payload() -> None:
    with pytest.raises(TokenLimitExceededError):
        check_within_limit("hello world", "gpt-4o-mini", max_tokens=1)
