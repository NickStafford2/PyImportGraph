from __future__ import annotations

from pathlib import Path

from pyimportgraph.scan.builder import build_dependency_graph
from tests.shared import write_file


def test_build_dependency_graph_simple_internal_import(tmp_path: Path) -> None:
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

    graph = build_dependency_graph(tmp_path)

    assert "app" in graph.modules
    assert "utils" in graph.modules
    assert graph.imports_module("app") == ["utils"]
    assert graph.imported_by("utils") == ["app"]

    resolutions = graph.get_module_resolutions("app")
    assert len(resolutions) == 1
    assert resolutions[0].resolved_module == "utils"
    assert resolutions[0].is_unresolved is False


def test_build_dependency_graph_resolves_from_import_to_definition(
    tmp_path: Path,
) -> None:
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

    graph = build_dependency_graph(tmp_path)
    resolutions = graph.get_module_resolutions("consumer")

    assert len(resolutions) == 1

    resolution = resolutions[0]
    assert resolution.requested_module == "provider"
    assert resolution.requested_name == "make_value"
    assert resolution.definition_module == "provider"
    assert resolution.definition_name == "make_value"
    assert resolution.definition_line == 1
    assert resolution.is_reexport is False
    assert resolution.is_unresolved is False


def test_build_dependency_graph_detects_reexport_chain(tmp_path: Path) -> None:
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

    graph = build_dependency_graph(tmp_path)
    resolutions = graph.get_module_resolutions("entry")
    assert len(resolutions) == 1

    resolution = resolutions[0]
    assert resolution.requested_module == "middle"
    assert resolution.requested_name == "exported_name"
    assert resolution.definition_module == "leaf"
    assert resolution.definition_name == "exported_name"
    assert resolution.is_reexport is True
    assert resolution.is_unresolved is False

    reexports = graph.find_reexports()
    assert len(reexports) >= 1
    assert any(
        item.importer_module == "entry"
        and item.definition_module == "leaf"
        and item.definition_name == "exported_name"
        for item in reexports
    )


def test_build_dependency_graph_tracks_local_scope_imports(tmp_path: Path) -> None:
    _ = write_file(
        tmp_path,
        "consumer.py",
        """
        def run() -> None:
            import provider
        """,
    )
    _ = write_file(
        tmp_path,
        "provider.py",
        """
        VALUE = 1
        """,
    )

    graph = build_dependency_graph(tmp_path)
    imports = graph.get_module_imports("consumer")
    assert len(imports) == 1

    occurrence = imports[0]
    assert occurrence.importer_module == "consumer"
    assert occurrence.target_module == "provider"
    assert occurrence.is_local_scope is True
    assert occurrence.scope == "run"
    assert occurrence.line == 2

    resolutions = graph.get_module_resolutions("consumer")
    assert len(resolutions) == 1
    assert resolutions[0].resolved_module == "provider"


def test_build_dependency_graph_detects_cycles(tmp_path: Path) -> None:
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

    graph = build_dependency_graph(tmp_path)

    assert graph.imports_module("a") == ["b"]
    assert graph.imports_module("b") == ["a"]

    cycles = graph.find_cycles()
    cycle_sets = {frozenset(cycle) for cycle in cycles}
    assert frozenset({"a", "b"}) in cycle_sets


def test_build_dependency_graph_resolves_relative_imports(tmp_path: Path) -> None:
    _ = write_file(
        tmp_path,
        "pkg/__init__.py",
        """
        from .helpers import helper
        """,
    )
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
        "pkg/consumer.py",
        """
        from .helpers import helper
        """,
    )

    graph = build_dependency_graph(tmp_path)

    assert "pkg" in graph.modules
    assert "pkg.helpers" in graph.modules
    assert "pkg.consumer" in graph.modules

    consumer_resolutions = graph.get_module_resolutions("pkg.consumer")
    assert len(consumer_resolutions) == 1

    resolution = consumer_resolutions[0]
    assert resolution.requested_module == "pkg.helpers"
    assert resolution.requested_name == "helper"
    assert resolution.definition_module == "pkg.helpers"
    assert resolution.definition_name == "helper"
    assert resolution.is_unresolved is False


def test_build_dependency_graph_treats_external_dependencies_as_black_boxes(
    tmp_path: Path,
) -> None:
    _ = write_file(
        tmp_path,
        "app.py",
        """
        import networkx
        from pathlib import Path
        """,
    )

    graph = build_dependency_graph(tmp_path)

    assert set(graph.modules) == {"app"}

    imports = graph.get_module_imports("app")
    assert len(imports) == 2

    resolutions = graph.get_module_resolutions("app")
    assert len(resolutions) == 2
    assert all(item.is_unresolved for item in resolutions)
    assert {item.requested_module for item in resolutions} == {"networkx", "pathlib"}


def test_build_dependency_graph_reports_unresolved_internal_symbol(
    tmp_path: Path,
) -> None:
    _ = write_file(
        tmp_path,
        "consumer.py",
        """
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

    graph = build_dependency_graph(tmp_path)

    resolutions = graph.get_module_resolutions("consumer")
    assert len(resolutions) == 1

    resolution = resolutions[0]
    assert resolution.requested_module == "provider"
    assert resolution.requested_name == "missing_name"
    assert resolution.is_unresolved is True

    unresolved = graph.find_unresolved()
    assert len(unresolved) >= 1
    assert any(
        item.importer_module == "consumer"
        and item.requested_module == "provider"
        and item.requested_name == "missing_name"
        for item in unresolved
    )
