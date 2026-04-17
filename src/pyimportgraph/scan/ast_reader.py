from __future__ import annotations

import ast
from dataclasses import dataclass, field
from pathlib import Path

from pyimportgraph.graph.model import (
    DefinitionKind,
    DefinitionRecord,
    ImportKind,
    ImportOccurrence,
)


@dataclass(slots=True)
class ParsedModule:
    definitions: dict[str, DefinitionRecord] = field(default_factory=dict)
    imports: list[ImportOccurrence] = field(default_factory=list)


def parse_module_ast(path: Path, module_name: str) -> ParsedModule:
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    visitor = _ModuleVisitor(module_name)
    visitor.visit(tree)
    return ParsedModule(definitions=visitor.definitions, imports=visitor.imports)


class _ModuleVisitor(ast.NodeVisitor):
    def __init__(self, module_name: str) -> None:
        self.module_name = module_name
        self.scope_stack: list[str] = []
        self.imports: list[ImportOccurrence] = []
        self.definitions: dict[str, DefinitionRecord] = {}
        self._import_counter = 0

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self._record_definition(node.name, DefinitionKind.FUNCTION, node)
        self.scope_stack.append(node.name)
        self.generic_visit(node)
        self.scope_stack.pop()

    def visit_AsyncFunctionDef(self, node: ast.AsyncFunctionDef) -> None:
        self._record_definition(node.name, DefinitionKind.ASYNC_FUNCTION, node)
        self.scope_stack.append(node.name)
        self.generic_visit(node)
        self.scope_stack.pop()

    def visit_ClassDef(self, node: ast.ClassDef) -> None:
        self._record_definition(node.name, DefinitionKind.CLASS, node)
        self.scope_stack.append(node.name)
        self.generic_visit(node)
        self.scope_stack.pop()

    def visit_Assign(self, node: ast.Assign) -> None:
        if not self.scope_stack:
            for target in node.targets:
                for name in _extract_assigned_names(target):
                    self._record_definition(name, DefinitionKind.ASSIGNMENT, node)
        self.generic_visit(node)

    def visit_AnnAssign(self, node: ast.AnnAssign) -> None:
        if not self.scope_stack:
            for name in _extract_assigned_names(node.target):
                self._record_definition(name, DefinitionKind.ASSIGNMENT, node)
        self.generic_visit(node)

    def visit_Import(self, node: ast.Import) -> None:
        for alias in node.names:
            target_module = alias.name
            bound_name = alias.asname or alias.name.split(".")[0]

            occurrence = ImportOccurrence(
                id=self._next_import_id(),
                importer_module=self.module_name,
                target_module=target_module,
                kind=ImportKind.IMPORT,
                imported_name=None,
                alias=alias.asname,
                line=node.lineno,
                column=node.col_offset,
                scope=self._scope_name(),
                is_local_scope=bool(self.scope_stack),
                is_relative=False,
                level=0,
                raw_module=alias.name,
            )
            self.imports.append(occurrence)

            if not self.scope_stack:
                self.definitions[bound_name] = DefinitionRecord(
                    module_name=self.module_name,
                    name=bound_name,
                    kind=DefinitionKind.IMPORT_ALIAS,
                    line=node.lineno,
                    column=node.col_offset,
                    scope=self._scope_name(),
                    source_module_name=target_module,
                    source_name=None,
                )

    def visit_ImportFrom(self, node: ast.ImportFrom) -> None:
        raw_module = node.module
        is_relative = node.level > 0

        if len(node.names) == 1 and node.names[0].name == "*":
            occurrence = ImportOccurrence(
                id=self._next_import_id(),
                importer_module=self.module_name,
                target_module=None,
                kind=ImportKind.STAR_IMPORT,
                imported_name="*",
                alias=None,
                line=node.lineno,
                column=node.col_offset,
                scope=self._scope_name(),
                is_local_scope=bool(self.scope_stack),
                is_relative=is_relative,
                level=node.level,
                raw_module=raw_module,
            )
            self.imports.append(occurrence)
            return

        for alias in node.names:
            occurrence = ImportOccurrence(
                id=self._next_import_id(),
                importer_module=self.module_name,
                target_module=None,
                kind=ImportKind.FROM_IMPORT,
                imported_name=alias.name,
                alias=alias.asname,
                line=node.lineno,
                column=node.col_offset,
                scope=self._scope_name(),
                is_local_scope=bool(self.scope_stack),
                is_relative=is_relative,
                level=node.level,
                raw_module=raw_module,
            )
            self.imports.append(occurrence)

            if not self.scope_stack:
                bound_name = alias.asname or alias.name
                self.definitions[bound_name] = DefinitionRecord(
                    module_name=self.module_name,
                    name=bound_name,
                    kind=DefinitionKind.IMPORT_ALIAS,
                    line=node.lineno,
                    column=node.col_offset,
                    scope=self._scope_name(),
                    source_module_name=raw_module,
                    source_name=alias.name,
                )

    def _record_definition(
        self,
        name: str,
        kind: DefinitionKind,
        node: ast.AST,
    ) -> None:
        if self.scope_stack:
            return
        self.definitions[name] = DefinitionRecord(
            module_name=self.module_name,
            name=name,
            kind=kind,
            line=getattr(node, "lineno", 0),
            column=getattr(node, "col_offset", 0),
            scope=self._scope_name(),
        )

    def _scope_name(self) -> str:
        if not self.scope_stack:
            return "<module>"
        return ".".join(self.scope_stack)

    def _next_import_id(self) -> str:
        self._import_counter += 1
        return f"{self.module_name}:{self._import_counter}"


def _extract_assigned_names(target: ast.AST) -> list[str]:
    if isinstance(target, ast.Name):
        return [target.id]

    if isinstance(target, (ast.Tuple, ast.List)):
        names: list[str] = []
        for element in target.elts:
            names.extend(_extract_assigned_names(element))
        return names

    return []
