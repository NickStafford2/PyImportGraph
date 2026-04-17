from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True, slots=True)
class DiscoveredModule:
    name: str
    path: Path
    package_name: str
    package_path: Path


def discover_python_modules(project_root: Path) -> list[DiscoveredModule]:
    project_root = project_root.resolve()

    modules: list[DiscoveredModule] = []
    for path in sorted(project_root.rglob("*.py")):
        if _should_skip_path(path):
            continue
        module = _to_discovered_module(project_root, path)
        if module is not None:
            modules.append(module)

    return modules


def _should_skip_path(path: Path) -> bool:
    skip_parts = {
        ".git",
        ".hg",
        ".svn",
        ".venv",
        "venv",
        "env",
        "node_modules",
        "__pycache__",
        ".mypy_cache",
        ".pytest_cache",
        ".ruff_cache",
        ".tox",
        ".nox",
        ".eggs",
        "build",
        "dist",
    }
    return any(part in skip_parts for part in path.parts)


def _to_discovered_module(project_root: Path, path: Path) -> DiscoveredModule | None:
    relative = path.relative_to(project_root)
    parts = list(relative.parts)
    if not parts:
        return None

    if parts[-1] == "__init__.py":
        module_parts = parts[:-1]
        if not module_parts:
            module_name = relative.parent.name or project_root.name
            package_name = module_name
            package_path = path.parent
        else:
            module_name = ".".join(module_parts)
            package_name = module_name
            package_path = path.parent
    else:
        stem = path.stem
        module_parts = parts[:-1] + [stem]
        module_name = ".".join(module_parts)
        package_parts = module_parts[:-1]
        package_name = ".".join(package_parts)
        package_path = path.parent

    return DiscoveredModule(
        name=module_name,
        path=path,
        package_name=package_name,
        package_path=package_path,
    )


def resolve_relative_module(
    *,
    current_module: str,
    raw_module: str | None,
    level: int,
) -> str | None:
    if level == 0:
        return raw_module

    current_parts = current_module.split(".")
    current_package_parts = current_parts[:-1]

    if level > len(current_parts):
        return None

    base_parts = current_package_parts[: len(current_package_parts) - (level - 1)]
    if raw_module:
        base_parts.extend(raw_module.split("."))

    if not base_parts:
        return None

    return ".".join(base_parts)
