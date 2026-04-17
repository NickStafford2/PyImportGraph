from __future__ import annotations

from pathlib import Path

from pyimportgraph.scan.ast_reader import parse_module_ast


def test_parse_module_ast_tracks_top_level_and_local_imports(tmp_path: Path) -> None:
    path = tmp_path / "sample.py"
    path.write_text(
        (
            "from provider import exported_name\n"
            "\n"
            "def run() -> None:\n"
            "    import local_dependency\n"
        ),
        encoding="utf-8",
    )

    parsed = parse_module_ast(path, "sample")

    assert "run" in parsed.definitions
    assert "exported_name" in parsed.definitions

    assert len(parsed.imports) == 2

    top_level_import = parsed.imports[0]
    assert top_level_import.importer_module == "sample"
    assert top_level_import.imported_name == "exported_name"
    assert top_level_import.scope == "<module>"
    assert top_level_import.is_local_scope is False

    local_import = parsed.imports[1]
    assert local_import.importer_module == "sample"
    assert local_import.target_module == "local_dependency"
    assert local_import.scope == "run"
    assert local_import.is_local_scope is True
