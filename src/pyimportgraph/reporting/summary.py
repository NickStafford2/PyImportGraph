from __future__ import annotations

from pyimportgraph.analysis import (
    PackageDependencyMap,
    SymbolUsageReport,
)

from pyimportgraph.reporting._format import render_kv_table, render_section


def render_summary(
    package_map: PackageDependencyMap,
    symbol_report: SymbolUsageReport,
) -> str:
    analyzed_packages = ", ".join(sorted(package_map.imports_by_package)) or "(none)"

    lines = render_kv_table(
        [
            ("Analyzed packages:", analyzed_packages),
            ("Package count:", str(len(package_map.imports_by_package))),
            ("External symbol uses:", str(len(symbol_report.external_uses))),
        ]
    )

    return render_section("PyImportGraph summary", lines)
