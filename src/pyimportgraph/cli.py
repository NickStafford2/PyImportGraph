from __future__ import annotations

import argparse
import json
from pathlib import Path

from pyimportgraph.analysis import ProjectModel
from pyimportgraph.reporting.full_report import render_full_report
from pyimportgraph.reporting.module_detail import render_module_detail
from pyimportgraph.reporting.package_detail import render_package_detail
from pyimportgraph.reporting.summary import render_summary
from pyimportgraph.serialization import build_project_snapshot


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="pyimportgraph",
        description="Analyze Python project architecture from module and package relationships.",
    )

    parser.add_argument(
        "project_path",
        type=Path,
        help="Path to the Python project root or src directory.",
    )
    parser.add_argument(
        "--package",
        dest="package_names",
        action="append",
        required=True,
        help="Top-level package to analyze. Repeat for multiple packages.",
    )
    parser.add_argument(
        "--version",
        action="version",
        version="pyimportgraph 0.1.0",
    )

    subparsers = parser.add_subparsers(dest="command", metavar="<command>")

    subparsers.add_parser(
        "summary",
        help="Show a high-level summary.",
    )

    module_parser = subparsers.add_parser(
        "module",
        help="Inspect one module.",
    )
    module_parser.add_argument(
        "name",
        help="Full module name, e.g. pyimportgraph.analysis.symbol_usage",
    )

    package_parser = subparsers.add_parser(
        "package",
        help="Inspect one package or subpackage.",
    )
    package_parser.add_argument(
        "name",
        help="Full package name, e.g. pyimportgraph.analysis",
    )

    subparsers.add_parser(
        "report",
        help="Show a compact package-focused report.",
    )

    subparsers.add_parser(
        "full-report",
        help="Show the verbose package + module report.",
    )

    subparsers.add_parser(
        "json",
        help="Write a frontend-friendly JSON snapshot to stdout.",
    )

    parser.epilog = """
Examples:

  pyimportgraph src --package myapp summary
  pyimportgraph src --package myapp module myapp.services.user_service
  pyimportgraph src --package myapp package myapp.services
  pyimportgraph src --package myapp report
  pyimportgraph src --package myapp full-report
  pyimportgraph src --package myapp json > graph.json
"""

    args = parser.parse_args()
    command = args.command or "summary"

    model = ProjectModel.build(
        package_names=args.package_names,
        project_root=args.project_path.resolve(),
    )

    if command == "summary":
        print(render_summary(model))
        return

    if command == "module":
        print(render_module_detail(model, args.name))
        return

    if command == "package":
        print(render_package_detail(model, args.name))
        return

    if command == "report":
        parts = [render_summary(model)]
        for package_name in model.package_tree.package_names():
            parts.append(render_package_detail(model, package_name))
        print("\n\n".join(parts))
        return

    if command == "full-report":
        print(render_full_report(model))
        return

    if command == "json":
        snapshot = build_project_snapshot(model)
        print(json.dumps(snapshot, indent=2, sort_keys=True))
        return

    raise ValueError(f"Unsupported command: {command}")


if __name__ == "__main__":
    main()
