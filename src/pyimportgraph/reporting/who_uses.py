from __future__ import annotations

from pyimportgraph.analysis import SymbolUsageReport


def render_who_uses(report: SymbolUsageReport, symbol: str) -> str:
    lines = [
        f"Who uses: {symbol}",
        "=" * (10 + len(symbol)),
    ]

    matches = [u for u in report.external_uses if u.symbol_name == symbol]

    if not matches:
        return "\n".join(lines + ["(none)"])

    for u in matches:
        lines.append(f"{u.defining_module} -> {u.imported_by_module}:{u.line}")

    return "\n".join(lines)
