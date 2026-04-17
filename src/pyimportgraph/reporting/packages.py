from __future__ import annotations

from pyimportgraph.analysis import PackageDependencyMap

from pyimportgraph.reporting._format import render_section, render_table


def render_packages(package_map: PackageDependencyMap) -> str:
    imported_by = package_map.imported_by()

    rows = [
        (
            package,
            ", ".join(imports) or "(none)",
            ", ".join(imported_by.get(package, [])) or "(none)",
        )
        for package, imports in package_map.imports_by_package.items()
    ]

    lines = render_table(
        headers=["Package", "Imports", "Imported by"],
        rows=rows,
    )

    return render_section("Package dependencies", lines)
