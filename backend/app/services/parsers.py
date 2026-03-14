from __future__ import annotations

from io import BytesIO, StringIO

import pandas as pd
from docx import Document
from PyPDF2 import PdfReader


class UnsupportedFileTypeError(ValueError):
    pass


def _format_csv_cell(value: object) -> str:
    return str(value).replace("|", "\\|").replace("\n", " ").strip()


def parse_txt(file_bytes: bytes) -> str:
    return file_bytes.decode("utf-8", errors="ignore").strip()


def parse_docx(file_bytes: bytes) -> str:
    document = Document(BytesIO(file_bytes))
    return "\n".join(paragraph.text for paragraph in document.paragraphs).strip()


def parse_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(BytesIO(file_bytes))
    pages = [page.extract_text() or "" for page in reader.pages]
    return "\n".join(pages).strip()


def parse_csv(file_bytes: bytes) -> str:
    dataframe = pd.read_csv(StringIO(file_bytes.decode("utf-8", errors="ignore")))
    headers = [_format_csv_cell(column) for column in dataframe.columns.tolist()]
    separator = ["---"] * len(headers)
    rows = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(separator) + " |",
    ]

    for row in dataframe.itertuples(index=False, name=None):
        values = [_format_csv_cell(value) for value in row]
        rows.append("| " + " | ".join(values) + " |")

    return "\n".join(rows)


def detect_and_parse(filename: str, file_bytes: bytes) -> str:
    suffix = filename.lower().rsplit(".", maxsplit=1)[-1] if "." in filename else ""
    if suffix == "txt":
        return parse_txt(file_bytes)
    if suffix == "docx":
        return parse_docx(file_bytes)
    if suffix == "pdf":
        return parse_pdf(file_bytes)
    if suffix == "csv":
        return parse_csv(file_bytes)
    raise UnsupportedFileTypeError(f"Unsupported file type: {filename}")
