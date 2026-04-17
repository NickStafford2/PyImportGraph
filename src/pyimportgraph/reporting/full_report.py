from __future__ import annotations

from pyimportgraph.analysis import (
    PackageDependencyMap,
    SymbolUsageReport,
)

from pyimportgraph.reporting.external_symbols import render_external_symbols
from pyimportgraph.reporting.package_detail import render_package_detail
from pyimportgraph.reporting.packages import render_packages
from pyimportgraph.reporting.summary import render_summary
from pyimportgraph.reporting.symbols import render_all_symbols
from pyimportgraph.reporting.who_uses import render_who_uses


def render_full_report(
    package_map: PackageDependencyMap,
    symbol_report: SymbolUsageReport,
) -> str:
    parts: list[str] = [
        render_summary(package_map, symbol_report),
        render_packages(package_map),
        render_external_symbols(symbol_report),
        render_all_symbols(symbol_report),
    ]

    package_names = sorted(
        {
            *package_map.imports_by_package.keys(),
            *(definition.package_name for definition in symbol_report.definitions),
            *(use.defining_package for use in symbol_report.external_uses),
            *(use.imported_by_package for use in symbol_report.external_uses),
        }
    )

    for package_name in package_names:
        parts.append(render_package_detail(symbol_report, package_name))

    symbol_names = sorted({use.symbol_name for use in symbol_report.external_uses})
    for symbol_name in symbol_names:
        parts.append(render_who_uses(symbol_report, symbol_name))

    return "\n\n".join(parts)
