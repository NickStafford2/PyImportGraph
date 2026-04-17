from __future__ import annotations


def render_section(title: str, lines: list[str]) -> str:
    return "\n".join([title, "=" * len(title), *lines])


def render_kv_table(rows: list[tuple[str, str]]) -> list[str]:
    if not rows:
        return ["(none)"]

    key_width = max(len(key) for key, _ in rows)
    return [f"{key:<{key_width}}  {value}" for key, value in rows]


def render_table(headers: list[str], rows: list[tuple[str, ...]]) -> list[str]:
    if not rows:
        return ["(none)"]

    widths = [len(header) for header in headers]
    for row in rows:
        for index, cell in enumerate(row):
            widths[index] = max(widths[index], len(cell))

    def render_row(row: tuple[str, ...]) -> str:
        return "  ".join(f"{cell:<{widths[index]}}" for index, cell in enumerate(row))

    header_line = render_row(tuple(headers))
    divider_line = "  ".join("-" * width for width in widths)

    return [
        header_line,
        divider_line,
        *(render_row(row) for row in rows),
    ]
