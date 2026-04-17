from __future__ import annotations

from pathlib import Path

from pyimportgraph.scan.discovery import (
    discover_python_modules,
    resolve_relative_module,
)


def _write_file(root: Path, relative_path: str, content: str = "") -> Path:
    path = root / relative_path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    return path


def test_discover_python_modules_skips_denylisted_directories(tmp_path: Path) -> None:
    _write_file(tmp_path, "srcpkg/app.py", "import x\n")
    _write_file(tmp_path, ".venv/lib/site.py", "x = 1\n")
    _write_file(tmp_path, "node_modules/tool/index.py", "x = 1\n")
    _write_file(tmp_path, "__pycache__/cached.py", "x = 1\n")
    _write_file(tmp_path, ".pytest_cache/cache_file.py", "x = 1\n")
    _write_file(tmp_path, "build/generated.py", "x = 1\n")
    _write_file(tmp_path, "dist/release.py", "x = 1\n")
    _write_file(tmp_path, ".git/hooks/hook.py", "x = 1\n")

    modules = discover_python_modules(tmp_path)
    module_names = [module.name for module in modules]

    assert module_names == ["srcpkg.app"]


def test_resolve_relative_module_resolves_parent_and_sibling_modules() -> None:
    assert (
        resolve_relative_module(
            current_module="pkg.consumer",
            raw_module="helpers",
            level=1,
        )
        == "pkg.helpers"
    )

    assert (
        resolve_relative_module(
            current_module="pkg.sub.consumer",
            raw_module="helpers",
            level=2,
        )
        == "pkg.helpers"
    )
