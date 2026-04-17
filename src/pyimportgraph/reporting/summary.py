from __future__ import annotations

from pyimportgraph.analysis import (
    PackageDependencyMap,
    SymbolUsageReport,
)


def render_summary(
    package_map: PackageDependencyMap,
    symbol_report: SymbolUsageReport,
) -> str:
    lines = [
        "PyImportGraph summary",
        "=====================",
        f"Package count: {len(package_map.imports_by_package)}",
        f"External symbol uses: {len(symbol_report.external_uses)}",
        "",
    ]

    return "\n".join(lines)
