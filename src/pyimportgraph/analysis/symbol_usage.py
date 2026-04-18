from __future__ import annotations

import ast
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path

from pyimportgraph.model.package_tree import PackageTree


@dataclass(frozen=True, slots=True)
class Definition:
    module_name: str
    package_name: str
    symbol_name: str
    kind: str
    line: int


@dataclass(frozen=True, slots=True)
class ExternalSymbolUse:
    defining_package: str
    defining_module: str
    symbol_name: str
    kind: str
    imported_by_package: str
    imported_by_module: str
    line: int


@dataclass(frozen=True, slots=True)
class SymbolUsageReport:
    definitions: list[Definition]
    external_uses: list[ExternalSymbolUse]

    def by_defining_package(self) -> dict[str, list[ExternalSymbolUse]]:
        grouped: dict[str, list[ExternalSymbolUse]] = defaultdict(list)
        for item in self.external_uses:
            grouped[item.defining_package].append(item)

        return {
            package_name: sorted(
                items,
                key=lambda item: (
                    item.symbol_name,
                    item.imported_by_package,
                    item.imported_by_module,
                    item.line,
                ),
            )
            for package_name, items in sorted(grouped.items())
        }


def build_symbol_usage_report(project_root: str | Path) -> SymbolUsageReport:
    root = Path(project_root).resolve()
    module_paths = _discover_python_files(root)

    module_name_by_path = {
        path: _module_name_from_path(root, path) for path in module_paths
    }
    known_module_names = set(module_name_by_path.values())
    package_tree = PackageTree.from_module_names(module_name_by_path.values())

    definitions_by_module: dict[str, dict[str, Definition]] = {}
    imports: list[_FromImport] = []

    for path, module_name in module_name_by_path.items():
        parsed = _parse_module(path)
        definitions_by_module[module_name] = {
            symbol_name: Definition(
                module_name=module_name,
                package_name=package_tree.package_for_module(module_name),
                symbol_name=definition.symbol_name,
                kind=definition.kind,
                line=definition.line,
            )
            for symbol_name, definition in parsed.definitions.items()
        }
        imports.extend(
            _FromImport(
                importer_module=module_name,
                imported_module=item.imported_module,
                imported_name=item.imported_name,
                line=item.line,
            )
            for item in parsed.from_imports
            if item.imported_module in known_module_names
        )

    external_uses: list[ExternalSymbolUse] = []

    for item in imports:
        imported_module_name = item.imported_module
        imported_symbol_name = item.imported_name

        if imported_module_name not in definitions_by_module:
            continue

        definition = definitions_by_module[imported_module_name].get(
            imported_symbol_name
        )
        if definition is None:
            continue

        importer_package_name = package_tree.package_for_module(item.importer_module)
        defining_package_name = definition.package_name

        if importer_package_name == defining_package_name:
            continue

        external_uses.append(
            ExternalSymbolUse(
                defining_package=defining_package_name,
                defining_module=definition.module_name,
                symbol_name=definition.symbol_name,
                kind=definition.kind,
                imported_by_package=importer_package_name,
                imported_by_module=item.importer_module,
                line=item.line,
            )
        )

    all_definitions = sorted(
        (
            definition
            for definitions in definitions_by_module.values()
            for definition in definitions.values()
        ),
        key=lambda item: (
            item.package_name,
            item.module_name,
            item.line,
            item.symbol_name,
        ),
    )

    external_uses.sort(
        key=lambda item: (
            item.defining_package,
            item.defining_module,
            item.symbol_name,
            item.imported_by_package,
            item.imported_by_module,
            item.line,
        )
    )

    return SymbolUsageReport(
        definitions=all_definitions,
        external_uses=external_uses,
    )


@dataclass(slots=True)
class _ParsedModule:
    definitions: dict[str, "_ParsedDefinition"]
    from_imports: list["_ParsedFromImport"]


@dataclass(frozen=True, slots=True)
class _ParsedDefinition:
    symbol_name: str
    kind: str
    line: int


@dataclass(frozen=True, slots=True)
class _ParsedFromImport:
    imported_module: str
    imported_name: str
    line: int


@dataclass(frozen=True, slots=True)
class _FromImport:
    importer_module: str
    imported_module: str
    imported_name: str
    line: int


def _parse_module(path: Path) -> _ParsedModule:
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    visitor = _ModuleVisitor()
    visitor.visit(tree)
    return _ParsedModule(
        definitions=visitor.definitions,
        from_imports=visitor.from_imports,
    )


class _ModuleVisitor(ast.NodeVisitor):
    def __init__(self) -> None:
        self.scope_depth = 0
        self.definitions: dict[str, _ParsedDefinition] = {}
        self.from_imports: list[_ParsedFromImport] = []

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        if self.scope_depth == 0:
            self._record_definition(node.name, "function", node.lineno)
        self.scope_depth += 1
        self.generic_visit(node)
        self.scope_depth -= 1

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        if self.scope_depth == 0:
            self._record_definition(node.name, "async_function", node.lineno)
        self.scope_depth += 1
        self.generic_visit(node)
        self.scope_depth -= 1

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        if self.scope_depth == 0:
            self._record_definition(node.name, "class", node.lineno)
        self.scope_depth += 1
        self.generic_visit(node)
        self.scope_depth -= 1

    def visit_Assign(self, node: ast.Assign) -> None:
        if self.scope_depth == 0:
            for target in node.targets:
                for name in _extract_assigned_names(target):
                    self._record_definition(name, "assignment", node.lineno)
        self.generic_visit(node)

    def visit_AnnAssign(self, node: ast.AnnAssign) -> None:
        if self.scope_depth == 0:
            for name in _extract_assigned_names(node.target):
                self._record_definition(name, "assignment", node.lineno)
        self.generic_visit(node)

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        if self.scope_depth != 0:
            self.generic_visit(node)
            return

        if node.module is None:
            self.generic_visit(node)
            return

        if node.level != 0:
            self.generic_visit(node)
            return

        for alias in node.names:
            if alias.name == "*":
                continue

            self.from_imports.append(
                _ParsedFromImport(
                    imported_module=node.module,
                    imported_name=alias.name,
                    line=node.lineno,
                )
            )

        self.generic_visit(node)

    def _record_definition(self, name: str, kind: str, line: int) -> None:
        self.definitions[name] = _ParsedDefinition(
            symbol_name=name,
            kind=kind,
            line=line,
        )


def _discover_python_files(project_root: Path) -> list[Path]:
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

    paths: list[Path] = []
    for path in sorted(project_root.rglob("*.py")):
        if any(part in skip_parts for part in path.parts):
            continue
        paths.append(path)
    return paths


def _module_name_from_path(project_root: Path, path: Path) -> str:
    relative = path.relative_to(project_root)
    parts = list(relative.parts)

    if parts[-1] == "__init__.py":
        return ".".join(parts[:-1])

    return ".".join(parts[:-1] + [path.stem])


def _extract_assigned_names(target: ast.AST) -> list[str]:
    if isinstance(target, ast.Name):
        return [target.id]

    if isinstance(target, (ast.Tuple, ast.List)):
        names: list[str] = []
        for element in target.elts:
            names.extend(_extract_assigned_names(element))
        return names

    return []
