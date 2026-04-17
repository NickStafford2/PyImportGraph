from __future__ import annotations

from pyimportgraph.analysis import PackageDependencyMap


def render_packages(package_map: PackageDependencyMap) -> str:
    imported_by = package_map.imported_by()

    lines = [
        "Package dependencies",
        "====================",
    ]

    for package, imports in package_map.imports_by_package.items():
        lines.append(package)
        lines.append("-" * len(package))
        lines.append(f"imports: {', '.join(imports) or '(none)'}")
        lines.append(
            f"imported by: {', '.join(imported_by.get(package, [])) or '(none)'}"
        )
        lines.append("")

    if lines[-1] == "":
        lines.pop()

    return "\n".join(lines)
