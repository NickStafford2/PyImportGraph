from __future__ import annotations

from pyimportgraph.analysis import SymbolUsageReport

from pyimportgraph.reporting._format import render_section, render_table


def render_all_symbols(report: SymbolUsageReport) -> str:
    rows = [
        (
            d.package_name,
            d.module_name,
            str(d.line),
            d.symbol_name,
            d.kind,
        )
        for d in report.definitions
    ]

    lines = render_table(
        headers=["Package", "Module", "Line", "Symbol", "Kind"],
        rows=rows,
    )

    return render_section("All symbol definitions", lines)
