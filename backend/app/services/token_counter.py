from __future__ import annotations

import tiktoken


DEFAULT_MODEL_TOKEN_LIMIT = 128_000


class TokenLimitExceededError(ValueError):
    pass


def count_tokens(text: str, model: str) -> int:
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")

    return len(encoding.encode(text))


def check_within_limit(text: str, model: str, max_tokens: int = DEFAULT_MODEL_TOKEN_LIMIT) -> int:
    total_tokens = count_tokens(text, model)
    if total_tokens > max_tokens:
        raise TokenLimitExceededError(
            f"Input is too large for the selected model. Estimated {total_tokens} tokens, limit is {max_tokens}."
        )
    return total_tokens
