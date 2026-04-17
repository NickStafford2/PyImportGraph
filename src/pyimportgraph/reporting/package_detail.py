from __future__ import annotations

from pyimportgraph.analysis import SymbolUsageReport

from pyimportgraph.reporting._format import render_section, render_table


def render_package_detail(report: SymbolUsageReport, package: str) -> str:
    defs = [d for d in report.definitions if d.package_name == package]
    uses = [u for u in report.external_uses if u.defining_package == package]

    lines: list[str] = []

    lines.append("Defined symbols")
    lines.append("---------------")
    lines.extend(
        render_table(
            headers=["Module", "Line", "Symbol", "Kind"],
            rows=[
                (
                    d.module_name,
                    str(d.line),
                    d.symbol_name,
                    d.kind,
                )
                for d in defs
            ],
        )
    )

    lines.append("")
    lines.append("External usage")
    lines.append("--------------")
    lines.extend(
        render_table(
            headers=["Symbol", "Kind", "Used by", "Line"],
            rows=[
                (
                    u.symbol_name,
                    u.kind,
                    u.imported_by_module,
                    str(u.line),
                )
                for u in uses
            ],
        )
    )

    return render_section(f"Package: {package}", lines)
