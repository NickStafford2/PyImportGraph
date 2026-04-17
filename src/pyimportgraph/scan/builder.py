from __future__ import annotations

from pathlib import Path

from pyimportgraph.graph.model import (
    DefinitionKind,
    DefinitionRecord,
    DependencyGraph,
    ImportKind,
    ImportOccurrence,
    ModuleRecord,
    ResolvedImport,
)
from pyimportgraph.scan.ast_reader import parse_module_ast
from pyimportgraph.scan.discovery import (
    discover_python_modules,
    resolve_relative_module,
)


def build_dependency_graph(project_root: str | Path) -> DependencyGraph:
    root = Path(project_root).resolve()
    discovered_modules = discover_python_modules(root)

    parsed_by_module = {
        discovered.name: parse_module_ast(discovered.path, discovered.name)
        for discovered in discovered_modules
    }

    graph = DependencyGraph()

    for discovered in discovered_modules:
        parsed = parsed_by_module[discovered.name]
        graph.add_module(
            ModuleRecord(
                name=discovered.name,
                path=discovered.path,
                package_name=discovered.package_name,
                package_path=discovered.package_path,
                definitions=parsed.definitions,
            )
        )

    for discovered in discovered_modules:
        parsed = parsed_by_module[discovered.name]
        for occurrence in parsed.imports:
            resolved_target_module = _resolve_target_module_name(
                graph=graph,
                importer_module=occurrence.importer_module,
                raw_module=occurrence.raw_module,
                level=occurrence.level,
                imported_name=occurrence.imported_name,
            )

            finalized = ImportOccurrence(
                id=occurrence.id,
                importer_module=occurrence.importer_module,
                target_module=resolved_target_module,
                kind=occurrence.kind,
                imported_name=occurrence.imported_name,
                alias=occurrence.alias,
                line=occurrence.line,
                column=occurrence.column,
                scope=occurrence.scope,
                is_local_scope=occurrence.is_local_scope,
                is_relative=occurrence.is_relative,
                level=occurrence.level,
                raw_module=occurrence.raw_module,
            )
            graph.add_import(finalized)

    for occurrence in graph.imports.values():
        graph.add_resolution(_resolve_occurrence(graph, occurrence))

    return graph


def _resolve_target_module_name(
    *,
    graph: DependencyGraph,
    importer_module: str,
    raw_module: str | None,
    level: int,
    imported_name: str | None,
) -> str | None:
    base_module = resolve_relative_module(
        current_module=importer_module,
        raw_module=raw_module,
        level=level,
    )

    if imported_name is None:
        return base_module

    if imported_name == "*":
        return base_module

    if base_module in graph.modules:
        return base_module

    candidate_submodule = (
        f"{base_module}.{imported_name}" if base_module else imported_name
    )
    if candidate_submodule in graph.modules:
        return candidate_submodule

    return base_module


def _resolve_occurrence(
    graph: DependencyGraph,
    occurrence: ImportOccurrence,
) -> ResolvedImport:
    if occurrence.kind == ImportKind.IMPORT:
        return _resolve_plain_import(graph, occurrence)

    if occurrence.kind == ImportKind.STAR_IMPORT:
        return ResolvedImport(
            occurrence_id=occurrence.id,
            importer_module=occurrence.importer_module,
            requested_module=occurrence.target_module,
            requested_name="*",
            resolved_module=occurrence.target_module,
            resolved_name="*",
            definition_module=None,
            definition_name=None,
            definition_line=None,
            is_reexport=False,
            is_unresolved=True,
        )

    return _resolve_from_import(graph, occurrence)


def _resolve_plain_import(
    graph: DependencyGraph,
    occurrence: ImportOccurrence,
) -> ResolvedImport:
    target = occurrence.target_module

    return ResolvedImport(
        occurrence_id=occurrence.id,
        importer_module=occurrence.importer_module,
        requested_module=occurrence.raw_module,
        requested_name=None,
        resolved_module=target,
        resolved_name=None,
        definition_module=target if target in graph.modules else None,
        definition_name=None,
        definition_line=1 if target in graph.modules else None,
        is_reexport=False,
        is_unresolved=target not in graph.modules,
    )


