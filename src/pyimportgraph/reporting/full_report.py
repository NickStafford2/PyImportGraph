from __future__ import annotations

from pyimportgraph.analysis import (
    PackageDependencyMap,
    SymbolUsageReport,
)

from pyimportgraph.reporting.packages import render_packages
from pyimportgraph.reporting.external_symbols import render_external_symbols
from pyimportgraph.reporting.symbols import render_all_symbols


def render_full_report(
    package_map: PackageDependencyMap,
    symbol_report: SymbolUsageReport,
) -> str:
    parts = [
        render_packages(package_map),
        "",
        render_external_symbols(symbol_report),
        "",
        render_all_symbols(symbol_report),
    ]

    return "\n".join(parts)
