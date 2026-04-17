from __future__ import annotations

from pyimportgraph.analysis import SymbolUsageReport

from pyimportgraph.reporting._format import render_section, render_table


def render_who_uses(report: SymbolUsageReport, symbol: str) -> str:
    matches = [u for u in report.external_uses if u.symbol_name == symbol]

    lines = render_table(
        headers=["Defined in", "Used by", "Line"],
        rows=[
            (
                u.defining_module,
                u.imported_by_module,
                str(u.line),
            )
            for u in matches
        ],
    )

    return render_section(f"Who uses: {symbol}", lines)
