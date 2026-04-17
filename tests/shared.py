from __future__ import annotations

from pathlib import Path
from textwrap import dedent


def write_file(root: Path, relative_path: str, content: str) -> Path:
    path = root / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    _ = path.write_text(dedent(content).strip() + "\n", encoding="utf-8")
    return path
