from __future__ import annotations

import argparse
from pathlib import Path

from pyimportgraph.analysis import (
    build_package_dependency_map,
    build_symbol_usage_report,
)

from pyimportgraph.reporting.summary import render_summary
from pyimportgraph.reporting.packages import render_packages
from pyimportgraph.reporting.symbols import render_all_symbols
from pyimportgraph.reporting.external_symbols import render_external_symbols
from pyimportgraph.reporting.package_detail import render_package_detail
from pyimportgraph.reporting.who_uses import render_who_uses
from pyimportgraph.reporting.full_report import render_full_report


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="pyimportgraph",
        description=(
            "Analyze Python project architecture.\n\n"
            "PyImportGraph helps you understand package boundaries, dependencies,\n"
            "and cross-package symbol usage."
        ),
        formatter_class=argparse.RawTextHelpFormatter,
    )

    _ = parser.add_argument(
        "project_path",
        type=Path,
        help="Path to the Python project (root or src directory).",
    )

    _ = parser.add_argument(
        "--package",
        dest="package_names",
        action="append",
        required=True,
        help=(
            "Top-level package(s) to analyze.\n"
            "Repeat for multiple packages.\n\n"
            "Example:\n"
            "  --package myapp\n"
            "  --package mylib"
        ),
    )

    _ = parser.add_argument(
        "--version",
        action="version",
        version="pyimportgraph 0.1.0",
    )

    sub = parser.add_subparsers(
        dest="command",
        title="commands",
        metavar="<command>",
    )

    _ = sub.add_parser(
        "summary",
        help="High-level overview of project structure.",
        description="Show a concise summary of packages and cross-package usage.",
    )

    _ = sub.add_parser(
        "packages",
        help="Show package dependency graph.",
        description="Display which packages import which other packages.",
    )

    _ = sub.add_parser(
        "symbols",
        help="List all symbol definitions.",
        description="List all top-level functions, classes, and assignments.",
    )

    _ = sub.add_parser(
        "external-symbols",
        help="Show cross-package symbol usage.",
        description="Show symbols defined in one package and used in another.",
    )

    pkg_cmd = sub.add_parser(
        "package",
        help="Inspect a specific package.",
        description="Show symbols defined in a package and how they are used.",
    )
    _ = pkg_cmd.add_argument(
        "name",
        help="Package name (e.g. pyimportgraph.analysis)",
    )

    who_cmd = sub.add_parser(
        "who-uses",
        help="Find where a symbol is used.",
        description="Show all cross-package usages of a symbol.",
    )
    _ = who_cmd.add_argument(
        "symbol",
        help="Symbol name (e.g. build_symbol_usage_report)",
    )

    _ = sub.add_parser(
        "report",
        help="Full architecture report.",
        description="Generate a complete report of dependencies and symbol usage.",
    )

    parser.epilog = """
Examples:

  Analyze a src-based project:
    pyimportgraph src --package myapp summary

  Show package dependencies:
    pyimportgraph src --package myapp packages

  Inspect a package:
    pyimportgraph src --package myapp package myapp.services

  Find who uses a symbol:
    pyimportgraph src --package myapp who-uses create_user

  Generate full report:
    pyimportgraph src --package myapp report
"""

    args = parser.parse_args()
    command = args.command or "summary"

    project_path: Path = args.project_path.resolve()
    package_names: list[str] = args.package_names

    package_map = build_package_dependency_map(package_names, project_root=project_path)
    symbol_report = build_symbol_usage_report(project_path)

    if command == "summary":
        print(render_summary(package_map, symbol_report))
    elif command == "packages":
        print(render_packages(package_map))
    elif command == "symbols":
        print(render_all_symbols(symbol_report))
    elif command == "external-symbols":
        print(render_external_symbols(symbol_report))
    elif command == "package":
        print(render_package_detail(symbol_report, args.name))
    elif command == "who-uses":
        print(render_who_uses(symbol_report, args.symbol))
    elif command == "report":
        print(render_full_report(package_map, symbol_report))
    else:
        raise ValueError(f"Unsupported command: {command}")


if __name__ == "__main__":
    main()
