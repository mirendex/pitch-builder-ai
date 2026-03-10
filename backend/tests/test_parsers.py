from app.services.parsers import detect_and_parse, parse_txt


def test_parse_txt() -> None:
    assert parse_txt(b"hello") == "hello"


def test_detect_and_parse_txt() -> None:
    assert detect_and_parse("notes.txt", b"line item") == "line item"
