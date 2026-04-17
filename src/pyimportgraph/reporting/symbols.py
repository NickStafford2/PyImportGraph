from __future__ import annotations

from pyimportgraph.analysis import SymbolUsageReport


def render_all_symbols(report: SymbolUsageReport) -> str:
    lines = [
        "All symbol definitions",
        "======================",
    ]

    for d in report.definitions:
        lines.append(
            f"{d.package_name} :: {d.module_name}:{d.line} {d.symbol_name} ({d.kind})"
        )

    return "\n".join(lines)
