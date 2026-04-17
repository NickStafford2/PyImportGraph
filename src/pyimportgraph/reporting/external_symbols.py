from __future__ import annotations

from pyimportgraph.analysis import SymbolUsageReport

from pyimportgraph.reporting._format import render_section, render_table


def render_external_symbols(report: SymbolUsageReport) -> str:
    rows = [
        (
            use.symbol_name,
            use.kind,
            use.defining_module,
            f"{use.imported_by_module}:{use.line}",
        )
        for use in report.external_uses
    ]

    lines = render_table(
        headers=["Symbol", "Kind", "Defined in", "Used by"],
        rows=rows,
    )

    return render_section("Cross-package symbol usage", lines)
