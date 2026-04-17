from __future__ import annotations

from pyimportgraph.analysis import SymbolUsageReport


def render_external_symbols(report: SymbolUsageReport) -> str:
    lines = [
        "Cross-package symbol usage",
        "==========================",
    ]

    for use in report.external_uses:
        lines.append(
            f"{use.symbol_name} ({use.kind}) "
            f"{use.defining_module} -> "
            f"{use.imported_by_module}:{use.line}"
        )

    return "\n".join(lines)
