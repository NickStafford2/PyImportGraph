from __future__ import annotations

from pyimportgraph.analysis import SymbolUsageReport


def render_package_detail(report: SymbolUsageReport, package: str) -> str:
    lines = [
        f"Package: {package}",
        "=" * (9 + len(package)),
        "",
        "Defined symbols",
        "---------------",
    ]

    defs = [d for d in report.definitions if d.package_name == package]

    for d in defs:
        lines.append(f"{d.module_name}:{d.line} {d.symbol_name} ({d.kind})")

    lines.append("")
    lines.append("External usage")
    lines.append("--------------")

    uses = [u for u in report.external_uses if u.defining_package == package]

    for u in uses:
        lines.append(f"{u.symbol_name} -> {u.imported_by_module}:{u.line}")

    return "\n".join(lines)
