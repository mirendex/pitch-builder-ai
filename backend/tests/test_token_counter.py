from app.services.token_counter import check_within_limit


def test_token_counter_allows_small_payload() -> None:
    total = check_within_limit("hello world", "gpt-4o-mini", max_tokens=100)
    assert total > 0
