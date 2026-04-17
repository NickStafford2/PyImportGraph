from __future__ import annotations

from dataclasses import dataclass, field
from enum import StrEnum
from pathlib import Path
from typing import Iterable

import networkx as nx


class DefinitionKind(StrEnum):
    FUNCTION = "function"
    ASYNC_FUNCTION = "async_function"
    CLASS = "class"
    ASSIGNMENT = "assignment"
    IMPORT_ALIAS = "import_alias"
    MODULE = "module"


class ImportKind(StrEnum):
    IMPORT = "import"
    FROM_IMPORT = "from_import"
    STAR_IMPORT = "star_import"


@dataclass(frozen=True, slots=True)
class DefinitionRecord:
    module_name: str
    name: str
    kind: DefinitionKind
    line: int
    column: int
    scope: str
    source_module_name: str | None = None
    source_name: str | None = None

    @property
    def is_alias(self) -> bool:
        return self.kind == DefinitionKind.IMPORT_ALIAS


@dataclass(frozen=True, slots=True)
class ImportOccurrence:
    id: str
    importer_module: str
    target_module: str | None
    kind: ImportKind
    imported_name: str | None
    alias: str | None
    line: int
    column: int
    scope: str
    is_local_scope: bool
    is_relative: bool
    level: int
    raw_module: str | None


@dataclass(frozen=True, slots=True)
class ResolvedImport:
    occurrence_id: str
    importer_module: str
    requested_module: str | None
    requested_name: str | None
    resolved_module: str | None
    resolved_name: str | None
    definition_module: str | None
    definition_name: str | None
    definition_line: int | None
    is_reexport: bool
    is_unresolved: bool


@dataclass(slots=True)
class ModuleRecord:
    name: str
    path: Path
    package_name: str
    package_path: Path
    definitions: dict[str, DefinitionRecord] = field(default_factory=dict)
    import_occurrence_ids: list[str] = field(default_factory=list)

    @property
    def is_package_module(self) -> bool:
        return self.path.name == "__init__.py"


class DependencyGraph:
    """
    Single source of truth for import analysis.

    - modules: stores module metadata exactly once
    - imports: stores import occurrences exactly once
    - resolutions: stores resolved meaning of each import exactly once
    - edges in graph: relationships only
    """

    def __init__(self) -> None:
        self.modules: dict[str, ModuleRecord] = {}
        self.imports: dict[str, ImportOccurrence] = {}
        self.resolutions: dict[str, ResolvedImport] = {}
        self._graph = nx.DiGraph()

    def add_module(self, module: ModuleRecord) -> None:
        self.modules[module.name] = module
        self._graph.add_node(module.name)

    def add_import(self, occurrence: ImportOccurrence) -> None:
        self.imports[occurrence.id] = occurrence

        module = self.modules[occurrence.importer_module]
        module.import_occurrence_ids.append(occurrence.id)

        if occurrence.target_module is not None:
            self._graph.add_edge(occurrence.importer_module, occurrence.target_module)
            edge_data = self._graph.edges[
                occurrence.importer_module, occurrence.target_module
            ]
            occurrence_ids = edge_data.setdefault("occurrence_ids", [])
            occurrence_ids.append(occurrence.id)

    def add_resolution(self, resolution: ResolvedImport) -> None:
        self.resolutions[resolution.occurrence_id] = resolution

    def module_names(self) -> list[str]:
        return sorted(self.modules)

    def get_module(self, module_name: str) -> ModuleRecord:
        return self.modules[module_name]

    def get_module_imports(self, module_name: str) -> list[ImportOccurrence]:
        module = self.get_module(module_name)
        return [self.imports[occ_id] for occ_id in module.import_occurrence_ids]

    def get_module_resolutions(self, module_name: str) -> list[ResolvedImport]:
        return [
            self.resolutions[occ.id]
            for occ in self.get_module_imports(module_name)
            if occ.id in self.resolutions
        ]

    def imported_by(self, module_name: str) -> list[str]:
        if module_name not in self._graph:
            return []
        return sorted(self._graph.predecessors(module_name))

    def imports_module(self, module_name: str) -> list[str]:
        if module_name not in self._graph:
            return []
        return sorted(self._graph.successors(module_name))

    def occurrences_between(
        self, importer: str, imported: str
    ) -> list[ImportOccurrence]:
        if not self._graph.has_edge(importer, imported):
            return []
        occurrence_ids: list[str] = self._graph.edges[importer, imported].get(
            "occurrence_ids", []
        )
        return [self.imports[occ_id] for occ_id in occurrence_ids]

    def get_definition(self, module_name: str, name: str) -> DefinitionRecord | None:
        module = self.modules.get(module_name)
        if module is None:
            return None
        return module.definitions.get(name)

    def find_symbol_importers(
        self,
        module_name: str,
        symbol_name: str,
    ) -> list[ResolvedImport]:
        matches: list[ResolvedImport] = []
        for resolution in self.resolutions.values():
            if (
                resolution.definition_module == module_name
                and resolution.definition_name == symbol_name
            ):
                matches.append(resolution)
        matches.sort(
            key=lambda item: (item.importer_module, item.definition_line or -1)
        )
        return matches

    def find_reexports(self) -> list[ResolvedImport]:
        items = [item for item in self.resolutions.values() if item.is_reexport]
        items.sort(
            key=lambda item: (
                item.importer_module,
                item.requested_module or "",
                item.requested_name or "",
            )
        )
        return items

    def find_unresolved(self) -> list[ResolvedImport]:
        items = [item for item in self.resolutions.values() if item.is_unresolved]
        items.sort(
            key=lambda item: (
                item.importer_module,
                item.requested_module or "",
                item.requested_name or "",
            )
        )
        return items

    def find_cycles(self) -> list[list[str]]:
        return [cycle for cycle in nx.simple_cycles(self._graph)]

    def search_modules(self, text: str) -> list[ModuleRecord]:
        lowered = text.lower()
        items = [
            module
            for module in self.modules.values()
            if lowered in module.name.lower() or lowered in str(module.path).lower()
        ]
        items.sort(key=lambda module: module.name)
        return items

    def summary(self) -> dict[str, int]:
        return {
            "module_count": len(self.modules),
            "import_count": len(self.imports),
            "resolved_import_count": len(self.resolutions),
            "cycle_count": len(self.find_cycles()),
            "reexport_count": len(self.find_reexports()),
            "unresolved_count": len(self.find_unresolved()),
        }

    def topological_layers(self) -> list[list[str]]:
        """
        Returns DAG layers when possible. If cycles exist, strongly connected
        components are condensed first.
        """
        condensed = nx.condensation(self._graph)
        generations = list(nx.topological_generations(condensed))
        layers: list[list[str]] = []

        for generation in generations:
            layer: list[str] = []
            for component_id in generation:
                members: Iterable[str] = condensed.nodes[component_id]["members"]
                layer.extend(sorted(members))
            layers.append(sorted(layer))

        return layers
