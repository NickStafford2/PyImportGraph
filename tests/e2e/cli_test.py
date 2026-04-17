from __future__ import annotations

import subprocess
import sys
from pathlib import Path

from tests.shared import write_file


def _run_cli(project_root: Path, *args: str) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, "-m", "pyimportgraph.cli", str(project_root), *args],
        capture_output=True,
        text=True,
        check=False,
    )


def test_cli_summary_outputs_project_overview(tmp_path: Path) -> None:
    _ = write_file(
        tmp_path,
        "app.py",
        """
        import utils
        """,
    )
    _ = write_file(
        tmp_path,
        "utils.py",
        """
        def helper() -> None:
            pass
        """,
    )

    result = _run_cli(tmp_path, "summary")

    assert result.returncode == 0
    assert "PyImportGraph summary" in result.stdout
    assert "Modules:" in result.stdout
    assert "Imports:" in result.stdout
    assert "Cycles:" in result.stdout


def test_cli_module_outputs_resolved_module_details(tmp_path: Path) -> None:
    _ = write_file(
        tmp_path,
        "consumer.py",
        """
        from provider import make_value
        """,
    )
    _ = write_file(
        tmp_path,
        "provider.py",
        """
        def make_value() -> int:
            return 1
        """,
    )

    result = _run_cli(tmp_path, "module", "consumer")

    assert result.returncode == 0
    assert "consumer" in result.stdout
    assert "Definitions" in result.stdout
    assert "Imports" in result.stdout
    assert "provider.make_value" in result.stdout
    assert "defined at:" in result.stdout


def test_cli_cycles_outputs_detected_cycle(tmp_path: Path) -> None:
    _ = write_file(
        tmp_path,
        "a.py",
        """
        import b
        """,
    )
    _ = write_file(
        tmp_path,
        "b.py",
        """
        import a
        """,
    )

    result = _run_cli(tmp_path, "cycles")

    assert result.returncode == 0
    assert "Cycles" in result.stdout
    assert "a" in result.stdout
    assert "b" in result.stdout


def test_cli_reexports_outputs_reexport_details(tmp_path: Path) -> None:
    _ = write_file(
        tmp_path,
        "entry.py",
        """
        from middle import exported_name
        """,
    )
    _ = write_file(
        tmp_path,
        "middle.py",
        """
        from leaf import exported_name
        """,
    )
    _ = write_file(
        tmp_path,
        "leaf.py",
        """
        def exported_name() -> str:
            return "ok"
        """,
    )

    result = _run_cli(tmp_path, "reexports")

    assert result.returncode == 0
    assert "Reexports" in result.stdout
    assert "entry" in result.stdout
    assert "middle.exported_name" in result.stdout
    assert "leaf.exported_name" in result.stdout


def test_cli_unresolved_outputs_external_and_missing_imports(tmp_path: Path) -> None:
    _ = write_file(
        tmp_path,
        "app.py",
        """
        import networkx
        from provider import missing_name
        """,
    )
    _ = write_file(
        tmp_path,
        "provider.py",
        """
        def real_name() -> None:
            pass
        """,
    )

    result = _run_cli(tmp_path, "unresolved")

    assert result.returncode == 0
    assert "Unresolved imports" in result.stdout
    assert "networkx" in result.stdout
    assert "provider.missing_name" in result.stdout


def test_cli_search_finds_modules_by_name(tmp_path: Path) -> None:
    _ = write_file(
        tmp_path,
        "pkg/helpers.py",
        """
        def helper() -> None:
            pass
        """,
    )
    _ = write_file(
        tmp_path,
        "pkg/service.py",
        """
        from .helpers import helper
        """,
    )

    result = _run_cli(tmp_path, "search", "help")

    assert result.returncode == 0
    assert "pkg.helpers" in result.stdout
