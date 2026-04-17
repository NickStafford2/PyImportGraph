from __future__ import annotations

import argparse
from pathlib import Path

from pyimportgraph.render.cli_output import (
    render_cycles,
    render_module_details,
    render_reexports,
    render_summary,
    render_unresolved,
)
from pyimportgraph.scan.builder import build_dependency_graph


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="pyimportgraph",
        description="Analyze Python imports and build a module dependency graph.",
    )
    _ = parser.add_argument(
        "project_path",
        type=Path,
        help="Path to the Python project to analyze.",
    )

    subparsers = parser.add_subparsers(dest="command", required=False)

    _ = subparsers.add_parser("summary", help="Show project summary.")

    module_parser = subparsers.add_parser("module", help="Show details for one module.")
    _ = module_parser.add_argument("module_name")

    search_parser = subparsers.add_parser(
        "search", help="Search modules by name or path."
    )
    _ = search_parser.add_argument("text")

    _ = subparsers.add_parser("cycles", help="Show circular imports.")
    _ = subparsers.add_parser("reexports", help="Show reimports / reexports.")
    _ = subparsers.add_parser("unresolved", help="Show unresolved imports.")

    args = parser.parse_args()
    _ = graph = build_dependency_graph(args.project_path)

    command = args.command or "summary"

    if command == "summary":
        print(render_summary(graph))
        return

    if command == "module":
        print(render_module_details(graph, args.module_name))
        return

    if command == "search":
        matches = graph.search_modules(args.text)
        if not matches:
            print("(no matches)")
            return
        for module in matches:
            print(f"{module.name:<40} {module.path}")
        return

    if command == "cycles":
        print(render_cycles(graph))
        return

    if command == "reexports":
        print(render_reexports(graph))
        return

    if command == "unresolved":
        print(render_unresolved(graph))
        return

    raise ValueError(f"Unsupported command: {command}")


if __name__ == "__main__":
    main()