def _resolve_from_import(
    graph: DependencyGraph,
    occurrence: ImportOccurrence,
) -> ResolvedImport:
    source_module = occurrence.target_module
    source_name = occurrence.imported_name

    if source_module is None or source_name is None:
        return _unresolved_resolution(occurrence)

    if source_module not in graph.modules:
        return _unresolved_resolution(
            occurrence,
            requested_module=source_module,
            requested_name=source_name,
        )

    visited: set[tuple[str, str]] = set()
    resolved = _resolve_symbol_origin(
        graph=graph,
        module_name=source_module,
        symbol_name=source_name,
        visited=visited,
    )

    if resolved is None:
        candidate_submodule = f"{source_module}.{source_name}"
        if candidate_submodule in graph.modules:
            definition = _module_definition(candidate_submodule, source_name)
            return ResolvedImport(
                occurrence_id=occurrence.id,
                importer_module=occurrence.importer_module,
                requested_module=source_module,
                requested_name=source_name,
                resolved_module=source_module,
                resolved_name=source_name,
                definition_module=definition.module_name,
                definition_name=definition.name,
                definition_line=definition.line,
                is_reexport=False,
                is_unresolved=False,
            )

        return _unresolved_resolution(
            occurrence,
            requested_module=source_module,
            requested_name=source_name,
        )

    definition, is_reexport = resolved
    return ResolvedImport(
        occurrence_id=occurrence.id,
        importer_module=occurrence.importer_module,
        requested_module=source_module,
        requested_name=source_name,
        resolved_module=source_module,
        resolved_name=source_name,
        definition_module=definition.module_name,
        definition_name=definition.name,
        definition_line=definition.line,
        is_reexport=is_reexport,
        is_unresolved=False,
    )


def _resolve_symbol_origin(
    *,
    graph: DependencyGraph,
    module_name: str,
    symbol_name: str,
    visited: set[tuple[str, str]],
) -> tuple[DefinitionRecord, bool] | None:
    key = (module_name, symbol_name)
    if key in visited:
        return None
    visited.add(key)

    module = graph.modules.get(module_name)
    if module is None:
        return None

    definition = module.definitions.get(symbol_name)
    if definition is None:
        candidate_submodule = f"{module_name}.{symbol_name}"
        if candidate_submodule in graph.modules:
            return _module_definition(candidate_submodule, symbol_name), False
        return None

    if not definition.is_alias:
        return definition, False

    source_module_name = definition.source_module_name
    source_name = definition.source_name

    if source_module_name is None:
        return definition, False

    if source_name is None:
        return _module_definition(source_module_name, symbol_name), True

    nested = _resolve_symbol_origin(
        graph=graph,
        module_name=source_module_name,
        symbol_name=source_name,
        visited=visited,
    )
    if nested is None:
        return definition, True

    nested_definition, _ = nested
    return nested_definition, True


def _module_definition(module_name: str, bound_name: str) -> DefinitionRecord:
    return DefinitionRecord(
        module_name=module_name,
        name=bound_name,
        kind=DefinitionKind.MODULE,
        line=1,
        column=0,
        scope="<module>",
    )


def _unresolved_resolution(
    occurrence: ImportOccurrence,
    *,
    requested_module: str | None = None,
    requested_name: str | None = None,
) -> ResolvedImport:
    return ResolvedImport(
        occurrence_id=occurrence.id,
        importer_module=occurrence.importer_module,
        requested_module=requested_module
        if requested_module is not None
        else occurrence.target_module,
        requested_name=requested_name
        if requested_name is not None
        else occurrence.imported_name,
        resolved_module=None,
        resolved_name=None,
        definition_module=None,
        definition_name=None,
        definition_line=None,
        is_reexport=False,
        is_unresolved=True,
    )
