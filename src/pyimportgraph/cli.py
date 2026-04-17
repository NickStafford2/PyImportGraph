from __future__ import annotations

import argparse
from pathlib import Path

from pyimportgraph.analysis import (
    build_package_dependency_map,
    build_symbol_usage_report,
)


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="pyimportgraph",
        description=(
            "Analyze Python package boundaries and cross-package symbol usage."
        ),
    )
    parser.add_argument(
        "project_path",
        type=Path,
        help="Path to the Python project to analyze.",
    )
    parser.add_argument(
        "--package",
        dest="package_names",
        action="append",
        required=True,
        help=(
            "Top-level package name to analyze with Grimp. "
            "Repeat for multiple packages."
        ),
    )

    subparsers = parser.add_subparsers(dest="command")
    subparsers.add_parser("summary", help="Show a high-level architecture summary.")
    subparsers.add_parser(
        "packages",
        help="Show which packages import which other packages.",
    )
    subparsers.add_parser(
        "external-symbols",
        help="Show symbols defined in one package and imported by another.",
    )

    args = parser.parse_args()
    command = args.command or "summary"

    project_path: Path = args.project_path.resolve()
    package_names: list[str] = args.package_names

    if command == "packages":
        print(_render_package_dependencies(package_names))
        return

    if command == "external-symbols":
        print(_render_external_symbols(project_path))
        return

    if command == "summary":
        print(_render_summary(project_path, package_names))
        return

    raise ValueError(f"Unsupported command: {command}")


def _render_summary(project_path: Path, package_names: list[str]) -> str:
    package_map = build_package_dependency_map(package_names)
    symbol_report = build_symbol_usage_report(project_path)

    lines = [
        "PyImportGraph summary",
        "=====================",
        f"Analyzed packages: {', '.join(package_names)}",
        f"Package count:     {len(package_map.imports_by_package)}",
        f"External symbol uses: {len(symbol_report.external_uses)}",
        "",
        "Package dependencies",
        "--------------------",
    ]

    if not package_map.imports_by_package:
        lines.append("(none)")
    else:
        for package, imports in package_map.imports_by_package.items():
            rendered_imports = ", ".join(imports) if imports else "(none)"
            lines.append(f"{package:<24} -> {rendered_imports}")

    lines.extend(
        [
            "",
            "Cross-package symbol usage",
            "--------------------------",
        ]
    )

    grouped_uses = symbol_report.by_defining_package()
    if not grouped_uses:
        lines.append("(none)")
    else:
        for package, uses in grouped_uses.items():
            lines.append(f"{package}: {len(uses)} external use(s)")

    return "\n".join(lines)


def _render_package_dependencies(package_names: list[str]) -> str:
    package_map = build_package_dependency_map(package_names)
    imported_by = package_map.imported_by()

    lines = [
        "Package dependencies",
        "====================",
    ]

    if not package_map.imports_by_package:
        lines.append("(none)")
        return "\n".join(lines)

    for package, imports in package_map.imports_by_package.items():
        lines.append(package)
        lines.append("-" * len(package))
        lines.append(f"imports:     {', '.join(imports) if imports else '(none)'}")
        lines.append(
            f"imported by: {', '.join(imported_by.get(package, [])) if imported_by.get(package) else '(none)'}"
        )
        lines.append("")

    if lines[-1] == "":
        lines.pop()

    return "\n".join(lines)


def _render_external_symbols(project_path: Path) -> str:
    report = build_symbol_usage_report(project_path)
    grouped = report.by_defining_package()

    lines = [
        "Cross-package symbol usage",
        "==========================",
    ]

    if not grouped:
        lines.append("(none)")
        return "\n".join(lines)

    for package, uses in grouped.items():
        lines.append(package)
        lines.append("-" * len(package))

        for use in uses:
            lines.append(
                f"{use.symbol_name} ({use.kind}) "
                f"defined in {use.defining_module} "
                f"-> imported by {use.imported_by_module}:{use.line}"
            )

        lines.append("")

    if lines[-1] == "":
        lines.pop()

    return "\n".join(lines)


if __name__ == "__main__":
    main()
