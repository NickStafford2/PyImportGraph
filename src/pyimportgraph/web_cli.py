from __future__ import annotations

import argparse
from pathlib import Path

from pyimportgraph.web.app import create_app


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="web",
        description="Run the PyImportGraph Flask backend.",
    )
    _ = parser.add_argument(
        "project_path",
        type=Path,
        help="Path to the Python project root or src directory.",
    )
    _ = parser.add_argument(
        "--package",
        dest="package_names",
        action="append",
        required=True,
        help="Top-level package to analyze. Repeat for multiple packages.",
    )
    _ = parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host interface to bind the Flask server to.",
    )
    _ = parser.add_argument(
        "--port",
        type=int,
        default=5000,
        help="Port to bind the Flask server to.",
    )
    _ = parser.add_argument(
        "--debug",
        action="store_true",
        help="Run the Flask development server in debug mode.",
    )

    parser.epilog = """
Examples:

  web src --package pyimportgraph
  web src --package pyimportgraph --port 5000
  web src --package pyimportgraph --debug
"""

    args = parser.parse_args()

    app = create_app(
        project_root=args.project_path.resolve(),
        package_names=args.package_names,
    )
    app.run(host=args.host, port=args.port, debug=args.debug)


if __name__ == "__main__":
    main()
